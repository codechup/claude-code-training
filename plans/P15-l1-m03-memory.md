---
id: P15
title: "L1 Beginner module: Memory (m03-memory)"
milestone: M1
status: done
owner: opus-p15-2026-09-07
branch: plan/15-l1-m03-memory
model_hint: opus
effort_hint: high
depends_on: [P12, P03, P22, P23]
owned_paths:
  - content/en/l1-beginner/m03-memory/**
  - content/tr/l1-beginner/m03-memory/**
  - content/_shared/transcripts/m03-memory/**
shared_paths:
  - content/_shared/sources.json
estimate: L
updated_at: 2026-09-07T10:22:17Z
open_questions:
  - 'Lab tag convention drift (P03/P22): docs/CURRICULUM.md §2 says `lesson/<module>-<NN>-start` (`lesson/m03-memory-01-start`), but the tags that exist in codechup/claude-code-lab are `lesson/m03-01-start` and `lesson/m03-03-start`. Lessons cite the real tags. One of the two should change.'
  - 'research/deprecations.md (P03) has no entry for the `#` quick-memory shortcut, removed in Claude Code 2.0.70 (15 December 2025, official changelog). Lesson 05 carries the Changed callout; the deprecations table and the playbook changelog page (playbook/06-changed-since-2025, P42) still need the row — neither is in this plan''s owned_paths.'
  - 'research/feature-inventory.md (P03) summarises memory as "hierarchy managed > user > project > local". memory.md describes concatenation in load order rather than override, and says a direct contradiction may be resolved arbitrarily. The one-line summary should be reworded.'
  - 'docs/CURRICULUM.md §2 still describes lesson 05 as "`/memory`, `#` quick notes, ...". The `#` shortcut is gone; this plan corrected the wording on the module index pages it owns but not in CURRICULUM.md (P03 owns it).'
---

## Goal

Author every lesson of Memory (`m03-memory`), the 4-lesson opening module of Beginner (l1-beginner), in English: the reader learns every layer Claude Code remembers project and personal context in, and leaves with a working CLAUDE.md and one path-scoped rule of their own. Each lesson follows the fixed template (D006): Objectives + prerequisites, When NOT to use, Concept, Hands-on lab, Anti-patterns, Quiz, Sources. Every command shown was actually run against the lab repo and every claim is backed by real output (D093) — this plan produces no lesson content from memory alone.

## Context

Read first: `docs/CURRICULUM.md` (P03) — it is the **authoritative** source for this module's final lesson slugs, objectives, and order; the lesson list below is the floor the approved plan set, not a ceiling. Also read `research/feature-inventory.md` and `research/deprecations.md` (P03) for what is current vs. "Changed" as of `verified_version: 2.1.263`; `content/_shared/sources.json` (P23) for the vetted source list to pull from and append to; `.claude/rules/content.md`, `.claude/skills/new-lesson/SKILL.md` and the `lesson-researcher`/`lesson-writer`/`fact-checker`/`reviewer` agents (all P11) for the exact authoring workflow; `content/schema.ts` (P06) for the frontmatter zod schema; `docs/design/CANVAS.md` and `/design/` (P05) for the lesson-page visual reference; and the outline text this module was scoped from:

> `m03-memory`: CLAUDE.md hierarchy + `@import` + `/init` · `.claude/rules/` path-scoped rules · auto-memory (MEMORY.md, types) · `/memory` and `#` notes

No lesson in this module exists yet; `content/en/l1-beginner/m03-memory/**` starts from the level/module `index.mdx` stub P06 created.

Decisions this module leans on beyond the shared pipeline decisions below: (D077).

## Scope

In:
- 4 lesson files under `content/en/l1-beginner/m03-memory/`, numbered `01-`…`04-`, each a complete MDX file following D006's seven sections.
- The matching Turkish draft stub for each lesson under `content/tr/l1-beginner/m03-memory/` (`draft: true`, created by the `/new-lesson` skill in the same commit as the EN lesson — D016, D018; P25/P26/P40/P41 translate it later, never this plan).
- One raw lab transcript per lesson with a hands-on lab, saved under `content/_shared/transcripts/m03-memory/`, plus the simplified `<Transcript>` rendering embedded in the lesson (D099).
- This module's entries appended to `content/_shared/sources.json` (D041, D043; append-only — never rewrite another module's entries).
- Updating `l1-beginner/index.mdx` and `m03-memory/index.mdx` module-index copy if this module's final lesson list differs from the stub P06 left (rare; only if `docs/CURRICULUM.md` changed the outline).

Out: Turkish translation of these lessons (P25/P26/P40/P41 own `content/tr/l1-beginner/m03-memory/**` after this plan hands it off); any other module's content; MDX component code (P07/P08 own those; if a lesson needs a component that does not exist, write it into `open_questions` and do not build it here); changes to `content/schema.ts`, `src/lib/nav.ts`, or any route/layout file; the lab repo itself (P22 owns `codechup/claude-code-lab`; this plan clones and runs it, never edits it in place — a bug fix needed there goes into `open_questions` naming the tag).

## Deliverables

- `content/en/l1-beginner/m03-memory/NN-<slug>.mdx` (4 files):
01. **CLAUDE.md hierarchy, @import, and /init** — `01-claude-md-hierarchy-and-import.mdx`
02. **.claude/rules/: path-scoped rules** — `02-claude-rules.mdx`
03. **Auto-memory: MEMORY.md and its types** — `03-auto-memory.mdx`
04. **/memory and # quick notes** — `04-memory-command-and-quick-notes.mdx`
- `content/tr/l1-beginner/m03-memory/NN-<slug>.mdx` (4 files) — `draft: true` stubs with EN frontmatter fields carried over and `title`/`description` left in English (translation is not this plan's job; the stub exists so routing/parity gates pass).
- `content/_shared/transcripts/m03-memory/NN-<slug>.md` — one per lesson that has a hands-on lab, containing the raw terminal transcript.
- Updated `content/_shared/sources.json` with this module's sources block entries.

## Acceptance criteria

- `node scripts/content-gate.ts` passes for this module: every lesson's frontmatter validates against `content/schema.ts`, every code fence has a language tag, EN/TR path parity holds (the TR draft exists at the same slug), and `level`/`module` in frontmatter match the file path.
- Every lesson has `verified_version: 2.1.263` and a non-empty `sources` array with at least one `type: "doc"` entry whose URL was fetched successfully by `/verify-sources` (D041, D043) — paste the WebFetch/lychee evidence in the PR.
- Every lesson with a hands-on lab has a transcript file under `content/_shared/transcripts/m03-memory/` whose content matches, verbatim, a real run of the commands shown in the lesson (D093, D099) — no lesson may show output that was not captured this way.
- `npm run typecheck && npm run lint && npm test` pass; `npm run build` succeeds and `dist/en/l1-beginner/m03-memory/` contains 4 lesson pages plus the index.
- `npx playwright test e2e/lesson.spec.ts` passes against at least one lesson in this module (axe: 0 serious/critical violations at 390 px and 1280 px).
- The `fact-checker` agent's report (pasted into the PR) shows no unresolved discrepancy against `research/feature-inventory.md`; the `reviewer` agent's report confirms the D006 template order and the evidence rule on every lesson.

## Steps

1. Read `docs/CURRICULUM.md` §m03-memory and confirm the lesson list/order below still matches; if it drifted, follow the doc, not this plan, and note the delta in Handoff notes.
2. Run the `lesson-researcher` agent once per lesson (D098): official doc URL(s) + 2–3 web/YouTube sources, summarized against `research/feature-inventory.md`; save nothing permanent yet, this feeds step 4.
3. Clone `codechup/claude-code-lab` (P22) into a scratch directory; for every lesson with a hands-on lab, check out its start tag (`lesson/m03-memory-NN-start`), do the exercise for real, and capture the full terminal transcript.
4. Write each lesson MDX with `/new-lesson l1-beginner/m03-memory/<slug>` (creates the EN file and the TR draft stub together); fill Objectives, When NOT to use, Concept (grounded in the researcher's summary, never invented), Hands-on lab (the exact commands from step 3), Anti-patterns, Quiz, Sources.
5. Save the raw transcript from step 3 under `content/_shared/transcripts/m03-memory/NN-<slug>.md`; embed the simplified version with the `<Transcript>` component (P07) in the lesson.
6. Append this lesson's sources to `content/_shared/sources.json` (P23's schema); run `/verify-sources content/en/l1-beginner/m03-memory/NN-<slug>.mdx` to stamp `verified_at`.
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

A reviewer opens `npm run dev`, visits each of the 4 lessons at `/en/l1-beginner/m03-memory/<slug>/`, confirms the OS tabs, transcript, quiz, and sources block render, spot-checks two Sources links by hand, and reads the fact-checker/reviewer agent reports pasted in the PR before merging.

## Handoff notes

### What was written

Five EN lessons under `content/en/l1-beginner/m03-memory/`, matching `docs/CURRICULUM.md` §2
exactly: `01-claude-md`, `02-hierarchy-imports`, `03-rules`, `04-auto-memory`,
`05-memory-commands`. Five `draft: true` TR twins at mirrored paths. Nine real transcripts under
`content/_shared/transcripts/m03-memory/`. Two new entries plus three module tags appended to
`content/_shared/sources.json`. Both module `index.mdx` files now link their lesson list.

### Delta from this plan's Deliverables (Step 1 — the curriculum wins)

This plan's Deliverables section lists **4** lessons with different slugs
(`01-claude-md-hierarchy-and-import`, `02-claude-rules`, `03-auto-memory`,
`04-memory-command-and-quick-notes`). `docs/CURRICULUM.md` §2 lists **5**
(`01-claude-md`, `02-hierarchy-imports`, `03-rules`, `04-auto-memory`, `05-memory-commands`),
and Step 1 of this plan says to follow the doc. The five CURRICULUM slugs were written. The
plan's Acceptance criteria also say `type: "doc"`; `src/content/schema.ts` has no such type —
every lesson correctly uses `type: official`. Both are plan-text staleness, not content bugs.

### Lab tags — a real drift

`docs/CURRICULUM.md` §2 and the standing brief describe the tag convention as
`lesson/<module>-<NN>-start`, i.e. `lesson/m03-memory-01-start`. The tags that actually exist in
`codechup/claude-code-lab` use the abbreviated module id: `lesson/m03-01-start` and
`lesson/m03-03-start` (see that repo's README "Lesson tag map"). The real tags are what the
lessons cite. P03/P22 own the reconciliation — see `open_questions`.

### Evidence and how it was captured

Every headless command in every lab was run this session, against detached `git worktree`
checkouts of the lab repo in a scratch directory (never a shared `git checkout`, because sibling
sessions P13/P14/P16 use the same clone). All captures ran with
`CLAUDE_CODE_DISABLE_AUTO_MEMORY=1` so the only variable between a before/after pair is the file
on disk; the lessons now say so in a callout and the provenance headers record it.

`/init` was run for real (`claude -p "/init" --model sonnet --permission-mode acceptEdits`) and
produced a 51-line `./CLAUDE.md`. Two consequences went into the lesson: `/init` writes to the
repo root while the before/after pair used `./.claude/CLAUDE.md` (both load, which is the
lesson's own point), and `/init` *did* discover the `TEACHING SURFACE` convention from the source
comments — so lesson 01 no longer claims that fact is underivable from the code.

Every capture answers in **Turkish**. The recording machine has a user-scope `~/.claude/CLAUDE.md`
asking for Turkish, and it overrode an explicit "Answer in English" in the prompt. This is
disclosed in each lesson and is used as lesson 02's own evidence that user-scope memory loads
everywhere. Same situation as `m01-start/01-what-claude-code-is`.

Lesson 05 is TUI-heavy; its `/memory` steps are prose plus `<CodeBlock>`, never a faked screen.
The two non-interactive steps ("add this to CLAUDE.md" vs "remember that") were captured for real
and show the two phrasings landing in two different files.

### Review counts (D071)

- **fact-checker:** 62 claims confirmed, 0 contradicted, 2 reported unverifiable. Both were in
  fact confirmed from primary sources fetched by this session that the agent's own fetches
  truncated: `settings-reference.md` §`autoMemoryEnabled` ("**Per-session overrides**:
  `CLAUDE_CODE_DISABLE_AUTO_MEMORY` takes precedence over this key for one session, in either
  direction") and `changelog.md` `<Update label="2.0.70" description="December 15, 2025">`
  ("Removed # shortcut for quick memory entry"). Both lessons now quote the source text inline so
  the trail is visible. 0 unresolved.
- **reviewer:** 0 blockers, 6 majors, 10 minors across two runs. Fixed: the lesson-05 lab now
  carries a real transcript; the lesson-05 "Changed" callout moved from mid-Concept to after
  Anti-patterns; lesson 03 no longer claims all four rule conventions are absent from
  `.claude/CLAUDE.md` (the thin-wrapper one is in both, as its own transcript shows); lesson 04
  now says `type:` sits under `metadata:`, matching the recording; the
  `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1` requirement is stated in labs 01–03; transcript READMEs list
  every file with correct step numbers. Not accepted: the reviewer said the four "Changed" version
  pins (v2.1.206, v2.1.211, v2.1.214, v2.1.239) lack an evidence trail — all four are stated
  verbatim in `memory.md`, which every one of those lessons already cites.

### Docs-vs-inventory drift found

`research/feature-inventory.md` summarises memory precedence as "managed > user > project >
local". The live `memory.md` describes something different: all discovered files are
**concatenated** in load order (broadest scope first, root-down through the directory tree,
`CLAUDE.local.md` appended after `CLAUDE.md` at each level), and a direct contradiction between
two files may be resolved arbitrarily. The lessons teach the doc.

`research/deprecations.md` has no entry for the removed `#` quick-memory shortcut.

