---
id: P14
title: "L1 Beginner module: Interact (m02-interact)"
milestone: M1
status: done
owner: opus-p14-2026-09-07
branch: plan/14-l1-m02-interact
model_hint: opus
effort_hint: high
depends_on: [P12, P03, P22, P23]
owned_paths:
  - content/en/l1-beginner/m02-interact/**
  - content/tr/l1-beginner/m02-interact/**
  - content/_shared/transcripts/m02-interact/**
shared_paths:
  - content/_shared/sources.json
estimate: L
updated_at: 2026-09-07T10:22:17Z
open_questions:
  - 'Inline links inside lesson prose fail axe link-in-text-block (serious) - they are colour-only. P05/P07 must add a non-colour affordance before the TR wave links glossary terms in paragraphs.'
  - 'content/tr/playbook/glossary.mdx lacks entries for permission mode, checkpoint and context window; outside this plan owned_paths.'
  - 'research/feature-inventory.md settings-precedence row contradicts permissions.md (managed is highest); research/deprecations.md Bash-rule-text-after-paren row not found in the live docs.'
---

## Goal

Author every lesson of Interact (`m02-interact`), the 6-lesson opening module of Beginner (l1-beginner), in English: the reader goes from typing prompts to trusting Claude Code with real file edits under an explicit permission model, ending with plan mode and the context commands that keep long sessions usable. Each lesson follows the fixed template (D006): Objectives + prerequisites, When NOT to use, Concept, Hands-on lab, Anti-patterns, Quiz, Sources. Every command shown was actually run against the lab repo and every claim is backed by real output (D093) — this plan produces no lesson content from memory alone.

## Context

Read first: `docs/CURRICULUM.md` (P03) — it is the **authoritative** source for this module's final lesson slugs, objectives, and order; the lesson list below is the floor the approved plan set, not a ceiling. Also read `research/feature-inventory.md` and `research/deprecations.md` (P03) for what is current vs. "Changed" as of `verified_version: 2.1.263`; `content/_shared/sources.json` (P23) for the vetted source list to pull from and append to; `.claude/rules/content.md`, `.claude/skills/new-lesson/SKILL.md` and the `lesson-researcher`/`lesson-writer`/`fact-checker`/`reviewer` agents (all P11) for the exact authoring workflow; `content/schema.ts` (P06) for the frontmatter zod schema; `docs/design/CANVAS.md` and `/design/` (P05) for the lesson-page visual reference; and the outline text this module was scoped from:

> `m02-interact`: prompting fundamentals (bad vs good) · reading & editing files, Glob/Grep/Bash tools · permission modes & allow/deny rules · plan mode (Shift+Tab, plan files) · checkpoints & `/rewind` · context basics (`/context`, `/compact`, `/clear`)

No lesson in this module exists yet; `content/en/l1-beginner/m02-interact/**` starts from the level/module `index.mdx` stub P06 created.

Decisions this module leans on beyond the shared pipeline decisions below: (D076).

## Scope

In:
- 6 lesson files under `content/en/l1-beginner/m02-interact/`, numbered `01-`…`06-`, each a complete MDX file following D006's seven sections.
- The matching Turkish draft stub for each lesson under `content/tr/l1-beginner/m02-interact/` (`draft: true`, created by the `/new-lesson` skill in the same commit as the EN lesson — D016, D018; P25/P26/P40/P41 translate it later, never this plan).
- One raw lab transcript per lesson with a hands-on lab, saved under `content/_shared/transcripts/m02-interact/`, plus the simplified `<Transcript>` rendering embedded in the lesson (D099).
- This module's entries appended to `content/_shared/sources.json` (D041, D043; append-only — never rewrite another module's entries).
- Updating `l1-beginner/index.mdx` and `m02-interact/index.mdx` module-index copy if this module's final lesson list differs from the stub P06 left (rare; only if `docs/CURRICULUM.md` changed the outline).

Out: Turkish translation of these lessons (P25/P26/P40/P41 own `content/tr/l1-beginner/m02-interact/**` after this plan hands it off); any other module's content; MDX component code (P07/P08 own those; if a lesson needs a component that does not exist, write it into `open_questions` and do not build it here); changes to `content/schema.ts`, `src/lib/nav.ts`, or any route/layout file; the lab repo itself (P22 owns `codechup/claude-code-lab`; this plan clones and runs it, never edits it in place — a bug fix needed there goes into `open_questions` naming the tag).

## Deliverables

- `content/en/l1-beginner/m02-interact/NN-<slug>.mdx` (6 files):
01. **Prompting fundamentals: bad prompts vs. good prompts** — `01-prompting-fundamentals.mdx`
02. **Reading and editing files: Glob, Grep, and Bash tools** — `02-reading-and-editing-files-and-tools.mdx`
03. **Permission modes and allow/deny rules** — `03-permission-modes-and-rules.mdx`
04. **Plan mode: Shift+Tab and plan files** — `04-plan-mode.mdx` (hands-on lab: walking through an AskUserQuestion-driven plan, using this project's own planning session as the worked example)
05. **Checkpoints and /rewind** — `05-checkpoints-and-rewind.mdx`
06. **Context basics: /context, /compact, and /clear** — `06-context-basics.mdx`
- `content/tr/l1-beginner/m02-interact/NN-<slug>.mdx` (6 files) — `draft: true` stubs with EN frontmatter fields carried over and `title`/`description` left in English (translation is not this plan's job; the stub exists so routing/parity gates pass).
- `content/_shared/transcripts/m02-interact/NN-<slug>.md` — one per lesson that has a hands-on lab, containing the raw terminal transcript.
- Updated `content/_shared/sources.json` with this module's sources block entries.

## Acceptance criteria

- `node scripts/content-gate.ts` passes for this module: every lesson's frontmatter validates against `content/schema.ts`, every code fence has a language tag, EN/TR path parity holds (the TR draft exists at the same slug), and `level`/`module` in frontmatter match the file path.
- Every lesson has `verified_version: 2.1.263` and a non-empty `sources` array with at least one `type: "doc"` entry whose URL was fetched successfully by `/verify-sources` (D041, D043) — paste the WebFetch/lychee evidence in the PR.
- Every lesson with a hands-on lab has a transcript file under `content/_shared/transcripts/m02-interact/` whose content matches, verbatim, a real run of the commands shown in the lesson (D093, D099) — no lesson may show output that was not captured this way.
- `npm run typecheck && npm run lint && npm test` pass; `npm run build` succeeds and `dist/en/l1-beginner/m02-interact/` contains 6 lesson pages plus the index.
- `npx playwright test e2e/lesson.spec.ts` passes against at least one lesson in this module (axe: 0 serious/critical violations at 390 px and 1280 px).
- The `fact-checker` agent's report (pasted into the PR) shows no unresolved discrepancy against `research/feature-inventory.md`; the `reviewer` agent's report confirms the D006 template order and the evidence rule on every lesson.

## Steps

1. Read `docs/CURRICULUM.md` §m02-interact and confirm the lesson list/order below still matches; if it drifted, follow the doc, not this plan, and note the delta in Handoff notes.
2. Run the `lesson-researcher` agent once per lesson (D098): official doc URL(s) + 2–3 web/YouTube sources, summarized against `research/feature-inventory.md`; save nothing permanent yet, this feeds step 4.
3. Clone `codechup/claude-code-lab` (P22) into a scratch directory; for every lesson with a hands-on lab, check out its start tag (`lesson/m02-interact-NN-start`), do the exercise for real, and capture the full terminal transcript.
4. Write each lesson MDX with `/new-lesson l1-beginner/m02-interact/<slug>` (creates the EN file and the TR draft stub together); fill Objectives, When NOT to use, Concept (grounded in the researcher's summary, never invented), Hands-on lab (the exact commands from step 3), Anti-patterns, Quiz, Sources.
5. Save the raw transcript from step 3 under `content/_shared/transcripts/m02-interact/NN-<slug>.md`; embed the simplified version with the `<Transcript>` component (P07) in the lesson.
6. Append this lesson's sources to `content/_shared/sources.json` (P23's schema); run `/verify-sources content/en/l1-beginner/m02-interact/NN-<slug>.mdx` to stamp `verified_at`.
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

A reviewer opens `npm run dev`, visits each of the 6 lessons at `/en/l1-beginner/m02-interact/<slug>/`, confirms the OS tabs, transcript, quiz, and sources block render, spot-checks two Sources links by hand, and reads the fact-checker/reviewer agent reports pasted in the PR before merging.

## Handoff notes

**Shipped.** 6 EN lessons + 6 TR `draft: true` stubs under `l1-beginner/m02-interact/`, 18 raw
transcripts under `content/_shared/transcripts/m02-interact/`, both module `index.mdx` files
updated, `content/_shared/sources.json` tagged (2-line diff).

**Authority conflicts resolved (all in favour of the more authoritative source):**

- **Slugs.** Used `docs/CURRICULUM.md` §2 (`01-prompting-basics`, `02-tools-read-edit-run`,
  `03-permissions`, `04-plan-mode`, `05-checkpoints-rewind`, `06-context-basics`), not this plan's
  Deliverables list (`01-prompting-fundamentals`, …). CURRICULUM is authoritative per Steps §1.
- **Lab tags.** The lab repo's real tags are `lesson/m02-NN-start`, not
  `lesson/m02-interact-NN-start`. `repo_tag` carries the exact string.
- **Lesson 01 has a lab.** CURRICULUM marks no Lab for `01`, but the D006 template requires a
  Hands-on lab section, so `01` reuses `lesson/m02-02-start` (tag reuse across lessons is an
  established lab-repo pattern) and runs four read-only prompts against the same bug.
- **Lesson 06 uses `repo_tag: 'main'`,** not `'none'`: `labRepoTreeUrl()` has no `none` case and
  would render a dead `…/tree/none` link, and the lab genuinely runs against `main`.
- **Transcript layout.** Followed the brief and the m01 reference (`<module>/<NN-slug>/<kk>-name.txt`,
  `# ` provenance header on line 1), not this plan's `<module>/NN-<slug>.md`.
- **TR stubs.** Followed the brief (translated title + one Turkish summary paragraph), not this
  plan's "leave title/description in English".

**Evidence.** Every transcript is a real run made this session against a real tag; nothing is
reconstructed. Line 2 of each file is the literal command executed. Every capture passed
`--settings '{"language":"English"}'` because the capturing machine has a user-level
`"language": "Turkish"` setting — the flag is visible on every command line and called out in each
lesson's lab. Three plan-file paths under `~/.claude/plans/` were redacted from absolute Windows
paths (noted in those files' headers). Captures were made on native Windows through Git Bash, which
is why some tool output shows backslash path separators; the PowerShell variants shown in `<OSTabs>`
(`;` chaining, and a settings **file** instead of inline JSON for `--settings`) were run for real
before being written down.

**Review pipeline (D071).** fact-checker: ~90 claims CONFIRMED across the six lessons; 1 contradicted
claim fixed (two quiz explanations wrongly said a terminal restart loses the session and its
checkpoints — sessions and checkpoints persist), 5 unverifiable claims resolved by capturing new
evidence (`00-npm-test-before.txt` for tags `m02-02/04/05`, `00-project-settings.txt` for the lab
repo's own allow rules) and 2 by rewording; 1 invented "Changed" callout removed (`/autocompact` is
current behaviour, not a documented supersession). reviewer: 1 blocker + 2 major + 3 minor, all
fixed — transcript command lines restored to their literal form, `repo_tag: 'none'` → `'main'`,
TR module index i18n corrected, an example prompt added to lesson 03's Concept, lesson 06's
transcript range widened to show complete JSON, and `interactive-mode.md` cited from lesson 05.

**Drift found (not this plan's to fix):**

1. `research/feature-inventory.md` states settings precedence as `--settings` > managed > … The live
   docs (`permissions.md` §Settings precedence) put **managed highest**: "no other level, including
   command line arguments, can override a managed permission rule". The lessons follow the docs.
2. `research/feature-inventory.md` lists an `autoCompactAt` setting; the live `context-window.md`
   documents the `/autocompact <tokens>` command instead. The lesson teaches the documented command.
3. `research/deprecations.md` row "Bash permission rules with text after `)` → invalid" could not be
   found anywhere in the live `permissions.md` fetched on 2026-09-07. Left out of lesson 03 rather
   than asserted; needs re-verification by whoever owns `research/`.
4. `content/_shared/sources.json` tags `docs-common-workflows` with `m02-interact`, but no lesson in
   this module cites it. Left untouched (shared, append-only). `docs-interactive-mode` was resolved
   by citing it from lesson 05.

**Post-review corrections (second commit):**

- Both module `index.mdx` files no longer carry a numbered lesson list — the module page renders that
  list from the collection, so an MDX list duplicated every lesson (lead's instruction, 2026-09-07).
- Lesson 03 now tells the reader to accept the **workspace trust** dialog in an interactive session
  before any `-p` run. A project's `permissions.allow` rules are ignored until the folder is trusted,
  and `claude -p` never shows the dialog — the lab's first run only succeeded here because this
  session had trusted the clone by hand (`permissions.md`, "What runs before you trust a folder").
- Lesson 02's read-before-edit claim now quotes the tools reference exactly, including the
  model-dependent carve-out: Opus 4.6, Haiku 4.5 and older models always require the read; newer
  models may edit an unread file when reading it would not need a permission prompt.

**Open follow-ups:**

- **a11y gap in inline prose links.** Adding glossary links inside a paragraph on the TR module index
  produced a serious axe violation (`link-in-text-block` — links not distinguishable without colour).
  The links were removed from that page to keep the build green, so the TR module index currently
  breaks `.claude/rules/i18n.md`'s "link once per page to the glossary" rule. The six TR lesson stubs
  still carry their glossary links (they are `draft: true`, so unbuilt) and will hit the same
  violation when P25/P26/P40/P41 flip them. **P05/P07 need an underline (or equivalent non-colour
  affordance) for inline links in lesson prose before the TR wave ships.**
- **Missing TR glossary terms.** `permission mode`, `checkpoint`, `context window` and `Edit`/`Grep`
  tool names have no entry in `content/tr/playbook/glossary.mdx`. Not added — `content/tr/playbook/**`
  is outside this plan's `owned_paths`. The translation plan should add them.
- The TR module index deliberately does **not** link its lesson list: those routes do not exist while
  the TR lessons are `draft: true`. The EN index does link all six.

