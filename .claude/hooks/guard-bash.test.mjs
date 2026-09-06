// Unit test for the guard-bash matching logic.
//
// Originally written against `node:test` because `vitest.config.ts` did not collect `.claude/**`
// and that file was outside plan P11's `owned_paths` (see P11's Handoff notes, follow-up 1).
// P12 added `.claude/**/*.test.mjs` to that config, so this now runs in CI with everything else:
//
//   npm test
//
// Only the two imports below changed; `node:test` reported the same 9 tests passing beforehand.
import assert from 'node:assert/strict';
import { test } from 'vitest';
import { assess, root } from './guard-bash.mjs';

const blocked = (cmd) => assert.notEqual(assess(cmd), null, `expected BLOCK: ${cmd}`);
const allowed = (cmd) => assert.equal(assess(cmd), null, `expected ALLOW: ${cmd}`);

test('blocks recursive force-deletes outside build directories', () => {
  blocked('rm -rf /');
  blocked('rm -rf ~');
  blocked('rm -rf src');
  blocked('rm -rf ./content/en');
  blocked('rm -fr ../cct-wt-08');
  blocked('rm -r -f /usr/local/lib');
  blocked('Remove-Item -Recurse -Force C:\\Windows\\System32');
});

test('allows deleting regenerable build output', () => {
  allowed('rm -rf dist');
  allowed('rm -rf ./dist');
  allowed('rm -rf node_modules');
  allowed('rm -rf node_modules dist .astro');
  allowed('rm -rf coverage/ playwright-report/');
  allowed('Remove-Item -Recurse -Force dist');
});

test('confines the disposable-directory exemption to THIS repository', () => {
  // A disposable directory name elsewhere on disk is still someone else's — most importantly a
  // sibling plan's worktree, which CLAUDE.md forbids touching.
  blocked('rm -rf /other/project/node_modules');
  blocked('rm -rf ../cct-wt-08/node_modules');
  blocked('rm -rf ../cct-wt-08/dist');
  // ...but an absolute path to this repo's own build output is fine.
  allowed(`rm -rf ${root.replace(/\\/g, '/')}/dist`);
  allowed(`rm -rf ${root.replace(/\\/g, '/')}/node_modules`);
});

test('allows non-recursive and non-forced removes', () => {
  allowed('rm scratch.txt');
  allowed('rm -r some-empty-dir');
  allowed('rm -f stale.log');
});

test('blocks force-pushes to main and lease-less force-pushes', () => {
  blocked('git push --force origin main');
  blocked('git push --force-with-lease origin main');
  blocked('git push -f origin plan/11-dogfood-claude-setup');
  blocked('git push --force');
});

test('allows ordinary pushes and leased force-pushes off main', () => {
  allowed('git push');
  allowed('git push -u origin plan/11-dogfood-claude-setup');
  allowed('git push --force-with-lease origin plan/11-dogfood-claude-setup');
  allowed('git status');
  allowed('git log --oneline -5');
});

test('blocks writes into .env files but not reads', () => {
  blocked('echo "SECRET=1" > .env');
  blocked('printf "A=1\\n" >> .env.local');
  blocked('cat template | tee .env.production');
  blocked('cp secrets.txt .env');
  blocked('Set-Content .env "A=1"');
  allowed('cat .env.example');
  allowed('grep -c . .env.local');
  allowed('cp .env.example .env.local.sample');
  allowed('echo "PORT=3000" > .env.example');
});

test('inspects every command in a chain', () => {
  blocked('npm run build && rm -rf /');
  blocked('git add -A; git push --force origin main');
  allowed('npm ci && npm run build && rm -rf dist');
});

test('ignores empty and non-string input', () => {
  allowed('');
  allowed('   ');
  assert.equal(assess(undefined), null);
  assert.equal(assess(42), null);
});
