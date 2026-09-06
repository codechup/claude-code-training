---
id: P42
title: Playbook (EN)
milestone: M3
status: todo
owner: null
branch: plan/42-playbook-en
model_hint: opus
effort_hint: high
depends_on: [P39]
owned_paths:
  - content/en/playbook/**
shared_paths: []
estimate: L
updated_at: 2026-09-06T00:00:00Z
open_questions: []
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

- _Filled by the executing session: what changed, decisions, follow-ups, blockers._
