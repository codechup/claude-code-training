---
id: P02
title: Plan tool port and first STATE.md
milestone: M0
status: done
owner: null
branch: plan/02-plan-tool
model_hint: sonnet
effort_hint: medium
depends_on: [P01]
owned_paths:
  - tools/plan/**
  - plans/README.md
  - STATE.md
shared_paths: []
estimate: M
updated_at: 2026-09-06T20:15:00Z
open_questions: []
---

## Goal

Give this project the same multi-session coordination tool a sibling project proved out (D045, D049), ported to native Node/TypeScript: `tools/plan/{cli,plan,check,state}.ts` implementing `state | next | claim | status | check | show`, a full Vitest fixture suite, and `plans/README.md` — this repository's own contract for the plan system, written for this repo (commands, paths, enums), not copied verbatim from anywhere else. Once this plan merges, `node tools/plan/cli.ts state` produces the very first `STATE.md`, and every plan file already in `plans/` (including this one) is checkable.

## Context

Read `DECISIONS.md` D045 (plan-file pattern), D047 (ten-section plan body — already fixed by every `plans/PNN-*.md` file in this repo, written by the planning session), D048 (parallelism via `owned_paths`), D049 (Node, not a port of another language's binary). Read every existing `plans/P*.md` and `plans/ROADMAP.md` in this repo — they are the **real fixture data** `tools/plan/check` must validate cleanly against; if `check` disagrees with a real plan file, the bug is almost always in `check`, not the plan file (the plan files were written by the planning session against this same spec). This plan does not touch any `plans/PNN-*.md` file's content — it only reads them as test input and writes `plans/README.md` and `STATE.md`.

## Scope

In:
- `tools/plan/cli.ts` (entry point), `tools/plan/plan.ts` (frontmatter parsing/writing, using the `yaml` package — no other new runtime dependency), `tools/plan/check.ts` (validation rules below), `tools/plan/state.ts` (deterministic `STATE.md` generator).
- Commands: `state` (rewrite `STATE.md`), `next` (print claimable plans), `claim PNN --owner NAME [--force]`, `status PNN todo|in_progress|blocked|review|done [--reason TEXT]`, `check`, `show PNN`.
- Claimable rule: `status: todo`, or `in_progress`/`review` but stale (`updated_at` older than 24 h relative to the newest `updated_at` across all plans — clock-free, no wall-clock dependency in tests); every `depends_on` id has `status: done`; none of its `owned_paths` overlaps (by static glob prefix — the part of the glob before the first `*`) the `owned_paths` of any non-stale `in_progress`/`review` plan.
- `check` rules: `id` equals the filename prefix and the `branch` suffix; every frontmatter key present, in the documented order, with a valid enum value (`milestone: M0|M1|M2|M3|M4`; `model_hint: haiku|sonnet|opus|fable`; `effort_hint: low|medium|high|xhigh|max`; `estimate: S|M|L`); `updated_at` is RFC3339 UTC (`...Z`); `owned_paths` is never empty; `depends_on` ids all exist and form a DAG (no cycle); the ten `## ` sections appear, in order, exactly once each; no two active (`in_progress`/`review`, non-stale) plans have overlapping `owned_paths`; `STATE.md` matches byte-for-byte what `state` would currently write.
- `plans/README.md`: this repo's own contract — file/branch naming, the frontmatter block (with this repo's actual enum values), the ten-section body, the lifecycle/claim protocol (mirroring `plans/ROADMAP.md`'s milestone table), the worktree workflow commands (`node tools/plan/cli.ts …`, not `go run ./tools/plan …`), owned/shared path rules including the two documented scaffold-then-handoff exceptions (P01→src/**, P06→content/**), Definition of Done, model/effort hint table (D046), and this repo's own doc-drift/escalation section if any conflicts turn up while writing it (none are expected at M0; leave it a short "none yet" note rather than inventing content).
- `STATE.md`, generated (not hand-written) by running `node tools/plan/cli.ts state` once every other M0 plan file exists in `plans/`.
- Vitest fixtures under `tools/plan/testdata/` mirroring at least these scenarios: a clean valid set; a missing frontmatter key; an id/filename mismatch; an unknown `depends_on`; a dependency cycle; two active plans with overlapping `owned_paths`; a stale `in_progress` plan (reclaimable with `--force`); a `STATE.md` drift case. A golden `STATE.md` fixture the `state` output is diffed against.

Out: editing any `plans/PNN-*.md` frontmatter or body (those belong to the planning session and to whichever session later claims that plan); `.github/workflows/**` (P04 calls this tool, it does not own it); any content under `content/**`.

## Deliverables

`tools/plan/{cli,plan,check,state}.ts`, `tools/plan/*.test.ts`, `tools/plan/testdata/**` (including `STATE.golden.md`), `plans/README.md`, `STATE.md`.

## Acceptance criteria

- `node tools/plan/cli.ts check` exits 0 against the real `plans/` directory as it stands when this plan is claimed.
- `node tools/plan/cli.ts state` produces a `STATE.md` that, run twice in a row with no other changes, is byte-identical (determinism).
- `node tools/plan/cli.ts next` lists P01's dependents that are actually claimable given `plans/`'s real state (at minimum P02 itself should no longer appear once its own status is bumped past `todo`, and P03/P04/P05 should appear once P01 is `done`).
- `npm test` covers `tools/plan/**` at ≥ 70% lines (this repo's CI bar, per `docs/CURRICULUM.md`'s eventual CI section — P04 enforces the number, this plan meets it).
- `plans/README.md` §2 exactly matches the frontmatter shape actually used by this repo's plan files (compare against `plans/P01-repo-scaffold.md`'s frontmatter key order) and its command examples all use `node tools/plan/cli.ts`, never a Go invocation.
- Every one of the eight fixture scenarios in Scope has a passing (or correctly-failing, for the invalid ones) test.

## Steps

1. Scaffold `tools/plan/` with the four files and a shared internal type for parsed plan frontmatter; add the `yaml` dependency to `package.json` (a `shared_paths`-style minimal, additive change — coordinate with P01's `package.json` if it has not merged yet by rebasing).
2. Implement `plan.ts` (parse/serialize) and `check.ts` rules one at a time, each backed by a fixture under `testdata/` before moving to the next rule.
3. Implement `state.ts`'s deterministic sections (TL;DR counts, milestone progress, claimable now, in progress, blocked, in review, done, recent changes, open questions) against the fixture set; freeze a `STATE.golden.md`.
4. Implement `next`, `claim`, `status` on top of the same parse/check primitives; add their fixture tests (claim refuses an unmet dependency; claim refuses an owned_paths overlap; `--force` reclaims a stale plan only).
5. Run `check` and `state` against the real `plans/` directory; fix any real discrepancy in `check`'s rules (not in the real plan files) until `check` exits 0.
6. Write `plans/README.md` for this repo; commit the first real `STATE.md`.
7. `npm test` for coverage; paste the coverage summary and a real `node tools/plan/cli.ts check`/`state` run into the PR.

## Tests required

`tools/plan/*.test.ts` covering the eight fixture scenarios in Scope, run via `npm test`; a snapshot/golden test for `state.ts` output; an integration test that runs `check` against the real `plans/` directory (not just fixtures) as a regression guard.

## Non-goals / pitfalls

- Do not "fix" a real plan file to make `check` pass — if a real file legitimately violates a rule, the rule (or, rarely, the plan file, but only by filing an `open_questions` note for the owner) is what's wrong, not something to silently patch.
- Do not hand-edit `STATE.md` after generating it — every future change goes through `node tools/plan/cli.ts state`, and `check` fails if it drifts.
- Do not invent frontmatter keys or enum values beyond what `DECISIONS.md`/`plans/ROADMAP.md` establish — `model_hint` is exactly `haiku|sonnet|opus|fable`, nothing else.
- Overlap detection is static-prefix based, not full glob semantics — do not over-engineer it; match the fixture behavior exactly (`content/en/l1-beginner/**` overlaps `content/en/l1-beginner/m01-start/**`; `content/en/l1-beginner/**` does not overlap `content/en/l2-intermediate/**`).
- Do not add a Go, Python, or shell reimplementation "for speed" — Node/TypeScript only, per D049.

## Verification

A reviewer runs `node tools/plan/cli.ts check`, `state`, `next`, and `show P01` against the real repo, diffs the freshly generated `STATE.md` against the committed one (must be identical), and reads `npm test`'s coverage report for `tools/plan`.

## Handoff notes

- Done 2026-09-06 (Sonnet session under lead supervision). `tools/plan/{plan,check,state,cli}.ts` + 30 vitest tests + golden `STATE.md`; `plans/README.md` rewritten for this repo.
- **Deviations from the original tool:** flags may appear before or after positionals and `--flag=value` is accepted; enums widened (M0–M4, `fable`, `xhigh`/`max`).
- **Gotcha found on first real run:** YAML titles containing `: ` must be quoted (31 plan files were fixed). `check` now runs green on the real `plans/` (48 plans).
- Usage: `node tools/plan/cli.ts state|next|claim|status|check|show`; `PLAN_NOW=<RFC3339>` fixes the clock for tests.
