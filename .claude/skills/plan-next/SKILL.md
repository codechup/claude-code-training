---
name: plan-next
description: Thin wrapper around the plan CLI — show claimable plans, claim one, set a status, regenerate STATE.md, or validate the plan set. Type /plan-next instead of remembering the node tools/plan/cli.ts invocations.
when_to_use: The session needs to see, claim, or update a plan, or to regenerate or validate STATE.md.
argument-hint: '[next | claim PNN --owner NAME | status PNN STATUS | state | check]'
allowed-tools: Read, Bash(node tools/plan/cli.ts:*), Bash(npm run plan:*), Bash(git status:*), Bash(git branch:*)
disable-model-invocation: true
model: haiku
effort: low
---

# /plan-next

A wrapper around `node tools/plan/cli.ts` (`plans/README.md` §7). Run the subcommand in `$ARGUMENTS`;
with no arguments, run `next`.

```bash
node tools/plan/cli.ts next                                   # claimable plans, with model/effort hints
node tools/plan/cli.ts claim PNN --owner <session-name>        # take a plan (add --force only for a stale one)
node tools/plan/cli.ts status PNN todo|in_progress|blocked|review|done [--reason TEXT]
node tools/plan/cli.ts state                                   # regenerate STATE.md
node tools/plan/cli.ts check                                   # validate frontmatter, DAG, overlap, STATE.md freshness
node tools/plan/cli.ts show PNN                                # frontmatter + section headings
```

Print the CLI's real output. Do not summarise away the plan ids, hints or error text.

## After `claim`

A claim is not real until the branch is pushed — remind the session to finish the sequence:

```bash
git checkout -b plan/NN-slug
git add plans && git commit -m "chore(plans): claim PNN" && git push -u origin plan/NN-slug
git worktree add ../cct-wt-NN plan/NN-slug && cd ../cct-wt-NN && npm ci
```

## After `status ... review` or `done`

`done` is followed by `node tools/plan/cli.ts state` and a commit of the regenerated `STATE.md`;
`check` fails if `STATE.md` is stale. `blocked` requires `--reason`, which the CLI appends under
the plan's `## Handoff notes`.

## Rules

- `STATE.md` is generated. If `check` complains that it is stale, run `state` and commit — never
  hand-edit it.
- Statuses change through the CLI, never by editing plan frontmatter by hand: the CLI bumps
  `updated_at`, which is what staleness and the claim protocol are computed from.
- If a claim is refused, report the reason verbatim (unmet `depends_on`, `owned_paths` overlap, or
  the plan is already owned) and suggest `next` rather than reaching for `--force`. `--force` is
  only for a genuinely stale claim, and the reclaiming session must read that plan's branch and
  Handoff notes and continue from there.
