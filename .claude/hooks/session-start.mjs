#!/usr/bin/env node
// SessionStart hook — briefs a new session on where the project stands, so it does not have to
// open two files and run a command before it can do anything useful.
//
// Prints:
//   1. the `> **TL;DR:**` line from STATE.md (milestone counts + the current claimable wave), and
//   2. the output of `node tools/plan/cli.ts next` (the claimable plans, with model/effort hints).
//
// Contract notes (docs/en/hooks.md, verified 2026-09-06): SessionStart adds context through
// `hookSpecificOutput: {hookEventName: 'SessionStart', additionalContext}` on stdout. Plain stdout
// is also visible at SessionStart, but the structured field is the documented channel, so we use
// it. SessionStart is not a blocking event and a briefing is never worth failing a session over:
// every path here exits 0.
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

/** The single TL;DR blockquote line STATE.md opens with, without its `> ` marker. */
function stateTldr() {
  try {
    const text = readFileSync(join(root, 'STATE.md'), 'utf8');
    const line = text.split(/\r?\n/).find((l) => l.startsWith('> **TL;DR:**'));
    return line ? line.replace(/^>\s?/, '') : null;
  } catch {
    return null;
  }
}

/** `node tools/plan/cli.ts next`, run with the repo root as cwd so it finds plans/ either way. */
function claimablePlans() {
  const r = spawnSync(process.execPath, [join('tools', 'plan', 'cli.ts'), 'next'], {
    cwd: root,
    encoding: 'utf8',
    timeout: 20_000,
  });
  if (r.status !== 0) return null;
  const out = (r.stdout ?? '').trim();
  return out === '' ? null : out;
}

const parts = [];
const tldr = stateTldr();
if (tldr) parts.push(`STATE.md — ${tldr}`);

const next = claimablePlans();
if (next) parts.push(`Claimable plans (\`node tools/plan/cli.ts next\`):\n\n${next}`);

if (parts.length > 0) {
  parts.push(
    'Read CLAUDE.md, then your plan file, before touching anything. Claim with ' +
      '`node tools/plan/cli.ts claim PNN --owner <session-name>` and work in `../cct-wt-NN`.',
  );
  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'SessionStart',
        additionalContext: parts.join('\n\n'),
      },
    }),
  );
}
process.exit(0);
