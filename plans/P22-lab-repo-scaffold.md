---
id: P22
title: Lab repository scaffold (codechup/claude-code-lab)
milestone: M1
status: done
owner: sonnet-p22-2026-09-07
branch: plan/22-lab-repo-scaffold
model_hint: sonnet
effort_hint: medium
depends_on: [P03]
owned_paths:
  - docs/lab/**
shared_paths: []
estimate: M
updated_at: 2026-09-07T07:57:31Z
open_questions:
  - 'Tag coverage is M1-only (m01-m09, 23 lesson pairs / 46 tags), not every hands-on lesson in
    docs/CURRICULUM.md as the plan Scope literally asks (nearly every module through m21). A
    follow-up plan must tag m10-m21 (L3/L4) before those content plans can build real `Lab`
    blocks; two structural surfaces m14 will need (prompt-injection-shaped, secrets-shaped) are
    already seeded in the lab repo (src/api/server.ts, catalogued as B6/B7 in its BUGS.md) but
    not yet wired to a tag.'
  - "m03-01-claude-md's lesson teaches `/init`, which writes a project's *root* `./CLAUDE.md`;
    this plan's m03-01 tag pair instead adds `.claude/CLAUDE.md` (matching the outer task's
    'its own minimal .claude/ (a short CLAUDE.md, ...)' wording and this training repo's own
    layout convention). The m03-01 lesson writer should decide whether to point the lesson at
    `.claude/CLAUDE.md` as-is or ask for a root-level file instead - flagging rather than
    guessing which the lesson intends."
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

**What shipped.** `codechup/claude-code-lab` (public, MIT, created with
`gh repo create`): a TypeScript/Node 24 CLI (`labtrack`, commander) + a tiny `node:http`
API, no build step (Node 24 runs `.ts` directly - `bin` points straight at `src/cli.ts`).
`main` tip `202fdfa`. 46 tags (`git tag -l 'lesson/*'` = 46, i.e. 23 `-start`/`-solution`
pairs), covering every `Lab`-tagged lesson in `docs/CURRICULUM.md` §2 for `m01`-`m09`
(L1 Beginner + L2 Intermediate) - **not** the whole curriculum through `m21` as the plan's
Scope literally reads; see `open_questions` above for the deliberate scope cut and the
follow-up it implies. `docs/lab/README.md` (this plan's only owned path in this repo)
documents the repo, the frontmatter-to-tag mapping, and the transcript workflow.

**Bugs and tags.** 5 real seeded bugs (B1 off-by-one pagination, B2 date compared in ms vs.
s, B3 an unhandled promise rejection, B4 missing input validation, B5 a timing-dependent
test) plus 2 reserved-but-untagged teaching surfaces for the future m14 module
(B6 prompt-injection-shaped, B7 secrets-in-logs-shaped) - all catalogued in the lab repo's
`BUGS.md`. Each bug lives as an "introduce it / fix it" commit pair on `main`'s linear
history so `main` itself stays green throughout; a `-start` tag points at the
"introduced" commit, `-solution` at the "fixed" one right after. Two bugs are **reused**
by a second lesson pointing tags at the *same* commits rather than duplicating the bug:
`lesson/m05-04-*` (effort lab) reuses `lesson/m02-05-*` (B2), `lesson/m08-04-*`
(code-review-commands) reuses `lesson/m02-02-*` (B1). The other 9 M1 lesson pairs are
structural (not bugs): each adds one real artifact - `.claude/CLAUDE.md` (m03-01),
`.claude/rules/style.md` (m03-03), three example skills - `/commit-msg` (m06-03, prompt-only,
`$ARGUMENTS`), `/review-security` (m06-04, prompt-only checklist), `/new-component`
(m06-05, tool-running: a script + `allowed-tools` + `context: fork`) - and four hooks
(m07-02 PreToolUse dangerous-command guard, m07-03 PostToolUse formatter, m07-04
Notification/Stop notify-to-file, m07-05 SessionStart context-load + Stop test-runner),
per D055/D056's exact example lists. That means the lab repo's `.claude/` ends up with
4 hooks and 3 skills, not "one hook, one skill" - read as the *minimum needed for the
M1 tag set* rather than literally one of each; still small (each hook/skill is under
~30 lines). The remaining 7 M1 lesson pairs are **process-only** (`m01-02`, `m02-03`,
`m04-02`, `m04-03`, `m08-01`, `m08-02`, `m08-03`): both tags point at the same commit
(`main`'s stable tip, `202fdfa`) because the lesson is about Claude Code's own CLI/UI
behaviour, not a lab-repo code change - there is nothing to diff.

**A resolved ambiguity worth recording.** The plan's Acceptance criteria describe
"`npm test` succeeds at the repo's default branch tip, with some tests passing and the
seeded-bug tests genuinely failing" - read literally that would make the *default branch*
carry failing tests, which conflicts with the outer task's explicit instruction that
"`main` is the clean baseline." The session followed the outer instruction: `main` is fully green
(verified via `npm ci && npm test` locally and via the lab repo's own GitHub Actions CI,
run 34096936633, green); every seeded-bug test only fails at its own `-start` tag, and
passes again at `-solution`. I read the plan's wording as describing a tag checkout, not
literally `main`'s HEAD.

**Verification performed (real, not reconstructed, D093).**
- `gh repo view codechup/claude-code-lab` → public, MIT `LICENSE`, default branch `main`.
- `gh api repos/codechup/claude-code-lab --jq '{license,visibility,default_branch}'` →
  `{"default_branch":"main","license":"MIT","visibility":"public"}`.
- `npm ci && npm test` at `main` tip → 4 test files, 15 tests, all green (also reproduced
  by the repo's own CI run).
- Three sampled `-start`/`-solution` pairs, spread across L1 and L2 (L3/L4 aren't tagged -
  see `open_questions`), each checked out and run for real:
  - `m01-04` (B4): `-start` → 3 genuine failures (empty title / negative priority
    accepted); `-solution` → 15/15 green.
  - `m02-02` (B1): `-start` → 4 genuine failures (page 1 returns items 3-4);
    `-solution` → 15/15 green.
  - `m05-02` (B3): `-start` → 1 genuine failure (an unhandled rejection caught by the
    test's own `process.on('unhandledRejection')` listener, not a harness crash);
    `-solution` → 15/15 green.
- The B5 flaky-test lesson's `-start` state was run 3/3 times locally and failed every
  time (documented honestly in `BUGS.md` as "fails deterministically here, would be
  merely intermittent with tighter margins" rather than claimed as reliably flaky).
- The CLI and API were smoke-tested running natively under Node 24 (no test framework in
  the loop) after a real bug was found and fixed this way: the CLI wrote
  `.labtrack-data.json` on `add` but never read it back on the next invocation, so
  `add` then a separate `list` command showed "(no tasks)". Fixed forward on `main`
  (commit `84c1177`, load-on-startup + persist after `done`/`rm`) and reverified:
  `node src/cli.ts add ...`, `node src/cli.ts list`, `node src/cli.ts done <id>`,
  `node src/cli.ts show <id>`, and `node src/api/server.ts` + `curl` against `/health`,
  `POST /tasks`, `GET /tasks` all behaved correctly across separate process invocations.
- Every file tracked in the lab repo was scanned with this repo's own
  `scripts/check-public-hygiene.mjs --stdin` (31 files, 0 hits) - the public-hygiene
  rules apply to the lab repo too, per the outer task instruction.

**Follow-ups / blockers for later plans.**
- Tag `m10`-`m21` (L3 Advanced, L4 Master) before content plans for those modules build
  their `Lab` blocks - tracked in `open_questions` above.
- `m14-02-prompt-injection` and `m14-03-secrets` have their code surfaces already seeded
  (B6/B7 in the lab repo's `BUGS.md`) but no tag yet - whichever plan tags `m14` should
  wire `lesson/m14-02-*` and `lesson/m14-03-*` to those, not invent new surfaces.
- `m03-01-claude-md`'s writer should confirm whether the lesson wants `.claude/CLAUDE.md`
  (what this plan built, matching this training repo's layout) or a root `./CLAUDE.md`
  (what `/init` actually writes) - see `open_questions`.
- No blockers. Nothing in this repo outside `docs/lab/**` was touched.
