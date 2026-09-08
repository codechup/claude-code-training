---
id: P49
title: 'Public-repo hardening and a changelog-currency pipeline'
milestone: M4
status: review
owner: lane5-opus
branch: plan/49-public-hardening-currency
model_hint: opus
effort_hint: high
depends_on: [P47, P48]
owned_paths:
  - .claude/rules/content.md
  - .claude/rules/public-hygiene.md
  - .claude/skills/changelog-triage/**
  - .github/ISSUE_TEMPLATE/**
  - .github/workflows/changelog-weekly.yml
  - docs/deploy/hardening.md
  - research/changelog/**
  - research/deprecations.md
  - scripts/changelog-drift.mjs
  - scripts/changelog-drift.test.ts
  - scripts/check-public-hygiene.mjs
  - scripts/check-public-hygiene.test.ts
  - scripts/repo-hardening.mjs
  - scripts/git-hooks/pre-push
  - scripts/install-hooks.sh
  - plans/P49-public-hardening-currency.md
  - plans/P50-gateway-sessions-telemetry.md
  - scripts/drift-issue-body.mjs
  - scripts/__fixtures__/content-gate/pin-above/**
  - scripts/__fixtures__/content-gate/pin-nonversion/**
  - scripts/__fixtures__/content-gate/pin-prerelease/**
shared_paths:
  - .github/workflows/ci.yml
  - .github/workflows/links-weekly.yml
  - .gitignore
  - scripts/content-gate.ts
  - scripts/content-gate.test.ts
  - src/content/schema.ts
  - docs/design/CANVAS.md
  - docs/release/M0-release.md
  - plans/README.md
  - plans/P00-design-canvas.md
  - plans/P09-search-seo.md
  - plans/P22-lab-repo-scaffold.md
  - plans/P30-l3-m13-headless-ci.md
  - plans/P35-l4-m18-multi-session.md
  - plans/P48-kiln-redesign.md
  - content/en/l3-advanced/m15-platforms/04-web-and-cloud-sessions.mdx
  - content/tr/l3-advanced/m15-platforms/04-web-and-cloud-sessions.mdx
  - content/en/l4-master/m19-visual/01-artifacts.mdx
  - content/tr/l4-master/m19-visual/01-artifacts.mdx
  - content/en/l1-beginner/m04-commands/05-subcommands.mdx
  - content/tr/l1-beginner/m04-commands/05-subcommands.mdx
  - content/en/l3-advanced/m11-mcp/01-mcp-concepts.mdx
  - content/tr/l3-advanced/m11-mcp/01-mcp-concepts.mdx
  - content/en/l4-master/m20-team/02-managed-settings.mdx
  - content/tr/l4-master/m20-team/02-managed-settings.mdx
  - content/en/playbook/changelog.mdx
  - content/tr/playbook/changelog.mdx
estimate: L
updated_at: 2026-09-08T21:44:26Z
open_questions:
  - 'Resolved in this PR, recorded so the reviewer knows why the step exists: `changelog-weekly.yml` now runs `gh label create drift --force` before upserting the issue, because `gh issue create --label drift` fails outright when the label does not exist and would have made the first scheduled run red for a non-drift reason.'
  - 'Owner action: set the `HYGIENE_EXTRA_PATTERNS` repo secret on both codechup/claude-code-training and codechup/claude-code-lab. Every check works without it — the private patterns simply are not applied in CI.'
  - 'Changelog entry `2b655e1edca3` (2.1.265, gateway OpenTelemetry export) is `escalated` to P50 and needs a curriculum decision before any lesson is written.'
---

## Goal

Two things the site needs to survive contact with a public repository and a weekly upstream
release. First, **hardening**: nothing that identifies private infrastructure — including a commit
author identity or a session URL in a commit message — can reach either public repo, and the same
contract is enforced in `codechup/claude-code-lab`. Second, **currency**: a deterministic weekly
pipeline that turns the upstream Claude Code changelog into a small, routed backlog, plus the
`/changelog-triage` skill that clears it, a ledger recording every decision, and a content-gate
assertion that makes an unverifiable `verified_version` unmergeable.

## Context

Read before working:

- `.claude/rules/public-hygiene.md` — the rule this plan extends to commit metadata.
- `.claude/rules/content.md` §7 ("Changelog facts") — the triage contract, written by this plan.
- `plans/README.md` §5 for `shared_paths` discipline; `DECISIONS.md` D026, D044, D093, D096, D099.
- `research/feature-inventory.md` heading — the version the course is pinned to.

What existed before this plan: `scripts/check-public-hygiene.mjs` scanned tracked files only; the
course pinned `verified_version: '2.1.263'` in all 119 EN lessons and their Turkish twins with
nothing checking that number against reality; the lab repo had no hygiene checker at all.

## Scope

In:

- `scripts/check-public-hygiene.mjs`: `--commits <range>` (author, committer, `Co-authored-by` and
  `Signed-off-by` identities against a positive allowlist; a ban on `Claude-Session` trailers; the
  file rules applied to the message text, with every offending value masked in the output) and
  `--identity` (this clone's configured git identity).
- `scripts/git-hooks/pre-push` and `scripts/install-hooks.sh`: the same checks at push time and at
  install time; `.github/workflows/ci.yml` gains one `--commits base..head` step on pull requests.
- `scripts/changelog-drift.mjs` + tests: parse the upstream changelog, keep what is newer than the
  ledger pin, drop what the ledger records, classify unrouted `Fixed` bullets as noise, route the
  rest to at most three lessons with their matching lines, and render the issue body.
- `.github/workflows/changelog-weekly.yml`: Monday `fetch` → `route` → `report`, upserting one
  `drift` issue and failing the schedule past either threshold.
- `.claude/skills/changelog-triage/SKILL.md`, `research/changelog/reviewed.json` (the ledger, and
  fixtures), the `verified_version ≤ pin` assertion in `scripts/content-gate.ts`, and
  `docs/deploy/hardening.md` + `scripts/repo-hardening.mjs`.
- The first real triage run against the 2.1.265 backlog, and its lesson edits.
- The sibling changes in `codechup/claude-code-lab`, which carries the same checker.

Out:

- New curriculum. An entry that needs a lesson becomes a plan (P50), never a lesson written inside
  a triage PR.
- Re-verifying `sources[]`; that is `/verify-sources`, quarterly, on changed pages only.

## Deliverables

- `scripts/changelog-drift.mjs`, `scripts/changelog-drift.test.ts`,
  `research/changelog/reviewed.json` and `research/changelog/fixtures/**`.
- `.claude/skills/changelog-triage/SKILL.md`; `.claude/rules/content.md` §7.
- `.github/workflows/changelog-weekly.yml`; `.github/ISSUE_TEMPLATE/lesson-outdated.yml`.
- Commit-metadata hygiene in `scripts/check-public-hygiene.mjs` (+ tests), the pre-push hook,
  `scripts/install-hooks.sh`, and one CI step; `.claude/rules/public-hygiene.md`.
- `docs/deploy/hardening.md`, `scripts/repo-hardening.mjs`.
- The `verified_version ≤ ledger pin` assertion in `scripts/content-gate.ts`.
- The triage output: three edited EN lessons and their Turkish twins, three rows in
  `research/deprecations.md`, three entries on both Playbook changelog pages, 27 ledger decisions,
  the pin at `2.1.265`, and `plans/P50-gateway-sessions-telemetry.md`.

## Acceptance criteria

- `npx prettier --write .`, `npm run typecheck`, `npm run lint`, `npm run gate`, `npm test`,
  `npm run build`, `node tools/plan/cli.ts check` and `npx playwright test` are all green.
- `node scripts/changelog-drift.mjs report` exits 0 with nothing pending.
- `node scripts/check-public-hygiene.mjs --commits origin/main..HEAD` passes on this branch, and
  fails on a commit carrying a `Claude-Session` trailer or an off-allowlist identity (asserted by
  `scripts/check-public-hygiene.test.ts`).
- No lesson's `verified_version` exceeds the ledger pin, and no lesson was bumped that nobody read.
- The lab repo's copy of the checker takes the same flags and applies the same policy.

## Steps

1. Extend the hygiene checker to commit metadata; wire the pre-push hook, the installer and CI.
2. Build `changelog-drift.mjs` against fixtures, then against the live changelog.
3. Write the `/changelog-triage` skill and `.claude/rules/content.md` §7; add the content-gate
   assertion.
4. Run the pipeline for real against 2.1.265 and triage every pending entry.
5. Mirror the checker and the hooks into `codechup/claude-code-lab`.
6. Run every gate, open both PRs, set this plan to `review`.

## Tests required

- `scripts/changelog-drift.test.ts` — parsing, ids, classification, routing, noise, report
  thresholds, and the "parser broke" assertions.
- `scripts/check-public-hygiene.test.ts` — the identity allowlist, the session-trailer ban, masking,
  and the file rules.
- `npm run gate` (EN/TR parity, schema, `verified_version` ≤ pin) and the existing suites.

## Non-goals / pitfalls

- **Never paraphrase a changelog bullet into a "Changed" callout.** Quote it verbatim with its
  version (D093).
- **Never bump `verified_version` for a lesson nobody read.** Lessons legitimately sit below the pin.
- **Never bump the pin past a pending entry.** The pin is a claim about the whole course.
- Do not sweep the course looking for other things a release might have touched; that is exactly
  the token cost the router exists to avoid, and it is how unverified edits get made.
- Do not spell a private value into either repo to make a check fire; the patterns arrive through
  `HYGIENE_EXTRA_PATTERNS` / `.hygiene.local.json`.

## Verification

In ≤10 minutes a reviewer can: run `node scripts/changelog-drift.mjs report` (0, nothing pending);
read `research/changelog/reviewed.json` and check each `applied` id against the three lesson diffs;
check each quoted bullet character-for-character against `node scripts/changelog-drift.mjs fetch`;
confirm the three TR twins mirror their EN sources; and run
`node scripts/check-public-hygiene.mjs --commits origin/main..HEAD`.

## Handoff notes

**What changed.** The four build lanes produced the hygiene, drift, skill and hardening pieces; this
session reconciled their seams, ran the pipeline against the real 2.1.265 backlog, and landed both
repos.

**Triage result (27 pending, all decided).** 3 `applied`, 1 `escalated`, 23 `noop`. Applied:
`b6e5017da222` (`--plugin-dir` takes a folder of plugins → m04-05), `3f4b7249cf17`
(`forceLoginGatewayUrl` forces a gateway session → m20-02), `88edea65b2a9` (an `http` MCP entry
falls back to SSE → m11-01). Escalated: `2b655e1edca3` (gateway OpenTelemetry export) → P50. The
pin moved `2.1.263` → `2.1.265`; six lessons (three EN, three TR) were bumped to `2.1.265`. The
other 113 sit at `2.1.263` on purpose — nobody read them.

**Seams reconciled.** The lab's copy of `check-public-hygiene.mjs` was a fork with a weaker
authorship rule (a denylist of personal addresses) and an optional `--commits` range; it now carries
this repo's policy — a positive identity allowlist, the `Claude-Session` trailer ban, masked output
and `--identity` — with lab-only `SKIP`/`SELF` paths documented inline, and the lab's `pre-push`
passes an explicit range. `changelog-weekly.yml` references only scripts that exist; the content
gate's `verified_version ≤ pin` assertion passes against the ledger as shipped.

**Not done.** The `HYGIENE_EXTRA_PATTERNS` secret on both repos (owner action; every check works
without it, the private patterns simply are not applied in CI), and `scripts/repo-hardening.mjs`
has not been run against either repository — it needs an admin token this session does not have.

**Found while reconciling, owner decision needed.** `codechup/claude-code-lab`'s existing history on
`main` does not pass `--commits`: those commits carry a personal author identity and
`Claude-Session` trailers, and they are already public. Fixing it means rewriting history and
re-pointing all 98 `lesson/*` tags, which the lab's own tag contract forbids doing casually. Both
repos' guards therefore scan only what a push **adds**; the historical rewrite is the owner's call
and is written down in the lab's `.claude/rules/public-hygiene.md` under "Known gap".

### Adversarial review response (three reviewers, 28 findings)

Every finding was reproduced against the code as shipped before it was fixed, and the same
reproduction re-run after. Reproductions used throwaway git repos and bare remotes under the
session scratchpad; nothing here is reconstructed.

**Blockers.**

- `scripts/git-hooks/pre-push` scanned `@{u}..HEAD` — the checked-out branch — after reading the
  pushed refs off stdin and discarding them. Pushing another worktree's branch, `git push --all`
  and `git push <sha>:refs/heads/x` all bypassed it (all three verified landing a personal identity
  + `Claude-Session` trailer on a bare remote). The hook now scans one range per pushed ref, uses
  `<sha> --not --remotes=origin` for a new branch, fails if any ref fails, and only falls back to
  `@{u}`/`origin/main` when stdin carries no refs. Re-verified: all three pushes refused, the clean
  branch still lands. A zero-commit scan now says "nothing new to check" rather than a bare "OK".
- `scripts/changelog-drift.mjs` `parseRawChangelog` silently folded a heading it could not parse
  into the previous section. A `## <heading>` that is not a clean dotted version is now a
  `{version: null, raw}` marker and `fetchDrift` refuses to report drift when one exists. Three
  more anchors added: newest ≥ pin, an npm equality warning, and a `parsedVersionsFloor` (370;
  measured 388 live on 2026-09-09) recorded in the ledger.
- `compareVersions` returned `NaN` for anything non-numeric, and every consumer tests `> 0`, so the
  `newer` filter, the npm cross-check and the content gate's pin assertion all failed **open**. It
  is now total and loud: real semver pre-release precedence, and a throw on an uncomparable value.
- `verified_version` was `z.string().min(1)` and the gate compared it with a **second, local** copy
  of `compareVersions`. The schema now requires a semver release, the gate imports the one
  implementation, and an uncomparable value is a gate failure. Three fixtures added
  (`pin-above`, `pin-prerelease`, `pin-nonversion`).
- `docs/release/M0-release.md` §5–§7b was a written map of the live host (forced-command path, host
  rsync version, a neighbouring site and the jail-escape attempts run against it, the `DEPLOY_PATH`
  value, an on-box directory listing, an internal health-check path). Rewritten to record what the
  gate **proved**, not how the host is built. Because no regex can catch prose, a prose-review
  requirement for `docs/release/**`, `docs/deploy/**` and `docs/launch/**` is now in
  `.claude/rules/public-hygiene.md`.

**Also fixed:** the CI commit-metadata step skipped `push`/`merge_group`, so the squash-merge commit
(a free-text box the merger can edit) was never scanned; folded, odd-cased and non-`Co-authored-by`
identity trailers; a personal NAME riding on `noreply@anthropic.com`; session URLs in prose and in
files; a case-sensitive `ALLOWED_EMAIL` that red-lighted a correct clone; a length-preserving mask
that republished most of the value it redacted; `` record splicing; `Fixed` bullets never
routed even when the identifier was in the index; alphabetical tie-breaks that routed a topic change
to a beginner lesson; `Reverted` weighted below `Improved`; boilerplate that could freeze the pin
forever; no HTTP timeout or job timeout; empty context on tag-routed entries; a silent snapshot
fallback; a silent npm-check skip; a second `drift` issue whenever the first was closed and a body
that destroyed human notes; an unescaped, uncapped issue table; three committed private artifact
URLs; a real cloud session id in a lesson (EN + TR); `.claude/settings.local.json` ignored only by
the owner's machine-global gitignore; first-person session confessionals in plan files.

**Rejected, with evidence.** One sub-suggestion: "apply the same `maxDf` pruning to `tagToLessons`
that `buildIndex` applies to `tokenToLessons`, which would remove `#sessions` from carrying a
worktrees lesson." Measured on the real course — 119 EN lessons, the most common tag (`lab`) is
carried by 12 lessons (10%), and the existing token threshold is 40% (47) — so tag pruning at that
threshold is a no-op and would not drop `#sessions` (df 2). The underlying complaint (a weak tag
route costing the model whole lessons to evaluate) is fixed the other way: tag-routed entries now
carry real context lines, so a bad route is discarded for a few hundred bytes.

**Dead man's switch.** GitHub disables `schedule` after 60 days of repo inactivity and the pipeline
could not notice it had gone dark. `links-weekly.yml` (a separate schedule) now fails when
`changelog-weekly` has not run in 21 days.
