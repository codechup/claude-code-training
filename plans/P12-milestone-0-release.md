---
id: P12
title: Milestone M0 release
milestone: M0
status: review
owner: fable-lead-2026-09-07
branch: plan/12-milestone-0-release
model_hint: sonnet
effort_hint: medium
depends_on: [P07, P08, P09, P10, P11]
owned_paths:
  - content/en/l1-beginner/m01-start/01-what-claude-code-is.mdx
  - content/tr/l1-beginner/m01-start/01-what-claude-code-is.mdx
  - content/_shared/transcripts/m01-start/**
  - content/_shared/sources.json
  - content/tr/playbook/glossary.mdx
  - docs/release/**
shared_paths:
  - content/_shared/sources.json
estimate: M
updated_at: 2026-09-06T22:24:06Z
open_questions:
  - "P13: the M0 sample lesson's hands-on lab is a self-contained exercise (claude --version, claude doctor, a headless first session on a two-line file) with `repoTag: none` because codechup/claude-code-lab (P22) does not exist yet — reconcile with the real lab repo and tags when P22 lands."
  - "P42: the lesson's Changed callout (MultiEdit → Edit) needs its playbook/06-changed-since-2025 entry once that page exists."
---

## Goal

Close out M0 with a real, live release: one genuine lesson in both languages (replacing P06's build-graph placeholder), `/design/` fully populated by every M0 component plan, `DEPLOY_ENABLED` flipped on for this repository, and a full evidence trail (axe, Lighthouse CI, and — once the owner gate below is met — an on-box and edge smoke pass) recorded in `docs/release/M0-release.md`. This is the plan that proves the whole M0 pipeline (scaffold → tokens → content pipeline → components → CI → deploy → dogfooding) actually works end to end before any content plan starts.

## Context

Read `plans/ROADMAP.md`'s M0 wave description and every M0 plan's Handoff notes (P00–P11, all `done` by the time this plan is claimed) for anything each flagged as a follow-up. Read `content/_shared/sources.json` (P23 does not exist yet at M0 — this plan is the very first to append to it, seeding it if it is still empty from P06's scaffold) and `research/feature-inventory.md`/`research/deprecations.md` (P03) for the lesson's factual grounding. This plan does not create `codechup/claude-code-lab` (P22, M1) — the M0 sample lesson's hands-on lab section is written against a small, self-contained exercise that needs no external repo (e.g., running `claude --version` and `claude doctor` locally), explicitly noted as a temporary simplification in `open_questions` for P13 to reconcile once the real lab repo exists.

The **owner gate** this plan is partly blocked on: the static host's vhost is live and answering (on-box `/healthz` → 200) — this is a cross-repo, owner-managed dependency (D086), never a `depends_on` plan id, and this plan's text never names the project or repository that makes it happen. If that gate is not yet met when every other acceptance criterion is satisfied, this plan's status becomes `blocked` with that exact reason, not `done` with the deploy/smoke evidence skipped.

## Scope

In:
- Delete `content/en/l1-beginner/m01-start/00-placeholder.mdx` and its TR counterpart; in their place, write `01-what-is-claude-code-and-how-it-works.mdx` (EN, real, complete, `draft: false`) and its TR counterpart (also real and complete — this is the one lesson D072's "MVP = infra + design + L1–L2 complete" schedule needs live in both languages before M1 even starts, and it doubles as this repo's own worked example for later lessons to point back to).
- The lesson's transcript(s) under `content/_shared/transcripts/m01-start/`, captured from a real, local `claude --version`/`claude doctor`/first-session walkthrough (D093 — no fabricated output, even for this simplified lab).
- Appending this lesson's sources to `content/_shared/sources.json` (seeding the file if P06 left it as an empty stub).
- `docs/release/M0-release.md`: the evidence record — axe results (0 serious/critical at 390/1280 across `/`, `/en/`, `/tr/`, the sample lesson, `/design/`, `/404/`), Lighthouse CI scores against the built `dist/` (perf ≥ 0.9, a11y ≥ 0.95, best-practices ≥ 0.9, seo ≥ 0.95), the `DEPLOY_ENABLED` flip (via `gh variable set DEPLOY_ENABLED --body true` on this repository, confirm-before-run per D089), and — once the owner gate is met — the on-box `/healthz` check and a full `scripts/smoke/edge.sh` run against the live `https://cc.codechup.com`.

Out: any other lesson or module (P13 onward); the lab repo (P22); the host-side vhost change itself (owner-managed, private repo — this plan only checks its externally-visible result).

## Deliverables

The real `01-what-is-claude-code-and-how-it-works.mdx` in both languages, its transcript(s), an updated `content/_shared/sources.json`, `docs/release/M0-release.md`.

## Acceptance criteria

- `node scripts/content-gate.ts` passes with the placeholder gone and the real lesson in place; `npm run build` succeeds; `/design/` shows every M0 component (P05, P07, P08, P09) populated, not placeholder text.
- `npx playwright test e2e/a11y.spec.ts` reports 0 serious/critical violations across `/`, `/en/`, `/tr/`, the sample lesson (both languages), `/design/`, `/404/`, at both 390 px and 1280 px — pasted into `docs/release/M0-release.md`.
- LHCI run against the built `dist/` meets every budget in `lighthouserc.json` (P04) — pasted into `docs/release/M0-release.md`.
- `gh variable list` shows `DEPLOY_ENABLED=true` for this repository.
- Once the owner gate ("static host vhost live, on-box `/healthz` → 200") is met: `deploy.yml` runs successfully on a push to `main`, and `scripts/smoke/edge.sh` passes in full against `https://cc.codechup.com` — both pasted into `docs/release/M0-release.md`. If the gate is not yet met, this plan's status is `blocked` with that exact reason recorded, and every other acceptance criterion above must still be met and recorded before it is set to `blocked` rather than left incomplete.

## Steps

1. Delete the placeholder lesson pair; write the real EN lesson against `research/feature-inventory.md`/`deprecations.md`, following the D006 template exactly.
2. Do the lesson's simplified hands-on exercise for real (`claude --version`, `claude doctor`, a first `claude` session) and capture the transcript; embed it with `<Transcript>` (P07).
3. Translate the lesson into Turkish directly in this plan (a one-off exception to the usual "EN plans only stub the TR draft" pattern, justified because M0 needs a genuinely bilingual release and no TR translation plan exists yet at M0) — flip `draft: false` on both.
4. Append sources to `content/_shared/sources.json`.
5. Run the full local gate (`typecheck`, `lint`, `content-gate`, `test`, `build`), then `npx playwright test e2e/a11y.spec.ts` against every route in Acceptance criteria; run LHCI against `dist/`.
6. `gh variable set DEPLOY_ENABLED --body true` (confirm-before-run); push to `main` (via the normal PR-merge path) and watch `deploy.yml` run.
7. Check the owner gate; if met, run the on-box `/healthz` check (SSH as the low-privilege deploy account, D088) and `scripts/smoke/edge.sh` against the live URL; record everything in `docs/release/M0-release.md`. If not met, set status `blocked` with that reason.

## Tests required

`e2e/a11y.spec.ts` across every M0 route in both languages; LHCI against `dist/`; `scripts/smoke/edge.sh` (once the owner gate is met); `node scripts/content-gate.ts` clean.

## Non-goals / pitfalls

- Do not fabricate the on-box or edge smoke evidence if the owner gate is not yet met — `blocked` is the correct status, not a plan marked `done` with placeholder evidence text.
- Do not build or reference `codechup/claude-code-lab` here — it does not exist until P22; the M0 lesson's lab section is explicitly simplified and flagged as such.
- Do not skip the Turkish translation of this one lesson to save time — D072's MVP bar needs a real bilingual page live, and no other plan will do it before M1.
- Never write the static host's IP, an absolute server filesystem path, or any other project's name into `docs/release/M0-release.md`.

## Verification

A reviewer opens the live (or, if the owner gate is not yet met, the CI-built preview of the) sample lesson in both languages, reads the pasted axe/LHCI evidence, confirms `DEPLOY_ENABLED` is set via `gh variable list`, and — if the owner gate is met — visits `https://cc.codechup.com/en/` directly.

## Handoff notes

- **2026-09-07 (lead session, with an Opus authoring sub-session):** real bilingual lesson `01-what-claude-code-is` (slug per CURRICULUM, superseding the plan text's longer name) replaces the placeholder pair; 5 real transcripts under `content/_shared/transcripts/m01-start/01-what-claude-code-is/` (captured on 2026-09-06/07, Claude Code 2.1.263); `content/_shared/sources.json` seeded; TR glossary seeded with 12 terms and linked from the TR lesson.
- **Integration wiring done here (release scope):** lesson page uses `<Sources>`, `<Helpful>`, `<Giscus>` and passes a components map to `<Content>`; Header mounts `<Search>`; Base emits og:image/twitter meta; `/design/` shows P07's gallery and P08's five components; `src/env.d.ts`; vitest collects `.claude/**/*.test.mjs`; remaining e2e fixmes un-skipped (OSTabs, full curriculum); `Lab` gained a `repoTag="none"` mode (no lab repo yet — see open_questions).
- **Review pipeline (D071):** fact-checker → 1 contradiction fixed (TodoWrite → Task* tools; deprecations row added); reviewer → glossary links, owned_paths, Academy source, heading wording applied; per-language transcript choice kept and documented.
- **Evidence:** `docs/release/M0-release.md` (gate, LHCI medians en 0.98 / tr 0.96 / design 0.92 perf with 1.0 a11y/bp/seo, axe 0, restricted deploy key + real rsync test).
- **Gate status:** the static-host vhost is not live yet (owner: origin cert secrets, host deploy switch, DNS record). After this PR merges with `DEPLOY_ENABLED=true`, the rsync step will succeed and the edge smoke will fail by design; P12 then goes `blocked` with that exact reason until the gate is met.
