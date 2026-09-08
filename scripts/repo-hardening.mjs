#!/usr/bin/env node
// Applies — and then VERIFIES — the public-repository hardening baseline for
// this project's GitHub repositories, so the settings are a script in the repo
// rather than a click-path in someone's memory. If a repository is ever deleted
// and recreated, `node scripts/repo-hardening.mjs --repo owner/name` puts it
// back exactly as it was.
//
// Design notes
// ------------
//  * Every setting is read BEFORE, applied only if it differs, and read AGAIN
//    afterwards. The table prints setting -> before -> after, so the output is
//    the evidence (CLAUDE.md "Evidence (D093)") rather than a claim.
//  * Idempotent by construction: a second run reports every row `unchanged`
//    and issues no writes.
//  * Nothing repo-specific is hard-coded. The Actions allowlist and the
//    required status-check contexts are DERIVED from the repository's own
//    `.github/workflows/*.yml` on its default branch, and the tag ruleset is
//    created only for a repository that actually carries `lesson/**` tags.
//  * No secret value is ever read or printed. Every line that reaches stdout
//    passes through redact(); the script only ever asks GitHub about
//    configuration, never about secret contents.
//
// Usage
//   node scripts/repo-hardening.mjs --repo owner/name [--repo owner/other] --dry-run
//   node scripts/repo-hardening.mjs --repo owner/name            # applies
//
// Flags
//   --repo <owner/name>   repository to harden (repeatable, or comma-separated)
//   --dry-run             plan only: read everything, write nothing
//   --skip-rulesets       skip the branch/tag rulesets (features + security only)
//   --check <context>     extra required status-check context (repeatable)
//   --skip-check <ctx>    drop a derived context from the required list (repeatable)
//   --action-pattern <p>  extra allowed-action pattern, e.g. `foo/bar@*` (repeatable)
//   --json                emit the plan as JSON after the table
//
// Requires the `gh` CLI, authenticated as an account with admin on the repo.
// See docs/deploy/hardening.md for what each item buys and for the
// account-level settings that cannot be scripted.
import { execFileSync } from 'node:child_process';
import { parse as parseYaml } from 'yaml';

/* ------------------------------------------------------------------ args -- */

function parseArgs(argv) {
  const opts = {
    repos: [],
    dryRun: false,
    skipRulesets: false,
    extraChecks: [],
    skipChecks: [],
    extraPatterns: [],
    json: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    const next = () => {
      const v = argv[++i];
      if (v === undefined) throw new Error(`${a} needs a value`);
      return v;
    };
    if (a === '--repo') opts.repos.push(...next().split(',').filter(Boolean));
    else if (a === '--dry-run') opts.dryRun = true;
    else if (a === '--skip-rulesets') opts.skipRulesets = true;
    else if (a === '--check') opts.extraChecks.push(next());
    else if (a === '--skip-check') opts.skipChecks.push(next());
    else if (a === '--action-pattern') opts.extraPatterns.push(next());
    else if (a === '--json') opts.json = true;
    else if (a === '--help' || a === '-h') opts.help = true;
    else throw new Error(`unknown argument: ${a}`);
  }
  return opts;
}

const USAGE = `repo-hardening — apply and verify the public-repo hardening baseline

  node scripts/repo-hardening.mjs --repo owner/name [--repo owner/other] [--dry-run]

  --repo <owner/name>   repository to harden (repeatable, or comma-separated)
  --dry-run             plan only: read everything, write nothing
  --skip-rulesets       features + security only, no branch/tag rulesets
  --check <context>     extra required status-check context (repeatable)
  --skip-check <ctx>    drop a derived context from the required list (repeatable)
  --action-pattern <p>  extra allowed-action pattern (repeatable)
  --json                also emit the plan as JSON

See docs/deploy/hardening.md.`;

/* --------------------------------------------------------------- redact -- */

// Belt and braces. This script never requests a secret value, but anything it
// prints (including a gh error body) is scrubbed of credential-shaped strings
// first, so a surprising API response can never leak one into a CI log.
const SECRETISH = [
  /gh[pousr]_[A-Za-z0-9]{16,}/g,
  /github_pat_[A-Za-z0-9_]{20,}/g,
  /\b(?:sk|rk)-[A-Za-z0-9_-]{20,}/g,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g,
];
function redact(text) {
  let out = String(text);
  for (const re of SECRETISH) out = out.replace(re, '[redacted]');
  return out;
}
const log = (...parts) => console.log(redact(parts.join(' ')));

/* ------------------------------------------------------------------- gh -- */

function gh(args, { input } = {}) {
  return execFileSync('gh', args, {
    encoding: 'utf8',
    input,
    stdio: ['pipe', 'pipe', 'pipe'],
    maxBuffer: 16 * 1024 * 1024,
  });
}

/** GET a JSON endpoint. Returns { ok, status, body }. Never throws on 4xx. */
function ghGet(path) {
  try {
    const raw = gh(['api', '-i', path]);
    return parseIncluded(raw);
  } catch (err) {
    const raw = `${err.stdout ?? ''}`;
    if (raw.startsWith('HTTP/')) return parseIncluded(raw);
    throw new Error(`gh api ${path} failed: ${redact(err.stderr || err.message)}`);
  }
}

function parseIncluded(raw) {
  const headerEnd =
    raw.indexOf('\r\n\r\n') >= 0 ? raw.indexOf('\r\n\r\n') + 4 : raw.indexOf('\n\n') + 2;
  const head = raw.slice(0, headerEnd);
  const bodyText = raw.slice(headerEnd).trim();
  const status = Number(/HTTP\/[\d.]+\s+(\d{3})/.exec(head)?.[1] ?? 0);
  let body = null;
  if (bodyText) {
    try {
      body = JSON.parse(bodyText);
    } catch {
      body = bodyText;
    }
  }
  return { ok: status >= 200 && status < 300, status, body };
}

/** Write to an endpoint. Throws with a readable message on failure. */
function ghWrite(method, path, payload) {
  const args = ['api', '--method', method, path];
  if (payload !== undefined) args.push('--input', '-');
  else args.push('-H', 'Content-Length: 0');
  try {
    gh(args, { input: payload === undefined ? undefined : JSON.stringify(payload) });
  } catch (err) {
    throw new Error(`gh api ${method} ${path} failed: ${redact(err.stderr || err.message)}`);
  }
}

/* -------------------------------------------------- workflow derivation -- */

const GITHUB_OWNED_OWNERS = new Set(['actions', 'github']);

/**
 * Read `.github/workflows/*.y[a]ml` from the repository's default branch and
 * derive (a) the third-party actions it actually uses and (b) the check
 * contexts a pull request produces. Deriving beats guessing: a workflow the
 * repo grows later shows up in the next run's diff instead of silently
 * failing against a stale allowlist.
 */
function readWorkflows(repo) {
  const listing = ghGet(`repos/${repo}/contents/.github/workflows`);
  if (!listing.ok || !Array.isArray(listing.body)) return [];
  const files = listing.body.filter((f) => f.type === 'file' && /\.ya?ml$/.test(f.name));
  return files.map((f) => {
    const res = ghGet(`repos/${repo}/contents/${f.path}`);
    const text = Buffer.from(res.body?.content ?? '', 'base64').toString('utf8');
    let doc = null;
    try {
      doc = parseYaml(text);
    } catch (err) {
      log(`  ! could not parse ${f.path}: ${err.message}`);
    }
    return { path: f.path, text, doc };
  });
}

function derivedActionPatterns(workflows) {
  const patterns = new Set();
  for (const wf of workflows) {
    // `uses:` may appear at step level or as a reusable-workflow job. A regex
    // over the raw text catches both without walking every job shape.
    for (const m of wf.text.matchAll(/^\s*(?:-\s+)?uses:\s*['"]?([^'"\s#]+)/gm)) {
      const ref = m[1];
      if (ref.startsWith('./') || ref.startsWith('docker://')) continue; // local / docker
      const [owner, name] = ref.split('@')[0].split('/');
      if (!owner || !name) continue;
      if (GITHUB_OWNED_OWNERS.has(owner)) continue; // covered by github_owned_allowed
      patterns.add(`${owner}/${name}@*`);
    }
  }
  return [...patterns].sort();
}

function triggersOnPullRequest(doc) {
  // `on:` unquoted in YAML 1.1 parses as the boolean true; the `yaml` package
  // is YAML 1.2 and keeps it as the string "on", so check both keys.
  const on = doc?.on ?? doc?.true ?? doc?.['on'];
  if (!on) return false;
  if (typeof on === 'string') return on === 'pull_request';
  if (Array.isArray(on)) return on.includes('pull_request');
  return Object.prototype.hasOwnProperty.call(on, 'pull_request');
}

function derivedCheckContexts(workflows) {
  const contexts = new Set();
  for (const wf of workflows) {
    if (!wf.doc || !triggersOnPullRequest(wf.doc)) continue;
    for (const [id, job] of Object.entries(wf.doc.jobs ?? {})) {
      if (!job || typeof job !== 'object') continue;
      // A job gated on a repository variable or a secret may legitimately not
      // run; requiring it would wedge every PR on a permanently pending check.
      const cond = job.if === undefined ? '' : String(job.if);
      if (/\b(vars|secrets)\./.test(cond)) continue;
      contexts.add(typeof job.name === 'string' ? job.name : id);
    }
  }
  return [...contexts].sort();
}

function hasLessonTags(repo) {
  const res = ghGet(`repos/${repo}/git/matching-refs/tags/lesson/`);
  return res.ok && Array.isArray(res.body) && res.body.length > 0;
}

/* ------------------------------------------------------------- settings -- */

const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const fmt = (v) => {
  if (v === null || v === undefined) return '—';
  if (typeof v === 'string') return v;
  if (Array.isArray(v)) return v.join(', ') || '(none)';
  return JSON.stringify(v);
};

/**
 * Build the list of settings for one repository. Each entry is
 *   { name, read() -> value, desired, apply() }
 * plus an optional `note` explaining a skip.
 */
function buildPlan(repo, ctx) {
  const settings = [];
  const add = (s) => settings.push(s);

  /* -- repository features and merge policy ------------------------------ */
  // One PATCH covers them all, so they share a read of `repos/{repo}` but are
  // reported (and diffed) one row at a time — a table that says "features"
  // hides which of the six actually changed.
  const repoFields = {
    has_wiki: false, // wiki: an unversioned second source of truth. The docs live in the repo.
    has_projects: false, // projects: unused; an empty tab invites drive-by issues.
    has_discussions: false, // discussions: unmoderated surface, no one watching it.
    allow_squash_merge: true, // squash only — CLAUDE.md: "main is PR-only", one commit per plan.
    allow_merge_commit: false,
    allow_rebase_merge: false,
    delete_branch_on_merge: true, // plan/NN-* branches are disposable after the squash.
  };
  const readRepo = () => ghGet(`repos/${repo}`).body ?? {};
  const patchRepo = (payload) => ghWrite('PATCH', `repos/${repo}`, payload);
  for (const [field, want] of Object.entries(repoFields)) {
    add({
      name: `repo.${field}`,
      read: () => readRepo()[field] ?? null,
      desired: want,
      apply: () => patchRepo({ [field]: want }),
    });
  }

  /* -- Dependabot -------------------------------------------------------- */
  // GET returns 204 when enabled and 404 when not; there is no JSON body.
  add({
    name: 'dependabot.alerts',
    read: () => ghGet(`repos/${repo}/vulnerability-alerts`).status === 204,
    desired: true,
    apply: () => ghWrite('PUT', `repos/${repo}/vulnerability-alerts`),
  });
  add({
    name: 'dependabot.security_updates',
    read: () => ghGet(`repos/${repo}/automated-security-fixes`).body?.enabled === true,
    desired: true,
    // Requires alerts to be on first; the settings run in order.
    apply: () => ghWrite('PUT', `repos/${repo}/automated-security-fixes`),
  });

  /* -- secret scanning extras ------------------------------------------- */
  // Base secret scanning and push protection are already on (GitHub enables
  // them for public repos); these two are the parts that are not automatic.
  const sec = (key) => ghGet(`repos/${repo}`).body?.security_and_analysis?.[key]?.status ?? null;
  for (const key of ['secret_scanning_non_provider_patterns', 'secret_scanning_validity_checks']) {
    add({
      name: `security.${key}`,
      read: () => sec(key),
      desired: 'enabled',
      apply: () => patchRepo({ security_and_analysis: { [key]: { status: 'enabled' } } }),
    });
  }
  add({
    name: 'security.private_vulnerability_reporting',
    read: () => ghGet(`repos/${repo}/private-vulnerability-reporting`).body?.enabled === true,
    desired: true,
    apply: () => ghWrite('PUT', `repos/${repo}/private-vulnerability-reporting`),
  });

  /* -- Actions ----------------------------------------------------------- */
  const patterns = [...new Set([...ctx.actionPatterns, ...ctx.extraPatterns])].sort();
  add({
    name: 'actions.allowed_actions',
    read: () => ghGet(`repos/${repo}/actions/permissions`).body?.allowed_actions ?? null,
    desired: 'selected',
    apply: () =>
      ghWrite('PUT', `repos/${repo}/actions/permissions`, {
        enabled: true,
        allowed_actions: 'selected',
      }),
  });
  add({
    name: 'actions.selected_actions',
    read: () => {
      const res = ghGet(`repos/${repo}/actions/permissions/selected-actions`);
      // 409 = the repo still allows everything, so there is no selection yet.
      if (!res.ok) return null;
      return {
        github_owned_allowed: res.body.github_owned_allowed,
        verified_allowed: res.body.verified_allowed,
        patterns_allowed: [...(res.body.patterns_allowed ?? [])].sort(),
      };
    },
    desired: {
      github_owned_allowed: true, // actions/checkout, actions/setup-node, …
      verified_allowed: true,
      patterns_allowed: patterns, // derived from this repo's own workflows
    },
    apply: () =>
      ghWrite('PUT', `repos/${repo}/actions/permissions/selected-actions`, {
        github_owned_allowed: true,
        verified_allowed: true,
        patterns_allowed: patterns,
      }),
  });
  add({
    name: 'actions.workflow_permissions',
    read: () => {
      const b = ghGet(`repos/${repo}/actions/permissions/workflow`).body ?? {};
      return {
        default_workflow_permissions: b.default_workflow_permissions,
        can_approve_pull_request_reviews: b.can_approve_pull_request_reviews,
      };
    },
    desired: {
      default_workflow_permissions: 'read',
      can_approve_pull_request_reviews: false,
    },
    apply: () =>
      ghWrite('PUT', `repos/${repo}/actions/permissions/workflow`, {
        default_workflow_permissions: 'read',
        can_approve_pull_request_reviews: false,
      }),
  });
  add({
    name: 'actions.fork_pr_approval',
    read: () =>
      ghGet(`repos/${repo}/actions/permissions/fork-pr-contributor-approval`).body
        ?.approval_policy ?? null,
    desired: 'all_external_contributors',
    apply: () =>
      ghWrite('PUT', `repos/${repo}/actions/permissions/fork-pr-contributor-approval`, {
        approval_policy: 'all_external_contributors',
      }),
  });

  /* -- rulesets ---------------------------------------------------------- */
  if (!ctx.skipRulesets) {
    add(rulesetSetting(repo, branchRuleset(ctx.checkContexts)));
    if (ctx.lessonTags) add(rulesetSetting(repo, lessonTagRuleset()));
  }

  return settings;
}

function branchRuleset(contexts) {
  return {
    name: 'default-branch',
    target: 'branch',
    enforcement: 'active',
    // No bypass actors, deliberately: an admin who wants to force-push
    // disables the ruleset, which is visible in the audit log, rather than
    // holding a standing exemption nobody remembers granting.
    bypass_actors: [],
    conditions: { ref_name: { include: ['~DEFAULT_BRANCH'], exclude: [] } },
    rules: [
      { type: 'deletion' },
      { type: 'non_fast_forward' },
      { type: 'required_linear_history' },
      {
        type: 'pull_request',
        parameters: {
          // 0 approvals: this is a solo-maintainer repo, so requiring a review
          // would only teach the maintainer to bypass the rule. The point of
          // the rule here is that main is only ever written through a PR.
          required_approving_review_count: 0,
          dismiss_stale_reviews_on_push: false,
          require_code_owner_review: false,
          require_last_push_approval: false,
          required_review_thread_resolution: false,
          allowed_merge_methods: ['squash'],
        },
      },
      {
        type: 'required_status_checks',
        parameters: {
          strict_required_status_checks_policy: true,
          do_not_enforce_on_create: false,
          required_status_checks: contexts.map((context) => ({ context })),
        },
      },
    ],
  };
}

function lessonTagRuleset() {
  return {
    name: 'lesson-tags',
    target: 'tag',
    enforcement: 'active',
    bypass_actors: [],
    conditions: { ref_name: { include: ['refs/tags/lesson/**'], exclude: [] } },
    // Every lesson names its lab tag in frontmatter (`lab.repo_tag`). A deleted
    // or moved tag silently breaks the lab of every lesson that cites it.
    rules: [{ type: 'deletion' }, { type: 'non_fast_forward' }, { type: 'update' }],
  };
}

/** Compare only the fields we manage — GitHub adds ids, _links, timestamps. */
function normaliseRuleset(rs) {
  if (!rs) return null;
  const rules = [...(rs.rules ?? [])]
    .map((r) => ({ type: r.type, parameters: r.parameters ?? undefined }))
    .sort((a, b) => a.type.localeCompare(b.type));
  return {
    target: rs.target,
    enforcement: rs.enforcement,
    bypass_actors: (rs.bypass_actors ?? []).map((a) => a.actor_id ?? a),
    conditions: rs.conditions ?? null,
    rules,
  };
}

function rulesetSetting(repo, desiredRuleset) {
  const findExisting = () => {
    const list = ghGet(`repos/${repo}/rulesets`);
    if (!list.ok || !Array.isArray(list.body)) return null;
    const hit = list.body.find((r) => r.name === desiredRuleset.name);
    if (!hit) return null;
    const full = ghGet(`repos/${repo}/rulesets/${hit.id}`);
    return full.ok ? full.body : null;
  };
  return {
    name: `ruleset.${desiredRuleset.name}`,
    read: () => normaliseRuleset(findExisting()),
    desired: normaliseRuleset(desiredRuleset),
    detail: desiredRuleset,
    apply: () => {
      const existing = findExisting();
      if (existing) ghWrite('PUT', `repos/${repo}/rulesets/${existing.id}`, desiredRuleset);
      else ghWrite('POST', `repos/${repo}/rulesets`, desiredRuleset);
    },
  };
}

/* ------------------------------------------------------------------ run -- */

// A ruleset's JSON is far too wide for a terminal table, so cells are clipped
// and anything clipped is reprinted in full underneath. The table stays
// scannable; the evidence stays complete.
const CELL = 46;
const clip = (s) => (s.length > CELL ? `${s.slice(0, CELL - 1)}…` : s);

function table(rows) {
  const headers = ['setting', 'before', 'after', 'result'];
  const body = rows.map((r) => [r.name, clip(r.before), clip(r.after), r.result]);
  const data = [headers, ...body];
  const widths = headers.map((_, i) => Math.max(...data.map((r) => String(r[i]).length)));
  const line = (cells) =>
    cells
      .map((c, i) => String(c).padEnd(widths[i]))
      .join('  ')
      .trimEnd();
  const out = [line(headers), widths.map((w) => '-'.repeat(w)).join('  ')];
  for (const r of body) out.push(line(r));

  const clipped = rows.filter((r) => r.before.length > CELL || r.after.length > CELL);
  if (clipped.length) {
    out.push('', 'full values for the clipped rows:');
    for (const r of clipped) {
      out.push(`  ${r.name}`);
      out.push(`    before: ${r.before}`);
      out.push(`    after:  ${r.after}`);
    }
  }
  return out.join('\n');
}

function hardenRepo(repo, opts) {
  log(`\n=== ${repo} ${opts.dryRun ? '(dry run — nothing is written)' : '(applying)'} ===`);

  const probe = ghGet(`repos/${repo}`);
  if (!probe.ok) {
    log(`  ! cannot read repos/${repo} (HTTP ${probe.status}) — skipping`);
    return { repo, rows: [], failed: 1 };
  }
  log(`  default branch: ${probe.body.default_branch}   visibility: ${probe.body.visibility}`);

  const workflows = readWorkflows(repo);
  const actionPatterns = derivedActionPatterns(workflows);
  const checkContexts = [...new Set([...derivedCheckContexts(workflows), ...opts.extraChecks])]
    .filter((c) => !opts.skipChecks.includes(c))
    .sort();
  const lessonTags = opts.skipRulesets ? false : hasLessonTags(repo);
  log(`  workflows read: ${workflows.map((w) => w.path.split('/').pop()).join(', ') || '(none)'}`);
  log(`  derived action allowlist (beyond GitHub-owned + verified): ${fmt(actionPatterns)}`);
  log(`  derived required checks: ${fmt(checkContexts)}`);
  log(`  lesson/** tags present: ${lessonTags ? 'yes — tag ruleset planned' : 'no'}`);

  const plan = buildPlan(repo, {
    actionPatterns,
    checkContexts,
    lessonTags,
    extraPatterns: opts.extraPatterns,
    skipRulesets: opts.skipRulesets,
  });

  const rows = [];
  let failed = 0;
  for (const s of plan) {
    let before;
    try {
      before = s.read();
    } catch (err) {
      rows.push({ name: s.name, before: 'ERROR', after: '—', result: redact(err.message) });
      failed += 1;
      continue;
    }
    if (eq(before, s.desired)) {
      rows.push({ name: s.name, before: fmt(before), after: fmt(before), result: 'unchanged' });
      continue;
    }
    if (opts.dryRun) {
      rows.push({
        name: s.name,
        before: fmt(before),
        after: fmt(s.desired),
        result: 'WOULD CHANGE',
      });
      continue;
    }
    try {
      s.apply();
    } catch (err) {
      rows.push({ name: s.name, before: fmt(before), after: 'ERROR', result: redact(err.message) });
      failed += 1;
      continue;
    }
    // Verify by reading back, not by trusting the write's 2xx.
    let after;
    try {
      after = s.read();
    } catch (err) {
      rows.push({ name: s.name, before: fmt(before), after: 'ERROR', result: redact(err.message) });
      failed += 1;
      continue;
    }
    const ok = eq(after, s.desired);
    if (!ok) failed += 1;
    rows.push({
      name: s.name,
      before: fmt(before),
      after: fmt(after),
      result: ok ? 'changed' : 'NOT APPLIED',
    });
  }

  log('');
  log(table(rows));
  return { repo, rows, failed, plan: { actionPatterns, checkContexts, lessonTags } };
}

function main() {
  let opts;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (err) {
    console.error(redact(err.message));
    console.error(`\n${USAGE}`);
    process.exit(2);
  }
  if (opts.help || opts.repos.length === 0) {
    log(USAGE);
    process.exit(opts.help ? 0 : 2);
  }
  try {
    gh(['auth', 'status']);
  } catch {
    console.error('gh is not authenticated — run `gh auth login` first.');
    process.exit(2);
  }

  const results = opts.repos.map((repo) => hardenRepo(repo, opts));
  const failed = results.reduce((n, r) => n + r.failed, 0);
  const wouldChange = results.reduce(
    (n, r) => n + r.rows.filter((x) => x.result === 'WOULD CHANGE').length,
    0,
  );
  const changed = results.reduce(
    (n, r) => n + r.rows.filter((x) => x.result === 'changed').length,
    0,
  );
  log('');
  log(
    opts.dryRun
      ? `Dry run complete: ${wouldChange} setting(s) would change, ${failed} error(s).`
      : `Done: ${changed} setting(s) changed, ${failed} error(s).`,
  );
  if (opts.json) log(JSON.stringify(results, null, 2));
  process.exit(failed > 0 ? 1 : 0);
}

main();
