#!/usr/bin/env node
// PostToolUse hook (matcher: Write|Edit) — runs Prettier on the file Claude just wrote or edited,
// so the tree is always in the shape `npm run lint` (`prettier --check .`) expects.
//
// Contract notes (docs/en/hooks.md):
//   * PostToolUse receives {tool_name, tool_input, tool_response, cwd, ...} as JSON on stdin.
//   * PostToolUse is NOT a blocking event, and formatting must never interrupt a session anyway —
//     every path in this file ends in exit 0, including every failure path.
//
// Why we spawn Prettier's own entrypoint with process.execPath instead of `npx prettier`:
// `npx` resolves to a `.cmd` shim on Windows that needs a shell, and shelling out with a file path
// that may contain spaces is exactly the kind of quoting bug that eats an afternoon. Calling
// `node node_modules/prettier/bin/prettier.cjs` is identical on macOS, Linux and Windows.
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, extname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

/** Extensions this repo's Prettier setup actually handles (prettier-plugin-astro adds .astro). */
const KNOWN = new Set([
  '.astro',
  '.css',
  '.html',
  '.js',
  '.json',
  '.jsonc',
  '.md',
  '.mdx',
  '.mjs',
  '.cjs',
  '.mts',
  '.ts',
  '.tsx',
  '.yaml',
  '.yml',
]);

function main() {
  let input;
  try {
    input = JSON.parse(readFileSync(0, 'utf8') || '{}');
  } catch {
    return; // No/!JSON stdin: nothing to format.
  }

  const tool = input.tool_name ?? '';
  if (tool !== 'Write' && tool !== 'Edit') return;

  const filePath = input.tool_input?.file_path;
  if (typeof filePath !== 'string' || filePath.length === 0) return;

  // Resolve relative paths against the session cwd, then require the file to live inside this
  // repository — a session may legitimately edit files elsewhere, and those are not ours to format.
  const abs = isAbsolute(filePath) ? filePath : resolve(input.cwd ?? root, filePath);
  const rel = relative(root, abs).replace(/\\/g, '/');
  if (rel.startsWith('..') || rel.length === 0) return;

  if (!KNOWN.has(extname(abs).toLowerCase())) return;
  if (!existsSync(abs)) return; // e.g. the write failed, or the file was moved after the tool ran.

  const prettier = join(root, 'node_modules', 'prettier', 'bin', 'prettier.cjs');
  if (!existsSync(prettier)) return; // Dependencies not installed yet — not a reason to complain.

  // --ignore-unknown keeps Prettier quiet about types it has no parser for; .prettierignore is
  // honoured automatically, so files this repo deliberately excludes are left alone.
  const r = spawnSync(process.execPath, [prettier, '--write', '--ignore-unknown', rel], {
    cwd: root,
    encoding: 'utf8',
  });

  // Report, never fail. A syntax error in a half-written file is normal mid-session; the author
  // (human or Claude) should see it, but the tool call itself already succeeded.
  if (r.status !== 0) {
    const why = (r.stderr || r.error?.message || '').trim().split('\n')[0] ?? '';
    console.log(`prettier: could not format ${rel}${why ? ` — ${why}` : ''}`);
  }
}

try {
  main();
} catch (err) {
  console.log(`format hook: ${err?.message ?? err}`);
}
process.exit(0);
