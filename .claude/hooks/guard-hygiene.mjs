#!/usr/bin/env node
// PreToolUse hook — blocks (exit 2) any Write/Edit whose new content, or any Bash command, would put
// private infrastructure details or secrets into this PUBLIC repository. Delegates the pattern list
// to scripts/check-public-hygiene.mjs so there is a single source of truth.
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const checker = join(root, 'scripts', 'check-public-hygiene.mjs');

let input = {};
try {
  input = JSON.parse(readFileSync(0, 'utf8') || '{}');
} catch {
  process.exit(0);
}
const tool = input.tool_name ?? '';
const ti = input.tool_input ?? {};

let text = '';
let label = '';
if (tool === 'Write') {
  text = ti.content ?? '';
  label = ti.file_path ?? 'Write';
} else if (tool === 'Edit') {
  text = ti.new_string ?? '';
  label = ti.file_path ?? 'Edit';
} else if (tool === 'Bash' || tool === 'PowerShell') {
  text = ti.command ?? '';
  label = tool;
} else process.exit(0);

// Only police files inside this repo (a session may legitimately edit a private sibling repo).
if (label !== tool) {
  const rel = relative(root, label).replace(/\\/g, '/');
  if (rel.startsWith('..')) process.exit(0);
  label = rel;
}
if (!text) process.exit(0);

// Shell commands are scanned for credential material only (see the checker's --secrets-only note);
// file writes get the full rule set.
const extra = label === tool ? ['--secrets-only'] : [];
const r = spawnSync(process.execPath, [checker, '--stdin', '--label', label, ...extra], {
  input: text,
  encoding: 'utf8',
});
if (r.status === 0) process.exit(0);

// Current PreToolUse contract: hookSpecificOutput.permissionDecision (exit 2 blocks regardless).
console.log(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: `Blocked by public-hygiene: this repository is public. ${r.stderr.trim()} Move the value to a secret/env var or describe it generically (see .claude/rules/public-hygiene.md).`,
    },
  }),
);
process.exit(2);
