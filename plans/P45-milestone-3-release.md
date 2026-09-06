---
id: P45
title: Milestone M3 release
milestone: M3
status: todo
owner: null
branch: plan/45-milestone-3-release
model_hint: sonnet
effort_hint: medium
depends_on: [P40, P41, P42, P43, P44]
owned_paths:
  - docs/release/M3-release.md
shared_paths: []
estimate: M
updated_at: 2026-09-06T00:00:00Z
open_questions: []
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

- _Filled by the executing session: what changed, decisions, follow-ups, blockers._
