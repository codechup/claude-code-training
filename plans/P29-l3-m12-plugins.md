---
id: P29
title: "L3 Advanced module: Plugins (m12-plugins)"
milestone: M2
status: done
owner: opus-p29-2026-09-07
branch: plan/29-l3-m12-plugins
model_hint: opus
effort_hint: high
depends_on: [P24]
owned_paths:
  - content/en/l3-advanced/m12-plugins/**
  - content/tr/l3-advanced/m12-plugins/**
  - content/_shared/transcripts/m12-plugins/**
shared_paths:
  - content/_shared/sources.json
estimate: L
updated_at: 2026-09-07T19:40:33Z
open_questions:
  - 'content/tr/playbook/glossary.mdx has no `plugin` or `marketplace` entry, so the TR stubs keep both terms in plain text with an inline Turkish gloss rather than linking a dead anchor. The TR translation plan (P25/P26/P40/P41) should add both entries and propose their EN twins.'
  - '`research/feature-inventory.md` line 39 attributes the `claude plugin eval` flag surface to `plugins-reference`. That page has no eval section (verified 2026-09-07); the surface comes from `claude plugin eval --help`. P03 owns the inventory, so this plan did not edit it.'
  - '`claude plugin eval` is early access and is not enabled on the authoring machine, so no eval suite was run. Lesson 04 says so and sources the eval surface to the captured `--help` only. A future plan with early access should add a real eval-run transcript.'
  - 'The lab repo has no `lesson/m12-01-*`, `m12-04-*` or `m12-05-*` tags, so those three lessons ship `repo_tag: none` with self-contained scratch-folder labs. P22 or its successor may want to add them.'
  - 'The `lesson/m12-03-solution` plugin bundles a skill and a hook but no agent, so lesson 03 teaches skill+hook packaging rather than the skill+agent+hook this plan Goal describes. Following the tag, not the plan.'
---

## Goal

Author every lesson of Plugins (`m12-plugins`), the 5-lesson next module of Advanced (l3-advanced), in English: the reader packages a skill, agent, and hook they already built earlier in the course into one distributable plugin. Each lesson follows the fixed template (D006): Objectives + prerequisites, When NOT to use, Concept, Hands-on lab, Anti-patterns, Quiz, Sources. Every command shown was actually run against the lab repo and every claim is backed by real output (D093) — this plan produces no lesson content from memory alone.

## Context

Read first: `docs/CURRICULUM.md` (P03) — it is the **authoritative** source for this module's final lesson slugs, objectives, and order; the lesson list below is the floor the approved plan set, not a ceiling. Also read `research/feature-inventory.md` and `research/deprecations.md` (P03) for what is current vs. "Changed" as of `verified_version: 2.1.263`; `content/_shared/sources.json` (P23) for the vetted source list to pull from and append to; `.claude/rules/content.md`, `.claude/skills/new-lesson/SKILL.md` and the `lesson-researcher`/`lesson-writer`/`fact-checker`/`reviewer` agents (all P11) for the exact authoring workflow; `content/schema.ts` (P06) for the frontmatter zod schema; `docs/design/CANVAS.md` and `/design/` (P05) for the lesson-page visual reference; and the outline text this module was scoped from:

> `m12-plugins`: plugin anatomy · marketplaces & `/plugin` · building a plugin (lab) · `claude plugin validate` / eval · team marketplace

No lesson in this module exists yet; `content/en/l3-advanced/m12-plugins/**` starts from the level/module `index.mdx` stub P06 created.

Decisions this module leans on beyond the shared pipeline decisions below: .

## Scope

In:
- 5 lesson files under `content/en/l3-advanced/m12-plugins/`, numbered `01-`…`05-`, each a complete MDX file following D006's seven sections.
- The matching Turkish draft stub for each lesson under `content/tr/l3-advanced/m12-plugins/` (`draft: true`, created by the `/new-lesson` skill in the same commit as the EN lesson — D016, D018; P25/P26/P40/P41 translate it later, never this plan).
- One raw lab transcript per lesson with a hands-on lab, saved under `content/_shared/transcripts/m12-plugins/`, plus the simplified `<Transcript>` rendering embedded in the lesson (D099).
- This module's entries appended to `content/_shared/sources.json` (D041, D043; append-only — never rewrite another module's entries).
- Updating `l3-advanced/index.mdx` and `m12-plugins/index.mdx` module-index copy if this module's final lesson list differs from the stub P06 left (rare; only if `docs/CURRICULUM.md` changed the outline).

Out: Turkish translation of these lessons (P25/P26/P40/P41 own `content/tr/l3-advanced/m12-plugins/**` after this plan hands it off); any other module's content; MDX component code (P07/P08 own those; if a lesson needs a component that does not exist, write it into `open_questions` and do not build it here); changes to `content/schema.ts`, `src/lib/nav.ts`, or any route/layout file; the lab repo itself (P22 owns `codechup/claude-code-lab`; this plan clones and runs it, never edits it in place — a bug fix needed there goes into `open_questions` naming the tag).

## Deliverables

- `content/en/l3-advanced/m12-plugins/NN-<slug>.mdx` (5 files):
01. **Plugin anatomy** — `01-plugin-anatomy.mdx`
02. **Marketplaces and /plugin** — `02-marketplaces-and-plugin-command.mdx`
03. **Building a plugin** — `03-building-a-plugin.mdx` (hands-on lab: a small plugin bundling a skill, an agent, and a hook)
04. **claude plugin validate and eval** — `04-plugin-validate-and-eval.mdx`
05. **A team marketplace** — `05-team-marketplace.mdx`
- `content/tr/l3-advanced/m12-plugins/NN-<slug>.mdx` (5 files) — `draft: true` stubs with EN frontmatter fields carried over and `title`/`description` left in English (translation is not this plan's job; the stub exists so routing/parity gates pass).
- `content/_shared/transcripts/m12-plugins/NN-<slug>.md` — one per lesson that has a hands-on lab, containing the raw terminal transcript.
- Updated `content/_shared/sources.json` with this module's sources block entries.

## Acceptance criteria

- `node scripts/content-gate.ts` passes for this module: every lesson's frontmatter validates against `content/schema.ts`, every code fence has a language tag, EN/TR path parity holds (the TR draft exists at the same slug), and `level`/`module` in frontmatter match the file path.
- Every lesson has `verified_version: 2.1.263` and a non-empty `sources` array with at least one `type: "doc"` entry whose URL was fetched successfully by `/verify-sources` (D041, D043) — paste the WebFetch/lychee evidence in the PR.
- Every lesson with a hands-on lab has a transcript file under `content/_shared/transcripts/m12-plugins/` whose content matches, verbatim, a real run of the commands shown in the lesson (D093, D099) — no lesson may show output that was not captured this way.
- `npm run typecheck && npm run lint && npm test` pass; `npm run build` succeeds and `dist/en/l3-advanced/m12-plugins/` contains 5 lesson pages plus the index.
- `npx playwright test e2e/lesson.spec.ts` passes against at least one lesson in this module (axe: 0 serious/critical violations at 390 px and 1280 px).
- The `fact-checker` agent's report (pasted into the PR) shows no unresolved discrepancy against `research/feature-inventory.md`; the `reviewer` agent's report confirms the D006 template order and the evidence rule on every lesson.

## Steps

1. Read `docs/CURRICULUM.md` §m12-plugins and confirm the lesson list/order below still matches; if it drifted, follow the doc, not this plan, and note the delta in Handoff notes.
2. Run the `lesson-researcher` agent once per lesson (D098): official doc URL(s) + 2–3 web/YouTube sources, summarized against `research/feature-inventory.md`; save nothing permanent yet, this feeds step 4.
3. Clone `codechup/claude-code-lab` (P22) into a scratch directory; for every lesson with a hands-on lab, check out its start tag (`lesson/m12-plugins-NN-start`), do the exercise for real, and capture the full terminal transcript.
4. Write each lesson MDX with `/new-lesson l3-advanced/m12-plugins/<slug>` (creates the EN file and the TR draft stub together); fill Objectives, When NOT to use, Concept (grounded in the researcher's summary, never invented), Hands-on lab (the exact commands from step 3), Anti-patterns, Quiz, Sources.
5. Save the raw transcript from step 3 under `content/_shared/transcripts/m12-plugins/NN-<slug>.md`; embed the simplified version with the `<Transcript>` component (P07) in the lesson.
6. Append this lesson's sources to `content/_shared/sources.json` (P23's schema); run `/verify-sources content/en/l3-advanced/m12-plugins/NN-<slug>.mdx` to stamp `verified_at`.
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

A reviewer opens `npm run dev`, visits each of the 5 lessons at `/en/l3-advanced/m12-plugins/<slug>/`, confirms the OS tabs, transcript, quiz, and sources block render, spot-checks two Sources links by hand, and reads the fact-checker/reviewer agent reports pasted in the PR before merging.

## Handoff notes

**Written.** 5 EN lessons under `content/en/l3-advanced/m12-plugins/` plus 5 TR `draft: true` stubs, and 14 real transcripts under `content/_shared/transcripts/m12-plugins/`. No changes to `content/_shared/sources.json`: all seven plugin doc pages plus `repo-awesome-claude-code` were already registered against `m12-plugins` (P23), and every lesson's `sources[]` reuses those exact URLs.

**Slug drift (followed CURRICULUM, not this plan).** `docs/CURRICULUM.md` §2 is authoritative per the brief, so the delivered slugs are `01-plugin-anatomy`, `02-marketplaces`, `03-build-a-plugin`, `04-validate-and-eval`, `05-team-marketplace` — not this plan's Deliverables list (`02-marketplaces-and-plugin-command`, `03-building-a-plugin`, `04-plugin-validate-and-eval`).

**Lab tags.** Only `lesson/m12-02-start|solution` and `lesson/m12-03-start|solution` exist. `m12-02` is process-only (start == solution). `m12-03`'s solution ships `plugins/labtrack-tools/` with `plugin.json`, one skill (`commit-msg`) and one hook (`format-on-save.mjs` + `hooks.json`) — **no agent**, so lesson 03 teaches a skill+hook plugin, not the skill+agent+hook this plan's Goal describes. Lessons 01, 04 and 05 use `repo_tag: 'none'` with self-contained scratch-folder labs.

**Transcripts (14, all real).** Captured against a private clone of the lab repo: the shared `../claude-code-lab` checkout was being moved between tags by sibling sessions mid-run, so this session cloned its own copy rather than fight over it. The home directory and clone path are redacted in every file; `node scripts/check-public-hygiene.mjs` is clean. Lab 03's tree was verified byte-identical to `lesson/m12-03-solution` with `git diff --cached --stat`. All machine state created for the captures (one local marketplace registration and one `--scope local` install) was removed again; that cleanup is itself transcript `05-team-marketplace/02-cleanup.txt`.

**`claude plugin eval` was NOT run.** It is early access and prints `` `plugin eval` is currently in early access `` on this machine. Lesson 04 shows that capture plus the full `--help` output, and states plainly that the eval surface is read from `--help` because no public docs page exists.

**Review counts (D071).** fact-checker: 0 WRONG, 0 contradicted claims across all 5 lessons; 6 items flagged UNVERIFIABLE (validate exit codes, the `--json` envelope, the `--json` v2.1.259 gate, `plugin tag --force`/`--message`, the single-skill-at-root rule, the per-finding JSON shape). Five of the six were re-verified by hand against the raw `plugins-reference.md` fetched this session — they are verbatim in its "CLI commands reference" section (lines 1215, 1230, 1233–1239, 1259–1266) and its path-behaviour section (line 670); the agent's WebFetch summariser did not surface that section. Those claims were kept. The sixth (the `path`/`message`/`code` shape of an individual finding) is genuinely undocumented, and lesson 04 now attributes it to the transcript rather than to a doc. reviewer: 0 blockers, 3 major + 6 minor; 8 fixed (wrong module reference `m03-context` → `m03-memory`; a self-contradicting objective in lesson 01; lesson 02's lab now states its forward dependency on the lesson-03 plugin explicitly, with `hello-plugin` as the in-order substitute; an unevidenced checklist item reworded; both `Changed` callouts now cite 2.1.3 for the commands→skills merge; `awesome-claude-code` now cited in lesson 02's body; two conceding quiz distractors reworded; two dead TR glossary anchors dropped) and 1 routed to `open_questions` (the missing TR glossary entries).

**Verification.** `npm run gate` OK (168 files) · `npm run typecheck` 0 errors · `npm run lint` clean · `npm test` pass · `npm run build` ends `check-no-inline-script (dist): OK (118 files scanned)` with 5 lesson pages plus the index under `dist/en/l3-advanced/m12-plugins/` and only the index under `dist/tr/...` (TR lessons are drafts) · `check-raw-colors` OK · `check-public-hygiene` OK · `node tools/plan/cli.ts check` OK · Playwright on port 4429 via a temporary `playwright.p29.config.ts` and `e2e/p29-m12.spec.ts` (both deleted afterwards): 28/28 passed at 390 px and 1280 px with 0 serious/critical axe violations. Port 4429 was initially occupied by a stray `python -m http.server 4429` left behind by another process; it was stopped so the assigned port could be used.


