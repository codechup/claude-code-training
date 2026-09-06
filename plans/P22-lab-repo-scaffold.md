---
id: P22
title: Lab repository scaffold (codechup/claude-code-lab)
milestone: M1
status: todo
owner: null
branch: plan/22-lab-repo-scaffold
model_hint: sonnet
effort_hint: medium
depends_on: [P03]
owned_paths:
  - docs/lab/**
shared_paths: []
estimate: M
updated_at: 2026-09-06T00:00:00Z
open_questions: []
---

## Goal

Create and populate a second, small, public GitHub repository, `codechup/claude-code-lab`: a TypeScript/Node CLI plus a tiny HTTP API, seeded with intentional, documented bugs, tagged once per lesson so every content plan (P13 onward) can check out a known-good starting point and a known-good solution for its lesson's hands-on lab (D007). This plan's `owned_paths` above describe files **inside that second repository**, not inside `claude-code-training` — this plan is executed from a checkout of the new repo, created with `gh repo create codechup/claude-code-lab --public` (confirm-before-run, D089), and its own MIT license (D052).

## Context

> **Path note (lead, 2026-09-06):** this plan\'s deliverables live in the separate repository `codechup/claude-code-lab`; in this repository it owns only `docs/lab/**` (a README-style description of the lab repo, its tags and how lessons reference it). The lab repo\'s own files (README, LICENSE, BUGS.md, package.json, src/**, test/**, .claude/**) are created there, not here.


Read `docs/CURRICULUM.md` (P03) for the full lesson list across every module that names a hands-on lab (nearly every lesson, per D006) — this plan's tag list must cover every one of them. Read `DECISIONS.md` D007 (lab stack TS/Node, one tag per lesson, D053/D054 folded in: verification = expected result + checklist + real transcript), D093 (every lab must actually run and produce real output — this repo's bugs must be genuinely reproducible, not decorative). This plan does not write any lesson content or transcript — it only builds the substrate every lesson's `Lab`/`Transcript` components point at.

## Scope

In:
- Repository scaffold: `package.json` (TypeScript, a small CLI entry via a `bin` field, a minimal Express/Fastify-style HTTP API for the MCP/headless/API-flavored lessons), `tsconfig.json`, `vitest` for its own test suite, `README.md` (what the repo is for, how to check out a lesson's tag, MIT license note), `LICENSE` (MIT), `BUGS.md` (a catalogue of every intentional bug: what it is, which lesson it supports, how to reproduce it, what the fix looks like).
- `src/**`: a small but real CLI (a handful of subcommands manipulating a tiny in-memory or SQLite-backed dataset — enough surface for "read files," "run tests," "fix a bug," "add a feature," "refactor," and "review a diff" style exercises across L1–L4) and `src/api/**` (a tiny HTTP API with a couple of routes, deliberately including at least one prompt-injection-shaped and one secrets-handling-shaped exercise surface for the L3 security module, D060).
- `test/**`: a real test suite (some passing, some intentionally failing against the seeded bugs) so hooks/CI-flavored lessons (PostToolUse formatter, Stop test-runner, headless `-p` runs, GitHub Actions PR review) have something genuine to run against.
- Git tags: `lesson/<module>-<nn>-start` and `lesson/<module>-<nn>-solution` for every lesson identified in `docs/CURRICULUM.md` that names a hands-on lab — the `-start` tag is the state a reader/writer checks out before the exercise, `-solution` is the state after.
- A minimal `.claude/` in this second repo (D051 shows this repo's *training* setup as course material; this lab repo's own `.claude/` is deliberately minimal — just enough to make the "run Claude Code against a real small project" experience realistic for lessons that use it as a demo target, not a full dogfooding setup).

Out: any content in `claude-code-training` (this plan's files live in the sibling public repo); writing lesson MDX or transcripts (the content plans do that, against this repo's tags); a design system or UI (this is a CLI/API project, no frontend).

## Deliverables

The `codechup/claude-code-lab` repository, publicly readable, MIT-licensed, with the file tree in Scope and one `-start`/`-solution` tag pair per hands-on lesson named in `docs/CURRICULUM.md`.

## Acceptance criteria

- `gh repo view codechup/claude-code-lab` shows a public repository with an MIT `LICENSE`.
- `git clone` + `npm ci` + `npm test` succeeds at the repo's default branch tip, with some tests passing and the seeded-bug tests genuinely failing (not erroring out of the harness — a real red result).
- For at least three sampled lesson tags across different modules (spread across L1, L2, and L3/L4), `git checkout lesson/<module>-<nn>-start && npm ci && npm test` reproduces the documented bug/failure exactly as `BUGS.md` describes it, and `git checkout lesson/<module>-<nn>-solution && npm ci && npm test` shows it fixed.
- `BUGS.md` lists one entry per hands-on lesson in `docs/CURRICULUM.md`, each naming its lesson and its tag pair.
- `git tag -l 'lesson/*'` count matches the number of hands-on lessons identified in `docs/CURRICULUM.md` exactly (or a documented, deliberate exception noted in Handoff notes).

## Steps

1. `gh repo create codechup/claude-code-lab --public` (confirm-before-run); clone locally.
2. Scaffold the TypeScript CLI + tiny API + test suite; get a genuinely green baseline (`main` branch, no seeded bugs yet).
3. From `docs/CURRICULUM.md`, list every hands-on lesson; for each, design a small, real bug or missing feature that lesson's exercise will fix, and write its `-start` state.
4. Tag each `-start` state; implement/fix it to produce the `-solution` state; tag that.
5. Write `BUGS.md` cataloguing every bug against its lesson and tag pair.
6. Sample three tag pairs across different modules and verify the reproduce/fix cycle for real, per Acceptance criteria; paste the transcripts into this plan's PR (against `claude-code-training`, since this plan's own review happens there even though its `owned_paths` are in the other repo — note this explicitly in the PR).

## Tests required

The lab repo's own `npm test` (real passing/failing tests per tag, as above); the three-sample reproduce/fix verification from Acceptance criteria.

## Non-goals / pitfalls

- Do not make the seeded bugs trivial or decorative — a lesson's hands-on lab is only as good as the bug being genuinely reproducible and fixable the way the lesson describes.
- Do not let the tag count drift from `docs/CURRICULUM.md`'s hands-on lesson count without a documented, deliberate reason (a lesson added after this plan ships needs a follow-up tag, tracked in `open_questions`).
- Do not build a large or complex application — small and legible beats realistic-but-bloated; a content-plan writer needs to understand the whole repo in minutes.
- Do not add a heavy framework dependency that would make `npm ci` slow or brittle across many lesson checkouts — keep the dependency footprint minimal.

## Verification

A reviewer clones the lab repo, runs the baseline test suite, checks out three sampled lesson tags across different modules, and confirms each reproduces its documented bug and its solution tag fixes it.

## Handoff notes

- _Filled by the executing session: what changed, decisions, follow-ups, blockers._
