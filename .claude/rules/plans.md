---
paths:
  - 'plans/**'
  - 'STATE.md'
  - 'tools/plan/**'
---

# Plan-system rules

`plans/README.md` is the actual contract — read it. This file is the short version plus the
mistakes sessions in this repo actually make.

## Claiming

- Claim before working: `node tools/plan/cli.ts claim PNN --owner <session-name>`, then commit the
  frontmatter change on branch `plan/NN-slug` and **push immediately**. An unpushed claim does not
  exist; the first pushed branch wins a race.
- Work in a worktree at `../cct-wt-NN` with its own `npm ci`. Never `cd` into another plan's
  worktree to borrow a file — if you need it, `depends_on` is wrong; write that in Handoff notes.
- A plan is claimable only when its status is `todo` (or `in_progress` but stale — no refresh for
  24 h relative to the newest `updated_at` in the set), every `depends_on` is `done`, and none of
  its `owned_paths` overlaps an active plan's. Reclaim a stale plan with `--force`, then read its
  branch and Handoff notes and **continue** from there rather than starting over.

## Owned paths

- Create and modify files only under your plan's `owned_paths`. Reading anything is fine.
- **Never edit another plan's files.** Not "just this once", not to fix an obvious bug, not to
  unblock yourself. If a file you need is not yours, either it belongs in your `shared_paths` (say
  so in Handoff notes; a small follow-up PR can add it) or the dependency graph is wrong.
- `shared_paths` are append-only / minimal-diff: one logical hunk, never a reformat or a reorder,
  and each shared-file change is called out in the PR body. Known shared files and their rules are
  tabled in `plans/README.md` §5.
- `docs/CURRICULUM.md` (P03) and `DECISIONS.md` (owner) are never edited by an ordinary plan.

## STATE.md is generated

`STATE.md` is produced by `node tools/plan/cli.ts state` from plan frontmatter and is byte-
deterministic. **Never hand-edit it.** If `node tools/plan/cli.ts check` fails because it is stale,
run `state` and commit the result. `check` also validates frontmatter keys, id-vs-filename, the
`depends_on` DAG and `owned_paths` overlap — run it before every PR.

## Status and Handoff notes

- Statuses move through the CLI only (`status PNN todo|in_progress|blocked|review|done`), which
  bumps `updated_at`. `blocked` requires `--reason`, which is appended under `## Handoff notes`.
- `review` when the PR is open and CI is green; `done` after the squash merge, followed by `state`.
- **Handoff notes are written for a stranger.** Before you finish, record: what actually changed,
  what you decided and why, what you could _not_ verify, and the concrete next action. A session
  that reclaims your plan has your branch and these notes and nothing else.
- Paste real evidence (D093). "Tests pass" is not evidence; the test runner's output is.

## Open questions

- If a plan makes you guess about product, curriculum, design or anything already decided, do not
  invent an answer. Add it to the plan's `open_questions` frontmatter list and to Handoff notes,
  take the most conservative reading, and continue.
- Decisions belong to the owner and live in `DECISIONS.md`. A plan may propose a change there; it
  never makes one.
- Do not create new plan files yourself unless the plan set says so — route "there should be a plan
  for X" through `open_questions`.

## Scaffold-then-handoff exceptions

Two plans deliberately created files they do not own long-term, so a later plan takes ownership
without that counting as an `owned_paths` violation: **P01** scaffolded `src/**`, and **P06** built
out `content/**`. If you own one of those trees now, you inherit their scaffolding — read the
originating plan's Handoff notes before changing it.
