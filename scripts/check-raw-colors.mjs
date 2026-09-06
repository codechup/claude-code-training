#!/usr/bin/env node
// Fails the build if a raw hex/rgb()/rgba()/hsl()/hsla() color literal
// appears anywhere under src/ OUTSIDE src/styles/tokens.css.
//
// The design system is token-only (CLAUDE.md: "Design only through
// tokens"): every color a component uses must resolve to a `--cc-color-*`
// custom property (directly, or via a Tailwind `@theme` alias defined in
// app.css) so a single edit to tokens.css can restyle the whole site and
// dark/light stay in sync. `tokens.css` is the one file allowed to spell
// out literal color values — that's the definition site.
import { readdir, readFile } from 'node:fs/promises';
import { join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const EXTS = /\.(astro|css|ts|tsx|mdx)$/;
// Relative-to-root path (posix-normalized) of the one file allowed to
// contain literal color values.
const ALLOWED_PATH = 'styles/tokens.css';

// Negative lookbehind excludes HTML numeric character references like
// `&#9788;` (a sun/moon glyph, not a color) — a literal "#" preceded by "&".
const HEX_COLOR = /(?<!&)#(?:[0-9a-fA-F]{3,4}){1,2}\b/g;
const FUNC_COLOR = /\b(?:rgba?|hsla?)\s*\(/g;

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
 * Scan `root` (defaults to `<cwd>/src`) for raw color literals outside
 * `styles/tokens.css`. Returns `{ ok, offenders, filesChecked }`.
 */
export async function checkRawColors(root = join(process.cwd(), 'src')) {
  const allFiles = await walk(root);
  const files = allFiles.filter((f) => EXTS.test(f));

  const offenders = [];
  for (const file of files) {
    const rel = toPosix(relative(root, file));
    if (rel === ALLOWED_PATH) continue;

    const text = await readFile(file, 'utf8');
    const lines = text.split(/\r?\n/);
    lines.forEach((line, i) => {
      for (const m of line.matchAll(HEX_COLOR)) {
        offenders.push(
          `${rel}:${i + 1}: raw color literal "${m[0]}" (use a token from tokens.css)`,
        );
      }
      for (const m of line.matchAll(FUNC_COLOR)) {
        offenders.push(
          `${rel}:${i + 1}: raw color function "${m[0]}…" (use a token from tokens.css)`,
        );
      }
    });
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
  const result = await checkRawColors();
  if (result.ok) {
    console.log(`check-raw-colors: OK (${result.filesChecked} files scanned)`);
  } else {
    console.error(`check-raw-colors: found ${result.offenders.length} problem(s):\n`);
    for (const o of result.offenders) console.error(`  - ${o}`);
    console.error(
      '\nRaw color literals are banned outside src/styles/tokens.css — add/reuse a --cc-color-* token instead.',
    );
    process.exit(1);
  }
}
