---
id: P48
title: 'Kiln: whole-site visual redesign'
milestone: M4
status: done
owner: lead-opus
branch: plan/48-kiln-redesign
model_hint: opus
effort_hint: high
depends_on: [P45, P47]
owned_paths:
  - docs/design/KILN.md
  - src/styles/**
  - src/components/**
  - src/layouts/**
  - src/pages/**
  - src/lib/i18n/ui.ts
  - src/lib/levels.ts
  - public/favicon.svg
  - e2e/**
shared_paths:
  - astro.config.ts
  - package.json
  - .claude/rules/design.md
  - scripts/check-raw-colors.mjs
estimate: L
updated_at: 2026-09-08T20:18:11Z
open_questions: []
---

## Goal

Replace the site's entire visual language with **Kiln** (`docs/design/KILN.md`): new palette,
type pairing, brand mark and lockup, icon set, three-column documentation layout, and a
rebuilt terminal component. Every page — landing, level, module, lesson, playbook, meta,
design, 404 — in both languages and both themes. **No lesson content changes**: the MDX
tree, transcripts and frontmatter are read-only for this plan; only how they render
changes.

## Context

The first design system shipped with M0 and has aged badly: a mustard accent on cream, a
3×3 grid sigil duplicated in four files, monospace `//` eyebrows used as decoration, a cold
blue-black dark theme against a warm light theme, 32 px tap targets in the theme and OS
tab controls, and — the defect that prompted this plan — transcripts that render shattered.

`docs/design/KILN.md` is the normative specification produced for this plan and is the
single source of truth; it also records the six diagnosed root causes behind the broken
terminal (§8.11) and the rendering defects visible in content (§9). `.claude/rules/design.md`
still describes the old token arrangement and must be brought in line.

## Scope

In: `src/styles/**` (tokens, fonts, globals, prose, shiki), every component under
`src/components/**`, every layout, every page, the brand strings in `src/lib/i18n/ui.ts`,
level hues in `src/lib/levels.ts`, `public/favicon.svg`, the OG card renderer, and the e2e
specs that assert on the chrome. Shared, minimal-diff: `astro.config.ts` (Shiki themes
only), `package.json` (the display face), `.claude/rules/design.md`,
`scripts/check-raw-colors.mjs` (widen it to named colours and `public/`).

Out: `content/**` (all of it), `research/**`, `docs/` except the design directory,
`tools/plan/**`, deploy workflows, and anything that would change what a lesson *says*.

## Deliverables

A rebuilt visual system implementing `docs/design/KILN.md` §2–§8, the content-side
rendering defects in §9 fixed, `/design` re-authored to document the new system, and the
acceptance list in §10 met with real evidence.

## Acceptance criteria

- Every item in `docs/design/KILN.md` §10 holds, with pasted command output.
- A 20-line recorded transcript renders under 600 px tall, scrolls horizontally, and shows
  its role colours; no double frame, no leaked indentation.
- No raw colour literal outside `tokens.css`, including named colours and `public/`.
- Zero serious/critical axe violations at 390 px and 1280 px in both themes, both languages.
- No horizontal page scroll at 320, 360, 390, 768, 1024, 1280, 1440 px.
- Lighthouse budgets in `lighthouserc.json` still met.
- Content diff is empty: `git diff --stat origin/main -- content/` shows no changes.

## Steps

1. Foundations: tokens, fonts, globals, prose sheet, Shiki palette, icon component.
2. In parallel: brand and chrome; layouts; code surfaces (transcript, code block, OS tabs);
   content components.
3. Then: pages (landing, indexes, sections, 404) and the `/design` page.
4. Integration: full build, e2e with axe, Lighthouse, screenshots at 390 and 1280 in both
   themes, then fix everything the sweep finds.
5. Live verification after deploy, then iterate until clean.

## Tests required

`npm run gate`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`,
`node tools/plan/cli.ts check`, `npx playwright test` (axe at both viewports), Lighthouse
on the built site, and a scripted screenshot sweep of every page type at 390/1280 in light
and dark.

## Non-goals / pitfalls

- Do not touch `content/**`. If a lesson looks wrong, the component is wrong.
- Do not reintroduce inline `<script>` bodies; CSP forbids them and the build checks.
- Do not let a page-level `:global()` rule reach inside a component again — that specificity
  mistake is what broke the terminal.
- Do not draw inspiration from the owner's other properties; Kiln is original to this site.
- Keep the `:root[data-theme='dark']` block shape that `src/pages/og/_render.ts` parses, or
  update that parser in the same change.

## Verification

Evidence in the PR: the full gate output, the Playwright/axe summary, Lighthouse scores,
before/after screenshots at both viewports in both themes, and the empty content diff.

## Handoff notes

Executed as a 24-agent dynamic workflow (foundations, four parallel builders, pages,
integration, two review-and-repair rounds) plus a third repair round from the lead's own
visual audit of the built site.

**The terminal defect had three causes, all fixed.** Astro emitted the component's literal
JSX indentation into the `<pre>`, so a multi-line `.map()` body plus `white-space: pre-wrap`
turned each recorded line into about seven physical lines — a 20-line recording rendered
2090 px tall. The lesson route's `.cc-body :global(pre)` then beat the component's own
scoped styles on specificity, adding a second frame and forcing 14 px code against a 13 px
line height. And `pre-wrap` defeated the `overflow-x: auto` that was already there. The
rebuilt component renders the same recording at 358 px with `white-space: pre` and a real
horizontal scroller (measured 4923 px of content in a 556 px viewport).

**Also fixed while here:** the skip link painted its shadow in the top-left corner of every
page because a transform does not clip a shadow; prose tables were clipped at 390 px and
raised an unreported serious axe violation (`scrollable-region-focusable`); the lesson meta
rendered `updated2026-09-07` with no space; objectives lists lost their markers; the header
marked "Meta" as current on `/design/`; and the theme control, OS tabs, lab checkboxes, quiz
radios and curriculum-map headings were all under the 44 px target rule.

**Deliberate decisions the spec left open.** The product name stays "Claude Code Academy" —
renaming the site is the owner's call, not a redesign's; only the lockup, mark and publisher
line changed. Eyebrows on section pages keep a clay tint rather than the muted grey used in
lessons, to separate reference pages from the curriculum. Terminal surfaces are identical in
both themes, so a recording looks the same to every reader.

**Open for the owner.** The design canvas is published at
the owner's private Kiln canvas artifact (URL held outside this repo). `docs/design/CANVAS.md`
still describes the retired system and should be superseded by `KILN.md` in a follow-up, and
`src/pages/og/_render.ts` now reads the new tokens but its card art deserves a second pass
once the mark has lived on the site for a while.
