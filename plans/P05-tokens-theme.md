---
id: P05
title: Tokens and theme from the approved canvas
milestone: M0
status: todo
owner: null
branch: plan/05-tokens-theme
model_hint: sonnet
effort_hint: medium
depends_on: [P00, P01]
owned_paths:
  - src/styles/**
  - public/theme-init.js
  - src/components/shell/ThemeToggle.astro
  - src/pages/design/**
shared_paths: []
estimate: M
updated_at: 2026-09-06T00:00:00Z
open_questions: []
---

## Goal

Turn the approved design canvas (`docs/design/CANVAS.md`, P00) into real, working CSS and the first live `/design/` page: `src/styles/tokens.css` (dark + light custom properties, following the system by default), `src/styles/fonts.css` (self-hosted Inter + JetBrains Mono, latin + latin-ext), `src/styles/app.css` and `src/styles/shiki.css` (dual-theme code highlighting, `defaultColor: false`), a flash-free `public/theme-init.js` blocking script, a working `ThemeToggle.astro`, and a `/design/` skeleton that already shows the token dump and the design principles/a11y rules (D033) even before P07/P08's components exist to fill out its gallery section.

## Context

Read `docs/design/CANVAS.md` and its `tokens`/`design-page` artboard exports (P00) — token values, both palettes, contrast pairs — plus `DECISIONS.md` D029–D036 (aesthetic, theme modes, typography, brand, `/design` contents and EN-only routing outside the locale prefix, mobile-first at 390 px, WCAG 2.2 AA). This plan's files currently exist only as P01 stubs (`src/styles/*.css` near-empty, `src/pages/design/index.astro` a placeholder, `ThemeToggle.astro` a no-op, `public/theme-init.js` a no-op) — this plan replaces their content in place and becomes their permanent owner. `src/layouts/Design.astro` is P06's file (it owns all layouts); if `/design/` needs a layout change, write the exact change needed into this plan's Handoff notes for P06 rather than editing the layout file yourself.

## Scope

In:
- `src/styles/tokens.css`: every custom property from the canvas's `tokens` artboard, under `:root` for light values and re-declared under both `@media (prefers-color-scheme: dark)` (guarded `:root:not([data-theme="light"])`) and `:root[data-theme="dark"]` (for the explicit toggle) — never only in one place, per the theme-authoring rule that a variable must have a `:root` (light) definition and be overridden, not defined only, in a dark block.
- `src/styles/fonts.css`: `@fontsource-variable/inter` and `@fontsource/jetbrains-mono` imports, latin + latin-ext subsets (Turkish ş/ğ/ı/İ must render correctly — verify by rendering a Turkish string in the `/design/` page itself).
- `src/styles/app.css`: base element resets and typography scale wired to the tokens; `src/styles/shiki.css`: Shiki's dual-theme CSS-variables output wired to the same tokens so code blocks match the site theme exactly.
- `public/theme-init.js`: a tiny external, non-module, blocking script (no FOUC) that reads `localStorage['cc:theme']`, falls back to system preference, and sets `data-theme` on `<html>` before first paint; wrapped in try/catch (private browsing can throw on storage access).
- `src/components/shell/ThemeToggle.astro`: a real toggle (dark/light/system) that writes `localStorage['cc:theme']` and updates `data-theme` live, keyboard-operable, with a visible focus ring.
- `src/pages/design/index.astro`: EN-only, outside the locale prefix (route is `/design/`, not `/en/design/`); shows the token dump (rendered from the actual CSS custom properties, not hand-copied values, so it cannot drift), the design principles and a11y rules from the canvas, and a placeholder gallery section clearly marked "components land in P07/P08" (do not fake components that do not exist yet).

Out: any MDX component (P07/P08); `src/layouts/**`, `src/lib/**`, navigation, or any route other than `/design/` (P06); the canvas itself (P00, already approved); Pagefind/SEO (P09).

## Deliverables

`src/styles/{tokens,fonts,app,shiki}.css`, `public/theme-init.js`, `src/components/shell/ThemeToggle.astro`, `src/pages/design/index.astro`.

## Acceptance criteria

- `npm run build` succeeds; `/design/` renders at both 390 px and 1280 px with no horizontal scroll of the page body.
- Loading `/design/` (or any page) with dark-mode system preference, then reloading, never shows a flash of the wrong theme (manually verify with browser devtools' "Emulate CSS prefers-color-scheme" toggle plus a hard reload); `ThemeToggle` overrides the system preference and the override persists across a reload.
- Every color used in `app.css`/`shiki.css` for text-on-background pairs meets WCAG 2.2 AA (≥ 4.5:1 normal text, ≥ 3:1 large text/UI) in both themes — recompute and note the ratios for at least the body-text pair and one accent pair in the PR.
- `npm run lint` (including `scripts/check-raw-colors.mjs` once P04 exists, or a manual self-check against the same rule before then) reports no raw color literal outside `tokens.css`.
- A Turkish string containing ş, ğ, ı, İ, ö, ü, ç renders correctly (no tofu/missing-glyph boxes) in both Inter and JetBrains Mono on the `/design/` page.
- `npx playwright test e2e/a11y.spec.ts` (once P04 exists) passes against `/design/` at both viewports with 0 serious/critical axe violations; before P04 exists, run `axe-core` manually against `/design/` and paste the result.

## Steps

1. Extract every token value from `docs/design/CANVAS.md`'s `tokens` artboard export into `tokens.css`, both themes, in the two-block pattern (system-media guard + explicit `data-theme` override).
2. Wire `fonts.css`; render a Turkish pangram-ish string somewhere on `/design/` to prove latin-ext works.
3. Write `theme-init.js` and `ThemeToggle.astro`; test the no-flash property by hand (devtools scheme emulation + hard reload) and note the steps taken in Handoff notes.
4. Write `app.css`/`shiki.css` against the tokens; build a couple of representative elements (heading, paragraph, code block) on `/design/` to sanity-check contrast.
5. Build out `/design/` itself: token dump rendered from computed styles (not hard-coded), principles/a11y text from the canvas, and the placeholder gallery section.
6. Compute and record AA contrast ratios for the pairs in Acceptance criteria; run the manual/automated axe check; paste everything into the PR.

## Tests required

Manual/automated axe run against `/design/` (via Playwright once P04 exists, otherwise the standalone axe CLI); a documented no-FOUC check; a documented Turkish-glyph rendering check; `npm run build` green.

## Non-goals / pitfalls

- Do not hard-code a token value in two places (CSS custom property + a hand-typed number in `/design/`'s dump) — the dump must read the computed value so it cannot silently drift from `tokens.css`.
- Do not define a dark-only token with no light `:root` definition, and do not put a token's only definition inside a `@media`/`[data-theme]` block — both break the light default and the explicit-toggle path respectively.
- Do not build any real lesson-facing component here (Callout, CodeBlock, Quiz, …) — this plan is tokens/theme/`/design/`-skeleton only.
- Do not add `/design/` under a locale prefix — it is `/design/`, not `/en/design/` (D034).
- Do not skip the Turkish-glyph check — `latin-ext` must be an explicit subset choice, not an assumption.

## Verification

A reviewer opens `/design/` at 390 and 1280, toggles the theme three ways (system/dark/light), reloads mid-dark-mode to confirm no flash, reads the pasted contrast ratios against the canvas's own stated values, and looks at the rendered Turkish string for glyph correctness.

## Handoff notes

- _Filled by the executing session: what changed, decisions, follow-ups, blockers._
