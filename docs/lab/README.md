# The lab repository (`codechup/claude-code-lab`)

P22 (D007) built and populated a second, small, public GitHub repository that every
hands-on lesson's lab points at: **<https://github.com/codechup/claude-code-lab>**. This
document (owned by P22, `docs/lab/**`) describes it from the training site's side — what it
is, how a lesson's frontmatter references it, and where transcripts captured against it
belong. The lab repository's own files (`README.md`, `BUGS.md`, `src/**`, `test/**`,
`.claude/**`) live there, not here — see its `README.md` for the full lesson tag map and
its `BUGS.md` for every seeded bug.

## What it is

A tiny TypeScript/Node 24 project: `labtrack`, a task-tracker CLI (`commander`) plus a
matching HTTP API (`node:http`, no framework). No build step — Node 24 runs the `.ts`
files directly. `main` is the clean baseline (every seeded bug fixed, `npm test` green);
each hands-on lesson gets a `lesson/<module>-<NN>-start`/`-solution` git tag pair, seeded
with one small, real, reproducible defect (or, for lessons about a skill/hook/memory file
rather than a code bug, the repo state before/after that artifact is added).

## How a lesson's frontmatter maps to a tag

A lesson's frontmatter carries `lab.repo_tag` (schema: `src/content/schema.ts`,
`labSchema`), rendered by the `<Lab>` component (`src/components/mdx/Lab.astro`,
`src/components/mdx/lab.ts`) as `git checkout {repoTag}`. Two things worth stating
precisely, since they are easy to get wrong from the field name alone:

- **`repo_tag` holds the exact `-start` tag string**, e.g.
  `repo_tag: 'lesson/m02-02-start'` — not a stem the component expands. The `<Lab>`
  component links only to this checkout point; it does not itself render the matching
  `-solution` tag.
- **The `-solution` tag is the same stem with `-solution` in place of `-start`** (e.g.
  `lesson/m02-02-solution`). A lesson's transcript and its "expected result" prose are
  what a writer checks against that tag while authoring — there is no second frontmatter
  field for it today.
- A lesson with no hands-on lab, or one not yet tagged, uses `repo_tag: 'none'` — see the
  M0 sample lesson, `content/en/l1-beginner/m01-start/01-what-claude-code-is.mdx`.

## Tag coverage (current state, deliberate scope limit)

P22 tagged the **M1 hands-on lessons only** — every `Lab`-tagged lesson in
`docs/CURRICULUM.md` §2 for `m01`–`m09` (L1 Beginner + L2 Intermediate): 23 lesson tag
pairs, 46 tags (`git tag -l 'lesson/*'` in the lab repo). The full curriculum names hands-on
labs in nearly every module through `m21` (L3 Advanced, L4 Master) — those are **not yet
tagged**. This is a documented, deliberate scope limit of P22 (see its Handoff notes), not
a defect: a follow-up plan must tag `m10`–`m21` before content plans for those modules can
build their `Lab` blocks against a real tag. Two structural surfaces the L3 security module
will need already exist in the lab repo's `src/api/server.ts` (marked `TEACHING SURFACE`
in comments, catalogued as B6/B7 in its `BUGS.md`) — reserved, not yet wired to a tag.

The lab repository's own `README.md` carries the full 23-row lesson → tag → change table
for the M1 set; do not duplicate it here — it will drift. Read it there.

## Reused tags

A handful of M1 lesson tags intentionally point at the **same commits** as another
lesson's tag, when the exercise is "do the same fix again, differently" rather than a new
bug: `lesson/m05-04-*` (effort lab) reuses `lesson/m02-05-*`'s commits (the ms/s date bug,
compared across effort levels); `lesson/m08-04-*` (code-review-commands) reuses
`lesson/m02-02-*`'s commits (the pagination fix, reviewed as a PR diff). These are earlier
snapshots in the lab repo's history — they predate its `.claude/` scaffold (no
`CLAUDE.md`, rules, skills or hooks yet at those commits). A lesson writer building
`m05-04` or `m08-04` content should know they are looking at an earlier, narrower repo
state than `m03`+ tags show, and should not expect `.claude/` content to be present there.

Seven M1 lesson tags are **process-only**: `-start` and `-solution` point at the same
commit (the lab repo's stable `main` tip once its `.claude/` scaffold is fully built) because
the lesson is about Claude Code's own CLI/UI behaviour (installing it, permission modes,
CLI flags, `/resume`, or practising `git commit`/worktrees/PRs), not a code change in the
lab repo — there is nothing to diff. The lab repo's `README.md` lists exactly which seven.

## Capturing a transcript

Per `docs/CURRICULUM.md` §4.3 and `CLAUDE.md`'s hard rules (D070, D099): every lesson's
`<Transcript>` renders a trimmed copy of a **real** session, run by the lesson's writer
against the lab repo's actual `-start`/`-solution` tags — never a plausible-looking
invention. The workflow:

1. `git clone https://github.com/codechup/claude-code-lab.git` (or reuse a checkout),
   `git checkout lesson/<module>-<NN>-start`, `npm ci`.
2. Run the real Claude Code session the lesson's hands-on lab describes; let it read,
   edit, and run tests against that checkout.
3. Save the real transcript under
   `content/_shared/transcripts/<module>/<slug>/` in **this** repository (not in the lab
   repo) — the content plan that authors the lesson owns trimming it into the
   `<Transcript>` component's expected shape.
4. Confirm the session's end state matches `lesson/<module>-<NN>-solution` (or reproduces
   the fix described in the lab repo's `BUGS.md`) before citing it as the lesson's
   expected result.

## Verification performed for P22

- `gh repo view codechup/claude-code-lab` — public, MIT `LICENSE`, default branch `main`.
- `git clone` + `npm ci` + `npm test` at `main` tip: 4 test files, 15 tests, all green;
  confirmed both locally and via the repo's own GitHub Actions CI run (SHA-pinned
  `actions/checkout` + `actions/setup-node`, typecheck + lint + test, no deploy).
- Three sampled `-start`/`-solution` tag pairs, spread across L1 and L2 (L3/L4 are not
  tagged, see above), each checked out and run for real:
  - `lesson/m01-04-start` → 3 genuine test failures (missing input validation);
    `lesson/m01-04-solution` → all 15 tests green.
  - `lesson/m02-02-start` → 4 genuine test failures (off-by-one pagination);
    `lesson/m02-02-solution` → all 15 tests green.
  - `lesson/m05-02-start` → 1 genuine test failure (an unhandled promise rejection,
    caught by the test's own listener, not a harness crash); `lesson/m05-02-solution` →
    all 15 tests green.
- The CLI and API were also smoke-tested running natively under Node 24 (no test
  framework in the loop): `node src/cli.ts add ...`, `node src/cli.ts list`, `node
  src/cli.ts done <id>`, `node src/cli.ts show <id>`, and `node src/api/server.ts` +
  `curl` against `/health`, `POST /tasks`, `GET /tasks`.
- Every file tracked in the lab repository was scanned with this repo's
  `scripts/check-public-hygiene.mjs --stdin` (the public-hygiene rules apply there too,
  per `.claude/rules/public-hygiene.md`) — zero hits.

## Tag map (all modules, generated 2026-09-07)

98 tags on the lab repository. Modules without a row (m20, m21) have no lab-tagged lesson; their support material lives on `main` untagged.

| Module | Lesson numbers with a tag pair | Tag pattern |
|---|---|---|
| `m01` | 02, 04 | `lesson/m01-<NN>-start` / `-solution` |
| `m02` | 02, 03, 04, 05 | `lesson/m02-<NN>-start` / `-solution` |
| `m03` | 01, 03 | `lesson/m03-<NN>-start` / `-solution` |
| `m04` | 02, 03 | `lesson/m04-<NN>-start` / `-solution` |
| `m05` | 02, 04 | `lesson/m05-<NN>-start` / `-solution` |
| `m06` | 03, 04, 05 | `lesson/m06-<NN>-start` / `-solution` |
| `m07` | 02, 03, 04, 05 | `lesson/m07-<NN>-start` / `-solution` |
| `m08` | 01, 02, 03, 04 | `lesson/m08-<NN>-start` / `-solution` |
| `m10` | 03, 05 | `lesson/m10-<NN>-start` / `-solution` |
| `m11` | 02, 03, 04, 05, 06 | `lesson/m11-<NN>-start` / `-solution` |
| `m12` | 02, 03 | `lesson/m12-<NN>-start` / `-solution` |
| `m13` | 01, 02, 03, 05, 06 | `lesson/m13-<NN>-start` / `-solution` |
| `m14` | 02, 03 | `lesson/m14-<NN>-start` / `-solution` |
| `m15` | 01, 06 | `lesson/m15-<NN>-start` / `-solution` |
| `m16` | 04 | `lesson/m16-<NN>-start` / `-solution` |
| `m17` | 01, 02 | `lesson/m17-<NN>-start` / `-solution` |
| `m18` | 02, 03, 05 | `lesson/m18-<NN>-start` / `-solution` |
| `m19` | 01, 03 | `lesson/m19-<NN>-start` / `-solution` |
