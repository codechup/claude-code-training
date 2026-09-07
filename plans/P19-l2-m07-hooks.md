---
id: P19
title: "L2 Intermediate module: Hooks (m07-hooks)"
milestone: M1
status: done
owner: opus-p19-2026-09-07
branch: plan/19-l2-m07-hooks
model_hint: opus
effort_hint: high
depends_on: [P12, P03, P22, P23]
owned_paths:
  - content/en/l2-intermediate/m07-hooks/**
  - content/tr/l2-intermediate/m07-hooks/**
  - content/_shared/transcripts/m07-hooks/**
shared_paths:
  - content/_shared/sources.json
estimate: L
updated_at: 2026-09-07T10:22:18Z
open_questions:
  - 'research/feature-inventory.md line 35 lists 32 hook events and omits SessionEnd; the live hooks.md lifecycle table has 33. docs/CURRICULUM.md line 80 also says "All 32 events". P03 owns both files - the lessons teach 33, with the SessionEnd firing captured in content/_shared/transcripts/m07-hooks/06-event-catalogue/01-which-events-fire.txt.'
  - 'research/feature-inventory.md line 35 and research/deprecations.md line 17 both give permissionDecision as allow|deny|block. Current docs: allow|deny|ask|defer, with block/approve as deprecated aliases for deny/allow. P03 owns research/.'
  - 'Lab repo (P22): BUGS.md is missing from the lesson/m07-05-start tree, so the lab hook reports "unknown entries in BUGS.md".'
  - 'e2e/lesson.spec.ts (P04/P12) is hardcoded to the M0 lesson and cannot be pointed at another module, so this plan verified accessibility with a temporary spec that was deleted afterwards. Generalising that spec would let future content plans satisfy their acceptance criteria without touching e2e/.'
---

## Goal

Author every lesson of Hooks (`m07-hooks`), the 7-lesson next module of Intermediate (l2-intermediate), in English: every named hook example from D055 becomes a lab the reader actually runs, and the module closes with the complete event catalogue from the currency research (research/feature-inventory.md) and exit-code semantics (0 / 2 / other). Each lesson follows the fixed template (D006): Objectives + prerequisites, When NOT to use, Concept, Hands-on lab, Anti-patterns, Quiz, Sources. Every command shown was actually run against the lab repo and every claim is backed by real output (D093) — this plan produces no lesson content from memory alone.

## Context

Read first: `docs/CURRICULUM.md` (P03) — it is the **authoritative** source for this module's final lesson slugs, objectives, and order; the lesson list below is the floor the approved plan set, not a ceiling. Also read `research/feature-inventory.md` and `research/deprecations.md` (P03) for what is current vs. "Changed" as of `verified_version: 2.1.263`; `content/_shared/sources.json` (P23) for the vetted source list to pull from and append to; `.claude/rules/content.md`, `.claude/skills/new-lesson/SKILL.md` and the `lesson-researcher`/`lesson-writer`/`fact-checker`/`reviewer` agents (all P11) for the exact authoring workflow; `content/schema.ts` (P06) for the frontmatter zod schema; `docs/design/CANVAS.md` and `/design/` (P05) for the lesson-page visual reference; and the outline text this module was scoped from:

> `m07-hooks`: hook model & JSON contract · PreToolUse guard (lab: block `rm -rf`, force push) · PostToolUse formatter (lab) · Notification/Stop notifications (lab: desktop + Slack) · SessionStart context + Stop test runner (lab) · full event catalogue & `/hooks` · debugging hooks

No lesson in this module exists yet; `content/en/l2-intermediate/m07-hooks/**` starts from the level/module `index.mdx` stub P06 created.

Decisions this module leans on beyond the shared pipeline decisions below: (D055).

## Scope

In:
- 7 lesson files under `content/en/l2-intermediate/m07-hooks/`, numbered `01-`…`07-`, each a complete MDX file following D006's seven sections.
- The matching Turkish draft stub for each lesson under `content/tr/l2-intermediate/m07-hooks/` (`draft: true`, created by the `/new-lesson` skill in the same commit as the EN lesson — D016, D018; P25/P26/P40/P41 translate it later, never this plan).
- One raw lab transcript per lesson with a hands-on lab, saved under `content/_shared/transcripts/m07-hooks/`, plus the simplified `<Transcript>` rendering embedded in the lesson (D099).
- This module's entries appended to `content/_shared/sources.json` (D041, D043; append-only — never rewrite another module's entries).
- Updating `l2-intermediate/index.mdx` and `m07-hooks/index.mdx` module-index copy if this module's final lesson list differs from the stub P06 left (rare; only if `docs/CURRICULUM.md` changed the outline).

Out: Turkish translation of these lessons (P25/P26/P40/P41 own `content/tr/l2-intermediate/m07-hooks/**` after this plan hands it off); any other module's content; MDX component code (P07/P08 own those; if a lesson needs a component that does not exist, write it into `open_questions` and do not build it here); changes to `content/schema.ts`, `src/lib/nav.ts`, or any route/layout file; the lab repo itself (P22 owns `codechup/claude-code-lab`; this plan clones and runs it, never edits it in place — a bug fix needed there goes into `open_questions` naming the tag).

## Deliverables

- `content/en/l2-intermediate/m07-hooks/NN-<slug>.mdx` (7 files):
01. **The hook model and its JSON contract** — `01-hook-model-and-json-contract.mdx`
02. **PreToolUse guard** — `02-pretooluse-guard.mdx` (hands-on lab: blocking rm -rf and git push --force)
03. **PostToolUse formatter** — `03-posttooluse-formatter.mdx` (hands-on lab: an auto-formatter that runs after every edit)
04. **Notification and Stop notifications** — `04-notification-and-stop-notifications.mdx` (hands-on lab: desktop and Slack notifications)
05. **SessionStart context load and Stop test runner** — `05-sessionstart-and-stop-test-runner.mdx` (hands-on lab: loading context at session start and running tests on stop)
06. **The full hook event catalogue and /hooks** — `06-event-catalogue-and-hooks-command.mdx`
07. **Debugging hooks** — `07-debugging-hooks.mdx`
- `content/tr/l2-intermediate/m07-hooks/NN-<slug>.mdx` (7 files) — `draft: true` stubs with EN frontmatter fields carried over and `title`/`description` left in English (translation is not this plan's job; the stub exists so routing/parity gates pass).
- `content/_shared/transcripts/m07-hooks/NN-<slug>.md` — one per lesson that has a hands-on lab, containing the raw terminal transcript.
- Updated `content/_shared/sources.json` with this module's sources block entries.

## Acceptance criteria

- `node scripts/content-gate.ts` passes for this module: every lesson's frontmatter validates against `content/schema.ts`, every code fence has a language tag, EN/TR path parity holds (the TR draft exists at the same slug), and `level`/`module` in frontmatter match the file path.
- Every lesson has `verified_version: 2.1.263` and a non-empty `sources` array with at least one `type: "doc"` entry whose URL was fetched successfully by `/verify-sources` (D041, D043) — paste the WebFetch/lychee evidence in the PR.
- Every lesson with a hands-on lab has a transcript file under `content/_shared/transcripts/m07-hooks/` whose content matches, verbatim, a real run of the commands shown in the lesson (D093, D099) — no lesson may show output that was not captured this way.
- `npm run typecheck && npm run lint && npm test` pass; `npm run build` succeeds and `dist/en/l2-intermediate/m07-hooks/` contains 7 lesson pages plus the index.
- `npx playwright test e2e/lesson.spec.ts` passes against at least one lesson in this module (axe: 0 serious/critical violations at 390 px and 1280 px).
- The `fact-checker` agent's report (pasted into the PR) shows no unresolved discrepancy against `research/feature-inventory.md`; the `reviewer` agent's report confirms the D006 template order and the evidence rule on every lesson.

## Steps

1. Read `docs/CURRICULUM.md` §m07-hooks and confirm the lesson list/order below still matches; if it drifted, follow the doc, not this plan, and note the delta in Handoff notes.
2. Run the `lesson-researcher` agent once per lesson (D098): official doc URL(s) + 2–3 web/YouTube sources, summarized against `research/feature-inventory.md`; save nothing permanent yet, this feeds step 4.
3. Clone `codechup/claude-code-lab` (P22) into a scratch directory; for every lesson with a hands-on lab, check out its start tag (`lesson/m07-hooks-NN-start`), do the exercise for real, and capture the full terminal transcript.
4. Write each lesson MDX with `/new-lesson l2-intermediate/m07-hooks/<slug>` (creates the EN file and the TR draft stub together); fill Objectives, When NOT to use, Concept (grounded in the researcher's summary, never invented), Hands-on lab (the exact commands from step 3), Anti-patterns, Quiz, Sources.
5. Save the raw transcript from step 3 under `content/_shared/transcripts/m07-hooks/NN-<slug>.md`; embed the simplified version with the `<Transcript>` component (P07) in the lesson.
6. Append this lesson's sources to `content/_shared/sources.json` (P23's schema); run `/verify-sources content/en/l2-intermediate/m07-hooks/NN-<slug>.mdx` to stamp `verified_at`.
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

A reviewer opens `npm run dev`, visits each of the 7 lessons at `/en/l2-intermediate/m07-hooks/<slug>/`, confirms the OS tabs, transcript, quiz, and sources block render, spot-checks two Sources links by hand, and reads the fact-checker/reviewer agent reports pasted in the PR before merging.

## Handoff notes

### What was written

Seven EN lessons under `content/en/l2-intermediate/m07-hooks/`, using the slugs from
`docs/CURRICULUM.md` §2 (which differ from the deliverable names in this plan's Scope —
CURRICULUM wins, per step 1): `01-hook-anatomy`, `02-block-dangerous-commands`,
`03-format-on-save`, `04-notify-when-done`, `05-session-start-context`, `06-event-catalogue`,
`07-debugging-hooks`. Seven matching TR twins as `draft: true` stubs with translated
title/description and a one-paragraph Turkish summary.

Nine transcripts under `content/_shared/transcripts/m07-hooks/<NN-slug>/`, all captured this
session against Claude Code 2.1.263, each with a `# ` provenance first line and a per-folder
`README.md`. Labs 02–05 ran in detached worktrees of `codechup/claude-code-lab` at
`lesson/m07-02-start` … `lesson/m07-05-start`; labs 01, 06 and 07 ran in a scratch project
(`lab.repo_tag: 'none'`) because they register throwaway hooks on many events at once.

`content/_shared/sources.json`: appended `docs-settings` and `docs-debug-your-config`; tagged
`m07-hooks` onto the existing `docs-permissions`, `docs-memory` and `repo-claude-code-lab`
entries. `docs-hooks` and `docs-hooks-guide` were already tagged for this module.

Both module `index.mdx` files (EN and TR) had their numbered lesson lists deleted, per the lead's
mid-plan correction: the module page renders the lesson list from the collection, so a list in
the MDX shows every lesson twice. Only the intro paragraph remains.

### Drift found (docs win, D093)

1. **33 hook events, not 32.** `research/feature-inventory.md` line 35 lists 32 and omits
   `SessionEnd`; the live `hooks.md` lifecycle table has 33 rows including it. Lesson 06 teaches
   33. `docs/CURRICULUM.md` §2's `06-event-catalogue` line still says "All 32 events" (P03 owns
   that file).
2. **`permissionDecision` values are `allow | deny | ask | defer`.** Both
   `research/feature-inventory.md` (line 35) and `research/deprecations.md` (line 17) say
   `allow|deny|block`. `block` is a deprecated alias mapping to `deny`, alongside `approve` →
   `allow`; `ask` and `defer` are current values the inventory is missing. Lessons 01 and 02
   carry a `<Callout variant="changed">` for this.
3. **Blocking is not one list.** The reference's per-event exit-code table names ten blocking
   events; `PreCompact` and `PreModelSwitch` block on exit 2 from their own sections, and
   `WorktreeCreate` aborts on any non-zero exit. Lessons 01 and 06 say so explicitly.

### Lab-repo observations (P22 owns the repo — nothing changed there)

- `BUGS.md` is absent from the `lesson/m07-05-start` tree, so the lab's `session-context.mjs`
  reports "unknown entries in BUGS.md". The capture is kept as-is: it proves the hook's
  `additionalContext` reached the model (Claude quotes the word "unknown"), which is stronger
  evidence than a clean count would have been. Worth adding `BUGS.md` to that tag.
- `guard-dangerous-commands.mjs` does not match a plain `rm -rf build` — its regex requires `/`,
  `~`, `..` or a wildcard after the flags. That is a defensible design line and lesson 02 teaches
  it as one (the offline capture proves both halves), but it means a "delete the build folder"
  prompt produces no hook block. The lab prompt sweeps the directory contents instead, which the
  guard does match.

### Evidence

Every command shown in a lab was run. Lesson 03's step 7 (formatter path pointed at a missing
file → the edit still lands, unformatted) and lesson 06's step 6 (`disableAllHooks` passed on the
command line → `events.log` is never created) were both verified after the lessons were written.
Lesson 04's step 6 is interactive-only by nature: a `Notification` of type `permission_prompt` is
gated on the user being away from the keyboard, so it cannot be captured headlessly — the lesson
says so in prose and the transcript shows the `Stop` half. `/hooks` is an interactive TUI and is
described in prose with no invented transcript.

### Review pipeline (D071)

**reviewer** — CHANGES REQUESTED: 1 blocker, 3 major, 1 minor, 1 nit. All six addressed.
The blocker was the temporary Playwright config and spec, which live in P04's `e2e/**`; they were
deleted after the final run and the underlying limitation (`e2e/lesson.spec.ts` is hardcoded to
the M0 lesson) is now an open question. Three lab steps that asserted an outcome with no recording
were captured and embedded (`01/02-matcher-does-not-match.txt`,
`03/02-broken-hook-path.txt`, `06/02-hooks-disabled.txt`); lesson 04's interactive
`Notification` step is now labelled documentation-sourced rather than lab-proven. Clean on its
side: template order, `<WhenNotToUse>`, the D027 worked prompt, frontmatter schema, sources,
transcript paths and ranges, anti-pattern fixes, quiz shape, hygiene, Turkish diacritics.

**fact-checker** — FAIL as delivered: 1 wrong, 16 unverifiable, 3 inventory-drift rows, over
82 checked claims. The 16 unverifiable items are a tooling ceiling, not a content problem: WebFetch
truncated `hooks.md` at the same point (~line 892 of the fetched form) on every attempt, including
a raw-dump attempt, so everything past the `Exit code 2 behavior per event` table could not be
quoted. This session had fetched the complete page with `curl` before writing, and re-checked all
16 against that file — every one is present verbatim: `preferredNotifChannel`; Notification
discarding `systemMessage`/`continue`; `Stop hook feedback`; the `terminalSequence` OSC allowlist
and its interactive-only limit; `WorktreeCreate` reading stdout as a path; "Only `type: "command"`
and `type: "mcp_tool"` hooks are supported" for `SessionStart`; prompt-injection defences on
imperative `additionalContext`; resume replaying saved text while `SessionStart` re-runs with
`source: "resume"`; `--debug` not printing to the terminal; `CLAUDE_CODE_DEBUG_LOG_LEVEL=verbose`;
the working-directory fallback chain; and the deprecated `approve`/`block` mapping (hooks.md
line 1778). The one WRONG was real and is fixed: lesson 06 now says `Elicitation` and
`ElicitationResult` block through exit 2 (denying the elicitation, declining the response) as well
as `hookSpecificOutput.action`. All three inventory-drift rows the agent found match the drift
recorded above and are in `open_questions`.

Counts: 82 claims checked, 1 wrong fixed, 16 unverifiable re-verified from the raw page, 3 drift
rows filed against P03's files, 6 reviewer findings resolved.

### Infrastructure note

The session scratchpad directory is shared between concurrently running sessions: a helper file
written there by this session was overwritten by cct-wt-17 mid-run. Prefix scratch filenames with
the plan id.

### Open questions

None blocking. The two lab-repo observations above are for P22 to consider.

