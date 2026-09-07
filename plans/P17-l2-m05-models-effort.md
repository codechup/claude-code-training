---
id: P17
title: "L2 Intermediate module: Models and effort (m05-models-effort)"
milestone: M1
status: review
owner: opus-p17-2026-09-07
branch: plan/17-l2-m05-models-effort
model_hint: opus
effort_hint: high
depends_on: [P12, P03, P22, P23]
owned_paths:
  - content/en/l2-intermediate/m05-models-effort/**
  - content/tr/l2-intermediate/m05-models-effort/**
  - content/_shared/transcripts/m05-models-effort/**
shared_paths:
  - content/_shared/sources.json
estimate: L
updated_at: 2026-09-07T09:55:36Z
open_questions:
  - "Effort x model matrix (D074): the 04-effort-lab capture is a 3x1 slice (low/medium/high on Sonnet 5), not a full grid. Running the same sweep on Opus 5 and Fable 5.1 would cost real usage credits (Fable bills credits silently in `-p` mode), so it was deliberately not run. A later plan with a budget can widen it."
  - "Mythos: the fetched sources (platform pricing, models overview, anthropic.com/claude/fable, anthropic.com/glasswing) establish that Mythos 5.1 / Mythos 5 exist, are priced, and are limited-availability behind trusted-access vetting. They do NOT say whether Mythos appears in Claude Code's /model picker for organisations that have it, what its context window or effort levels are, or which Claude Code version is required. Lesson 07 says so explicitly rather than guessing."
  - "research/feature-inventory.md L41 is wrong about /fast: it says fast mode 'toggles to a lower effort for speed'. The live fast-mode.md (fetched 2026-09-07) says fast mode is not an effort change at all — it is Claude Opus served with a speed-prioritising API configuration, 'identical quality and capabilities', at $10/$50 per MTok. P03 owns research/; the row needs correcting. Lesson 05 follows the doc."
  - "research/feature-inventory.md drift found while writing this module (all for P03): L41 says the effort default is 'high(default)' without noting that Opus 4.7 defaults to xhigh; L40 lists bare model IDs (claude-haiku-4-5) without distinguishing them from the dated Claude API ID (claude-haiku-4-5-20251001) that real modelUsage output actually reports; L40's '(1M ctx)' is attached only to Fable 5.1, but Opus 5, Sonnet 5, Fable 5 and Sonnet 4.6 also carry 1M windows; L33's command list omits /usage-credits, /rename and /stats. None of these changed a lesson — the lessons follow the live docs — but the inventory should be reconciled."
  - "D044 requires a Changed callout's version to be traceable to research/deprecations.md or the official changelog, and requires a matching entry on the Playbook changelog page (playbook/06-changed-since-2025). Neither exists yet for this module's three callouts. P03 should add the deprecations.md rows; P42 (or whichever plan owns the changelog page) should add the entries."
  - "research/deprecations.md has no m05-models-effort row, so the three Changed callouts in this module (alias resolution moving in v2.1.219/v2.1.255, `--effort ultracode` needing v2.1.203, Opus 4.7 fast mode removed 2026-07-24) cite version notes in the official docs instead. P42 (playbook changelog) may want those rows added to research/deprecations.md."
---

## Goal

Author every lesson of Models and effort (`m05-models-effort`), the 6-lesson next module of Intermediate (l2-intermediate), in English: the reader learns to pick a model and effort level deliberately instead of always reaching for the strongest one, backed by two labs that make the cost/quality trade-off visible. Each lesson follows the fixed template (D006): Objectives + prerequisites, When NOT to use, Concept, Hands-on lab, Anti-patterns, Quiz, Sources. Every command shown was actually run against the lab repo and every claim is backed by real output (D093) — this plan produces no lesson content from memory alone.

## Context

Read first: `docs/CURRICULUM.md` (P03) — it is the **authoritative** source for this module's final lesson slugs, objectives, and order; the lesson list below is the floor the approved plan set, not a ceiling. Also read `research/feature-inventory.md` and `research/deprecations.md` (P03) for what is current vs. "Changed" as of `verified_version: 2.1.263`; `content/_shared/sources.json` (P23) for the vetted source list to pull from and append to; `.claude/rules/content.md`, `.claude/skills/new-lesson/SKILL.md` and the `lesson-researcher`/`lesson-writer`/`fact-checker`/`reviewer` agents (all P11) for the exact authoring workflow; `content/schema.ts` (P06) for the frontmatter zod schema; `docs/design/CANVAS.md` and `/design/` (P05) for the lesson-page visual reference; and the outline text this module was scoped from:

> `m05-models-effort`: model family & aliases · choosing a model (lab: same task ×3 models) · `/effort` levels & `/fast` (lab: effort × model matrix) · cost & usage (`/cost`, `/usage`, cache) · Fable vs Mythos

No lesson in this module exists yet; `content/en/l2-intermediate/m05-models-effort/**` starts from the level/module `index.mdx` stub P06 created.

Decisions this module leans on beyond the shared pipeline decisions below: (D073), (D074), (D028).

## Scope

In:
- 6 lesson files under `content/en/l2-intermediate/m05-models-effort/`, numbered `01-`…`06-`, each a complete MDX file following D006's seven sections.
- The matching Turkish draft stub for each lesson under `content/tr/l2-intermediate/m05-models-effort/` (`draft: true`, created by the `/new-lesson` skill in the same commit as the EN lesson — D016, D018; P25/P26/P40/P41 translate it later, never this plan).
- One raw lab transcript per lesson with a hands-on lab, saved under `content/_shared/transcripts/m05-models-effort/`, plus the simplified `<Transcript>` rendering embedded in the lesson (D099).
- This module's entries appended to `content/_shared/sources.json` (D041, D043; append-only — never rewrite another module's entries).
- Updating `l2-intermediate/index.mdx` and `m05-models-effort/index.mdx` module-index copy if this module's final lesson list differs from the stub P06 left (rare; only if `docs/CURRICULUM.md` changed the outline).

Out: Turkish translation of these lessons (P25/P26/P40/P41 own `content/tr/l2-intermediate/m05-models-effort/**` after this plan hands it off); any other module's content; MDX component code (P07/P08 own those; if a lesson needs a component that does not exist, write it into `open_questions` and do not build it here); changes to `content/schema.ts`, `src/lib/nav.ts`, or any route/layout file; the lab repo itself (P22 owns `codechup/claude-code-lab`; this plan clones and runs it, never edits it in place — a bug fix needed there goes into `open_questions` naming the tag).

## Deliverables

- `content/en/l2-intermediate/m05-models-effort/NN-<slug>.mdx` (6 files):
01. **The model family and its aliases** — `01-model-family-and-aliases.mdx`
02. **Choosing a model** — `02-choosing-a-model.mdx` (hands-on lab: the same task run on three different models, compared side by side)
03. **/effort levels and /fast** — `03-effort-levels-and-fast.mdx`
04. **The effort × model matrix** — `04-effort-model-matrix.mdx` (hands-on lab: the same task run across an effort × model grid)
05. **Cost and usage: /cost, /usage, and prompt caching** — `05-cost-and-usage.mdx`
06. **Fable vs. Mythos** — `06-fable-vs-mythos.mdx`
- `content/tr/l2-intermediate/m05-models-effort/NN-<slug>.mdx` (6 files) — `draft: true` stubs with EN frontmatter fields carried over and `title`/`description` left in English (translation is not this plan's job; the stub exists so routing/parity gates pass).
- `content/_shared/transcripts/m05-models-effort/NN-<slug>.md` — one per lesson that has a hands-on lab, containing the raw terminal transcript.
- Updated `content/_shared/sources.json` with this module's sources block entries.

## Acceptance criteria

- `node scripts/content-gate.ts` passes for this module: every lesson's frontmatter validates against `content/schema.ts`, every code fence has a language tag, EN/TR path parity holds (the TR draft exists at the same slug), and `level`/`module` in frontmatter match the file path.
- Every lesson has `verified_version: 2.1.263` and a non-empty `sources` array with at least one `type: "official"` entry whose URL was fetched successfully by `/verify-sources` (D041, D043) — paste the WebFetch/lychee evidence in the PR.
- Every lesson with a hands-on lab has a transcript file under `content/_shared/transcripts/m05-models-effort/` whose content matches, verbatim, a real run of the commands shown in the lesson (D093, D099) — no lesson may show output that was not captured this way.
- `npm run typecheck && npm run lint && npm test` pass; `npm run build` succeeds and `dist/en/l2-intermediate/m05-models-effort/` contains 6 lesson pages plus the index.
- `npx playwright test e2e/lesson.spec.ts` passes against at least one lesson in this module (axe: 0 serious/critical violations at 390 px and 1280 px).
- The `fact-checker` agent's report (pasted into the PR) shows no unresolved discrepancy against `research/feature-inventory.md`; the `reviewer` agent's report confirms the D006 template order and the evidence rule on every lesson.

## Steps

1. Read `docs/CURRICULUM.md` §m05-models-effort and confirm the lesson list/order below still matches; if it drifted, follow the doc, not this plan, and note the delta in Handoff notes.
2. Run the `lesson-researcher` agent once per lesson (D098): official doc URL(s) + 2–3 web/YouTube sources, summarized against `research/feature-inventory.md`; save nothing permanent yet, this feeds step 4.
3. Clone `codechup/claude-code-lab` (P22) into a scratch directory; for every lesson with a hands-on lab, check out its start tag (`lesson/m05-models-effort-NN-start`), do the exercise for real, and capture the full terminal transcript.
4. Write each lesson MDX with `/new-lesson l2-intermediate/m05-models-effort/<slug>` (creates the EN file and the TR draft stub together); fill Objectives, When NOT to use, Concept (grounded in the researcher's summary, never invented), Hands-on lab (the exact commands from step 3), Anti-patterns, Quiz, Sources.
5. Save the raw transcript from step 3 under `content/_shared/transcripts/m05-models-effort/NN-<slug>.md`; embed the simplified version with the `<Transcript>` component (P07) in the lesson.
6. Append this lesson's sources to `content/_shared/sources.json` (P23's schema); run `/verify-sources content/en/l2-intermediate/m05-models-effort/NN-<slug>.mdx` to stamp `verified_at`.
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

A reviewer opens `npm run dev`, visits each of the 6 lessons at `/en/l2-intermediate/m05-models-effort/<slug>/`, confirms the OS tabs, transcript, quiz, and sources block render, spot-checks two Sources links by hand, and reads the fact-checker/reviewer agent reports pasted in the PR before merging.

## Handoff notes

### What was written

Seven EN lessons under `content/en/l2-intermediate/m05-models-effort/` (`01-model-family`,
`02-choosing-a-model`, `03-effort-levels`, `04-effort-lab`, `05-fast-mode`, `06-cost-and-usage`,
`07-fable-vs-mythos`), seven `draft: true` TR stubs with translated titles/descriptions and a
one-paragraph Turkish summary each, 12 transcript files plus a folder README under
`content/_shared/transcripts/m05-models-effort/`, and four new entries in
`content/_shared/sources.json` (`anthropic-claude-fable`, `anthropic-glasswing`,
`platform-models-overview`, `platform-pricing`) plus `m05-models-effort` added to the `modules`
array of `docs-commands` and `repo-claude-code-lab`. Append-only; nothing existing was reordered or
removed.

### Deltas from this plan file (the doc/brief won each time)

- **Seven lessons, not six.** `docs/CURRICULUM.md` §2 is authoritative and lists seven slugs; this
  plan's Deliverables section listed six and merged `/effort` levels with `/fast`. Followed the
  curriculum: `03-effort-levels`, `04-effort-lab` and `05-fast-mode` are separate lessons.
- **Transcript layout.** The plan asked for `transcripts/m05-models-effort/NN-<slug>.md`; the
  content brief and the existing `m01-start` convention use
  `transcripts/<module>/<NN-slug>/<kk>-name.txt` with a `#` provenance line 1 and a `›` command
  line 2, embedded with `range="2-N"`. Followed the brief.
- **TR stubs carry a Turkish summary.** The plan said to leave the stub body EN-derived; the brief
  says a translated title and a one-paragraph Turkish summary. Followed the brief, matching the
  shape `content/tr/l1-beginner/m01-start/02-install.mdx` already uses.
- **Module `index.mdx` lesson lists removed** (both languages), per the lead's mid-plan correction:
  the module page renders the lesson list from the collection, so an MDX list duplicated it. The
  index files now hold only their intro paragraph. The brief's step 1.6 ("turn the list items into
  links") is superseded by that instruction.

### Labs actually run (D093/D099)

All captures are from 2026-09-07 against Claude Code 2.1.263 on Windows 11, with the lab repo cloned
into a scratch directory outside both repos. Real findings worth carrying forward:

- **`lesson/m05-02-start` (bug B3), three models, `--max-turns 6`.** All three fixed the bug and left
  `npm test` green (15/15). Only Sonnet finished inside the budget: haiku (`error_max_turns`, 7
  turns, 60.1 s, $0.0588) and opus (`error_max_turns`, 7 turns, 76.9 s, $0.2453) were cut off *after*
  the edit had landed. Sonnet: `success`, 6 turns, 38.2 s, $0.1201. `subtype: error_max_turns` with
  a correct fix on disk is a genuinely useful teaching case and lesson 02 builds on it.
- **`--allowedTools "Bash(npm test*)"` denied Opus's `cd "<lab>" && npm test … && npm run typecheck …`**
  compound command; the denial is recorded in the envelope's `permission_denials` and cost a turn.
  Any future lesson doing tool-restricted comparisons should budget for this.
- **`lesson/m05-04-start` (bug B2), Sonnet 5, `--effort low|medium|high`.** All three succeeded with
  the identical one-line fix. Cost spread ~1.15x, durations not monotonic in the level, thinking
  tokens 14 / 14 / 53. Reported honestly as a null result. That tag's commits predate the lab repo's
  `.claude/` scaffold, so no project `CLAUDE.md` loads there — stated in the lesson.
- **`result` strings come back in Turkish** because the capture machine's global preferences ask for
  Turkish, exactly as recorded for `m01-start`. Kept verbatim and flagged in the lessons and the
  transcripts README.
- **`--bare` is not usable for these captures**: it reads Anthropic auth strictly from
  `ANTHROPIC_API_KEY`/`apiKeyHelper` and never OAuth, so a `--bare` headless run on a subscription
  returns `Not logged in · Please run /login`. The lesson-01 captures therefore run without it.
- **No lab runs `--model fable` or `--model best`.** In non-interactive mode Claude Code never shows
  the usage-credit consent prompt for a Fable request and bills it silently (`model-config.md`).
  Deliberate, and stated in lesson 07.

### Redaction

One absolute scratch path inside a recorded `permission_denials[0].tool_input.command` string in
`02-choosing-a-model/04-opus.txt` was replaced with `<lab>`. JSON envelopes were pretty-printed with
`JSON.stringify(obj, null, 2)` — a whitespace reflow only, documented in the folder README. No other
change to any captured byte.

### Verification

`npm run gate` (90 files OK), `npm run typecheck` (0 errors), `npm run lint`
(eslint + prettier + inline-script all clean), `npm test` (22 files / 183 tests passed),
`npm run build` (ends `check-no-inline-script (dist): OK`; `dist/en/l2-intermediate/m05-models-effort/`
contains all seven lesson pages plus the index), `node scripts/check-raw-colors.mjs`,
`node scripts/check-public-hygiene.mjs`, `node tools/plan/cli.ts check`. Playwright: a temporary
`playwright.p17.config.ts` on port 4417 plus a temporary `e2e/m05-p17.spec.ts` that reads the lesson
links off each module index (count-independent, per the lead's correction) and axe-checks every
route at 390 px and 1280 px — 18 passed. Both temporary files were deleted afterwards.

TR draft lessons are correctly not built as routes, so the temporary spec asserts the TR module
index only.

### Review pipeline

Both agents were run read-only in plan mode from the worktree root, per the content brief.

**fact-checker** — verdict FAIL on its own criteria, resolved as follows.

- ~60 individual claims checked; every quantitative lab figure in all seven lessons (`duration_ms`,
  `total_cost_usd`, `num_turns`, `thinking_tokens`, the cache counters, `fast_mode_state`) matched
  the committed transcripts exactly, and the great majority of doc-sourced prose matched the live
  pages verbatim.
- **1 claim reported as contradicted, not accepted:** `/stats` as an alias for `/usage`
  (`06-cost-and-usage`). The agent searched `commands.md` and reported no `/stats` entry. The raw
  page fetched this session says, in the `/usage` row: "`/cost` and `/stats` are aliases". Primary
  source wins; the claim stands unchanged.
- **9 unverifiable clusters**, all caused by the agent's own tooling rather than by the lessons: its
  `WebFetch` to `anthropic.com` was permission-denied (so the whole Fable/Glasswing block in lesson
  07 came back unverifiable), and it did not run `claude --help` or read the parts of
  `model-config.md` covering "Work with Fable", `--safe-mode`/`switchModelsOnFlag`, the Fable
  usage-credit consent prompt, and the session-header effort wording. Every one of those was fetched
  or run by this session and is quoted from the raw page. Nothing changed.

  On the Fable/Glasswing point specifically: this session first reached both pages through
  `WebFetch`, which returns a model-written summary rather than raw text, so that alone would have
  been thin evidence for direct quotes. After the review, both pages were re-fetched as raw HTML
  with `curl` and every load-bearing phrase was confirmed in the markup: `April 7, 2026` and
  "Project Glasswing"; "Mythos Preview found a 27-year-old vulnerability in OpenBSD"; the FFmpeg
  finding; "We do not plan to make Claude Mythos Preview generally available, but our eventual goal
  is to enable our users to safely deploy Mythos-class models at scale"; and, on the Fable page,
  "Claude Fable 5.1 is priced at $10 per million input tokens and $50 per million output tokens.
  Cache reads now cost $0.25 per million" and "Claude Mythos 5.1 is available to vetted
  organizations through our trusted access programs. Cyberdefenders can apply to the Cyber
  Verification Program". Lesson 07 was corrected to say "cyberdefenders", the page's own word,
  rather than "cybersecurity researchers".
- **4 fixes applied anyway**, from the same report and from a pre-review pass: the MCP
  cache-invalidation nuance in `06` (deferred vs. prefix-loaded tool definitions), the implied
  attribution of the second `modelUsage` entry in `01`, a transcript range that overshot by one line
  in `01`, and the provenance of the `git diff --stat` figures now recorded in the transcripts
  README.
- Its report file captured only the per-file tables for lessons 05–07; the tables for 01–04 did not
  make it into the output stream, although its summary sections reference findings in 02, 03 and 04.

**reviewer** — verdict CHANGES REQUESTED (1 blocker, 3 major, 2 minor, 1 nit). All seven addressed.

- **Blocker (fixed):** the two `/usage` screen samples in `06-cost-and-usage` were quoted from
  `costs.md` without attribution, which read as undeclared captures (D070/D093/D099). Both
  `CodeBlock` titles now say "Sample from the official costs.md doc — not a capture", and the prose
  says so too, including why the sample names a model that appears in none of our recordings.
- **Major (recorded):** the `feature-inventory.md` `/fast` contradiction — now an `open_questions`
  entry for P03.
- **Major (fixed):** empty Handoff notes and `open_questions` — the reviewer ran against the first
  commit, before this section existed. Both are now filled, including the lesson-count and
  transcript-layout deltas it asked for.
- **Major (recorded):** the three Changed callouts are not in `research/deprecations.md` and have no
  Playbook changelog entry — now an `open_questions` entry for P03 and P42.
- **Minor (fixed):** `03-effort-levels` told the reader to check out `lesson/m05-04-start` while its
  own `repo_tag` is `none`, so the `<Lab>` banner showed no checkout line; the lesson now says
  explicitly that step 4 borrows the next lesson's tag.
- **Minor (fixed):** the transcripts README's cross-embed note listed only lesson 06; it is now a
  table covering lessons 03, 05 and 06.
- **Minor (fixed):** quiz q4 in `02-choosing-a-model` said the haiku and sonnet diffs were
  "byte-identical" while the body said "same shape"; the quiz now says "same shape" too, which is
  what was actually observed.
- **Nit (fixed):** this plan's acceptance criteria asked for a `type: "doc"` source entry, which is
  not a value in `sourceSchema`; corrected to `type: "official"`.

The reviewer additionally confirmed clean: template order in all seven EN lessons, every
`<Transcript src>` resolving to a real file, every spot-checked figure matching its recording,
`type: official` sources with matching `verified_at`, 3–5 quizzes per lesson each with one
defensible answer, `_Fix:_` on every anti-pattern, no public-hygiene hits, and TR twins at mirrored
paths with `draft: true`, EN-identical structural frontmatter and correct diacritics.

