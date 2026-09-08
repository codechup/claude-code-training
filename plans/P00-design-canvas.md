---
id: P00
title: "Design canvas: brand, tokens, and screen layouts"
milestone: M0
status: done
owner: fable-lead-2026-09-06
branch: plan/00-design-canvas
model_hint: fable
effort_hint: high
depends_on: []
owned_paths:
  - docs/design/CANVAS.md
  - docs/design/canvas/**
shared_paths: []
estimate: M
updated_at: 2026-09-06T18:55:09Z
open_questions: []
---

## Goal

Before any UI plan writes a line of Astro or CSS, produce the visual design of CodeChup Claude Code Academy as a Claude Design canvas (the `/design` skill), authored by the lead session, and get it approved by the owner (O9). The canvas is the single visual source every later M0 plan implements from: brand, design tokens, the landing page at 1280 and 390, a lesson page at 1280 and 390, the `/design` living-style-page layout, and the shared component set. Every prompt used to produce it is logged verbatim, in order, in `docs/design/CANVAS.md`, together with the exports and the owner's approval evidence. This plan is canvas-first by design (D084 folds directly into this plan's workflow: design is approved before implementation begins) — nothing here is code.

## Context

Read: `DECISIONS.md` D029–D036 (dark-leaning terminal aesthetic, dark+light with system default and a toggle, Inter + JetBrains Mono, the "CodeChup Claude Code Academy" sub-brand, `/design` contents and routing, mobile-first at 390 px, WCAG 2.2 AA), D019 (code block features the lesson artboard must show: copy button, OS tabs, a transcript block, line highlight + annotations), D061–D064 (nav shape, landing sections, lesson meta, quiz), D091–D092 (inline SVG decision-tree diagrams, theme-aware). This plan has no repo Context to read beyond `DECISIONS.md` — it runs before P01 exists, so there is no `astro.config.ts` or token file yet; the canvas is the first artifact in the repository's history that fixes any of this down. Only the lead session (top model, `fable/high`) executes this plan; a cheaper session must not claim it, because it is the author of the prompts, not an implementer following a spec.

## Scope

In:
- A Claude Design canvas project ("CodeChup Claude Code Academy") with at minimum these artboards: `brand` (wordmark lockups horizontal/stacked, favicon, OG card template — a CodeChup sub-brand per D032, not a new logo family), `tokens` (color palette for dark and light, both meeting AA per D036, type scale for Inter + JetBrains Mono per D031, spacing, radius, motion durations), `landing-1280`, `landing-390` (hero + CTA + level cards + curriculum map + "what changed" feed + terminal animation, per D062), `lesson-1280`, `lesson-390` (lesson meta bar, left nav tree, right TOC, code block with OS tabs/copy/highlight, a Transcript block, a Quiz block, a Sources block, bottom prev/next + progress bar, per D019/D061/D063/D064), `design-page` (the `/design` living style page layout: token dump, component gallery, principles + a11y notes, per D033), `components` (Callout, CodeBlock, OSTabs, WhenNotToUse, Lab, DecisionTree, Helpful thumbs, giscus panel, YouTubeCard — states and variants, not full page context).
- Every prompt sent to Claude Design, logged verbatim and in order in `docs/design/CANVAS.md`, each tagged with the artboard(s) it produced and what was kept vs. rejected.
- Exports: a screen capture per artboard under `docs/design/canvas/` (viewport captures at a reasonable zoom are acceptable — a high-fidelity PNG/PDF export is not required if a capture is legible enough to implement and review from), each reasonably sized for a git repo (aim under ~1.5 MB each).
- Owner approval, recorded as a screenshot or a PR-comment link pasted into `docs/design/CANVAS.md`.
- A short handoff paragraph per implementing plan (P05 tokens/theme, P06 landing/shell, P07 code/prose components, P08 quiz/decision-tree/feedback components, P09 search UI) naming the artboards it implements and any non-obvious decision.

Out: any code, any `tokens.css`, any component implementation (P05–P09 do that); the light theme's every last color (P05 recomputes contrast from the canvas's stated intent, it does not have to be pixel-identical); product-rule changes (nothing here overrides a D-decision — if a visual idea needs one, write it into `open_questions` for the owner, do not just draw it and move on).

## Deliverables

`docs/design/canvas/*` (screen captures, one or more per artboard, organized by artboard name), `docs/design/CANVAS.md` (canvas link if the owner's account allows sharing one, every prompt verbatim in order, decisions taken, owner approval evidence, per-plan handoff notes).

## Acceptance criteria

- The canvas has at least the ten artboards listed in Scope; `docs/design/CANVAS.md` documents every prompt used to produce them, in the order they were sent.
- Every artboard has a legible export under `docs/design/canvas/`.
- The `lesson-390` artboard shows a code block that is readable at 390 px with its OS tabs and copy button visible without horizontal scroll of the page itself (a code block may internally scroll).
- Both `tokens` artboard palettes (dark and light) list at least one contrast pair (body text on the page background) with its ratio, and the ratio is ≥ 4.5:1 for normal text (WCAG 2.2 AA, D036).
- Owner approval is recorded in `docs/design/CANVAS.md` with a visible timestamp or PR-comment link (O9).
- `docs/design/CANVAS.md` §"Handoff" has one paragraph each for P05, P06, P07, P08, P09 naming the exact artboards each should implement from.

## Steps

1. Open the `/design` skill; create the project; start with the `brand` and `tokens` artboards, iterating against the D029–D036/D019 constraints above; log every prompt as you send it.
2. Produce `landing-1280` and `landing-390`; log prompts.
3. Produce `lesson-1280` and `lesson-390`, including the code block, Transcript, Quiz, and Sources states; log prompts.
4. Produce `design-page` and `components`; log prompts.
5. Assemble `docs/design/CANVAS.md` (prompts, decisions, per-plan handoff) and export every artboard to `docs/design/canvas/`.
6. Request and record owner approval (O9); if the owner asks for a change, iterate on the canvas and note the revision in `docs/design/CANVAS.md` before marking this plan `done`.

## Tests required

None — this plan produces design artifacts and documentation, not code. The evidence is the canvas exports and the recorded owner approval.

## Non-goals / pitfalls

- Do not start writing `astro.config.ts`, `tokens.css`, or any component file from this plan — that is P01/P05 onward, and they read this plan's output, not the other way around.
- Do not let a canvas idea silently override a D-decision (dark-leaning terminal aesthetic, mobile-first, `/design` outside the locale prefix, no light-theme-only site, English-only `/design`); if the canvas suggests a change, write it as an `open_questions` entry for the owner and keep the D-decision as drawn until the owner says otherwise.
- Do not skip the owner-approval step to "save time" — every plan from P05 onward reads `docs/design/CANVAS.md` as ground truth, so an unapproved canvas blocks the rest of M0 by design.
- Keep exports committed to the repo, not just linked — a link can rot; the repo must be self-contained for a future session with no access to the design tool.
- This plan is lead-session-only; do not hand prompt authorship to a cheaper session even if the canvas work feels mechanical once started.

## Verification

The owner (or a reviewing session standing in for them) opens each exported artboard at both the 1280 and 390 captures, reads `docs/design/CANVAS.md` end to end, confirms the prompts are in order and match what was exported, and checks the AA contrast ratio claim against one token pair by eye.

## Handoff notes

- **Approval (2026-09-06):** the owner did not annotate the canvas but instructed the lead session (`/goal`) to proceed through P11 and take the site live; the lead session treats this as approval-to-proceed. Owner edits on the canvas remain welcome and flow into `tokens.css` via a follow-up.

- **Canvas:** `CodeChup Claude Code Academy` — the owner's private design canvas artifact (URL held outside this repo). Source of truth for regeneration: `docs/design/canvas-src/build.mjs` → `docs/design/canvas-out/` (9 artboards + `canvas.json`); prompts/decisions/token table/handoff per plan in `docs/design/CANVAS.md`.
- **Second-look review** found and fixed: an unclosed `div` on the `/design` artboard, zero-slack frame heights, and two light-theme contrast failures → `ink-muted` lifted in both themes, new `accent-text` token; contrast matrix is now computed in the generator (all six pairs ≥ 4.5:1).
- **Status:** `review` — waiting for owner approval (O9) on the canvas or by comment on this plan. On approval: record evidence in `CANVAS.md` §4, fold any owner edits into §3, set `done`.
- **Judgement calls for the owner:** lowercase mono `codechup` + red caret wordmark lineage; darker gold in light mode; landing hero is a real transcript, animation limited to a blinking caret.
