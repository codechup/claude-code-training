---
id: P24
title: Milestone M1 release
milestone: M1
status: done
owner: sonnet-p24-2026-09-07
branch: plan/24-milestone-1-release
model_hint: sonnet
effort_hint: medium
depends_on: [P13, P14, P15, P16, P17, P18, P19, P20, P21, P22, P23]
owned_paths:
  - docs/release/M1-release.md
shared_paths: []
estimate: S
updated_at: 2026-09-07T10:55:09Z
open_questions:
  - "P17/P19/P20/P21's plan-file Handoff notes were wiped back to the unfilled placeholder by later sibling squash merges (each L2 branch carried a stale copy of the 'claim P17-P21' commit); status is correctly 'done' (fixed on main by commit a62ab3c/PR #42) but the notes bodies are not. Real text survives at commits f909a64 (P17), cc9e27b (P19), 7df3ff8 (P20), 96eb711 (P21) and is quoted in docs/release/M1-release.md sec 8. Recommend a small chore(plans) follow-up PR to restore them in place."
  - "One apt-repository base URL (https://downloads.claude.ai/claude-code/apt/stable, content/en/l1-beginner/m01-start/02-install.mdx) 404s on a bare curl GET; confirmed byte-identical to the official setup.md and not a browsable page, so this is a link-checker false positive, not a real defect. No action needed unless a future lychee run wants it added to lychee.toml's exclude list."
---

## Goal

Confirm and record that L1 Beginner and L2 Intermediate are genuinely complete in English (D072's MVP bar) and live on `cc.codechup.com`, with Turkish shown as "Türkçesi hazırlanıyor" via the draft mechanism (P06) rather than missing or broken. This plan does not write content — every module plan (P13–P21) and the lab/sources plans (P22, P23) are already `done`; this plan is the release gate that proves the whole set holds together as one site and pushes it live.

## Context

Read every one of P13–P23's Handoff notes for open follow-ups; read `docs/CURRICULUM.md` (P03) to confirm the shipped lesson count per module matches or exceeds the floor. `DEPLOY_ENABLED` is already `true` since P12 — this plan does not flip it again, it only confirms the push-to-`main` → deploy path still works with real content volume (9 modules, dozens of lessons) rather than the single M0 sample lesson.

## Scope

In:
- A full-site content-gate and build check with all of L1–L2 present (`node scripts/content-gate.ts`, `npm run build`).
- `e2e` run across a representative sample: the landing page, one lesson per module (18 lessons: 9 modules × EN, sampled — not all ~50), `/design/`, `/404/`, LangSwitch on a TR-draft lesson showing "Türkçesi hazırlanıyor".
- Full `lychee` sweep over `content/en/{l1-beginner,l2-intermediate}/**` (not just the changed-file diff `ci.yml` normally runs).
- LHCI against the built `dist/` with the real content volume.
- A push to `main` and a real `deploy.yml` run against the live host; `scripts/smoke/edge.sh` against `https://cc.codechup.com`.
- `docs/release/M1-release.md`: every result above, plus a one-paragraph note per module (P13–P21) confirming its Handoff notes had no unresolved blocker.

Out: writing or fixing lesson content (if this plan finds a real defect, it opens a small, clearly-scoped follow-up rather than editing another plan's `owned_paths` directly — see Non-goals).

## Deliverables

`docs/release/M1-release.md`.

## Acceptance criteria

- `node scripts/content-gate.ts` passes across the full `content/en/{l1-beginner,l2-intermediate}/**` and `content/tr/{l1-beginner,l2-intermediate}/**` trees (TR still `draft: true`, which is expected and correct at M1).
- The sampled `e2e` run (one lesson per module, both viewports, axe 0 serious/critical) passes; the LangSwitch-to-draft "Türkçesi hazırlanıyor" case is explicitly exercised and passes.
- The full `lychee` sweep over L1–L2 English content shows 0 broken links (or every failure is triaged and either fixed via a tiny follow-up PR within this plan's own `owned_paths`-safe scope — i.e., a dead link in `content/_shared/sources.json`, which this plan may append-fix since it is append-only shared ground — or filed as `open_questions` naming the module plan responsible).
- LHCI meets every budget in `lighthouserc.json` against the full M1 content volume.
- A real `deploy.yml` run (triggered by this plan's own merge to `main`) succeeds, and `scripts/smoke/edge.sh` passes against `https://cc.codechup.com`.
- `docs/release/M1-release.md` records every result above with real pasted command output, plus the one-paragraph-per-module confirmation.

## Steps

1. Read every P13–P23 Handoff notes section; list any flagged follow-up.
2. Run the full local gate against the complete L1–L2 tree; fix nothing here directly (see Non-goals) — record and triage instead.
3. Run the sampled `e2e` suite (one lesson per module) plus the LangSwitch-draft case.
4. Run the full `lychee` sweep over L1–L2; triage any failure.
5. Run LHCI against the full-volume build.
6. Merge to `main`, watch `deploy.yml`, run `scripts/smoke/edge.sh` against the live site.
7. Write `docs/release/M1-release.md` with everything above.

## Tests required

Full-tree `content-gate.ts`; sampled `e2e` (axe); full `lychee` sweep on L1–L2; LHCI; `scripts/smoke/edge.sh` against the live deploy.

## Non-goals / pitfalls

- Do not edit any module's lesson content directly from this plan — every `content/en/<level>/<module>/**` path belongs to its own `done` plan; a real defect found here becomes a tiny, clearly-scoped follow-up (a new plan, or an `open_questions` entry naming the responsible module) rather than a silent edit that bypasses the module plan's own review trail.
- Do not treat "TR is draft" as a bug at M1 — it is the correct, designed state (D095's wave order); only a broken LangSwitch experience around it is a real defect.
- Do not re-flip `DEPLOY_ENABLED` — it is already `true` from P12.

## Verification

A reviewer reads `docs/release/M1-release.md`, opens the live site's L1 and L2 index pages, confirms a Turkish visitor sees "Türkçesi hazırlanıyor" rather than a broken link, and spot-checks the pasted `lychee`/LHCI/`e2e` evidence.

## Handoff notes

**Session:** `sonnet-p24-2026-09-07`, worktree `../cct-wt-24`, branch `plan/24-milestone-1-release`.

**Precondition fix, before any verification work.** This branch started 1 commit behind `main`;
fast-forwarding picked up `a62ab3c` (`chore(plans): P13–P21 done; claim P24`, PR #42, merged
independently by the repo owner) which flips P13–P21 to `done` and claims P24 for this session — a
`git cherry-pick` of the equivalent local commit (`b4ee7ab`) came back empty for exactly that reason.
See `docs/release/M1-release.md` §9 for a second, real finding made while confirming this: P17,
P19, P20 and P21's Handoff-notes bodies were separately wiped back to the unfilled placeholder by
later sibling squash merges (each L2 branch carried a stale copy of the "claim P17–P21" commit).
That commit did not restore them, and this plan's `owned_paths` is only
`docs/release/M1-release.md` — restoring another plan's Handoff notes in place is out of scope
here, so the real text (recovered from the merge-commit shas) is quoted in the release doc's §8
instead, and a small `chore(plans)` follow-up is recommended in §9 to fix the plan files themselves.

**What was run (all real, D093 — full output pasted in `docs/release/M1-release.md`).**
`node scripts/content-gate.ts` (158 files OK), `npm run typecheck` (0 errors), `npm run lint`
(clean), `node scripts/check-raw-colors.mjs` / `check-public-hygiene.mjs` (both OK), `npm test`
(184/184), `npm run build` (113 pages, `check-no-inline-script (dist): OK`). Lesson inventory: all
nine L1/L2 modules ship exactly their `docs/CURRICULUM.md` §2 floor (51 EN lessons total, 51 TR
twins, 50 correctly `draft: true`). Playwright: a temporary `playwright.p24.config.ts` (port 4424)
plus a temporary `e2e/p24-m1-release.spec.ts` — 78 passed, 0 axe serious/critical, including an
explicit LangSwitch-on-a-TR-draft check (`m02-interact/prompting-basics`); both temporary files
deleted afterward. Full lychee sweep: the npm `lychee` package is not the Rust link checker (a
different, unrelated tool — confirmed with `npm view lychee`); fell back to the plan's own
permitted `curl` loop over 127 URLs extracted from `content/en/{l1-beginner,l2-intermediate}/**`
and `content/_shared/sources.json` — 126×200, 1×404 on an `apt` repository base URL that is
byte-identical to the official `setup.md` and isn't a browsable page (triaged as a false positive,
not a real dead link; `content/_shared/sources.json` needed no fix). LHCI: all budgets met
(perf ≥0.92, a11y/best-practices/seo all 1.00 across `/en/`, `/tr/`, `/design/`). Live: `edge.sh`
14/14 PASS against `https://cc.codechup.com`; one lesson route per module curled live (all 200);
the TR draft route independently 404s live and the EN twin's HTML contains "hazırlanıyor" —
confirmed the Turkish-visitor experience end to end, not just locally.

**Decisions.** Did not merge this PR to `main` (per the outer task's explicit instruction, which
overrides this plan's own Steps §6 wording about merging and watching `deploy.yml`) — all L1–L2
content is already deployed by the module plans' own merges, confirmed live in §7 of the release
doc, so there is nothing this plan's own merge would add to the live site; `DEPLOY_ENABLED` was not
touched. Did not restore P17/P19/P20/P21's wiped Handoff notes in place (out of `owned_paths`; see
above). Did not edit `content/_shared/sources.json` (no dead entries found there).

**Follow-ups / open questions raised.** See `open_questions` below and `docs/release/M1-release.md`
§9 for the plan-bookkeeping restore; §8 lists each module's own content-level follow-ups
(unchanged from their original Handoff notes, none release-blocking).

**No blockers.**
