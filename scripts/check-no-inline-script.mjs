#!/usr/bin/env node
// Fails the build if a `<script is:inline>` WITHOUT a `src` attribute
// appears anywhere under src/.
//
// The site's CSP has no `'unsafe-inline'` for scripts, so an inline script
// *body* (`<script is:inline>doStuff()</script>`) would be silently
// blocked by real browsers. That's the pattern this check bans.
//
// `is:inline` paired with `src="..."` is a different, CSP-safe thing: it
// only tells Astro not to bundle/hash the referenced file (needed for any
// script that must point at a literal `public/` path, e.g.
// `<script is:inline src="/theme-init.js">` in src/layouts/Base.astro, so
// it can run render-blocking before paint). The browser still fetches and
// executes that as a normal external, same-origin script — exactly what
// `script-src 'self'` allows.
import { readdir, readFile } from 'node:fs/promises';
import { join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_TAG = /<script\b([^>]*)>/g;

function toPosix(p) {
  return p.split(sep).join('/');
}

async function walk(dir) {
  const out = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (err) {
    if (err.code === 'ENOENT') return out;
    throw err;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (entry.isFile()) out.push(full);
  }
  return out;
}

/**
 * Scan `root` (defaults to `<cwd>/src`) for `<script is:inline>` tags with
 * no `src=` attribute. Returns `{ ok, offenders, filesChecked }`.
 */
export async function checkNoInlineScript(root = join(process.cwd(), 'src')) {
  const allFiles = await walk(root);
  const files = allFiles.filter((f) => /\.(astro|mdx|ts|tsx|js|jsx)$/.test(f));

  const offenders = [];
  for (const file of files) {
    const rel = toPosix(relative(root, file));
    const text = await readFile(file, 'utf8');
    for (const match of text.matchAll(SCRIPT_TAG)) {
      const attrs = match[1];
      const isInline = /\bis:inline\b/.test(attrs);
      const hasSrc = /\bsrc\s*=/.test(attrs);
      if (isInline && !hasSrc) {
        offenders.push(`${rel}: <script is:inline> with no src= (inline script body)`);
      }
    }
  }

  return { ok: offenders.length === 0, offenders, filesChecked: files.length };
}

function isDirectRun() {
  const invoked = process.argv[1];
  if (!invoked) return false;
  try {
    return fileURLToPath(import.meta.url) === resolve(invoked);
  } catch {
    return false;
  }
}

if (isDirectRun()) {
  const result = await checkNoInlineScript();
  if (!result.ok) {
    console.error(`check-no-inline-script: found ${result.offenders.length} problem(s):\n`);
    for (const o of result.offenders) console.error(`  - ${o}`);
    console.error(
      '\nInline script bodies are banned by the CSP (no script-src unsafe-inline) — use an external script file instead.',
    );
    process.exit(1);
  }
  console.log(`check-no-inline-script: OK (${result.filesChecked} files scanned)`);
}
