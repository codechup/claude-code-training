---
id: P36
title: "L4 Master module: Visual (m19-visual)"
milestone: M2
status: done
owner: lead-fable
branch: plan/36-l4-m19-visual
model_hint: opus
effort_hint: high
depends_on: [P24]
owned_paths:
  - content/en/l4-master/m19-visual/**
  - content/tr/l4-master/m19-visual/**
  - content/_shared/transcripts/m19-visual/**
shared_paths:
  - content/_shared/sources.json
estimate: L
updated_at: 2026-09-08T00:13:06Z
open_questions:
  - 'Lab tag drift (P22): the m19 sample data `artifacts/` (README.md + task-activity.csv) exists only on `lesson/m19-01-solution`, not on `lesson/m19-01-start`. The 01-artifacts lab therefore instructs `git checkout lesson/m19-01-solution -- artifacts/` after checking out the start tag. Move the directory into `lesson/m19-01-start` (and re-cut `lesson/m19-03-start`) and the extra step can be deleted.'
  - 'Lab tag drift (P22): `lesson/m19-03-start` and `lesson/m19-03-solution` are byte-identical (empty diff). Intentional for a browser-only lab? If a solution state was meant to exist, it was never committed.'
  - 'Inventory drift (P03): `research/feature-inventory.md` Artifacts row says "capabilities (db, users, assets)". The live `artifacts.md` (fetched 2026-09-07) documents exactly one runtime capability for a published page - MCP connector calls. The lessons follow the live doc; the inventory row needs updating.'
  - 'Inventory drift (P03): the built-in slash-command list in `research/feature-inventory.md` omits `/design-login` (documented in the live `commands.md`: authorize design-system access for /design-sync with your claude.ai account).'
  - 'Registry hygiene (owning plan): `content/_shared/sources.json` entry `docs-computer-use` carries `modules: [m19-visual]` but no m19 lesson cites `computer-use.md`. Left untouched by this plan because the entry belongs to another plan; drop the tag or cite the page.'
  - 'Curriculum slug drift (resolved in favour of CURRICULUM): this plan file listed longer slugs (01-artifacts-publish-capabilities-and-comments, 03-chrome-automation-and-gif-recordings). `docs/CURRICULUM.md` section 2 is authoritative and uses `01-artifacts`, `02-design-canvas`, `03-chrome-automation`, `04-dataviz`; the files were written at the CURRICULUM slugs.'
---

## Goal

Author every lesson of Visual (`m19-visual`), the 4-lesson next module of Master (l4-master), in English: the reader publishes a real artifact and a real design canvas, and records a short GIF of a Chrome automation — all shown with real screenshots per the evidence rule (D093), not mockups. Each lesson follows the fixed template (D006): Objectives + prerequisites, When NOT to use, Concept, Hands-on lab, Anti-patterns, Quiz, Sources. Every command shown was actually run against the lab repo and every claim is backed by real output (D093) — this plan produces no lesson content from memory alone.

## Context

Read first: `docs/CURRICULUM.md` (P03) — it is the **authoritative** source for this module's final lesson slugs, objectives, and order; the lesson list below is the floor the approved plan set, not a ceiling. Also read `research/feature-inventory.md` and `research/deprecations.md` (P03) for what is current vs. "Changed" as of `verified_version: 2.1.263`; `content/_shared/sources.json` (P23) for the vetted source list to pull from and append to; `.claude/rules/content.md`, `.claude/skills/new-lesson/SKILL.md` and the `lesson-researcher`/`lesson-writer`/`fact-checker`/`reviewer` agents (all P11) for the exact authoring workflow; `content/schema.ts` (P06) for the frontmatter zod schema; `docs/design/CANVAS.md` and `/design/` (P05) for the lesson-page visual reference; and the outline text this module was scoped from:

> `m19-visual`: artifacts (publish, capabilities, comments) · `/design` canvas · Chrome automation & GIF recordings · dataviz

No lesson in this module exists yet; `content/en/l4-master/m19-visual/**` starts from the level/module `index.mdx` stub P06 created.

Decisions this module leans on beyond the shared pipeline decisions below: .

## Scope

In:
- 4 lesson files under `content/en/l4-master/m19-visual/`, numbered `01-`…`04-`, each a complete MDX file following D006's seven sections.
- The matching Turkish draft stub for each lesson under `content/tr/l4-master/m19-visual/` (`draft: true`, created by the `/new-lesson` skill in the same commit as the EN lesson — D016, D018; P25/P26/P40/P41 translate it later, never this plan).
- One raw lab transcript per lesson with a hands-on lab, saved under `content/_shared/transcripts/m19-visual/`, plus the simplified `<Transcript>` rendering embedded in the lesson (D099).
- This module's entries appended to `content/_shared/sources.json` (D041, D043; append-only — never rewrite another module's entries).
- Updating `l4-master/index.mdx` and `m19-visual/index.mdx` module-index copy if this module's final lesson list differs from the stub P06 left (rare; only if `docs/CURRICULUM.md` changed the outline).

Out: Turkish translation of these lessons (P25/P26/P40/P41 own `content/tr/l4-master/m19-visual/**` after this plan hands it off); any other module's content; MDX component code (P07/P08 own those; if a lesson needs a component that does not exist, write it into `open_questions` and do not build it here); changes to `content/schema.ts`, `src/lib/nav.ts`, or any route/layout file; the lab repo itself (P22 owns `codechup/claude-code-lab`; this plan clones and runs it, never edits it in place — a bug fix needed there goes into `open_questions` naming the tag).

## Deliverables

- `content/en/l4-master/m19-visual/NN-<slug>.mdx` (4 files):
01. **Artifacts: publish, capabilities, and comments** — `01-artifacts-publish-capabilities-and-comments.mdx`
02. **The /design canvas** — `02-design-canvas.mdx`
03. **Chrome automation and GIF recordings** — `03-chrome-automation-and-gif-recordings.mdx`
04. **Dataviz** — `04-dataviz.mdx`
- `content/tr/l4-master/m19-visual/NN-<slug>.mdx` (4 files) — `draft: true` stubs with EN frontmatter fields carried over and `title`/`description` left in English (translation is not this plan's job; the stub exists so routing/parity gates pass).
- `content/_shared/transcripts/m19-visual/NN-<slug>.md` — one per lesson that has a hands-on lab, containing the raw terminal transcript.
- Updated `content/_shared/sources.json` with this module's sources block entries.

## Acceptance criteria

- `node scripts/content-gate.ts` passes for this module: every lesson's frontmatter validates against `content/schema.ts`, every code fence has a language tag, EN/TR path parity holds (the TR draft exists at the same slug), and `level`/`module` in frontmatter match the file path.
- Every lesson has `verified_version: 2.1.263` and a non-empty `sources` array with at least one `type: "doc"` entry whose URL was fetched successfully by `/verify-sources` (D041, D043) — paste the WebFetch/lychee evidence in the PR.
- Every lesson with a hands-on lab has a transcript file under `content/_shared/transcripts/m19-visual/` whose content matches, verbatim, a real run of the commands shown in the lesson (D093, D099) — no lesson may show output that was not captured this way.
- `npm run typecheck && npm run lint && npm test` pass; `npm run build` succeeds and `dist/en/l4-master/m19-visual/` contains 4 lesson pages plus the index.
- `npx playwright test e2e/lesson.spec.ts` passes against at least one lesson in this module (axe: 0 serious/critical violations at 390 px and 1280 px).
- The `fact-checker` agent's report (pasted into the PR) shows no unresolved discrepancy against `research/feature-inventory.md`; the `reviewer` agent's report confirms the D006 template order and the evidence rule on every lesson.

## Steps

1. Read `docs/CURRICULUM.md` §m19-visual and confirm the lesson list/order below still matches; if it drifted, follow the doc, not this plan, and note the delta in Handoff notes.
2. Run the `lesson-researcher` agent once per lesson (D098): official doc URL(s) + 2–3 web/YouTube sources, summarized against `research/feature-inventory.md`; save nothing permanent yet, this feeds step 4.
3. Clone `codechup/claude-code-lab` (P22) into a scratch directory; for every lesson with a hands-on lab, check out its start tag (`lesson/m19-visual-NN-start`), do the exercise for real, and capture the full terminal transcript.
4. Write each lesson MDX with `/new-lesson l4-master/m19-visual/<slug>` (creates the EN file and the TR draft stub together); fill Objectives, When NOT to use, Concept (grounded in the researcher's summary, never invented), Hands-on lab (the exact commands from step 3), Anti-patterns, Quiz, Sources.
5. Save the raw transcript from step 3 under `content/_shared/transcripts/m19-visual/NN-<slug>.md`; embed the simplified version with the `<Transcript>` component (P07) in the lesson.
6. Append this lesson's sources to `content/_shared/sources.json` (P23's schema); run `/verify-sources content/en/l4-master/m19-visual/NN-<slug>.mdx` to stamp `verified_at`.
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

A reviewer opens `npm run dev`, visits each of the 4 lessons at `/en/l4-master/m19-visual/<slug>/`, confirms the OS tabs, transcript, quiz, and sources block render, spot-checks two Sources links by hand, and reads the fact-checker/reviewer agent reports pasted in the PR before merging.

## Handoff notes

Executed by session `opus-p36-2026-09-07` on 2026-09-07/08.

**Written.** Four EN lessons under `content/en/l4-master/m19-visual/`, at the `docs/CURRICULUM.md` §2 slugs (which win over this plan file's longer working titles — see `open_questions`):

| # | File | Duration / difficulty | Lab tag |
|---|---|---|---|
| 01 | `01-artifacts.mdx` | 20 min / core | `lesson/m19-01-start` |
| 02 | `02-design-canvas.mdx` | 20 min / core | `none` |
| 03 | `03-chrome-automation.mdx` | 15 min / core | `lesson/m19-03-start` |
| 04 | `04-dataviz.mdx` | 10 min / advanced | `none` |

Each follows the D006 order (Objectives & prerequisites → `<WhenNotToUse>` → Concept with one worked prompt → `<Lab>` → Anti-patterns → `<Callout variant="changed">` where `research/deprecations.md` has an item → 3–4 `<Quiz>` → Sources rendered from frontmatter). Four matching TR twins were created as `draft: true` stubs with EN frontmatter fields carried over, translated `title`/`description`/`tags` and a one-paragraph Turkish summary — no TR prose beyond that (P25/P26/P40/P41 own the translation).

**Sources.** Every fact comes from a page fetched this session: `artifacts.md`, `chrome.md`, `commands.md`, `skills.md`, `whats-new/2026-w27.md`, `whats-new/2026-w34.md`, plus `docs/llms.txt` to find the last two. `content/_shared/sources.json` gained two new entries (`docs-whats-new-2026-w27`, `docs-whats-new-2026-w34`) and `m19-visual` tags on `docs-commands`, `docs-skills`, `repo-claude-code-lab` and `repo-claude-code-training`; nothing was removed or reordered.

**Transcripts (D093/D099) — seven files, all real, none fabricated.** Under `content/_shared/transcripts/m19-visual/`:

- `01-artifacts/01-lab-setup.txt` — the real tag checkout and the sample CSV.
- `01-artifacts/02-build-page-headless.txt` — `claude -p … --disallowedTools "Artifact"`, which builds the page and publishes nothing.
- `02-design-canvas/01-canvas-out.txt` — this repo's own `/design` output (`docs/design/canvas-out/`, nine artboards, the `.dc.html` shape).
- `03-chrome-automation/01-chrome-flag.txt` — the `--chrome` line from a real `claude --help`.
- `03-chrome-automation/02-browser-tools.txt` — the real `claude-in-chrome` tool list from a headless `--chrome` session.
- `03-chrome-automation/03-list-connected-browsers.txt` — one read-only browser call; no tab was opened, navigated or clicked.
- `04-dataviz/01-dataviz-headless.txt` — a real `/dataviz` invocation with `Write` and `Artifact` denied, so advice only.

**Honest-capture policy applied.** Nothing was published to claude.ai, no browser was driven, and no interactive dialog was reconstructed. The publish prompt, the `/design` canvas editor, the `/chrome` panel and the GIF recording are described in prose with the exact commands to run, and each lesson says so where it applies. The capturing machine carries `"language": "Turkish"` in its user settings, which an `--append-system-prompt` override alone did not beat; every assistant reply in these transcripts was therefore re-captured with a temp `--settings` file containing `{"language": "English"}`, which does win, so no recording shows a learner output they would not see themselves. The absolute temp path is shown as `./english.json` and each header records that redaction.

**Review counts (D071).** `fact-checker`, delegated via `claude -p … --permission-mode plan`: 60+ claims CONFIRMED, **2 WRONG** and **2 UNVERIFIABLE** — all four fixed.

1. `02-design-canvas.mdx` claimed this site's canvas is public; `docs/design/CANVAS.md` marks the canvas link private to the owner's account. Reworded: the write-up and the exported artboards are public, the live canvas is not.
2. `01-artifacts.mdx`'s Changed callout garbled two distinct 2.1.242 facts. Rewritten to state both separately.
3. "pan-and-zoom canvas" appears in no fetched doc — descriptor cut.
4. The exact Windows registry *subkey* for the native messaging host is not documented (only the parent key) — the PowerShell tab now lists the parent key, and the prose says so.

`reviewer`: **1 blocker, 0 majors, 1 minor.** The blocker was a real local username leaking through the `ls -l` line of `02-build-page-headless.txt` (rendered to readers, not merely committed) — redacted to `user`, the header records the redaction, and the lesson's `range` was corrected from `4-10` to `5-11`. The minor (`docs-computer-use` tagged `m19-visual` with no citing lesson) belongs to another plan's registry entry and is routed to `open_questions` rather than edited.

**Verification, all run in this worktree after the fixes.** `npm run gate` → `content gate: OK (200 files checked)`; `npm run typecheck` → 0 errors / 0 warnings (110 files); `npm run lint` → prettier clean plus `check-no-inline-script: OK (73 files scanned)`; `npm test` → 22 files / 184 tests passed; `npm run build` → ends `check-no-inline-script (dist): OK (134 files scanned)` and `dist/en/l4-master/m19-visual/` holds `artifacts`, `chrome-automation`, `dataviz`, `design-canvas` and `index.html`; `node scripts/check-raw-colors.mjs` → OK (77 files); `node scripts/check-public-hygiene.mjs` → `public-hygiene: OK (tracked)`; `node tools/plan/cli.ts check` → ok. Playwright ran on port 4436 from a temporary `playwright.p36.config.ts` plus a temporary `e2e/p36-m19-visual.spec.ts` covering all six m19 routes (five EN plus the TR module index) at 390 px and 1280 px alongside `e2e/a11y.spec.ts`: **26 passed**, 0 axe serious/critical. Both temporary files were deleted afterwards.

**Notes for the next session.** The TR twins are stubs by design — do not treat their summaries as translations. `docs/design/CANVAS.md` and `docs/design/canvas-out/` are cited from lesson 02 as this site's own `/design` worked example; if P00 ever regenerates them, lesson 02's transcript (nine artboards with fixed frames) needs recapturing. Lesson 01's lab carries the extra `git checkout lesson/m19-01-solution -- artifacts/` step only until P22 moves that directory onto the start tag.

