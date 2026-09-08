#!/usr/bin/env node
// check-public-hygiene.mjs — this repository is PUBLIC. Fail if any tracked (or staged) text file
// contains private infrastructure details or secrets. Runs in `npm run lint`, the pre-commit hook,
// and CI. Also usable on a single string via --stdin (the Claude Code PreToolUse hook does that).
//
//   node scripts/check-public-hygiene.mjs            # scan git-tracked files (+ staged)
//   node scripts/check-public-hygiene.mjs --staged   # scan only staged files (pre-commit)
//   echo "text" | node scripts/check-public-hygiene.mjs --stdin [--label name]
//   node scripts/check-public-hygiene.mjs --commits origin/main..HEAD   # scan commit metadata
//   node scripts/check-public-hygiene.mjs --identity  # check this clone's configured git identity
import { execSync, spawnSync } from 'node:child_process';
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
  {
    // A session URL/id is a private link into the owner's Claude account. It must never reach a
    // public repo — not in a commit trailer, not in prose, not in a lesson, not in a file.
    // Documentation placeholders are written in an unmistakably synthetic ALL-CAPS style
    // (`session_01EXAMPLEEXAMPLEEXAMPLE`) or as `<session-id>`, and those are allowed.
    id: 'session-url',
    redact: true,
    re: /(?:claude\.ai\/code\/)?\bsession_[A-Za-z0-9_-]{12,}\b/g,
    why: 'Claude session id/URL (a private link into the owner account)',
    allow: /session_[0-9A-Z_-]+$/,
  },
  {
    // Same for artifact URLs: `claude.ai/code/artifact/<uuid>` names a resource in a private
    // account. `<artifact-id>` and other placeholder forms are fine.
    id: 'artifact-url',
    redact: true,
    re: /claude\.ai\/code\/artifact\/[0-9a-f]{8}[0-9a-f-]*/gi,
    why: 'Claude artifact URL (a private link into the owner account)',
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

// --- commit-metadata policy -------------------------------------------------------------------
// Commit author/committer/co-author identities are checked against a POSITIVE allowlist, so this
// public file never has to spell out which name or address is forbidden. Anything not listed fails.
// ALLOWED_NAME stays case-sensitive on purpose: the display name is an exact value, not a
// protocol field. ALLOWED_EMAIL is case-insensitive because domains are by spec and GitHub's
// noreply local-parts are too — a correctly configured clone must never be red-lighted.
const ALLOWED_NAME = /^(?:codechup|GitHub|dependabot\[bot\]|github-actions\[bot\])$/;
const ALLOWED_EMAIL =
  /^(?:(?:\d+\+)?codechup@users\.noreply\.github\.com|noreply@github\.com|(?:\d+\+)?dependabot\[bot\]@users\.noreply\.github\.com|(?:\d+\+)?github-actions\[bot\]@users\.noreply\.github\.com)$/i;
// Co-author trailers may additionally credit the assistant that helped write the commit. The
// NAME on that trailer is checked too — CLAUDE.md tells every session to type this line, so it
// is the easiest place for a real personal name to ride in behind a well-known address.
const ALLOWED_COAUTHOR_EMAIL = /^noreply@anthropic\.com$/i;
const ALLOWED_COAUTHOR_NAME = /^Claude[\p{L}\p{N} ()[\].+-]*$/u;
// Session URLs are private links into the owner's account and must never reach a public repo.
const SESSION_TRAILER = /^[ \t]*Claude-Session[ \t]*:.*$/gim;
// Any conventional identity trailer, not just Co-authored-by/Signed-off-by: `<Word>-by:` in any
// casing, plus On-behalf-of. Folding (a value on the next line) is handled separately by asking
// git itself to unfold the trailers — see the `%(trailers:unfold,…)` field below.
const IDENTITY_TRAILER =
  /^[ \t]*((?:[A-Za-z][A-Za-z0-9]*-)*[Bb]y|On-behalf-of)[ \t]*:[ \t]*(.+)$/gim;
// Any address at all in a commit message, trailer-shaped or not.
const ANY_EMAIL = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+\b/g;

// Offending values are redacted in the output: this runs in public CI logs, and the point of the
// check is to say "this commit is not publishable", not to republish the value somewhere else.
// The shape is FIXED — no length, word count or punctuation survives, because for a known project
// a length-preserving mask is close to plaintext.
const BULLETS = '••••••••';
const mask = (s) => (String(s ?? '').trim() ? BULLETS : `${BULLETS}(empty)`);
const REDACTED_IDENTITY = `${BULLETS} (redacted — inspect locally: git show -s --format='%an <%ae>%n%B' <hash>)`;

function checkIdentity(name, email, { coauthor = false } = {}) {
  if (coauthor && ALLOWED_COAUTHOR_EMAIL.test(email))
    return ALLOWED_COAUTHOR_NAME.test(String(name).trim()) ? null : REDACTED_IDENTITY;
  if (ALLOWED_NAME.test(name) && ALLOWED_EMAIL.test(email)) return null;
  return REDACTED_IDENTITY;
}

function scanCommit(c) {
  const hits = [];
  const push = (id, why, match) => hits.push({ id, why, line: 0, match });
  for (const [field, name, email] of [
    ['author', c.an, c.ae],
    ['committer', c.cn, c.ce],
  ]) {
    const bad = checkIdentity(name, email);
    if (bad)
      push(
        `commit-${field}`,
        `${field} identity is not on the public allowlist (see .claude/rules/public-hygiene.md)`,
        bad,
      );
  }
  if (SESSION_TRAILER.test(c.body))
    push(
      'commit-session-url',
      'Claude-Session trailer (a private URL into the owner account)',
      'Claude-Session: <redacted>',
    );
  SESSION_TRAILER.lastIndex = 0;
  // (a) trailers as git itself parses them (`%(trailers:unfold,…)`), so a FOLDED trailer —
  //     `Co-authored-by:\n  Name <mail>` — cannot slip past a line-anchored regex; and
  // (b) the same regex over the raw body, belt and braces, for messages git does not treat as
  //     having a trailer block at all.
  const trailerLines = [
    ...(c.trailers ?? '')
      .split('\x02')
      .map((t) => t.trim())
      .filter(Boolean)
      .map((t) => {
        const kv = /^([^:]+):[ \t]*([\s\S]*)$/.exec(t);
        return kv ? [kv[1].trim(), kv[2].trim()] : ['trailer', t];
      }),
    ...[...c.body.matchAll(IDENTITY_TRAILER)].map((m) => [m[1], m[2].trim()]),
  ];
  const seenTrailer = new Set();
  for (const [key, value] of trailerLines) {
    if (!/(?:-by|On-behalf-of|trailer)$/i.test(key)) continue;
    const dedupe = `${key.toLowerCase()} ${value}`;
    if (seenTrailer.has(dedupe)) continue;
    seenTrailer.add(dedupe);
    const t = /^(.*?)[ \t]*<([^>]*)>/.exec(value);
    const bad = t ? checkIdentity(t[1].trim(), t[2].trim(), { coauthor: true }) : mask(value);
    if (bad) push('commit-trailer', `${key} trailer identity is not on the public allowlist`, bad);
  }
  // Any address anywhere in the message — prose, a folded trailer, a hand-reflowed squash body.
  for (const m of `${c.subject}\n${c.body}`.matchAll(ANY_EMAIL)) {
    if (ALLOWED_EMAIL.test(m[0]) || ALLOWED_COAUTHOR_EMAIL.test(m[0])) continue;
    push(
      'commit-email',
      'the commit message carries an email address that is not on the public allowlist',
      REDACTED_IDENTITY,
    );
    break;
  }
  // (a) the out-of-band private patterns (and every other file rule) applied to the message text.
  for (const h of scanText(`${c.subject}\n${c.body}`, 'COMMIT_MSG'))
    push(h.id, h.why, mask(h.match));
  return hits;
}

const args = process.argv.slice(2);
const mode = args.includes('--commits')
  ? 'commits'
  : args.includes('--identity')
    ? 'identity'
    : args.includes('--stdin')
      ? 'stdin'
      : args.includes('--staged')
        ? 'staged'
        : 'tracked';
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
        hits.push({
          id: r.id,
          why: r.why,
          line: i + 1,
          // A private URL must not be reprinted into a public CI log to say it is private.
          match: r.redact ? mask(m[0]) : m[0].slice(0, 60),
        });
      }
    });
  }
  return hits;
}

let problems = [];
if (mode === 'identity') {
  const cfg = (k) =>
    spawnSync('git', ['config', '--get', k], { encoding: 'utf8' }).stdout?.trim() ?? '';
  const bad = checkIdentity(cfg('user.name'), cfg('user.email'));
  if (bad)
    problems.push({
      file: 'git config',
      id: 'commit-identity',
      why: 'this clone would author commits under an identity that is not on the public allowlist',
      line: 0,
      match: bad,
    });
} else if (mode === 'commits') {
  // Everything after --commits that is not a flag is a revision token, so a caller can pass a
  // range (`a..b`), several ranges, or `<sha> --not --remotes=origin` for a brand-new branch.
  const revs = args.slice(args.indexOf('--commits') + 1).filter((a) => !a.startsWith('--'));
  const notFlags = args
    .slice(args.indexOf('--commits') + 1)
    .filter((a) => a === '--not' || a.startsWith('--remotes') || a.startsWith('--branches'));
  const revArgs = args.slice(args.indexOf('--commits') + 1).filter((a) => {
    if (!a.startsWith('--')) return true;
    return notFlags.includes(a);
  });
  const range = revArgs.join(' ');
  if (revs.length === 0) {
    console.error('public-hygiene: --commits needs a range, e.g. --commits origin/main..HEAD');
    process.exit(2);
  }
  // \x1e separates commits, \x00 separates fields; %B (raw body) comes last so it may contain \n.
  // A message may legally contain \x1e (a NUL cannot — git refuses it), so the field count of
  // every record is validated below rather than trusted.
  const FIELDS = 8;
  const fmt =
    '--format=%x1e%H%x00%an%x00%ae%x00%cn%x00%ce%x00%s%x00%(trailers:unfold,separator=%x02)%x00%B';
  const res = spawnSync('git', ['log', fmt, ...revArgs, '--'], {
    encoding: 'utf8',
    maxBuffer: 64e6,
  });
  if (res.status !== 0) {
    console.error(`public-hygiene: cannot read commits for range "${range}"`);
    if (res.stderr) console.error(res.stderr.trim());
    process.exit(2);
  }
  const records = res.stdout.split('\x1e').filter((s) => s.trim());
  const commits = [];
  for (const rec of records) {
    const f = rec.split('\x00');
    if (f.length < FIELDS) {
      problems.push({
        file: '(commit)',
        id: 'commit-parse',
        why: 'unparseable commit record (a control character in the message?) — scan by hand',
        line: 0,
        match: mask(rec),
      });
      continue;
    }
    const [hash, an, ae, cn, ce, subject, trailers, ...rest] = f;
    commits.push({ hash, an, ae, cn, ce, subject, trailers, body: rest.join('\x00') });
  }
  for (const c of commits)
    for (const h of scanCommit(c)) problems.push({ file: `${c.hash.slice(0, 10)} (commit)`, ...h });
  if (!problems.length) {
    console.log(
      commits.length === 0
        ? `public-hygiene: OK (commits, nothing new to check in ${range})`
        : `public-hygiene: OK (commits, ${commits.length} in ${range})`,
    );
    process.exit(0);
  }
} else if (mode === 'stdin') {
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
