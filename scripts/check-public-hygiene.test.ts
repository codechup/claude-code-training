import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

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
  it('exempts the files that describe the patterns', () => {
    const r = run(`${ip} ${optPath}`, '.claude/rules/public-hygiene.md');
    expect(r.status).toBe(0);
  });
});
