---
id: P27
title: "L3 Advanced module: Subagents (m10-subagents)"
milestone: M2
status: done
owner: opus-p27-2026-09-07
branch: plan/27-l3-m10-subagents
model_hint: opus
effort_hint: high
depends_on: [P24]
owned_paths:
  - content/en/l3-advanced/m10-subagents/**
  - content/tr/l3-advanced/m10-subagents/**
  - content/_shared/transcripts/m10-subagents/**
shared_paths:
  - content/_shared/sources.json
estimate: L
updated_at: 2026-09-07T19:40:31Z
open_questions: []
---

## Goal

Author every lesson of Subagents (`m10-subagents`), the 6-lesson next module of Advanced (l3-advanced), in English: the reader builds the exact four agent archetypes named in D058 and understands when to fork vs. background vs. isolate in a worktree. Each lesson follows the fixed template (D006): Objectives + prerequisites, When NOT to use, Concept, Hands-on lab, Anti-patterns, Quiz, Sources. Every command shown was actually run against the lab repo and every claim is backed by real output (D093) — this plan produces no lesson content from memory alone.

## Context

Read first: `docs/CURRICULUM.md` (P03) — it is the **authoritative** source for this module's final lesson slugs, objectives, and order; the lesson list below is the floor the approved plan set, not a ceiling. Also read `research/feature-inventory.md` and `research/deprecations.md` (P03) for what is current vs. "Changed" as of `verified_version: 2.1.263`; `content/_shared/sources.json` (P23) for the vetted source list to pull from and append to; `.claude/rules/content.md`, `.claude/skills/new-lesson/SKILL.md` and the `lesson-researcher`/`lesson-writer`/`fact-checker`/`reviewer` agents (all P11) for the exact authoring workflow; `content/schema.ts` (P06) for the frontmatter zod schema; `docs/design/CANVAS.md` and `/design/` (P05) for the lesson-page visual reference; and the outline text this module was scoped from:

> `m10-subagents`: Agent tool & built-ins (Explore/Plan) · custom agents in `.claude/agents/` (lab: code-reviewer, test-writer, docs-writer, researcher) · model/tools per agent · fork & background agents · worktree isolation · advisor

No lesson in this module exists yet; `content/en/l3-advanced/m10-subagents/**` starts from the level/module `index.mdx` stub P06 created.

Decisions this module leans on beyond the shared pipeline decisions below: (D058).

## Scope

In:
- 6 lesson files under `content/en/l3-advanced/m10-subagents/`, numbered `01-`…`06-`, each a complete MDX file following D006's seven sections.
- The matching Turkish draft stub for each lesson under `content/tr/l3-advanced/m10-subagents/` (`draft: true`, created by the `/new-lesson` skill in the same commit as the EN lesson — D016, D018; P25/P26/P40/P41 translate it later, never this plan).
- One raw lab transcript per lesson with a hands-on lab, saved under `content/_shared/transcripts/m10-subagents/`, plus the simplified `<Transcript>` rendering embedded in the lesson (D099).
- This module's entries appended to `content/_shared/sources.json` (D041, D043; append-only — never rewrite another module's entries).
- Updating `l3-advanced/index.mdx` and `m10-subagents/index.mdx` module-index copy if this module's final lesson list differs from the stub P06 left (rare; only if `docs/CURRICULUM.md` changed the outline).

Out: Turkish translation of these lessons (P25/P26/P40/P41 own `content/tr/l3-advanced/m10-subagents/**` after this plan hands it off); any other module's content; MDX component code (P07/P08 own those; if a lesson needs a component that does not exist, write it into `open_questions` and do not build it here); changes to `content/schema.ts`, `src/lib/nav.ts`, or any route/layout file; the lab repo itself (P22 owns `codechup/claude-code-lab`; this plan clones and runs it, never edits it in place — a bug fix needed there goes into `open_questions` naming the tag).

## Deliverables

- `content/en/l3-advanced/m10-subagents/NN-<slug>.mdx` (6 files):
01. **The Agent tool and its built-ins (Explore, Plan)** — `01-agent-tool-and-builtins.mdx`
02. **Custom agents** — `02-custom-agents.mdx` (hands-on lab: building code-reviewer, test-writer, docs-writer, and researcher agents)
03. **Choosing model and tools per agent** — `03-model-and-tools-per-agent.mdx`
04. **Fork and background agents** — `04-fork-and-background-agents.mdx`
05. **Worktree isolation for agents** — `05-worktree-isolation.mdx`
06. **The advisor pattern** — `06-advisor.mdx`
- `content/tr/l3-advanced/m10-subagents/NN-<slug>.mdx` (6 files) — `draft: true` stubs with EN frontmatter fields carried over and `title`/`description` left in English (translation is not this plan's job; the stub exists so routing/parity gates pass).
- `content/_shared/transcripts/m10-subagents/NN-<slug>.md` — one per lesson that has a hands-on lab, containing the raw terminal transcript.
- Updated `content/_shared/sources.json` with this module's sources block entries.

## Acceptance criteria

- `node scripts/content-gate.ts` passes for this module: every lesson's frontmatter validates against `content/schema.ts`, every code fence has a language tag, EN/TR path parity holds (the TR draft exists at the same slug), and `level`/`module` in frontmatter match the file path.
- Every lesson has `verified_version: 2.1.263` and a non-empty `sources` array with at least one `type: "doc"` entry whose URL was fetched successfully by `/verify-sources` (D041, D043) — paste the WebFetch/lychee evidence in the PR.
- Every lesson with a hands-on lab has a transcript file under `content/_shared/transcripts/m10-subagents/` whose content matches, verbatim, a real run of the commands shown in the lesson (D093, D099) — no lesson may show output that was not captured this way.
- `npm run typecheck && npm run lint && npm test` pass; `npm run build` succeeds and `dist/en/l3-advanced/m10-subagents/` contains 6 lesson pages plus the index.
- `npx playwright test e2e/lesson.spec.ts` passes against at least one lesson in this module (axe: 0 serious/critical violations at 390 px and 1280 px).
- The `fact-checker` agent's report (pasted into the PR) shows no unresolved discrepancy against `research/feature-inventory.md`; the `reviewer` agent's report confirms the D006 template order and the evidence rule on every lesson.

## Steps

1. Read `docs/CURRICULUM.md` §m10-subagents and confirm the lesson list/order below still matches; if it drifted, follow the doc, not this plan, and note the delta in Handoff notes.
2. Run the `lesson-researcher` agent once per lesson (D098): official doc URL(s) + 2–3 web/YouTube sources, summarized against `research/feature-inventory.md`; save nothing permanent yet, this feeds step 4.
3. Clone `codechup/claude-code-lab` (P22) into a scratch directory; for every lesson with a hands-on lab, check out its start tag (`lesson/m10-subagents-NN-start`), do the exercise for real, and capture the full terminal transcript.
4. Write each lesson MDX with `/new-lesson l3-advanced/m10-subagents/<slug>` (creates the EN file and the TR draft stub together); fill Objectives, When NOT to use, Concept (grounded in the researcher's summary, never invented), Hands-on lab (the exact commands from step 3), Anti-patterns, Quiz, Sources.
5. Save the raw transcript from step 3 under `content/_shared/transcripts/m10-subagents/NN-<slug>.md`; embed the simplified version with the `<Transcript>` component (P07) in the lesson.
6. Append this lesson's sources to `content/_shared/sources.json` (P23's schema); run `/verify-sources content/en/l3-advanced/m10-subagents/NN-<slug>.mdx` to stamp `verified_at`.
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

A reviewer opens `npm run dev`, visits each of the 6 lessons at `/en/l3-advanced/m10-subagents/<slug>/`, confirms the OS tabs, transcript, quiz, and sources block render, spot-checks two Sources links by hand, and reads the fact-checker/reviewer agent reports pasted in the PR before merging.

## Handoff notes

**Delivered.** 6 EN lessons under `content/en/l3-advanced/m10-subagents/`, 6 TR `draft: true` stubs
(translated `title`/`description`/`tags` plus a one-paragraph Turkish summary, per
`docs/authoring/CONTENT-PLAN-BRIEF.md` §1.4 — the plan text said to leave them in English; the brief
wins, noted here as the delta), 12 real transcripts under
`content/_shared/transcripts/m10-subagents/`, and 7 appended/extended entries in
`content/_shared/sources.json` (`lab-m10-03-start`, `lab-m10-03-solution`, `lab-m10-05-start` added;
`m10-subagents` appended to `docs-tools-reference`, `docs-cross-session-messaging`,
`docs-agent-teams`, `repo-claude-code-lab`). Module `index.mdx` files needed no change — neither
carried a lesson list.

**Slug delta (CURRICULUM wins, per Steps §1).** The Deliverables list in this plan names
`03-model-and-tools-per-agent`, `04-fork-and-background-agents`, `05-worktree-isolation`.
`docs/CURRICULUM.md` §2 names `03-agent-lab`, `04-model-per-agent`, `05-fork-background-worktree`.
The curriculum slugs were used.

**Lab-tag delta.** The plan's Steps §3 expects `lesson/m10-subagents-NN-start`; the real tags P22
shipped are `lesson/m10-03-start`, `lesson/m10-03-solution`, `lesson/m10-05-start`,
`lesson/m10-05-solution`. The last three point at **identical trees** (`76c0c1d5…`), so lesson 05's
lab needs no repo change of its own. Only lessons 03 and 05 have a `-start` tag, so:
`01` and `06` → `repo_tag: 'none'`; `02` reuses `lesson/m10-03-start`; `03` → `lesson/m10-03-start`;
`04` → `lesson/m10-03-solution` (a real tag, not a `-start` one — the four agents must already exist
for the model-resolution runs); `05` → `lesson/m10-05-start`.

**Capture conditions (D093).** Every command in every lab was run this session against a private
clone of `codechup/claude-code-lab` at Claude Code 2.1.263, Node 24.18.0. Two environment notes that
are in the transcript provenance headers but are not part of the commands readers run:
this machine's user settings carry `"language": "Turkish"`, so the lab clone got a
`.claude/settings.local.json` with `{"language": "English"}` to keep the recordings readable (the
lab commands themselves are unmodified); and lesson 05's run additionally set
`worktree.baseRef: "head"` — the lesson's own step 4 tells the reader to do the same and says why.
Absolute paths in the captures were redacted to `~/claude-code-lab`.

**Review pipeline (D071).** `fact-checker` (read-only, plan mode, live re-fetch of all seven cited
doc pages) returned FAIL on the first pass: 3 WRONG, 2 UNVERIFIABLE, and (its own estimate) roughly 71 CONFIRMED. All five were
fixed and re-verified against a targeted re-fetch of `sub-agents.md` and `tools-reference.md`:

1. `01` — `run_in_background` "default `true`" (from the tools-reference summary) is not a documented
   default; the row now says the placement rules decide.
2. `01` — `Explore`'s tools were enumerated as "Read, Grep, Glob, Bash for reading"; the live page
   only says read-only with `Write`/`Edit` denied. Enumeration removed.
3. `01` — "the Agent tool needs no permission" now cites the tools-reference `Permission required: No`
   column explicitly.
4. `05` — the foreground/background order was wrong: case 4 is "fork mode off → background by
   default, foreground when Claude needs the result", and `background: true` only pins it there.
   Rewritten, and the lesson now explains the lesson-01-vs-lesson-03 `started_in_background`
   difference with that rule.
5. `05` — the tool list attributed to background agents is actually the *first* filter that applies
   to every subagent. The lesson now describes both filters, including the background allowlist.

Advisor-suggested edits also applied: a stray PowerShell note removed from lesson 04's `steps` array,
a duplicated `/subtask` version note trimmed in lesson 05, and lesson 06's advisor-pairing bullets
rewritten so they teach the rule instead of naming Opus 4.6/4.7 and Sonnet 4.6 (model versions this
curriculum does not otherwise teach). Lesson 02's "break the file on purpose" step was captured for
real rather than asserted — the extra transcript shows `by_type` falling back to `{"Explore": 1}`
with no warning printed.

The `reviewer` agent (read-only, plan mode) returned **CHANGES REQUESTED — 1 blocker, 0 majors**;
all seven findings were applied:

1. *Blocker* — the `<Callout variant="changed">` in lessons 02, 04 and 05 sat inside the lab section,
   before `## Anti-patterns`. D006's order is Anti-patterns → Changed → Quiz. All three moved.
2. The TR stub for lesson 05 still summarised the pre-correction background tool list; refreshed to
   the two-filter explanation.
3. Lesson 06 had no worked prompt in Concept (D027); one added, taken from the lab's real command.
4. `docs-agent-view` in `sources.json` was tagged `m10-subagents` with no lesson citing it;
   `agent-view.md` was fetched and is now cited by lesson 01, whose Concept discusses agent view.
5. The two scratch files (`.factcheck.txt`, `.review.txt`) were deleted rather than committed.
6. Two `<Transcript range>` end values overran the file length (harmless, `sliceRange` clamps);
   tightened to the real lengths.
7. Lesson 06's lab `expected` had single-quoted the captured error; restored to the capture's exact
   double quotes.

Everything the reviewer listed under **Passes** — template order, schema validity, EN/TR frontmatter
parity, one `type: official` source per lesson, all `<Transcript>` paths resolving, numbers matching
the raw captures, no hygiene violations, Turkish diacritics — held on the first pass.

**Inventory drift for P03 (not fixed here — outside `owned_paths`).**

- `research/feature-inventory.md` line 30's permission-mode list omits `manual` (an alias for
  `default`, v2.1.200+), which the live `sub-agents.md` frontmatter table lists.
- Line 42's headless row lists `--allowedTools` but not `--disallowedTools`, which `cli-reference.md`
  documents.
- The subagents row (line 36) does not mention `experimental: {cacheTtl}` or `initialPrompt`, both of
  which are in the live frontmatter table.
- `research/deprecations.md`'s hooks row still writes `permissionDecision: allow|deny|block`; the
  live pages list `allow|deny|ask|defer`. Already flagged by P19; repeated here for the record.

**Not done / open.** No video sources were opened, so none were added (D041 allows official-doc-only
source blocks). `/subtask`, `/fork`, `/tasks` and the interactive `Advising` / `Ctrl+O` advisor
states are interactive-only and are described in prose with `<CodeBlock>`s, never as a fake
transcript. The TR twins stay `draft: true` for P25/P26/P40/P41; the Turkish summaries use several
terms (`subagent`, `worktree`, `fork`, `background`, `context window`, `frontmatter`, `advisor`,
`headless`) that the translation plan should link to `/tr/playbook/glossary/#…` on first use —
`advisor` and `frontmatter` may need new glossary entries.

