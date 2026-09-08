// Content gate: validates everything under content/ before a build.
//
//   node scripts/content-gate.ts [--no-drafts]
//
// Checks:
//   1. EN <-> TR path parity (every content/en/** file has a content/tr/**
//      counterpart at the same relative path, and vice versa).
//   2. Frontmatter validity against the shared zod schema (gray-matter for
//      parsing, so this has no dependency on Astro or the content layer).
//   3. Every fenced code block (```) declares a language.
//   4. A lesson's `level`/`module` frontmatter matches the folder it lives in.
//   5. With --no-drafts: no entry may have `draft: true` (used by release
//      plans to assert nothing half-finished ships).
//   6. Every lesson's `verified_version` is <= the changelog ledger pin in
//      `research/changelog/reviewed.json`. A lesson may lag the pin (it just has
//      not been re-read yet, which the weekly drift report tracks) but it may
//      never claim to have been verified against a version nobody has triaged.
//      That is what makes silent drift impossible to merge.
//
// This module exports `runContentGate` so it can be reused by the Astro
// integration in `src/integrations/content-gates.ts` (called from
// `astro:build:start`) as well as by this file's own CLI entry point.
import { readFile, readdir } from 'node:fs/promises';
import { join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { lessonSchema, sectionSchema } from '../src/content/schema.ts';
// Single source of truth for version comparison. The gate used to carry its own copy, which
// returned NaN for a pre-release and let `verified_version: 2.1.266-rc.1` past the pin assertion.
import { compareVersions } from './changelog-drift.mjs';

export interface ContentGateOptions {
  /** Root directory containing the `en/` and `tr/` trees. Defaults to `<cwd>/content`. */
  contentRoot?: string;
  /** Fail if any entry has `draft: true`. */
  noDrafts?: boolean;
  /**
   * Changelog ledger. Defaults to this repo's `research/changelog/reviewed.json`,
   * resolved from this file — not from `contentRoot` — so a fixture run still
   * checks against the real pin, and a missing ledger is an error rather than a
   * silently skipped assertion.
   */
  ledgerPath?: string;
}

const DEFAULT_LEDGER_PATH = fileURLToPath(
  new URL('../research/changelog/reviewed.json', import.meta.url),
);

export interface ContentGateResult {
  ok: boolean;
  errors: string[];
  filesChecked: number;
}

function toPosix(p: string): string {
  return p.split(sep).join('/');
}

async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return out;
    throw err;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await walk(full)));
    } else if (entry.isFile()) {
      out.push(full);
    }
  }
  return out;
}

function checkFences(body: string, relPath: string, errors: string[]): void {
  const lines = body.split(/\r?\n/);
  let open = false;
  let openLine = -1;
  for (let i = 0; i < lines.length; i++) {
    const match = /^\s*```(.*)$/.exec(lines[i]);
    if (!match) continue;
    if (!open) {
      const lang = match[1].trim();
      if (!lang) {
        errors.push(`${relPath}:${i + 1}: code fence opened without a language tag`);
      }
      open = true;
      openLine = i;
    } else {
      open = false;
    }
  }
  if (open) {
    errors.push(`${relPath}:${openLine + 1}: code fence opened but never closed`);
  }
}

export async function runContentGate(options: ContentGateOptions = {}): Promise<ContentGateResult> {
  const contentRoot = options.contentRoot ?? join(process.cwd(), 'content');
  const noDrafts = options.noDrafts ?? false;
  const errors: string[] = [];

  let ledgerPin: string | null = null;
  const ledgerPath = options.ledgerPath ?? DEFAULT_LEDGER_PATH;
  try {
    const ledger = JSON.parse(await readFile(ledgerPath, 'utf8')) as { pin?: unknown };
    if (typeof ledger.pin !== 'string' || !/^\d+(\.\d+)+$/.test(ledger.pin)) {
      errors.push(`${toPosix(ledgerPath)}: "pin" must be a dotted version string`);
    } else {
      ledgerPin = ledger.pin;
    }
  } catch (err) {
    errors.push(
      `changelog ledger unreadable (${toPosix(ledgerPath)}): ${
        err instanceof Error ? err.message : String(err)
      }`,
    );
  }

  const allFiles = await walk(contentRoot);
  const mdxFiles = allFiles.filter((f) => f.endsWith('.mdx')).sort();

  const enPaths = new Set<string>();
  const trPaths = new Set<string>();

  for (const abs of mdxFiles) {
    const rel = toPosix(relative(contentRoot, abs));
    const parts = rel.split('/');
    const lang = parts[0];
    const withoutLang = parts.slice(1).join('/');

    if (lang === 'en') enPaths.add(withoutLang);
    else if (lang === 'tr') trPaths.add(withoutLang);
    else continue; // e.g. _shared/** — not part of the parity/schema gate

    const raw = await readFile(abs, 'utf8');
    const { data, content } = matter(raw);

    const filename = parts[parts.length - 1];
    const isIndex = filename === 'index.mdx';

    checkFences(content, rel, errors);

    if (isIndex) {
      if (parts.length !== 3 && parts.length !== 4) {
        errors.push(`${rel}: unexpected path depth for a section index file`);
        continue;
      }
      const parsed = sectionSchema.safeParse(data);
      if (!parsed.success) {
        errors.push(`${rel}: invalid section frontmatter — ${parsed.error.message}`);
      }
      continue;
    }

    // Standalone section-shaped page under playbook/ or meta/ (e.g. playbook/glossary.mdx):
    // depth 3, not numbered, validated with the section schema.
    if (parts.length === 3 && /^(playbook|meta)$/.test(parts[1]) && !/^\d{2}-/.test(filename)) {
      const parsed = sectionSchema.safeParse(data);
      if (!parsed.success) {
        errors.push(`${rel}: invalid section frontmatter — ${parsed.error.message}`);
      }
      continue;
    }

    // Lesson file.
    if (parts.length !== 4 || !/^\d{2}-.+\.mdx$/.test(filename)) {
      errors.push(`${rel}: lesson files must be at lang/level/module/NN-slug.mdx`);
      continue;
    }

    const parsed = lessonSchema.safeParse(data);
    if (!parsed.success) {
      errors.push(`${rel}: invalid lesson frontmatter — ${parsed.error.message}`);
      continue;
    }

    const [, levelDir, moduleDir] = parts;
    const levelMatch = /^l(\d)-/.exec(levelDir);
    if (!levelMatch) {
      errors.push(`${rel}: level directory "${levelDir}" doesn't match the l<N>-slug pattern`);
    } else if (Number(levelMatch[1]) !== parsed.data.level) {
      errors.push(
        `${rel}: frontmatter level (${parsed.data.level}) doesn't match path level (${levelDir})`,
      );
    }

    if (parsed.data.module !== moduleDir) {
      errors.push(
        `${rel}: frontmatter module ("${parsed.data.module}") doesn't match path module ("${moduleDir}")`,
      );
    }

    if (noDrafts && parsed.data.draft) {
      errors.push(`${rel}: draft: true is not allowed with --no-drafts`);
    }

    // A lesson may never claim a verified_version ahead of the changelog ledger pin:
    // the pin is the newest release whose bullets have all been triaged, so anything
    // beyond it is an unverifiable claim (see .claude/rules/content.md, "Changelog facts").
    if (ledgerPin) {
      try {
        if (compareVersions(parsed.data.verified_version, ledgerPin) > 0) {
          errors.push(
            `${rel}: verified_version ${parsed.data.verified_version} is newer than the changelog ` +
              `ledger pin ${ledgerPin} — triage the backlog with /changelog-triage and bump the pin first`,
          );
        }
      } catch (err) {
        // An uncomparable value is a gate FAILURE, never a silent pass.
        errors.push(
          `${rel}: verified_version ${JSON.stringify(parsed.data.verified_version)} cannot be ` +
            `compared with the ledger pin ${ledgerPin}: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }
  }

  for (const p of enPaths) {
    if (!trPaths.has(p)) errors.push(`content/en/${p}: missing TR counterpart (content/tr/${p})`);
  }
  for (const p of trPaths) {
    if (!enPaths.has(p)) errors.push(`content/tr/${p}: missing EN counterpart (content/en/${p})`);
  }

  return { ok: errors.length === 0, errors, filesChecked: mdxFiles.length };
}

function isDirectRun(): boolean {
  const invoked = process.argv[1];
  if (!invoked) return false;
  try {
    return fileURLToPath(import.meta.url) === resolve(invoked);
  } catch {
    return false;
  }
}

if (isDirectRun()) {
  const noDrafts = process.argv.includes('--no-drafts');
  const result = await runContentGate({ noDrafts });
  if (result.ok) {
    console.log(`content gate: OK (${result.filesChecked} files checked)`);
  } else {
    console.error(`content gate: FAILED (${result.errors.length} problem(s))\n`);
    for (const e of result.errors) console.error(`  - ${e}`);
    process.exit(1);
  }
}
