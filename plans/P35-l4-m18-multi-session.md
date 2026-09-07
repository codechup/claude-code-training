---
id: P35
title: "L4 Master module: Multi-session (m18-multi-session)"
milestone: M2
status: review
owner: lead-fable
branch: plan/35-l4-m18-multi-session
model_hint: opus
effort_hint: high
depends_on: [P24]
owned_paths:
  - content/en/l4-master/m18-multi-session/**
  - content/tr/l4-master/m18-multi-session/**
  - content/_shared/transcripts/m18-multi-session/**
shared_paths:
  - content/_shared/sources.json
estimate: L
updated_at: 2026-09-07T23:33:55Z
open_questions:
  - "Plan-vs-CURRICULUM drift (P03 owns CURRICULUM). This plan's Deliverables list 4 lessons with working titles; docs/CURRICULUM.md section 2 m18-multi-session lists 6 (01-plan-files ... 06-this-repo-as-example). Followed the doc, per this plan's own Step 1. The plan file's Scope/Deliverables text should be reconciled with CURRICULUM by whoever next edits it."
  - "This plan's Acceptance criteria require a source entry of type 'doc', but src/content/schema.ts's sourceSchema enum only accepts official | video | article | repo. The lessons ship type: official. The plan text should be corrected so a future reader is not misled."
  - "Contract-vs-implementation drift in tools/plan (no plan currently owns tools/plan/**). plans/README.md section 3 and .claude/rules/plans.md both define staleness clock-free (updated_at older than 24h relative to the newest updated_at in the set), and tools/plan/state.ts and tools/plan/check.ts implement exactly that via newest(s). But tools/plan/cli.ts's next and claim commands pass the wall clock (envClock()) instead, so the two commands a session actually uses to take work do NOT have the clock-free guarantee the contract states. Independently found by this session and by the fact-checker agent. Lesson 02 teaches both reference points and names the discrepancy rather than repeating the contract as settled fact; the code or the contract should be reconciled by whoever owns tools/plan/**."
  - "Lab repo (P22 owns it). STATE.md at lesson/m18-02-solution and lesson/m18-03-start tells the reader to run 'node scripts/plan.mjs claim P01 --owner <name>', but scripts/plan.mjs does not exist until lesson/m18-05-solution, and even there it only lists claimable plans - it implements no claim subcommand. A real captured session followed the instruction and repeated the non-existent command. Lesson 02 turns this into a teaching point about hand-maintained status files, but the tag's STATE.md text should probably be fixed."
  - "Lab tag naming (P03/P22; already raised by P15). docs/CURRICULUM.md section 2 documents the convention lesson/<module>-<NN>-start (i.e. lesson/m18-multi-session-02-start), but the tags that exist are lesson/m18-02-start. These lessons cite the tags that really exist."
  - "research/feature-inventory.md (P03 owns it) records worktrees only as the subagent field 'isolation: worktree'. The live worktrees.md documents the --worktree/-w flag, the EnterWorktree/ExitWorktree tools, .worktreeinclude and worktree.baseRef, and 'claude --help' on 2.1.263 lists '-w, --worktree [name]'. The inventory row should be expanded. Separately, cli-reference.md as fetched on 2026-09-07 did not surface a --worktree row although the flag exists, so lesson 03 sources that flag to worktrees.md and the verified local --help output."
  - "research/deprecations.md (P03 owns it) has no m18 rows. Three version-gated behaviours the fact-checker flagged are taught as current (correct at 2.1.263) but have no Changed entry anywhere: EnterWorktree's always-ask approval outside .claude/worktrees/ began at v2.1.206; the periodic sweep's release of a killed session's worktree lock began at v2.1.210; and the subagent model-resolution order inverted before v2.1.251 (the env var used to win). Worth rows for the playbook changelog page (P42)."
---

## Goal

Author every lesson of Multi-session (`m18-multi-session`), the 4-lesson next module of Master (l4-master), in English: this module teaches multi-session coordination using this very repository — its `plans/`, `STATE.md`, and `tools/plan` — as the worked example (D051). When explaining why this pattern exists, say only that it was "proven on a prior project"; never name or describe the owner's other, private projects (D026 — the same rule this plan itself is written under). Each lesson follows the fixed template (D006): Objectives + prerequisites, When NOT to use, Concept, Hands-on lab, Anti-patterns, Quiz, Sources. Every command shown was actually run against the lab repo and every claim is backed by real output (D093) — this plan produces no lesson content from memory alone.

## Context

Read first: `docs/CURRICULUM.md` (P03) — it is the **authoritative** source for this module's final lesson slugs, objectives, and order; the lesson list below is the floor the approved plan set, not a ceiling. Also read `research/feature-inventory.md` and `research/deprecations.md` (P03) for what is current vs. "Changed" as of `verified_version: 2.1.263`; `content/_shared/sources.json` (P23) for the vetted source list to pull from and append to; `.claude/rules/content.md`, `.claude/skills/new-lesson/SKILL.md` and the `lesson-researcher`/`lesson-writer`/`fact-checker`/`reviewer` agents (all P11) for the exact authoring workflow; `content/schema.ts` (P06) for the frontmatter zod schema; `docs/design/CANVAS.md` and `/design/` (P05) for the lesson-page visual reference; and the outline text this module was scoped from:

> `m18-multi-session`: plan files + generated STATE.md + claim protocol (taught on this repo, D026) · `owned_paths` & parallel worktrees · model/effort hints · handoff notes (lab)

No lesson in this module exists yet; `content/en/l4-master/m18-multi-session/**` starts from the level/module `index.mdx` stub P06 created.

Decisions this module leans on beyond the shared pipeline decisions below: (D045), (D047), (D048), (D049), (D026).

## Scope

In:
- 4 lesson files under `content/en/l4-master/m18-multi-session/`, numbered `01-`…`04-`, each a complete MDX file following D006's seven sections.
- The matching Turkish draft stub for each lesson under `content/tr/l4-master/m18-multi-session/` (`draft: true`, created by the `/new-lesson` skill in the same commit as the EN lesson — D016, D018; P25/P26/P40/P41 translate it later, never this plan).
- One raw lab transcript per lesson with a hands-on lab, saved under `content/_shared/transcripts/m18-multi-session/`, plus the simplified `<Transcript>` rendering embedded in the lesson (D099).
- This module's entries appended to `content/_shared/sources.json` (D041, D043; append-only — never rewrite another module's entries).
- Updating `l4-master/index.mdx` and `m18-multi-session/index.mdx` module-index copy if this module's final lesson list differs from the stub P06 left (rare; only if `docs/CURRICULUM.md` changed the outline).

Out: Turkish translation of these lessons (P25/P26/P40/P41 own `content/tr/l4-master/m18-multi-session/**` after this plan hands it off); any other module's content; MDX component code (P07/P08 own those; if a lesson needs a component that does not exist, write it into `open_questions` and do not build it here); changes to `content/schema.ts`, `src/lib/nav.ts`, or any route/layout file; the lab repo itself (P22 owns `codechup/claude-code-lab`; this plan clones and runs it, never edits it in place — a bug fix needed there goes into `open_questions` naming the tag).

## Deliverables

- `content/en/l4-master/m18-multi-session/NN-<slug>.mdx` (4 files):
01. **Plan files, generated STATE.md, and the claim protocol** — `01-plan-files-state-md-and-claim-protocol.mdx`
02. **owned_paths and parallel worktrees** — `02-owned-paths-and-parallel-worktrees.mdx`
03. **Model and effort hints** — `03-model-and-effort-hints.mdx`
04. **Handoff notes** — `04-handoff-notes.mdx` (hands-on lab: writing and reading real handoff notes on a plan in this repository)
- `content/tr/l4-master/m18-multi-session/NN-<slug>.mdx` (4 files) — `draft: true` stubs with EN frontmatter fields carried over and `title`/`description` left in English (translation is not this plan's job; the stub exists so routing/parity gates pass).
- `content/_shared/transcripts/m18-multi-session/NN-<slug>.md` — one per lesson that has a hands-on lab, containing the raw terminal transcript.
- Updated `content/_shared/sources.json` with this module's sources block entries.

## Acceptance criteria

- `node scripts/content-gate.ts` passes for this module: every lesson's frontmatter validates against `content/schema.ts`, every code fence has a language tag, EN/TR path parity holds (the TR draft exists at the same slug), and `level`/`module` in frontmatter match the file path.
- Every lesson has `verified_version: 2.1.263` and a non-empty `sources` array with at least one `type: "doc"` entry whose URL was fetched successfully by `/verify-sources` (D041, D043) — paste the WebFetch/lychee evidence in the PR.
- Every lesson with a hands-on lab has a transcript file under `content/_shared/transcripts/m18-multi-session/` whose content matches, verbatim, a real run of the commands shown in the lesson (D093, D099) — no lesson may show output that was not captured this way.
- `npm run typecheck && npm run lint && npm test` pass; `npm run build` succeeds and `dist/en/l4-master/m18-multi-session/` contains 4 lesson pages plus the index.
- `npx playwright test e2e/lesson.spec.ts` passes against at least one lesson in this module (axe: 0 serious/critical violations at 390 px and 1280 px).
- The `fact-checker` agent's report (pasted into the PR) shows no unresolved discrepancy against `research/feature-inventory.md`; the `reviewer` agent's report confirms the D006 template order and the evidence rule on every lesson.

## Steps

1. Read `docs/CURRICULUM.md` §m18-multi-session and confirm the lesson list/order below still matches; if it drifted, follow the doc, not this plan, and note the delta in Handoff notes.
2. Run the `lesson-researcher` agent once per lesson (D098): official doc URL(s) + 2–3 web/YouTube sources, summarized against `research/feature-inventory.md`; save nothing permanent yet, this feeds step 4.
3. Clone `codechup/claude-code-lab` (P22) into a scratch directory; for every lesson with a hands-on lab, check out its start tag (`lesson/m18-multi-session-NN-start`), do the exercise for real, and capture the full terminal transcript.
4. Write each lesson MDX with `/new-lesson l4-master/m18-multi-session/<slug>` (creates the EN file and the TR draft stub together); fill Objectives, When NOT to use, Concept (grounded in the researcher's summary, never invented), Hands-on lab (the exact commands from step 3), Anti-patterns, Quiz, Sources.
5. Save the raw transcript from step 3 under `content/_shared/transcripts/m18-multi-session/NN-<slug>.md`; embed the simplified version with the `<Transcript>` component (P07) in the lesson.
6. Append this lesson's sources to `content/_shared/sources.json` (P23's schema); run `/verify-sources content/en/l4-master/m18-multi-session/NN-<slug>.mdx` to stamp `verified_at`.
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

A reviewer opens `npm run dev`, visits each of the 4 lessons at `/en/l4-master/m18-multi-session/<slug>/`, confirms the OS tabs, transcript, quiz, and sources block render, spot-checks two Sources links by hand, and reads the fact-checker/reviewer agent reports pasted in the PR before merging.

## Handoff notes

**Session:** `opus-p35-2026-09-07`, worktree `../cct-wt-35`, branch `plan/35-l4-m18-multi-session`.

**Lesson-count drift (4 to 6), followed the doc.** This plan's Deliverables named 4 lessons with
working titles; `docs/CURRICULUM.md` §2 m18-multi-session is authoritative and lists 6. Per this
plan's own Step 1, the curriculum won. Shipped slugs, durations and difficulty are exactly
CURRICULUM's: `01-plan-files` (20, core), `02-state-md-and-claims` (20, core, Lab),
`03-owned-paths-worktrees` (20, core, Lab), `04-model-effort-hints` (10, core), `05-handoff-notes`
(15, core, Lab), `06-this-repo-as-example` (15, advanced). Logged in `open_questions` so the plan
text can be reconciled.

**What shipped.** 6 EN lessons under `content/en/l4-master/m18-multi-session/`, 6 `draft: true` TR
stubs at the mirrored paths (titles and descriptions translated, every other frontmatter field
byte-identical to its EN twin — translation belongs to P25/P26/P40/P41), 22 real transcripts under
`content/_shared/transcripts/m18-multi-session/`, and 6 module-tag additions plus 1 new entry
(`repo-plans-readme`) in `content/_shared/sources.json` (append-only; no existing entry reordered or
rewritten — the only `-` lines in that diff are `modules` arrays being extended in place).

**Evidence (D093, D099).** Every command shown was run. The plan-CLI captures (`show`, `check`,
`next`, `claim`, the refused second claim, the refused overlapping claim, `check` failing on an
overlap, `status ... blocked`, `state`) come from a throwaway clone of this public repo, never from
this worktree or `main`. The lab captures come from a private clone of `codechup/claude-code-lab` at
tags `lesson/m18-02-start`, `m18-02-solution`, `m18-03-start` and `m18-05-start`; all three `m18-*`
tag pairs the module needs exist, so no lesson falls back to `repo_tag: "none"` for a missing tag
(lessons 01, 04 and 06 carry `repo_tag: "none"` because their labs are reading exercises against
this repository's own plan set, and CURRICULUM does not mark those three as lab lessons). Four
headless captures used `claude -p ... --model sonnet --max-turns 6 --output-format text
--allowedTools Read,Glob,Grep`. Local paths and usernames were redacted to `<clone>`, `<lab repo>`,
`~/work/...` and `~/.claude.json`; nothing else in any recording was altered. The first captures
came back in Turkish because the capture machine carries a standing language preference — they were
re-run with an explicit English-only instruction rather than translated, since translating a
recording would fabricate it.

**Docs fetched live (2026-09-07); the doc wins over the inventory.** `worktrees.md`,
`cross-session-messaging.md`, `agents.md`, `best-practices.md`, `model-config.md`, `sub-agents.md`,
`cli-reference.md`. Two notes. `research/feature-inventory.md` mentions worktrees only as
`isolation: worktree` and does not record the `--worktree`/`-w` flag, `EnterWorktree`/`ExitWorktree`,
`.worktreeinclude` or `worktree.baseRef`; all four are on the live `worktrees.md`, and `-w,
--worktree [name]` is present in `claude --help` on 2.1.263, so the lessons teach them. The
`cli-reference.md` fetch did not surface a `--worktree` row, so that flag is sourced to
`worktrees.md` and the verified local `--help` output instead. Nothing the inventory marks
UNVERIFIED was used.

**Review pipeline (D071).** Both agents ran; the first two `fact-checker` attempts died on the API
session limit and the third completed after the session reset.

`fact-checker` — verdict FAIL on the draft, 4 contradicted claims, ~92 confirmed across the six
lessons, plus unverifiable items. All four contradictions fixed:

1. Three related claims in lesson 02 (the claimability condition, the stale-claims paragraph and
   quiz q3) asserted that staleness is measured clock-free. That is what `plans/README.md` §3 says
   and what `state.ts`/`check.ts` do, but `cli.ts` passes the wall clock to `next` and `claim` — the
   two commands a session actually uses. The lesson now teaches both reference points, names which
   code path uses which, and says the contract's guarantee does not hold for `next`/`claim`. Raised
   in `open_questions` against whoever owns `tools/plan/**`. I had found the same drift by reading
   `plan.ts` before the report arrived; the agent's independent confirmation is why it is now taught
   explicitly rather than hedged.
2. Lesson 04 presented a re-ordered splice of `model-config.md`'s `max` row inside quotation marks.
   Replaced with the doc's real sentence: "can improve performance on demanding tasks but may show
   diminishing returns and is prone to overthinking. Test before adopting broadly."

Its unverifiable items were environmental, not defects: the agent's session had no `github.com`
WebFetch permission (so the `type: repo` source URLs could not be fetched from inside it) and no
access to `codechup/claude-code-lab` (so it could not confirm the lab-tag facts). Both were verified
directly by this session — the lab clone is where the transcripts were captured, and the repo URLs
are this repository and its own `plans/README.md`. CI's `lychee` link check covers the URLs.

`reviewer` — 0 blockers, 3 majors, 2 minors, all five addressed. (1) all six lessons used
`## Objectives and prerequisites`; renamed to the canonical `## Objectives & prerequisites` that
every other lesson uses. (2) lesson 02's Concept carried no worked-example prompt (D027); added.
(3) these Handoff notes were unfilled; written. (4) the reviewer asked to drop `m18-multi-session`
from the `docs-sessions` entry in `sources.json` as an orphan tag — **not done**: that tag predates
this branch, and removing it would be a non-additive edit to a shared file (D048). Flagged here
instead. (5) the plan's `type: "doc"` acceptance criterion is not a valid schema value; recorded in
`open_questions`.

**Self-review fixes beyond the reviewer's list.** Lesson 02 originally asserted that the lab's
`scripts/plan.mjs` "does not implement claim"; checking the tags showed the file does not exist at
that tag at all and only appears at `lesson/m18-05-solution` — corrected in the lesson and raised as
an open question against the lab repo. Snapshot-specific numbers and plan ids (`48 plans`, `P36`,
`P38`, exact `claimed ...` and `not claimable ...` strings) were removed from lab `steps` and
`expected` text so the labs do not rot as the plan set moves; the transcripts still show the real
strings. Transcript provenance headers that read `claude -p '...'` were rewritten to carry the exact
prompt that was run.

**Verified locally (real output pasted in the PR).** `npm run gate` (204 files),
`npm run typecheck` (0 errors), `npm run lint`, `npm test` (22 files / 184 tests), `npm run build`
ending `check-no-inline-script (dist): OK`, `node scripts/check-raw-colors.mjs`,
`node scripts/check-public-hygiene.mjs`, `node tools/plan/cli.ts check`, and Playwright on a
temporary `playwright.p35.config.ts` (port 4435) with a temporary spec covering all six EN lesson
routes at 390 px and 1280 px plus `e2e/a11y.spec.ts` — 26 passed, 0 axe serious/critical. Both
temporary files were deleted afterwards. Note for the next content plan: the TR twins are
`draft: true` and therefore deliberately unrouted, so a spec asserting 200 on `/tr/**` for this
module fails; the temporary spec covered EN only.

**Not done / for others.** TR translation (P25/P26/P40/P41). No `Changed` callout appears in this
module: `research/deprecations.md` has no m18 row and nothing this module teaches was superseded. No
new MDX component was needed.

