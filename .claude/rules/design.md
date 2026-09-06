---
paths:
  - 'src/**/*.astro'
  - 'src/**/*.css'
  - 'src/**/*.ts'
  - 'src/**/*.tsx'
  - 'public/**'
---

# Design and front-end rules

The approved design is `docs/design/CANVAS.md` (D084). `src/styles/tokens.css` is derived from its
§3 table and is the only place a colour value is written down.

## Tokens only

- **No raw colour literals** outside `src/styles/tokens.css` — no `#rrggbb`, no `rgb()`/`hsl()`,
  no named CSS colours in components, layouts, pages or inline styles. Use the `--color-*` custom
  properties (or the Tailwind utilities mapped to them).
- The same applies to spacing, radii, type scale and motion: use the token, add a token if one is
  genuinely missing, and record the addition in the plan's Handoff notes so CANVAS §3 can follow.
- Both themes are defined by tokens: dark on `:root`, light on `[data-theme='light']` (D030). Never
  branch on theme in a component — swap the token value instead.
- `scripts/check-raw-colors.mjs` enforces this in `npm run lint` and CI.

## Layout and accessibility

- **Mobile-first at 390 px** (D035). Every page must be correct and usable at 390 px wide before
  any desktop breakpoint is considered. No horizontal page scroll; wide content (tables, code,
  diagrams) scrolls inside its own `overflow-x: auto` container.
- **WCAG 2.2 AA** (D036), checked with axe in Playwright. Text contrast ≥ 4.5:1 (≥ 3:1 for large
  text and UI boundaries). Gold as _text_ uses `--color-accent-text`, not `--color-accent` — raw
  gold fails AA on light paper.
- **Touch targets ≥ 44 px** on phone for every interactive element, including icon-only buttons,
  language and theme toggles, quiz options and pagination.
- Focus is always visible: 2 px accent outline at 2 px offset. Never `outline: none` without an
  equivalent replacement.
- Semantic HTML first: real `<button>`, `<a href>`, `<nav>`, one `<h1>` per page, headings in
  order, every image with meaningful `alt` (empty `alt=""` only for decoration).
- Never convey state by colour alone — pair it with an icon, label or shape.

## Motion

- Durations and easings come from the motion tokens (`--dur-1/2/3`, `--ease-out`).
- Only the terminal caret blinks. Everything else is a short transition, not an animation.
- **`prefers-reduced-motion: reduce` must stop it** — the caret blink, the hero's typed-line
  reveal, and every transition. Guard animation in a `@media (prefers-reduced-motion: no-preference)`
  block, or disable it inside `@media (prefers-reduced-motion: reduce)`. Test both states.

## Content Security Policy

- **No inline `<script>` bodies.** The site ships `script-src 'self'`; an inline script body is
  blocked at runtime. Put behaviour in a real module under `src/` or `public/` and reference it by
  `src=`. `astro.config.ts` sets `vite.build.assetsInlineLimit: 0` so Astro does not inline hoisted
  scripts — keep that when adding search, analytics or anything script-shaped.
- `scripts/check-no-inline-script.mjs` runs in `npm run lint` and again against `dist/` in
  `postbuild`. Zero inline scripts is the passing condition, not "few".
- No third-party script tags, no external font/CSS hosts: fonts are bundled via `@fontsource*`.

## Evidence for UI changes

A PR that touches rendered pages pastes real output from `npx playwright test` (including axe) and
attaches screenshots at **390 px and 1280 px**. Screenshots are attached to the PR, never committed
to the repo.
