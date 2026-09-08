---
id: P45
title: Milestone M3 release
milestone: M3
status: review
owner: sonnet-p45
branch: plan/45-milestone-3-release
model_hint: sonnet
effort_hint: medium
depends_on: [P40, P41, P42, P43, P44]
owned_paths:
  - docs/release/M3-release.md
shared_paths: []
estimate: M
updated_at: 2026-09-08T03:58:33Z
open_questions:
  - "O6 (giscus repo/category id) is still not set as a repository variable/secret — `gh variable list`/`gh secret list` confirm neither `PUBLIC_GISCUS_REPO_ID` nor `PUBLIC_GISCUS_CATEGORY_ID` exists. Giscus.astro correctly renders its placeholder on a live lesson. Deferred to M4, not release-blocking (owner action)."
  - "The 'agent'->'ajan' Turkish calque follow-up flagged by P40/P44 was fixed on main while this session ran (PR #83, 34 occurrences / 19 files). One occurrence survives on purpose: content/_shared/transcripts/m16-orchestration/04-pipeline-lab/03-workflow-result.txt is a byte-accurate real transcript (D070/D099) and must not be edited to match current terminology preference; recorded here so a future terminology sweep does not try to 'fix' a real recording."
  - "P44 proposed 5 new EN glossary terms (canvas, connector, devcontainer, gateway, teammate), currently only defined in a TR-only 'Ek terimler' section of content/tr/playbook/glossary.mdx. The EN glossary.mdx (P42) should gain matching entries so both languages stay symmetric; owner/curriculum call, not made unilaterally here."
  - "docs/deploy/README.md's Owner action checklist still lists O7 (Cloudflare Web Analytics token) and O8 (feedback worker) as open, unchanged since M1/M2 — owner action, not this plan's to resolve."
---

## Goal

Ship the complete course: every level, both languages, the Playbook, and Meta, all `draft: false` — this is the only release plan that runs `content-gate.ts --no-drafts`, meaning the build itself now fails if a single lesson is still a draft anywhere in the tree. Also turn on giscus comments (if O6 is done by now) and run the full evidence suite one last time before the site is considered launched (M4 is hardening, not new content).

## Context

Read every P40–P44 Handoff notes section. `docs/release/M2-release.md` (P39) is the previous baseline. `Giscus.astro` (P08) already renders a "not yet enabled" placeholder when `PUBLIC_GISCUS_REPO_ID`/`PUBLIC_GISCUS_CATEGORY_ID` are unset — this plan is where those env vars, if the owner has completed O6, actually get set (as repository variables/secrets via `gh`, confirm-before-run per D089) and the placeholder switches to real comments.

## Scope

In:
- `node scripts/content-gate.ts --no-drafts` — the **only** plan in the project that runs the gate with this flag; it must pass, meaning every lesson in `content/{en,tr}/**` (all four levels, Playbook, Meta) is `draft: false`.
- `e2e` sampled across every level, both languages (at least one lesson per level per language, plus Playbook and Meta pages), theme toggle, OS-tab persistence, quiz storage, search hit, and both LangSwitch directions with **no** remaining draft case to test (there should be none left).
- Full `lychee` sweep over the entire repository (`content/**`, `docs/**`, `research/**`).
- LHCI against the complete, final build.
- If O6 is done: set `PUBLIC_GISCUS_REPO_ID`/`PUBLIC_GISCUS_CATEGORY_ID` and confirm `Giscus.astro` renders real comments on a live lesson, not the placeholder. If O6 is not done: leave it as `open_questions` for M4 and note the placeholder is still showing, which is not a blocker for this release (comments are additive).
- Live deploy + edge smoke.
- `docs/release/M3-release.md`: everything above.

Out: editing any content file directly (same rule as P24/P39); the sources-verification sweep (P46, M4) and launch hardening (P47, M4) — this plan does not do either, it only confirms the content is complete and live.

## Deliverables

`docs/release/M3-release.md`.

## Acceptance criteria

- `node scripts/content-gate.ts --no-drafts` passes — zero `draft: true` lessons anywhere in `content/**`.
- The full sampled `e2e` run passes across every level in both languages, axe 0 serious/critical.
- The full-repo `lychee` sweep shows 0 broken links (or every failure triaged/fixed within append-only shared ground, or filed as `open_questions`).
- LHCI meets budget against the complete build.
- A real `deploy.yml` run succeeds and `scripts/smoke/edge.sh` passes against the live site.
- Giscus is either live (if O6 done, verified with a real comment thread loading on a real lesson) or explicitly deferred to `open_questions` with the reason.
- `docs/release/M3-release.md` records everything with real pasted output.

## Steps

1. Read every P40–P44 Handoff notes section.
2. Run `node scripts/content-gate.ts --no-drafts`; if it fails, do not fix content directly — identify which plan's Handoff notes claimed completion incorrectly and file `open_questions` naming it (or, if trivial and within already-owned shared ground, fix and note it).
3. Run the full sampled `e2e` suite across every level/language.
4. Run the full-repo `lychee` sweep; triage.
5. Run LHCI against the complete build.
6. Check O6; if done, set the giscus env vars via `gh` (confirm-before-run) and verify real comments load; if not, note the deferral.
7. Merge to `main`; watch `deploy.yml`; run `scripts/smoke/edge.sh` live.
8. Write `docs/release/M3-release.md`.

## Tests required

`content-gate.ts --no-drafts`; full sampled `e2e` across all levels/languages; full-repo `lychee`; LHCI; live `scripts/smoke/edge.sh`; a manual giscus load check (or a documented deferral).

## Non-goals / pitfalls

- Do not weaken `--no-drafts` to make this plan pass — a remaining draft is a real signal that a translation or content plan's Handoff notes overstated completion; find and name it.
- Do not edit any content file directly from this plan.
- Do not block this entire release on O6 (giscus) — it is additive; defer it explicitly if not ready, do not hold up the whole course launch for a comments feature.

## Verification

A reviewer reads `docs/release/M3-release.md`, confirms `--no-drafts` passed, opens the live site across all four levels in both languages, and checks whether giscus shows a real thread or its documented placeholder.

## Handoff notes

Executed by session `sonnet-p45-2026-09-08` in worktree `../cct-wt-45`. This plan wrote only
`docs/release/M3-release.md`; full evidence lives there — this section summarizes it.

- **Rebased onto `origin/main` mid-session**: two fixes landed on `main` while this session was
  running — PR #83 (Turkish "ajan" calque replaced with agent/subagent, 34 occurrences/19 files)
  and PR #80 (permanent Playbook/Meta route coverage added to `e2e/a11y.spec.ts`/`lesson.spec.ts`).
  This branch was rebased onto `origin/main` (`ddf1c9e`) and every gate/count/test below was
  re-run against the rebased tree, not the pre-rebase one.
- **`content-gate.ts --no-drafts` passes**: `content gate: OK (308 files checked)`, independently
  re-confirmed by parsing every `.mdx` file's real YAML frontmatter block (not a whole-file grep):
  0 of 308 files have `draft: true`. No P40–P44 Handoff-notes claim of completion was overstated.
- **Counts verified from disk** (unchanged by the rebase): 119 EN + 119 TR lessons (all four
  levels symmetric), 6 EN + 6 TR Playbook pages, 4 EN + 4 TR Meta pages, 288 transcript files (261
  real `.txt` recordings + 27 README manifests), 142 sources in `content/_shared/sources.json`
  (confirmed not-empty — the M2 §9 wipe finding has held fixed since P42/P43 began reading it).
- **Full local suite green**: `typecheck` 0 errors, `lint` clean (eslint/prettier/inline-script/
  hygiene/raw-colors all OK), `npm test` 187/187, `npm run build` 313 pages / Pagefind 310 pages
  indexed, `tools/plan/cli.ts check` OK (48 plans).
- **Playwright/axe**: standing suite (now including PR #80's permanent Playbook/Meta coverage) +
  a temporary `e2e/p45-m3-release.spec.ts` (deleted after the run) sampling one lesson per level
  per language (8 routes) and an EN<->TR LangSwitch round trip — 122 passed, 4 pre-existing skips
  (search-UI `fixme`, unrelated to this plan), 0 serious/critical axe violations.
- **Full-tree link sweep**: no `lychee` binary available (npm's `lychee` package is unrelated,
  confirmed again). Did the plan's prescribed curl-sweep fallback, re-run post-rebase: 238 external
  URLs (209×200, 29 triaged non-200 — all fictional lab fixtures, auth-gated demo endpoints, or
  extraction artifacts, 0 real defects) and 290 internal link paths resolved against a fresh
  `dist/` build (0 broken).
- **LHCI**: `npx -p @lhci/cli@0.15.1 lhci autorun` against the complete rebased `dist/` — 0 failing
  gating assertions across 9 runs / 3 URLs, exit code 0. Median scores: `/en/` 0.99 perf / 1.00
  a11y+bp+seo, `/tr/` 0.96 perf / 1.00 a11y+bp+seo, `/design/` 0.92 perf / 1.00 a11y+bp+seo — all
  four budgets met on every URL.
- **Live + edge smoke**: every required route (redirects, both homes, `/design/`, one lesson per
  level per language, a Playbook and Meta page per language, sitemap, both RSS feeds, Pagefind, a
  404, security headers, cache-control) checked live against https://cc.codechup.com — all green.
  `scripts/smoke/edge.sh` — 14/14 passed. Latest `deploy.yml` run (`34184126667`) is `success`;
  this plan's own PR (`docs/release/M3-release.md` + `plans/**` only) is `paths-ignore`d and
  triggers no new deploy, correctly, since the content it verifies is already live.
- **Giscus (O6)**: `gh variable list` / `gh secret list` confirm `PUBLIC_GISCUS_REPO_ID` and
  `PUBLIC_GISCUS_CATEGORY_ID` do not exist. No id invented or created. Confirmed live that
  `Giscus.astro` renders its placeholder correctly. Deferred to `open_questions`/M4, per this
  plan's own Non-goals (does not block the release).
- **The "ajan" calque follow-up P40/P44 flagged was fixed on `main` by PR #83** while this session
  ran, re-verified clean here — with one deliberate exception: a real captured transcript
  (`content/_shared/transcripts/m16-orchestration/04-pipeline-lab/03-workflow-result.txt`) still
  says "ajan" because it is a byte-accurate recording (D070/D099) and must not be edited to match
  current terminology; filed in `open_questions` so a future sweep does not "fix" a real transcript.
- **Remaining follow-up filed in `open_questions`** (outside this plan's `owned_paths`, per D048):
  5 TR-only glossary terms P44 proposed for the EN twin; O7/O8 owner actions still open.
- No new content defect was found by this release session beyond what P40–P44 already disclosed
  in their own Handoff notes — this release confirms, rather than uncovers, completeness.

Full evidence with real command output: `docs/release/M3-release.md`.
