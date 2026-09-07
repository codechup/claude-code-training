---
id: P16
title: "L1 Beginner module: Commands (m04-commands)"
milestone: M1
status: done
owner: opus-p16-2026-09-07
branch: plan/16-l1-m04-commands
model_hint: opus
effort_hint: high
depends_on: [P12, P03, P22, P23]
owned_paths:
  - content/en/l1-beginner/m04-commands/**
  - content/tr/l1-beginner/m04-commands/**
  - content/_shared/transcripts/m04-commands/**
shared_paths:
  - content/_shared/sources.json
estimate: L
updated_at: 2026-09-07T10:22:18Z
open_questions:
  - "docs/CURRICULUM.md §2 m04-commands names `/fullscreen` (lesson 04) and `claude config` (lesson 05); neither exists in Claude Code 2.1.263. The real forms are `/tui fullscreen` and `/config key=value`. P03 owns CURRICULUM; the module index.mdx copy in both languages repeats the same two errors and needs the same fix."
  - "research/deprecations.md says `/btw` history moved to `Shift+←/→`. The live interactive-mode.md says `Left`/`Right` (v2.1.187+). That row is wrong and needs correcting by its owner."
  - "The `/new-lesson` scaffold emits `{/* … */}` MDX comments into TR stubs; `prettier --write` rewrites them to `{/_ … _/}`, which is not a valid MDX comment. P11 should change the scaffold."
  - "Shiki's `github-light` keyword red (#D73A49) fails axe `color-contrast` (serious) on code backgrounds — hit by a PowerShell `function` keyword. Worked around in content; P05 should fix the theme."
---

## Goal

Author every lesson of Commands (`m04-commands`), the 4-lesson opening module of Beginner (l1-beginner), in English: this module is the L1 reference module — it closes the Beginner level with a command and session-management reference the reader will keep coming back to. Each lesson follows the fixed template (D006): Objectives + prerequisites, When NOT to use, Concept, Hands-on lab, Anti-patterns, Quiz, Sources. Every command shown was actually run against the lab repo and every claim is backed by real output (D093) — this plan produces no lesson content from memory alone.

## Context

Read first: `docs/CURRICULUM.md` (P03) — it is the **authoritative** source for this module's final lesson slugs, objectives, and order; the lesson list below is the floor the approved plan set, not a ceiling. Also read `research/feature-inventory.md` and `research/deprecations.md` (P03) for what is current vs. "Changed" as of `verified_version: 2.1.263`; `content/_shared/sources.json` (P23) for the vetted source list to pull from and append to; `.claude/rules/content.md`, `.claude/skills/new-lesson/SKILL.md` and the `lesson-researcher`/`lesson-writer`/`fact-checker`/`reviewer` agents (all P11) for the exact authoring workflow; `content/schema.ts` (P06) for the frontmatter zod schema; `docs/design/CANVAS.md` and `/design/` (P05) for the lesson-page visual reference; and the outline text this module was scoped from:

> `m04-commands`: built-in slash command reference · keybindings & `/keybindings` · `/statusline`, themes, fullscreen, output styles · sessions (`/resume`, `/branch`, `/fork`)

No lesson in this module exists yet; `content/en/l1-beginner/m04-commands/**` starts from the level/module `index.mdx` stub P06 created.

Decisions this module leans on beyond the shared pipeline decisions below: (D075).

## Scope

In:
- 4 lesson files under `content/en/l1-beginner/m04-commands/`, numbered `01-`…`04-`, each a complete MDX file following D006's seven sections.
- The matching Turkish draft stub for each lesson under `content/tr/l1-beginner/m04-commands/` (`draft: true`, created by the `/new-lesson` skill in the same commit as the EN lesson — D016, D018; P25/P26/P40/P41 translate it later, never this plan).
- One raw lab transcript per lesson with a hands-on lab, saved under `content/_shared/transcripts/m04-commands/`, plus the simplified `<Transcript>` rendering embedded in the lesson (D099).
- This module's entries appended to `content/_shared/sources.json` (D041, D043; append-only — never rewrite another module's entries).
- Updating `l1-beginner/index.mdx` and `m04-commands/index.mdx` module-index copy if this module's final lesson list differs from the stub P06 left (rare; only if `docs/CURRICULUM.md` changed the outline).

Out: Turkish translation of these lessons (P25/P26/P40/P41 own `content/tr/l1-beginner/m04-commands/**` after this plan hands it off); any other module's content; MDX component code (P07/P08 own those; if a lesson needs a component that does not exist, write it into `open_questions` and do not build it here); changes to `content/schema.ts`, `src/lib/nav.ts`, or any route/layout file; the lab repo itself (P22 owns `codechup/claude-code-lab`; this plan clones and runs it, never edits it in place — a bug fix needed there goes into `open_questions` naming the tag).

## Deliverables

- `content/en/l1-beginner/m04-commands/NN-<slug>.mdx` (4 files):
01. **Built-in slash command reference** — `01-slash-command-reference.mdx`
02. **Keybindings and /keybindings** — `02-keybindings.mdx`
03. **/statusline, themes, fullscreen, and output styles** — `03-statusline-themes-and-output-styles.mdx`
04. **Sessions: /resume, /branch, /fork** — `04-sessions-resume-branch-fork.mdx`
- `content/tr/l1-beginner/m04-commands/NN-<slug>.mdx` (4 files) — `draft: true` stubs with EN frontmatter fields carried over and `title`/`description` left in English (translation is not this plan's job; the stub exists so routing/parity gates pass).
- `content/_shared/transcripts/m04-commands/NN-<slug>.md` — one per lesson that has a hands-on lab, containing the raw terminal transcript.
- Updated `content/_shared/sources.json` with this module's sources block entries.

## Acceptance criteria

- `node scripts/content-gate.ts` passes for this module: every lesson's frontmatter validates against `content/schema.ts`, every code fence has a language tag, EN/TR path parity holds (the TR draft exists at the same slug), and `level`/`module` in frontmatter match the file path.
- Every lesson has `verified_version: 2.1.263` and a non-empty `sources` array with at least one `type: "doc"` entry whose URL was fetched successfully by `/verify-sources` (D041, D043) — paste the WebFetch/lychee evidence in the PR.
- Every lesson with a hands-on lab has a transcript file under `content/_shared/transcripts/m04-commands/` whose content matches, verbatim, a real run of the commands shown in the lesson (D093, D099) — no lesson may show output that was not captured this way.
- `npm run typecheck && npm run lint && npm test` pass; `npm run build` succeeds and `dist/en/l1-beginner/m04-commands/` contains 4 lesson pages plus the index.
- `npx playwright test e2e/lesson.spec.ts` passes against at least one lesson in this module (axe: 0 serious/critical violations at 390 px and 1280 px).
- The `fact-checker` agent's report (pasted into the PR) shows no unresolved discrepancy against `research/feature-inventory.md`; the `reviewer` agent's report confirms the D006 template order and the evidence rule on every lesson.

## Steps

1. Read `docs/CURRICULUM.md` §m04-commands and confirm the lesson list/order below still matches; if it drifted, follow the doc, not this plan, and note the delta in Handoff notes.
2. Run the `lesson-researcher` agent once per lesson (D098): official doc URL(s) + 2–3 web/YouTube sources, summarized against `research/feature-inventory.md`; save nothing permanent yet, this feeds step 4.
3. Clone `codechup/claude-code-lab` (P22) into a scratch directory; for every lesson with a hands-on lab, check out its start tag (`lesson/m04-commands-NN-start`), do the exercise for real, and capture the full terminal transcript.
4. Write each lesson MDX with `/new-lesson l1-beginner/m04-commands/<slug>` (creates the EN file and the TR draft stub together); fill Objectives, When NOT to use, Concept (grounded in the researcher's summary, never invented), Hands-on lab (the exact commands from step 3), Anti-patterns, Quiz, Sources.
5. Save the raw transcript from step 3 under `content/_shared/transcripts/m04-commands/NN-<slug>.md`; embed the simplified version with the `<Transcript>` component (P07) in the lesson.
6. Append this lesson's sources to `content/_shared/sources.json` (P23's schema); run `/verify-sources content/en/l1-beginner/m04-commands/NN-<slug>.mdx` to stamp `verified_at`.
7. Run the `fact-checker` agent against the whole module, then the `reviewer` agent (read-only; template + evidence + sources); fix everything both flag.
8. `node scripts/content-gate.ts && npm run typecheck && npm run lint && npm test && npm run build`; run `npx playwright test e2e/lesson.spec.ts` against one lesson from this module.
9. Open the PR with the fact-checker and reviewer reports plus real command output pasted in (D093); never paste output you did not just produce.

## Tests required

- `scripts/content-gate.ts` (schema, fences, EN/TR parity, level/module-vs-path).
- `npm test` (Vitest — `src/lib` nav/slug helpers exercised against this module's new slugs).
- `e2e/lesson.spec.ts` (Playwright + axe) against one lesson in this module, both 390 px and 1280 px.
- Manual: every command in every "Hands-on lab" section was run against the cloned lab repo this session and matches its saved transcript.

## Non-goals / pitfalls

- Do not write Turkish lesson prose in this plan — the draft stub exists only so the build does not break; leave its body as the EN-derived placeholder `/new-lesson` generates.
- Do not fabricate command output, ever — if a lab command's real result differs from what the lesson expects, fix the lesson (or flag the lab repo bug in `open_questions`), never the transcript.
- Do not invent a component that does not exist (Quiz, DecisionTree, Transcript, Sources, OSTabs, WhenNotToUse, Lab, Callout, CodeBlock, YouTubeCard are the only ones available, from P07/P08) — write the gap into `open_questions` instead.
- Do not touch another module's files, `content/schema.ts`, or anything under `src/**`.
- Do not mark a lesson's Turkish stub `draft: false` — that flip belongs to the translation plan.

## Verification

A reviewer opens `npm run dev`, visits each of the 4 lessons at `/en/l1-beginner/m04-commands/<slug>/`, confirms the OS tabs, transcript, quiz, and sources block render, spot-checks two Sources links by hand, and reads the fact-checker/reviewer agent reports pasted in the PR before merging.

## Handoff notes

**What was written.** Five EN lessons (not four — see plan-file drift below), five TR `draft: true`
stubs with translated `title`/`description` and a one-paragraph Turkish summary each, twelve raw
transcripts across three folders, three transcript `README.md` files, and the EN module index
lesson list turned into links.

**Plan-file drift (this file was stale; `docs/CURRICULUM.md` §2 won, per step 1).**

| This plan said | CURRICULUM §2 / reality |
| --- | --- |
| 4 lessons | 5 lessons |
| `02-keybindings`, `03-statusline-themes-and-output-styles`, `04-sessions-resume-branch-fork` | `02-cli-flags`, `03-sessions`, `04-keybindings-statusline-theme`, `05-subcommands` |
| transcripts at `transcripts/m04-commands/NN-<slug>.md` | `.claude/rules/content.md` §5 + the reference lesson use a folder per lesson with numbered `.txt` captures — followed that |
| lab tag `lesson/m04-commands-NN-start` (also what the session brief said) | real tags are `lesson/m04-02-start` / `lesson/m04-03-start`; `docs/lab/README.md` and the lab repo's own README both use the `m0N-NN` form. Used the tags that exist |

Lessons 01, 04 and 05 have no lab-repo tag (`repo_tag: 'none'`) — the lab repo only tags `m04-02`
and `m04-03`, and those two tags both point at the stable `main` tip (process-only lessons, no
seeded bug). 01 and 04 are interactive-only surfaces, so they carry a `<Lab>` the reader runs on
their own machine and deliberately **no** transcript (D093: a TUI menu is not something Claude Code
printed). 05 has four real captures taken on this machine rather than against a lab tag.

**Doc-vs-research drift found while writing (docs win, per the brief).**

1. **`research/deprecations.md` is wrong about `/btw`.** It says history navigation moved from
   `←/→` to `Shift+←/→`. Live `interactive-mode.md` (fetched 2026-09-07) says the opposite: `Left`
   steps to older `/btw` answers and `Right` returns toward the current one, requiring v2.1.187 or
   later; and a bare `/btw` reopens the overlay on the most recent exchange, where before v2.1.212
   it printed a usage message. The Changed callout in lesson 01 is written from the live doc. **P03
   or whoever owns `research/deprecations.md` should correct that row** — it is outside this plan's
   `owned_paths`.
2. **`keybindingFlavor` does not appear anywhere in the live `keybindings.md`.** That is consistent
   with the deprecations entry ("ignored"), and no version is recorded anywhere, so the lesson 04
   callout says the setting is ignored and no longer documented, verified against `keybindings.md`
   for 2.1.263 — it does not invent a version.
3. **`/fullscreen` does not exist.** CURRICULUM §2 and both module `index.mdx` files name it in the
   lesson-04 objective. The real command is `/tui [default|fullscreen]`; `terminal-config.md` and
   `commands.md` agree. Lesson 04 teaches `/tui fullscreen` and carries a Changed callout.
4. **`claude config` does not exist.** CURRICULUM §2 and both `index.mdx` files name it in the
   lesson-05 objective. It is not in `cli-reference.md` and not in `claude --help` (captured
   verbatim in `05-subcommands/03-claude-subcommands.txt`); running `claude config list` just starts
   a session. The current form is the in-session `/config [key=value ...]` (v2.1.181+, shorthand
   keys v2.1.182+), `--settings` at launch, or the settings file. Lesson 05 says so in prose with
   the capture as evidence — no Changed callout, because there is no recorded deprecation or version
   for it.

Items 3 and 4 mean the **module index copy** (`content/{en,tr}/l1-beginner/m04-commands/index.mdx`)
and **`docs/CURRICULUM.md` §2** still name `/fullscreen` and `claude config`. This plan only
linkified the EN list (per the standing brief), and CURRICULUM is P03's. See `open_questions`.

**Review pipeline (D071).** Both agents were run read-only from the worktree root and their reports
are pasted in the PR.

- `fact-checker`: verdict FAIL on lesson 05 with **0 "must fix"** and 6 "unverifiable". All six were
  then checked by hand against the raw `curl`-downloaded doc, and **all six are confirmed verbatim**:
  `MCP_TIMEOUT` "(default: 30000, or 30 seconds)"; `CLAUDE_CODE_SAFE_MODE` "Equivalent to passing
  `--safe-mode`"; `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` "auto-updates, telemetry, error
  reporting, the `/feedback` command…"; `CLAUDE_CONFIG_DIR` "Ignored in project and local settings";
  and the whole "Features that need feature-flag fetching" section, which names exactly
  `DISABLE_GROWTHBOOK`, `DISABLE_TELEMETRY`, `DO_NOT_TRACK`,
  `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` and lists Remote Control, `/import`, `/skill-doctor`,
  the advisor tool, artifact comments, cross-machine messaging and default auto-mode start among the
  effects. "Remote Control eligibility" in the `claude doctor` row is in `cli-reference.md`. The FAIL
  is a **WebFetch truncation artefact**: `env-vars.md` is ~470 KB and the agent's own report says the
  section "could not be fetched in full after 7 attempts". A future fact-checking pass over a very
  large doc page should be given the raw file rather than a URL.
- `reviewer`: CHANGES REQUESTED, 0 blockers, 3 majors. All fixed. Its major #1 (empty
  `open_questions`) was already resolved before the review landed. Its "checked and clean" list
  independently confirms the two judgement calls above: the missing `## Sources` heading is correct
  (the page layout renders `<Sources>` from frontmatter, `src/pages/[lang]/[level]/[module]/[slug]/index.astro:143`),
  and `<Lab repoTag="none">` is the established convention.

Counts: **confirmed 60+, fixed 9, unverifiable 0** (all 6 the fact-checker could not reach were
resolved from the raw docs).

**What the reviews changed.**

- Lesson 02 now shows the exact command behind the JSON transcript in a `<CodeBlock>` — it uses
  `--model haiku` and a fuller `jq` filter than the text-mode example above it, and the lab step
  matches. "Six fields" → "Seven".
- Lesson 05's env-var `<OSTabs>` command now includes `--output-format json | jq …`, so running it as
  written actually produces the output shown beneath it.
- Both module `index.mdx` files stopped naming `/fullscreen` and `claude config`, which the lessons
  they link to explicitly document as not existing. This is a copy fix inside `owned_paths`;
  `docs/CURRICULUM.md` §2 still has both errors and is P03's.
- Lesson 03 gained a short "Sessions that started somewhere else" section covering `--teleport` /
  `/teleport` and `/remote-control`, which the index bullet promised and the body had omitted.
- Sources added where prose leaned on a doc that was not cited: `permission-modes.md` and
  `fullscreen.md`, `interactive-mode.md`, `mcp.md`, `plugins-reference.md`. `fullscreen.md` was
  already tagged `m04-commands` in `sources.json` with no lesson citing it; lesson 04 now does.
- Lesson 05 gained a Changed callout for `ANTHROPIC_SMALL_FAST_MODEL` → `ANTHROPIC_DEFAULT_HAIKU_MODEL`.

**For the translation plan (P25/P26/P40/P41).** The TR stubs carry a real one-paragraph Turkish
summary rather than the placeholder `/new-lesson` generates, because the standing brief asks for one.
That is prose to **reconcile or discard** when the full translation lands, not text to keep.

**One more inventory item.** The live `cli-reference.md` lists `claude daemon status`, `claude daemon
stop`, `claude remote-control` and `claude self-hosted-runner` as subcommands. None appear in the
`claude --help` output actually captured on 2.1.263
(`05-subcommands/03-claude-subcommands.txt`), and the list is alphabetical, so they would be visible
if present. Either they are hidden from `--help`, or the doc has drifted ahead of the pinned version.
The lesson never claims the list is exhaustive — it says "the actual list from `claude --help` on
Claude Code 2.1.263" — but whoever owns `research/feature-inventory.md`'s docs map should look.
`research/feature-inventory.md` also has thin env-var coverage relative to what lesson 05 teaches.

**Also worth recording.**

- The reference lesson (`m01-start/01-what-claude-code-is.mdx`) has no `## Sources` heading — the
  page layout renders the block from frontmatter. The `/new-lesson` scaffold template *does* emit
  one. Followed the reference lesson, as the standing brief instructs ("copy its section order and
  component usage exactly"). If the reviewer agent wants the heading back, it is a one-line add to
  five files — but then the scaffold and the reference lesson disagree and P07/P12 should settle it.
- `Callout` has exactly three variants (`note`, `when-not-to-use`, `changed`) — no `new` variant, so
  the "New" badges `research/deprecations.md` suggests for recent additions were not used.
- `.claude/rules/content.md` §4 also wants every Changed item on `playbook/06-changed-since-2025`.
  That page is P42's and outside `owned_paths`; the four items used here (`/pr-comments`, `/vim`,
  `/ultraplan`, `/output-style`; `/btw`; `keybindingFlavor`; `--enable-auto-mode`;
  `claude --resume` cross-project search) need mirroring there.
- Prettier rewrites `{/* … */}` MDX comments into `{/_ … _/}`, which is not a valid MDX comment.
  The `/new-lesson` scaffold emits that exact construct into every TR stub, so **any plan that runs
  the scaffold and then `prettier --write` will corrupt its TR stubs.** Worked around here by
  replacing the comment with a Turkish blockquote note; the scaffold itself (P11) should stop
  emitting it.
- One a11y fix worth knowing about: a PowerShell snippet using the `function` keyword failed
  `color-contrast` (serious) at both viewports — Shiki's `github-light` keyword red `#D73A49` on the
  code background. Rewrote the snippet to avoid the keyword. This is a **theme/token gap in
  `src/styles/shiki.css`** (P05), not a content problem; any lesson that shows a PowerShell
  `function`, or any other token rendered in that red, will fail the same axe check.
- The lab repository was cloned to a **private copy** at `../cct-lab-16` rather than the shared
  `../claude-code-lab`, so that checking out `m04` tags could not disturb the sibling sessions in
  `cct-wt-13/14/15`.
- To take clean captures, `hasTrustDialogAccepted` was set for that clone in this machine's
  `~/.claude.json`. Without it every capture is prefixed by a workspace-trust warning naming a local
  path. That is a local-machine state change, not a repo change.
- Every capture answers in **Turkish**. This machine's global Claude Code preferences ask for it, and
  the recordings were kept verbatim per D093/D070 — the same thing `m01-start/01` records and
  explains. Lesson 02 explains it in prose where the reader first meets it.
- The 05 `--help` captures were filtered with `grep -E '^  [a-z]'` to the first line of each
  subcommand description (the terminal wraps them); the filter is in each file's provenance header
  and in the folder README. Lines were deleted, never rewritten.
- `content/_shared/sources.json` (shared, append-only): added `m04-commands` to
  `docs-interactive-mode`'s `modules`, and appended one new entry, `repo-claude-code-lab`. Edited as
  text, not re-serialised — a `JSON.stringify` round-trip reflows every inline `modules` array and
  would have produced a 300-line diff. Expect a merge conflict with the sibling sessions; resolve by
  keeping both sides' entries and re-sorting by `id`.

