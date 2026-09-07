#!/usr/bin/env node
// check-public-hygiene.mjs — this repository is PUBLIC. Fail if any tracked (or staged) text file
// contains private infrastructure details or secrets. Runs in `npm run lint`, the pre-commit hook,
// and CI. Also usable on a single string via --stdin (the Claude Code PreToolUse hook does that).
//
//   node scripts/check-public-hygiene.mjs            # scan git-tracked files (+ staged)
//   node scripts/check-public-hygiene.mjs --staged   # scan only staged files (pre-commit)
//   echo "text" | node scripts/check-public-hygiene.mjs --stdin [--label name]
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

// Patterns are deliberately generic so this file itself never spells out the private values.
const RULES = [
  {
    id: 'ipv4',
    re: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
    why: 'IPv4 address (hosting IPs never belong in a public repo)',
    allow: /\b(?:127\.0\.0\.1|0\.0\.0\.0|255\.255\.255\.255|10\.0\.0\.\d+|192\.168\.\d+\.\d+)\b/,
  },
  {
    id: 'opt-path',
    re: /\/opt\/[a-z0-9_-]+\/[a-z0-9_./-]*/gi,
    why: 'absolute host path under /opt (deploy target comes from the DEPLOY_PATH secret)',
  },
  {
    id: 'private-key',
    secret: true,
    re: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g,
    why: 'private key material',
  },
  {
    id: 'cert',
    secret: true,
    re: /-----BEGIN CERTIFICATE-----/g,
    why: 'certificate material (deliver via secrets)',
  },
  {
    id: 'ssh-authorized',
    secret: true,
    re: /\bssh-(?:ed25519|rsa) AAAA[0-9A-Za-z+/]{40,}/g,
    why: 'SSH public key blob',
  },
  {
    id: 'anthropic-key',
    secret: true,
    re: /\bsk-ant-[A-Za-z0-9_-]{20,}/g,
    why: 'Anthropic API key',
  },
  {
    id: 'github-token',
    secret: true,
    re: /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{30,}\b/g,
    why: 'GitHub token',
  },
  {
    id: 'cloudflare-token',
    secret: true,
    re: /\bCLOUDFLARE_API_TOKEN\s*[=:]\s*["']?[A-Za-z0-9_-]{30,}/g,
    why: 'Cloudflare API token value',
  },
  {
    id: 'user-path',
    re: /(?:[A-Za-z]:\\Users\\|\/(?:home|Users)\/)(?!<you>|<user>|<name>|you\b|user\b|username\b|USER\b|\$USER|\$\{USER\}|runner\b)[A-Za-z0-9._-]+[\\/]/g,
    why: 'local user profile path (redact the account name as <you>)',
  },
  { id: 'env-file', path: /(^|\/)\.env(\.[a-z]+)?$/i, why: '.env files are never committed' },
  { id: 'key-file', path: /\.(pem|key|p12|pfx)$/i, why: 'key/cert files are never committed' },
];
const SKIP = /^(?:node_modules|dist|\.astro|coverage|playwright-report|test-results)\//;
const BINARY = /\.(png|jpg|jpeg|gif|webp|avif|ico|woff2?|ttf|otf|pdf|zip|gz)$/i;
// Files that legitimately describe the patterns (this checker, its test, the hook, the rule):
const SELF =
  /^(?:scripts\/check-public-hygiene(?:\.test)?\.(?:mjs|ts)|\.claude\/hooks\/guard-hygiene\.mjs|\.claude\/rules\/public-hygiene\.md|\.gitleaks\.toml|\.hygiene\.local\.json)$/;

// Project-specific private names (sibling projects, hostnames, usernames) must NOT live in this
// public file. They are loaded from two optional sources, each a list of regex strings:
//   - env HYGIENE_EXTRA_PATTERNS  ("re1|||re2|||re3")  — set as a CI secret
//   - .hygiene.local.json         ({"patterns": ["re1", "re2"]}) — git-ignored, per machine
function extraRules() {
  const out = [];
  const add = (src, list) =>
    list.filter(Boolean).forEach((p, i) =>
      out.push({
        id: `private-${src}-${i + 1}`,
        re: new RegExp(p, 'gi'),
        why: 'private project detail (pattern supplied out-of-band, D026)',
      }),
    );
  if (process.env.HYGIENE_EXTRA_PATTERNS)
    add('env', process.env.HYGIENE_EXTRA_PATTERNS.split('|||'));
  try {
    add(
      'local',
      JSON.parse(readFileSync(new URL('../.hygiene.local.json', import.meta.url), 'utf8'))
        .patterns ?? [],
    );
  } catch {
    /* optional */
  }
  return out;
}
RULES.push(...extraRules());

const args = process.argv.slice(2);
const mode = args.includes('--stdin') ? 'stdin' : args.includes('--staged') ? 'staged' : 'tracked';
const label = args[args.indexOf('--label') + 1] || '<stdin>';
// --secrets-only: scan a shell command rather than file content — only credential material counts,
// because a command that *reads* a private system (ssh, gh -R, curl) is legitimate; what must never
// happen is that value landing in a tracked file, and the file-level scans catch that.
const secretsOnly = args.includes('--secrets-only');

function scanText(text, name) {
  const hits = [];
  for (const r of RULES) {
    if (secretsOnly && !r.secret) continue;
    if (r.path) {
      if (r.path.test(name)) hits.push({ id: r.id, why: r.why, line: 0, match: name });
      continue;
    }
    const lines = text.split(/\r?\n/);
    lines.forEach((l, i) => {
      for (const m of l.matchAll(r.re)) {
        if (r.allow && r.allow.test(m[0])) continue;
        hits.push({ id: r.id, why: r.why, line: i + 1, match: m[0].slice(0, 60) });
      }
    });
  }
  return hits;
}

let problems = [];
if (mode === 'stdin') {
  const text = readFileSync(0, 'utf8');
  problems = SELF.test(label) ? [] : scanText(text, label).map((h) => ({ file: label, ...h }));
} else {
  const cmd =
    mode === 'staged' ? 'git diff --cached --name-only --diff-filter=ACMR' : 'git ls-files';
  const files = execSync(cmd, { encoding: 'utf8' })
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
  for (const f of files) {
    if (SKIP.test(f) || BINARY.test(f) || SELF.test(f)) continue;
    let text;
    try {
      text =
        mode === 'staged'
          ? execSync(`git show :${JSON.stringify(f)}`, { encoding: 'utf8' })
          : readFileSync(f, 'utf8');
    } catch {
      continue;
    }
    for (const h of scanText(text, f)) problems.push({ file: f, ...h });
  }
}

if (problems.length) {
  console.error(`public-hygiene: ${problems.length} problem(s) — this repository is public.`);
  for (const p of problems)
    console.error(`  ${p.file}:${p.line}  [${p.id}] ${p.why}  → "${p.match}"`);
  process.exit(1);
}
console.log(`public-hygiene: OK (${mode})`);
