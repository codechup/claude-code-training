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
import { join } from 'node:path';

const ROOT = join(process.cwd(), 'src');

async function walk(dir) {
  const out = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

const files = (await walk(ROOT)).filter((f) => /\.(astro|mdx|ts|tsx|js|jsx)$/.test(f));

const SCRIPT_TAG = /<script\b([^>]*)>/g;

const offenders = [];
for (const file of files) {
  const text = await readFile(file, 'utf8');
  for (const match of text.matchAll(SCRIPT_TAG)) {
    const attrs = match[1];
    const isInline = /\bis:inline\b/.test(attrs);
    const hasSrc = /\bsrc\s*=/.test(attrs);
    if (isInline && !hasSrc) {
      offenders.push(`${file}: <script is:inline> with no src= (inline script body)`);
    }
  }
}

if (offenders.length > 0) {
  console.error(`check-no-inline-script: found ${offenders.length} problem(s):\n`);
  for (const o of offenders) console.error(`  - ${o}`);
  console.error(
    '\nInline script bodies are banned by the CSP (no script-src unsafe-inline) — use an external script file instead.',
  );
  process.exit(1);
}

console.log(`check-no-inline-script: OK (${files.length} files scanned)`);
