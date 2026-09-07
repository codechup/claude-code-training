---
id: P18
title: "L2 Intermediate module: Skills (m06-skills)"
milestone: M1
status: done
owner: opus-p18-2026-09-07
branch: plan/18-l2-m06-skills
model_hint: opus
effort_hint: high
depends_on: [P12, P03, P22, P23]
owned_paths:
  - content/en/l2-intermediate/m06-skills/**
  - content/tr/l2-intermediate/m06-skills/**
  - content/_shared/transcripts/m06-skills/**
shared_paths:
  - content/_shared/sources.json
estimate: L
updated_at: 2026-09-07T10:22:18Z
open_questions: []
---

## Goal

Author every lesson of Skills (`m06-skills`), the 6-lesson next module of Intermediate (l2-intermediate), in English: the reader builds two working skills of their own by the end — one prompt-only, one tool-running — and can explain when a skill beats a custom command. Each lesson follows the fixed template (D006): Objectives + prerequisites, When NOT to use, Concept, Hands-on lab, Anti-patterns, Quiz, Sources. Every command shown was actually run against the lab repo and every claim is backed by real output (D093) — this plan produces no lesson content from memory alone.

## Context

Read first: `docs/CURRICULUM.md` (P03) — it is the **authoritative** source for this module's final lesson slugs, objectives, and order; the lesson list below is the floor the approved plan set, not a ceiling. Also read `research/feature-inventory.md` and `research/deprecations.md` (P03) for what is current vs. "Changed" as of `verified_version: 2.1.263`; `content/_shared/sources.json` (P23) for the vetted source list to pull from and append to; `.claude/rules/content.md`, `.claude/skills/new-lesson/SKILL.md` and the `lesson-researcher`/`lesson-writer`/`fact-checker`/`reviewer` agents (all P11) for the exact authoring workflow; `content/schema.ts` (P06) for the frontmatter zod schema; `docs/design/CANVAS.md` and `/design/` (P05) for the lesson-page visual reference; and the outline text this module was scoped from:

> `m06-skills`: skills vs custom commands · SKILL.md anatomy & frontmatter · `$ARGUMENTS` / named args (lab: `/commit-msg`, `/new-component`) · prompt-only skills (`/review-security`) · tool-running skills (`allowed-tools`, `context: fork`) · `/skill-doctor`

No lesson in this module exists yet; `content/en/l2-intermediate/m06-skills/**` starts from the level/module `index.mdx` stub P06 created.

Decisions this module leans on beyond the shared pipeline decisions below: (D056).

## Scope

In:
- 6 lesson files under `content/en/l2-intermediate/m06-skills/`, numbered `01-`…`06-`, each a complete MDX file following D006's seven sections.
- The matching Turkish draft stub for each lesson under `content/tr/l2-intermediate/m06-skills/` (`draft: true`, created by the `/new-lesson` skill in the same commit as the EN lesson — D016, D018; P25/P26/P40/P41 translate it later, never this plan).
- One raw lab transcript per lesson with a hands-on lab, saved under `content/_shared/transcripts/m06-skills/`, plus the simplified `<Transcript>` rendering embedded in the lesson (D099).
- This module's entries appended to `content/_shared/sources.json` (D041, D043; append-only — never rewrite another module's entries).
- Updating `l2-intermediate/index.mdx` and `m06-skills/index.mdx` module-index copy if this module's final lesson list differs from the stub P06 left (rare; only if `docs/CURRICULUM.md` changed the outline).

Out: Turkish translation of these lessons (P25/P26/P40/P41 own `content/tr/l2-intermediate/m06-skills/**` after this plan hands it off); any other module's content; MDX component code (P07/P08 own those; if a lesson needs a component that does not exist, write it into `open_questions` and do not build it here); changes to `content/schema.ts`, `src/lib/nav.ts`, or any route/layout file; the lab repo itself (P22 owns `codechup/claude-code-lab`; this plan clones and runs it, never edits it in place — a bug fix needed there goes into `open_questions` naming the tag).

## Deliverables

- `content/en/l2-intermediate/m06-skills/NN-<slug>.mdx` (6 files):
01. **Skills vs. custom commands** — `01-skills-vs-custom-commands.mdx`
02. **SKILL.md anatomy and frontmatter** — `02-skill-md-anatomy-and-frontmatter.mdx`
03. **$ARGUMENTS and named args** — `03-arguments-and-named-args.mdx` (hands-on lab: building /commit-msg and /new-component)
04. **Prompt-only skills** — `04-prompt-only-skills.mdx` (hands-on lab: /review-security)
05. **Tool-running skills** — `05-tool-running-skills.mdx` (hands-on lab: a skill with allowed-tools and context: fork)
06. **/skill-doctor** — `06-skill-doctor.mdx`
- `content/tr/l2-intermediate/m06-skills/NN-<slug>.mdx` (6 files) — `draft: true` stubs with EN frontmatter fields carried over and `title`/`description` left in English (translation is not this plan's job; the stub exists so routing/parity gates pass).
- `content/_shared/transcripts/m06-skills/NN-<slug>.md` — one per lesson that has a hands-on lab, containing the raw terminal transcript.
- Updated `content/_shared/sources.json` with this module's sources block entries.

## Acceptance criteria

- `node scripts/content-gate.ts` passes for this module: every lesson's frontmatter validates against `content/schema.ts`, every code fence has a language tag, EN/TR path parity holds (the TR draft exists at the same slug), and `level`/`module` in frontmatter match the file path.
- Every lesson has `verified_version: 2.1.263` and a non-empty `sources` array with at least one `type: "doc"` entry whose URL was fetched successfully by `/verify-sources` (D041, D043) — paste the WebFetch/lychee evidence in the PR.
- Every lesson with a hands-on lab has a transcript file under `content/_shared/transcripts/m06-skills/` whose content matches, verbatim, a real run of the commands shown in the lesson (D093, D099) — no lesson may show output that was not captured this way.
- `npm run typecheck && npm run lint && npm test` pass; `npm run build` succeeds and `dist/en/l2-intermediate/m06-skills/` contains 6 lesson pages plus the index.
- `npx playwright test e2e/lesson.spec.ts` passes against at least one lesson in this module (axe: 0 serious/critical violations at 390 px and 1280 px).
- The `fact-checker` agent's report (pasted into the PR) shows no unresolved discrepancy against `research/feature-inventory.md`; the `reviewer` agent's report confirms the D006 template order and the evidence rule on every lesson.

## Steps

1. Read `docs/CURRICULUM.md` §m06-skills and confirm the lesson list/order below still matches; if it drifted, follow the doc, not this plan, and note the delta in Handoff notes.
2. Run the `lesson-researcher` agent once per lesson (D098): official doc URL(s) + 2–3 web/YouTube sources, summarized against `research/feature-inventory.md`; save nothing permanent yet, this feeds step 4.
3. Clone `codechup/claude-code-lab` (P22) into a scratch directory; for every lesson with a hands-on lab, check out its start tag (`lesson/m06-skills-NN-start`), do the exercise for real, and capture the full terminal transcript.
4. Write each lesson MDX with `/new-lesson l2-intermediate/m06-skills/<slug>` (creates the EN file and the TR draft stub together); fill Objectives, When NOT to use, Concept (grounded in the researcher's summary, never invented), Hands-on lab (the exact commands from step 3), Anti-patterns, Quiz, Sources.
5. Save the raw transcript from step 3 under `content/_shared/transcripts/m06-skills/NN-<slug>.md`; embed the simplified version with the `<Transcript>` component (P07) in the lesson.
6. Append this lesson's sources to `content/_shared/sources.json` (P23's schema); run `/verify-sources content/en/l2-intermediate/m06-skills/NN-<slug>.mdx` to stamp `verified_at`.
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

A reviewer opens `npm run dev`, visits each of the 6 lessons at `/en/l2-intermediate/m06-skills/<slug>/`, confirms the OS tabs, transcript, quiz, and sources block render, spot-checks two Sources links by hand, and reads the fact-checker/reviewer agent reports pasted in the PR before merging.

## Handoff notes

Executed 2026-09-07 by `opus-p18-2026-09-07` against Claude Code 2.1.263.

**Written.** 6 EN lessons + 6 TR `draft: true` stubs (translated title/description plus a one-paragraph Turkish summary) under `l2-intermediate/m06-skills/`, and 10 real transcripts under `content/_shared/transcripts/m06-skills/`.

**Slug drift (resolved in the curriculum's favour, D-rule: CURRICULUM is authoritative).** This plan's Deliverables listed `01-skills-vs-custom-commands`, `02-skill-md-anatomy-and-frontmatter`, `03-arguments-and-named-args`. `docs/CURRICULUM.md` §2 names `01-skills-vs-commands`, `02-skill-md-anatomy`, `03-arguments`; the shipped files follow the curriculum. Lab tags are `lesson/m06-NN-start` (not `lesson/m06-skills-NN-start` as the plan text guessed); tags exist for 03/04/05 only, so 01/02/06 ship `repo_tag: 'none'` with self-contained labs.

**Labs run for real.** 03/04/05 against `lesson/m06-03-start` … `-05-start`, writing the SKILL.md the tag's `-solution` contains and invoking it headlessly; 01/02/06 in throwaway skills in the same clone. Every `<Transcript>` is verbatim capture. Two redactions only: absolute local paths in `05-tool-running-skills/01-new-component.txt` replaced with `<lab>`.

**Capture-environment notes (visible in the transcripts).**
- The capture machine has `"language": "Turkish"` in user settings, so every recorded command carries `--settings '{"language":"English"}'`. Each lesson says so and tells the reader to drop the flag.
- **Headless invocation of a `disable-model-invocation: true` skill is not fully reliable on 2.1.263.** Roughly one run in three or four came back as a refusal ("the skill must be run directly by you") instead of the skill's output; re-running the identical command produced the recorded result. The two runs with nothing at all after the skill name were both refused and every run with a trailing space or an argument succeeded, but that is ~13 runs total — far too small a sample to claim causation, and lesson 01 says exactly that. Worth re-testing on a later version.
- `05-tool-running-skills/01-new-component.txt` opens mid-thought ("Both blocked too — shipping with the caveat, as advised."). That is the literal first line of the `--output-format text` result and is unedited; the fact-checker flagged it as an anomaly, and it is confirmed genuine. In the same run `npm run typecheck` / `npm run lint` were blocked (not in the skill's `allowed-tools`, and the workspace was untrusted so `permissions.allow` was ignored) — the lesson teaches exactly that.

**Review pipeline (D071).** fact-checker: 0 WRONG, 0 inventory drift; 4 "must resolve" items — all handled (lab-tag URLs re-verified 200 by curl; the "reference content is often paired with `paths`" clause rewritten as our own habit rather than a doc claim; the `--debug` listing-budget warning re-confirmed verbatim in `skills.md`; the lesson-05 transcript re-confirmed genuine). reviewer: 1 blocker + 3 major + 2 minor — all fixed: the temporary `playwright.p18.config.ts` / `e2e/m06-skills.p18.spec.ts` were deleted (they were the brief's temporary Playwright pair, outside `owned_paths`); headings renamed to `Objectives & prerequisites`; two missing transcripts captured (`01-skills-vs-commands/02-command-file-fallback.txt`, `02-skill-md-anatomy/03-frontmatter-not-first-line.txt`) so no lab step claims an unrecorded result; the "Changed" callout now cites the real version — **slash commands and skills were merged in 2.1.3 (9 January 2026)**, from `changelog.md`; `awesome-claude-code` now cited in lesson 01, matching its `m06-skills` tag in the registry.

**Post-review corrections (advisor pass, same session).** Lesson 01's headless paragraph was rewritten to match the run counts above rather than overclaiming, and its "picked up without a restart" reading of a `-p` capture was corrected (every `-p` run is a fresh session, so the capture cannot show live change detection); the corresponding checklist item was dropped. Lesson 02's field counts were wrong (seventeen documented fields, three inert) and the `arguments` row was missing — both fixed; the objective no longer promises `skillOverrides`, which lesson 06 covers. Lesson 05's `expected`/checklist no longer hard-codes "could not run typecheck/lint": the lab repo's own `.claude/settings.json` **does** allow `Bash(npm run typecheck)` and `Bash(npm run lint)`, and they were ignored only because the capture clone had never been trusted — the lesson now says a trusted clone behaves differently and that the trust warning went to stderr. The `--settings '{"language":"English"}'` explanation, previously only in lessons 01 and 03, is now in all six. Every `sources[].url` in the module was re-fetched by `curl` this session (11 URLs, all 200), including `awesome-claude-code`, rather than copying a `verified_at` forward.

**Cosmetic note.** This repo's Prettier normalises YAML/JS strings to single quotes inside fenced blocks, so the `argument-hint` lines and `scaffold.mjs` shown in lessons 03/04/05 use `'…'` where the lab repo's `-solution` files use `"…"`. Identical YAML/JS; lesson 03 says so in one line for readers diffing against the tag.

**i18n.** `.claude/rules/i18n.md` read; TR stubs use straight ASCII apostrophes for Turkish suffixes on English terms (`skill'ler`, `SKILL.md'nin`) per its examples, with the title/description re-quoted as double-quoted YAML so the apostrophes survive. No new glossary terms were needed for stubs; the translation plan will add them.

**Coordinator instruction applied.** Both `m06-skills/index.mdx` files now hold only the intro paragraph — the numbered lesson list was removed (the module page renders the list itself). The temporary e2e spec discovered lesson routes from the index rather than asserting a count.

**Deprecations follow-up (for P42 / the inventory owner).** `research/deprecations.md` has no entry for the slash-command→skill merge. Suggested row: *"custom commands as a separate mechanism → merged into skills in 2.1.3 (2026-01-09); `.claude/commands/*.md` keeps working, a skill of the same name wins"*. This plan does not own that file.

**Verification (re-run after the corrections above).** `npm run gate` OK (88 files) · `npm run typecheck` 0 errors · `npm run lint` clean · `npm test` pass · `npm run build` ends `check-no-inline-script (dist): OK (78 files scanned)` with `dist/en/l2-intermediate/m06-skills/` holding 6 lesson pages + index (TR twins are `draft: true`, so only `dist/tr/.../index.html`) · `check-raw-colors` OK · `check-public-hygiene` OK · `tools/plan/cli.ts check` OK · Playwright on port 4418: 18 passed (a11y.spec.ts plus a temporary module spec at 390 px and 1280 px, 0 serious/critical axe violations); both temporary Playwright files deleted afterwards.

**Open follow-ups.** `e2e/lesson.spec.ts` (P04) is hard-coded to the m01 lesson, so this module could not reuse it as-is — generalising it would let future content plans stop writing temporary specs.

