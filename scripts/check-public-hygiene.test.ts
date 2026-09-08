import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

// Test strings are assembled at runtime so this file never contains a literal offending value.
const ip = ['203', '0', '113', '9'].join('.'); // TEST-NET-3 documentation range
const optPath = ['', 'opt', 'example', 'sites', 'x'].join('/');

function run(text: string, label: string, env: Record<string, string> = {}) {
  return spawnSync(
    process.execPath,
    ['scripts/check-public-hygiene.mjs', '--stdin', '--label', label],
    {
      input: text,
      encoding: 'utf8',
      env: { ...process.env, ...env },
    },
  );
}

describe('check-public-hygiene --stdin', () => {
  it('passes clean deploy text that uses secrets and loopback', () => {
    const r = run(
      'rsync dist/ "$SSH_USER@$SSH_HOST:$DEPLOY_PATH/" && curl --resolve x:443:127.0.0.1',
      'deploy.yml',
    );
    expect(r.status).toBe(0);
  });
  it('blocks a public IPv4 address', () => {
    const r = run(`ssh user@${ip} ls`, 'notes.md');
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('[ipv4]');
  });
  it('blocks an absolute /opt host path', () => {
    const r = run(`target: ${optPath}`, 'notes.md');
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('[opt-path]');
  });
  it('blocks private key material', () => {
    const r = run(['-----BEGIN', 'PRIVATE KEY-----'].join(' '), 'k.txt');
    expect(r.status).toBe(1);
  });
  it('blocks .env files by path', () => {
    const r = run('X=1', '.env.production');
    expect(r.status).toBe(1);
  });
  it('honours out-of-band private patterns from HYGIENE_EXTRA_PATTERNS', () => {
    const r = run('the secret-project-name host', 'notes.md', {
      HYGIENE_EXTRA_PATTERNS: 'secret-project-name|||other',
    });
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('private-env-1');
  });
  it('--secrets-only ignores infrastructure details but still catches credentials', () => {
    const cmd = spawnSync(
      process.execPath,
      ['scripts/check-public-hygiene.mjs', '--stdin', '--label', 'Bash', '--secrets-only'],
      { input: `ssh user@${ip} ls ${optPath}`, encoding: 'utf8' },
    );
    expect(cmd.status).toBe(0);
    const key = spawnSync(
      process.execPath,
      ['scripts/check-public-hygiene.mjs', '--stdin', '--label', 'Bash', '--secrets-only'],
      { input: ['echo -----BEGIN', 'PRIVATE KEY----- > k'].join(' '), encoding: 'utf8' },
    );
    expect(key.status).toBe(1);
  });
  it('blocks local user profile paths but allows the <you> redaction', () => {
    const win = run(String.raw`C:\Users\someone\AppData\x`, 'notes.md');
    expect(win.status).toBe(1);
    expect(win.stderr).toContain('[user-path]');
    const nix = run('/home/someone/.claude/settings.json', 'notes.md');
    expect(nix.status).toBe(1);
    const ok = run(String.raw`C:\Users\<you>\AppData and /home/<you>/.claude`, 'notes.md');
    expect(ok.status).toBe(0);
  });
  it('exempts the files that describe the patterns', () => {
    const r = run(`${ip} ${optPath}`, '.claude/rules/public-hygiene.md');
    expect(r.status).toBe(0);
  });
});

// --- --commits mode --------------------------------------------------------------------------
// Built against a throwaway repo in a temp dir so the test never depends on this repo's history.
// Identities are assembled at runtime; no offending literal lives in this file.
const OK_NAME = 'codechup';
const OK_EMAIL = ['16761366+codechup', 'users.noreply.github.com'].join('@');
const BAD_NAME = ['Some', 'Person'].join(' ');
const BAD_EMAIL = ['some.person', 'example.com'].join('@');
// Session-id shape mirrors a real one (mixed case, 20+ chars); the value itself is invented.
const SESSION = ['Claude-Session', ' https://claude.ai/code/session_01AbcDefGhiJklMnoPqr'].join(
  ':',
);

let repo = '';
const CHECKER = resolve(process.cwd(), 'scripts/check-public-hygiene.mjs');

function git(args: string[], env: Record<string, string> = {}) {
  const r = spawnSync('git', args, {
    cwd: repo,
    encoding: 'utf8',
    env: { ...process.env, ...env },
  });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`);
  return r.stdout;
}

/** Commit an empty change with an explicit identity, then return its hash. */
function commit(
  message: string,
  { an = OK_NAME, ae = OK_EMAIL, cn = OK_NAME, ce = OK_EMAIL } = {},
): string {
  git(['commit', '--allow-empty', '-m', message], {
    GIT_AUTHOR_NAME: an,
    GIT_AUTHOR_EMAIL: ae,
    GIT_COMMITTER_NAME: cn,
    GIT_COMMITTER_EMAIL: ce,
  });
  return git(['rev-parse', 'HEAD']).trim();
}

/** Scan exactly one commit: <hash>^..<hash>. */
function scanCommit(hash: string, env: Record<string, string> = {}) {
  return spawnSync(process.execPath, [CHECKER, '--commits', `${hash}^..${hash}`], {
    cwd: repo,
    encoding: 'utf8',
    env: { ...process.env, HYGIENE_EXTRA_PATTERNS: '', ...env },
  });
}

describe('check-public-hygiene --commits', () => {
  beforeAll(() => {
    repo = mkdtempSync(join(tmpdir(), 'hygiene-commits-'));
    git(['init', '--initial-branch=main', '--quiet']);
    git(['config', 'user.name', OK_NAME]);
    git(['config', 'user.email', OK_EMAIL]);
    git(['config', 'commit.gpgsign', 'false']);
    writeFileSync(join(repo, 'README.md'), '# throwaway\n');
    git(['add', 'README.md']);
    commit('chore: root commit');
  });
  afterAll(() => {
    if (repo) rmSync(repo, { recursive: true, force: true });
  });

  it('passes a commit with an allowlisted identity and a clean message', () => {
    const r = scanCommit(commit('feat(content): add a lesson (P49)'));
    expect(r.stderr).toBe('');
    expect(r.status).toBe(0);
    expect(r.stdout).toContain('OK (commits');
  });

  it('passes an Anthropic co-author trailer', () => {
    const body = [
      'fix: tidy',
      '',
      `Co-authored-by: Claude <${['noreply', 'anthropic.com'].join('@')}>`,
    ].join('\n');
    const r = scanCommit(commit(body));
    expect(r.status).toBe(0);
  });

  it('fails a commit whose author is off the allowlist', () => {
    const r = scanCommit(commit('chore: nothing', { an: BAD_NAME, ae: BAD_EMAIL }));
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('[commit-author]');
  });

  it('fails a commit whose committer is off the allowlist', () => {
    const r = scanCommit(commit('chore: nothing', { cn: BAD_NAME, ce: BAD_EMAIL }));
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('[commit-committer]');
  });

  it('fails a Co-authored-by trailer carrying a personal identity', () => {
    const body = ['chore: squashed', '', `Co-authored-by: ${BAD_NAME} <${BAD_EMAIL}>`].join('\n');
    const r = scanCommit(commit(body));
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('[commit-trailer]');
  });

  it('fails a Claude-Session trailer', () => {
    const r = scanCommit(commit(['docs: notes', '', SESSION].join('\n')));
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('[commit-session-url]');
  });

  it('fails an out-of-band private pattern in the commit body', () => {
    const r = scanCommit(commit(['chore: deploy', '', 'moved to secret-project-name'].join('\n')), {
      HYGIENE_EXTRA_PATTERNS: 'secret-project-name|||other',
    });
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('private-env-1');
  });

  it('masks the offending identity instead of reprinting it', () => {
    const r = scanCommit(commit('chore: nothing', { an: BAD_NAME, ae: BAD_EMAIL }));
    expect(r.stderr).not.toContain(BAD_EMAIL);
    expect(r.stderr).toContain('•');
  });

  it('exits 2 when the range is missing', () => {
    const r = spawnSync(process.execPath, [CHECKER, '--commits'], { cwd: repo, encoding: 'utf8' });
    expect(r.status).toBe(2);
  });
  // --- adversarial-review regressions (P49) ----------------------------------------------------
  const NL = String.fromCharCode(10);

  it('fails a FOLDED co-author trailer (git resolves it; a line regex did not)', () => {
    const body = ['feat: e', '', 'Co-authored-by:', `  ${BAD_NAME} <${BAD_EMAIL}>`].join(NL);
    const r = scanCommit(commit(body));
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('[commit-trailer]');
  });

  it('fails a personal NAME attached to the allowlisted assistant address', () => {
    const body = [
      'feat: f',
      '',
      `Co-Authored-By: ${BAD_NAME} (personal) <${['noreply', 'anthropic.com'].join('@')}>`,
    ].join(NL);
    const r = scanCommit(commit(body));
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('[commit-trailer]');
  });

  it('fails any -by trailer, not only Co-authored-by/Signed-off-by', () => {
    const body = ['feat: h', '', `Reviewed-by: ${BAD_NAME} <${BAD_EMAIL}>`].join(NL);
    const r = scanCommit(commit(body));
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('[commit-trailer]');
  });

  it('fails a bare address written in prose', () => {
    const r = scanCommit(commit(['docs: notes', '', `thanks to ${BAD_EMAIL}`].join(NL)));
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('[commit-email]');
  });

  it('fails a session URL written in prose, not only as a trailer', () => {
    const url = SESSION.split(': ')[1];
    const r = scanCommit(commit(['docs: notes', '', `see ${url} for context`].join(NL)));
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('[session-url]');
  });

  it('blocks a session URL in a tracked file too, not only in commit metadata', () => {
    const r = run(`see ${SESSION.split(': ')[1]} for context`, 'docs/x.md');
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('[session-url]');
  });

  it('accepts the allowlisted identity typed with different capitalisation', () => {
    const mixed = ['16761366+CodeChup', 'Users.NoReply.GitHub.com'].join('@');
    const r = scanCommit(commit('feat: k', { ae: mixed, ce: mixed }));
    expect(r.stderr).toBe('');
    expect(r.status).toBe(0);
  });

  it('never republishes the offending value: the mask is a FIXED shape', () => {
    const r = scanCommit(commit('chore: nothing', { an: BAD_NAME, ae: BAD_EMAIL }));
    expect(r.stderr).not.toContain(BAD_EMAIL);
    expect(r.stderr).not.toContain(BAD_NAME.slice(0, 3));
    // no length-preserving run of bullets: every redaction is the same 8-bullet token
    expect(new RegExp(String.fromCharCode(8226) + '{9,}').test(r.stderr)).toBe(false);
  });

  it('fails closed on a commit record spliced by a control character in the message', () => {
    const body = ['feat: m', '', `${String.fromCharCode(30)} spliced`, SESSION].join(NL);
    const r = scanCommit(commit(body));
    expect(r.status).toBe(1);
    expect(r.stderr).toMatch(/commit-parse|commit-session-url/);
  });

  it('accepts several revision tokens after --commits (the pre-push new-branch form)', () => {
    const hash = commit('feat: multi');
    const r = spawnSync(process.execPath, [CHECKER, '--commits', '-1', hash], {
      cwd: repo,
      encoding: 'utf8',
      env: { ...process.env, HYGIENE_EXTRA_PATTERNS: '' },
    });
    expect(r.status).toBe(0);
    expect(r.stdout).toContain('OK (commits, 1');
  });
});
