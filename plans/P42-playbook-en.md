---
id: P42
title: Playbook (EN)
milestone: M3
status: done
owner: lead-opus
branch: plan/42-playbook-en
model_hint: opus
effort_hint: high
depends_on: [P39]
owned_paths:
  - content/en/playbook/**
shared_paths: []
estimate: L
updated_at: 2026-09-08T02:39:41Z
open_questions:
  - 'docs/CURRICULUM.md Playbook section lists seven numbered pages (01-decision-trees ... 07-checklists, with best practices split l1-l2 / l3-l4); this plan Scope named five non-numbered pages plus the index, which is also the set P44 Scope expects. The five were shipped. Does a checklists page (session start / PR / security / release) still ship, and under which plan - and should CURRICULUM.md be corrected to the five-page shape?'
  - 'The a11y acceptance criterion was met with a temporary playwright.p42.config.ts on port 4442 (per the session brief) and the temp files were deleted, so CI does not cover the six Playbook routes: e2e/a11y.spec.ts lists routes explicitly and is outside this plan owned_paths. Appending the six routes to that shared spec is a one-line-per-route change a release or hardening plan should make.'
  - 'EN/TR path parity forced this plan to create four TR stubs outside its owned_paths (content/tr/playbook/{decision-trees,best-practices,anti-patterns,changelog}.mdx); removing them fails npm run gate with four missing-counterpart errors. sectionSchema has no draft field, so the draft: true in those stubs is stripped and the pages render live with a Turkish translation-pending note until P44 translates them. Should the gate learn about section-shaped stubs, or is a visible pending note the accepted convention?'
  - 'The artifacts lesson (m19-01) dates the enableArtifact behaviour changes to 2.1.242, but that version does not exist in the live changelog (it goes 2.1.243 -> 2.1.241). The behaviours check out against the settings reference; only the version does not. Owner or P46 to re-verify and correct the lesson or this page.'
  - 'DecisionTree has no responsive treatment for a wide tree: a ~750px viewBox scales its 12px labels to roughly 6px at 390px. The figcaption screen-reader list keeps the content readable and axe reports no serious/critical violation, but a min-width plus horizontal scroll (or a stacked mobile rendering) in the P08 component would be a real improvement.'
---

## Goal

Build the English Playbook: the cross-cutting reference section every level's lessons link back into, rather than repeat — decision trees (CLAUDE.md vs. rule vs. skill vs. hook vs. agent vs. MCP), a best-practice digest per level, a full anti-pattern catalogue, an English glossary of every kept technical term, and a "Changed since 2025" changelog page collecting every "Changed" note from every lesson in one place (D025, D044, D080, D091, D092).

## Context

Read `docs/CURRICULUM.md` (P03) §Playbook for the page list this plan must ship; `research/deprecations.md` (P03) for the full "Changed" note catalogue this plan's changelog page consolidates; every completed content module's lessons under `content/en/{l1-beginner,l2-intermediate,l3-advanced,l4-master}/**` (all `done` by the time this plan runs, since it depends on P39) for the anti-patterns and "When NOT to use" content already written per-lesson — the Playbook's anti-pattern catalogue aggregates and cross-links these, it does not re-invent them. `DECISIONS.md` D091–D092 (decision trees as inline, theme-aware SVG — reuse the `DecisionTree` component from P08, do not build a new rendering path), D080 (anti-pattern sourcing: official, community, or own-observation, each marked), D025 (best practices embedded in lessons *and* here).

## Scope

In:
- `content/en/playbook/index.mdx` (already exists as P06's section-index stub; replace its placeholder body with a real overview and links to every page below).
- `content/en/playbook/decision-trees.mdx`: at least one `DecisionTree` component instance for "CLAUDE.md vs. rule vs. skill vs. hook vs. agent vs. MCP" (D091) — the tree's branches must reflect real distinctions taught in the corresponding lessons (m03-memory, m06-skills, m07-hooks, m10-subagents, m11-mcp), not an invented simplification.
- `content/en/playbook/best-practices.mdx`: one digest section per level (L1–L4), each a curated list of the strongest practices already taught in that level's lessons, each item linking back to the lesson it came from (D025 — this page indexes and elevates, it does not duplicate full explanations).
- `content/en/playbook/anti-patterns.mdx`: the full catalogue, aggregated from every lesson's "Anti-patterns" section, each entry tagged by source per D080 (official / community / own-observation) and linked back to its originating lesson.
- `content/en/playbook/glossary.mdx`: an English glossary of every technical term the course keeps untranslated in Turkish (D018) — hook, skill, subagent, worktree, plan mode, effort, and so on — each with a short definition and a link to the lesson that introduces it. This is the English-language glossary; it is a distinct file from `content/tr/playbook/glossary.mdx` (which P06 stubbed and P25/P26/P40/P41 have been appending Turkish explanations to) — this plan does not touch the Turkish file (P44 owns finalizing it, informed by this plan's structure).
- `content/en/playbook/changelog.mdx`: every "Changed" note from `research/deprecations.md`, organized by date/version, each a short entry (what changed, since when, what a stale tutorial would get wrong) — this is the page D044 says a deprecated-feature note points to instead of full lesson coverage.

Out: `content/tr/playbook/**` (P44); any lesson content itself (already `done`, this plan only aggregates and links); a new component (reuse `DecisionTree`, `Callout`, etc. from P07/P08 — if the Playbook genuinely needs a new one, write it into `open_questions` naming the gap, do not build it here).

## Deliverables

`content/en/playbook/{index,decision-trees,best-practices,anti-patterns,glossary,changelog}.mdx`.

## Acceptance criteria

- `node scripts/content-gate.ts` passes for the whole `content/en/playbook/**` tree (schema valid, code fences tagged if any, EN/TR parity holds against the existing TR stubs — Playbook TR content itself waits for P44, but the section index/page slugs must already match what P06 scaffolded).
- The decision-tree SVG (via `DecisionTree`, P08) renders correctly in both themes and its text is Ctrl+F-searchable (reusing P08's already-verified accessibility property, not re-testing it from scratch — this plan verifies its *content* is correct, not the component's mechanics).
- Every best-practice and anti-pattern entry links to a real, existing lesson URL (verify none are dead links via `lychee`).
- The changelog page has one entry per item in `research/deprecations.md`'s "Changed" list at minimum.
- `npx playwright test e2e/a11y.spec.ts` against all six Playbook pages shows 0 serious/critical violations at both viewports.

## Steps

1. Read `research/deprecations.md` and draft `changelog.mdx` first (most mechanical, establishes the pattern of citing back to source).
2. Walk every `done` L1–L4 lesson's "Anti-patterns" and best-practice-worthy content; build `anti-patterns.mdx` and `best-practices.mdx` as curated, linked indexes.
3. Design the CLAUDE.md/rule/skill/hook/agent/MCP decision tree against the real distinctions taught across m03/m06/m07/m10/m11; build it with `DecisionTree`.
4. Build `glossary.mdx` from the full list of kept English terms encountered across every lesson (search `content/en/**` for terms flagged in each lesson's first-use explanation, per D018's authoring pattern).
5. Replace `playbook/index.mdx`'s placeholder with a real overview linking all five pages.
6. Run the full local gate, `lychee` on internal links, and the axe check across all six pages.

## Tests required

`content-gate.ts`; `lychee` on this plan's internal cross-links; `e2e/a11y.spec.ts` against all six pages.

## Non-goals / pitfalls

- Do not duplicate a lesson's full explanation here — link to it; the Playbook is an index and a cross-cutting view, not a second copy of the course.
- Do not build a new diagramming approach — reuse `DecisionTree` (P08); if its API cannot express something this page needs, note the gap in `open_questions` rather than hand-rolling a second SVG mechanism.
- Do not touch `content/tr/playbook/**` — even though this plan and the TR glossary share a topic, they are different files owned by different plans.
- Do not invent an anti-pattern or best practice that no lesson actually teaches — every entry traces back to real, already-shipped lesson content.

## Verification

A reviewer opens all six Playbook pages, clicks five random cross-links to confirm they resolve to real lessons, Ctrl+F-searches the decision tree, and reads the changelog against `research/deprecations.md` for completeness.

## Handoff notes

Executed by session `opus-p42-2026-09-08` in worktree `../cct-wt-42`.

### What shipped

Six EN pages under `content/en/playbook/`:

| Page | order | Content |
|---|---|---|
| `index.mdx` | 5 | P06 placeholder body replaced with a real overview linking all five pages |
| `decision-trees.mdx` | 1 | four `DecisionTree` instances (mechanism, guidance, delegation, model/effort) plus a one-line cheat-sheet table |
| `best-practices.mdx` | 2 | 93 practices (L1 15, L2 22, L3 27, L4 29), each linking to its lesson |
| `anti-patterns.mdx` | 3 | 141 entries in nine themes, each tagged per D080 (85 official / 53 own observation / 3 community), plus an index of all 21 module pages |
| `changelog.mdx` | 4 | 25 entries - exactly one per "Changed" row in `research/deprecations.md` |
| `glossary.mdx` | 5 | 58 terms, alphabetical, each linked to the lesson that introduces it |

The catalogue and the digest were built from the real lessons: every `## Anti-patterns` section and
every `<WhenNotToUse>` block in the 119 EN lessons was extracted mechanically, read, and then
curated into themes. Nothing on these pages asserts a fact no lesson teaches, and every entry
carries the lesson link.

### Decisions taken

- **Page set follows this plan, not `docs/CURRICULUM.md`.** See `open_questions` #1 - the curriculum
  wants seven numbered pages, the plan (and P44) want five non-numbered ones. No checklists page.
- **`DecisionTree` reused unchanged** (P08, D091/D092). Four small trees rather than one wide one, so
  each viewBox stays at or below 750px, matching the existing tree in `m03-memory/03-rules`. The page
  imports the component explicitly, because the route that renders section-shaped pages
  (`src/pages/[lang]/[level]/[module]/index.astro`) renders `<Content />` without the MDX component
  map that the lesson route passes.
- **Source tags render inline** as a trailing `· official` / `· community` / `· own observation`,
  with the key defined at the top of the anti-pattern page (D080).
- **The changelog is grouped by kind** (removed / renamed / changed behaviour) with an explicit
  `**Since.**` line per entry, because several `research/deprecations.md` rows have no documented
  version at all and saying so is better than implying an order.

### TR files created outside `owned_paths` - read this first

`npm run gate` enforces EN/TR **path** parity, so four TR twins had to exist:
`content/tr/playbook/{decision-trees,best-practices,anti-patterns,changelog}.mdx`. Removing them was
tested and fails the gate with four `missing TR counterpart` errors, so they are load-bearing, not
optional. They are minimal stubs: a Turkish sentence pointing at the English page plus one paragraph
of what the page will hold. `content/tr/playbook/{index,glossary}.mdx` were **not touched** - a
sibling session was editing the Turkish glossary while this plan ran. **P44 owns finishing all of
them**; the stub slugs and `order:` values already match what P44 Scope expects.

### Review pipeline (D071)

- **fact-checker** (`claude -p`, read-only, findings applied): about 35 risk-bearing claims checked
  with line references and all internal link targets confirmed. **2 WRONG, 1 UNVERIFIABLE, the rest
  CONFIRMED - all three fixed:**
  1. the one-hour background-subagent limit was attributed to "2.1.248, restated in 2.1.260"; a
     direct re-fetch of `changelog.md` shows the entry exists **only at 2.1.260**. Corrected, and the
     entry now quotes the changelog wording;
  2. `disableArtifact` -> `enableArtifact` was dated 2.1.242, a version that **does not exist** in the
     live changelog. The date came from the artifacts lesson's own Changed callout, so the entry now
     attributes the version to the lesson and marks the behaviour as the verified part
     (`open_questions` #4);
  3. "2.1.3, 9 January 2026" for the commands-into-skills merge: the date could not be re-verified
     from the fetched changelog range, so the entry keeps the version and attributes the date.
  Two citation imprecisions inherited from `research/deprecations.md` were corrected as well: the
  `keybindingFlavor` and `/btw` details live on `interactive-mode.md`, not `keybindings.md` or
  `commands.md`.
- **reviewer** (`claude -p`, read-only): CHANGES REQUESTED - 4 blocker, 2 major, 2 minor. Content
  itself passed (links, D080 tags, changelog coverage, hygiene, no fabrication); every finding was
  about scope and process. Resolution: the two metadata findings are fixed by this section and
  `open_questions`; the wording finding is fixed (`index.mdx` now uses D091's six-way list); the
  scope findings - TR stubs, and e2e coverage living in a temporary config rather than in
  `e2e/a11y.spec.ts` - cannot be fixed inside this plan `owned_paths` and are recorded as
  `open_questions` #2 and #3 with the gate output that proves the TR stubs are required.

### Drift found in `research/` (not this plan's files - for the owner / P46)

1. `research/deprecations.md` still holds the Bash-permission-rule row as "Not confirmed ... do not
   teach until re-verified". It is now resolved: the official changelog's **2.1.260** entry says
   rules with text after the closing parenthesis "never matched anything" and are now reported as
   invalid settings. The Playbook changelog carries that, sourced and dated 2026-09-08; the research
   file should be updated (its own closing note anticipates exactly this).
2. That file's header says "verified 2026-09-06" while its body already contains 2026-09-08
   corrections - the header date is stale.
3. Live-docs inconsistency for the next sweep: `interactive-mode.md` still documents a 60-minute
   default for `CLAUDE_SUBAGENT_BG_SHELL_MAX_MS` while `tools-reference.md` and the 2.1.260 changelog
   entry say the limit is gone. The changelog entry is what this page teaches; the disagreement is
   named in the entry itself rather than papered over.

### Verification (all run in this worktree; real output in the PR body)

`npm run gate` (302 files), `npm run typecheck` (0 errors), `npm run lint`, `npm test`
(22 files / 187 tests), `npm run build` (239 files, ending `check-no-inline-script (dist): OK`),
`node scripts/check-public-hygiene.mjs`, `node scripts/check-raw-colors.mjs`,
`node tools/plan/cli.ts check`, and Playwright on a temporary `playwright.p42.config.ts` (port 4442)
with a temporary `e2e/p42-playbook.spec.ts` covering all six EN routes and their six TR twins at
390px and 1280px: **40 passed**, zero serious/critical axe violations. Both temporary files were
deleted afterwards (see `open_questions` #2 for the CI gap this leaves).

Links were verified **mechanically against `dist/`**, not by eye: a throwaway script resolved every
internal link in `content/{en,tr}/playbook/**` to a built `index.html` - **427 links, 0 dead**.

### Follow-ups

- **P44** finishes the four TR stubs and the TR glossary. The EN glossary defines 58 terms; the
  Turkish glossary has 36 headings while TR lessons already link **45** anchors, so at least these
  are missing on the TR side: `artifact`, `auto-memory`, `chord`, `compaction`, `import`,
  `marketplace`, `monorepo`, `renderer`, `routine`, `rule`.
- **Release / hardening plan**: add the six Playbook routes to `e2e/a11y.spec.ts`, and consider a
  "see the Playbook" pointer from the lessons the trees cite (m03, m06, m07, m10, m11) - every one of
  those files belongs to another plan, so this plan did not touch them (D048).
