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
//
// This module exports `runContentGate` so it can be reused by the Astro
// integration in `src/integrations/content-gates.ts` (called from
// `astro:build:start`) as well as by this file's own CLI entry point.
import { readFile, readdir } from 'node:fs/promises';
import { join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { lessonSchema, sectionSchema } from '../src/content/schema.ts';

export interface ContentGateOptions {
  /** Root directory containing the `en/` and `tr/` trees. Defaults to `<cwd>/content`. */
  contentRoot?: string;
  /** Fail if any entry has `draft: true`. */
  noDrafts?: boolean;
}

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
