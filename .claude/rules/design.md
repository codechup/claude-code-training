---
paths:
  - 'src/**/*.astro'
  - 'src/**/*.css'
  - 'src/**/*.ts'
  - 'src/**/*.tsx'
  - 'public/**'
---

# Design and front-end rules

The approved design is **`docs/design/KILN.md`** — warm paper, dark ink, one clay accent, and
terminals that actually look like terminals. It is normative: if a screen disagrees with it, the
screen is wrong. `src/styles/tokens.css` is derived from KILN §2 and §4 and is the only place a
colour value is written down. (`docs/design/CANVAS.md` is the superseded first system; do not build
against it.)

## Tokens only

- **No raw colour literals** outside `src/styles/tokens.css` — no `#rrggbb`, no
  `rgb()`/`hsl()`/`oklch()`, and no named CSS colours (`black`, `white`, `red`, …) in components,
  layouts, pages, inline styles or files under `public/`. Use the `--cc-*` custom properties, or the
  Tailwind utilities aliased to them in `src/styles/app.css`.
- Token names are the Kiln names: `--cc-paper`, `--cc-paper-raised`, `--cc-paper-sunken`,
  `--cc-line`, `--cc-line-strong`, `--cc-ink`, `--cc-ink-muted`, `--cc-ink-faint`, `--cc-accent`
  (+ `-hover`, `-wash`, `-line`, `--cc-on-accent`), `--cc-ok` / `--cc-warn` / `--cc-danger` /
  `--cc-info` (each with `-wash` and `-line`), the theme-independent `--cc-term-*` palette, and
  `--cc-level-1…4`. Sizes, spacing, radii, motion and elevation follow the same prefix:
  `--cc-text-*`, `--cc-space-1…16`, `--cc-radius-{sm,md,lg,xl,pill}`, `--cc-dur{,-fast,-slow}`,
  `--cc-ease`, `--cc-shadow-1` / `--cc-shadow-2`, `--cc-focus-*`, `--cc-tap`.
- Add a token if one is genuinely missing, and record the addition in the plan's Handoff notes.
- **Theme arrangement (KILN §2.4).** Light values sit on bare `:root`. Dark is redefined in exactly
  two places and nowhere else: `@media (prefers-color-scheme: dark) { :root:not([data-theme='light']) { … } }`
  for the system preference, and `:root[data-theme='dark']` for the explicit toggle, which wins by
  specificity and source order. A colour must never be defined for the _first_ time inside a dark
  block. Never branch on theme in a component — swap the token value instead.
  `src/pages/og/_render.ts` parses the `:root[data-theme='dark']` block at build time, so keep it a
  flat list of `--name: value;` declarations, one per line.
- The `--color-*` names at the end of `tokens.css` are a **temporary** compatibility layer from the
  pre-Kiln system. Nothing new may be written against them.
- `scripts/check-raw-colors.mjs` enforces all of this in `npm run lint` and CI, over `src/**` and
  `public/**`.

## Type and icons

- Three faces, from `src/styles/fonts.css`: **Fraunces Variable** for display (hero, h1, h2,
  wordmark, level names — never body copy), **Inter Variable** for UI and prose, **JetBrains Mono**
  for code, paths, commands and terminal output — and nothing else. Latin **and latin-ext** subsets
  are mandatory so Turkish renders correctly (ı İ ş ğ ç ö ü) in every face at every weight.
- The retired mannerisms stay retired (KILN §3.3): no `//` eyebrow prefix, no monospace section
  labels, no letter-spaced monospace headings. An eyebrow is `--cc-text-micro`, Inter, uppercase,
  `--cc-ink-faint`.
- Prose measure is capped at `--cc-measure` (68ch).
- **Icons come from `src/components/ui/Icon.astro`** and nowhere else — one set, 24×24 viewBox,
  1.75 stroke, round caps and joins, `currentColor`. Never paste an ad-hoc glyph or pull in an icon
  library (the CSP forbids external scripts). Decorative icons are `aria-hidden`; an icon-only
  control carries the accessible name on the control.

## Layout and accessibility

- **Mobile-first at 390 px** (D035). Every page must be correct and usable at 390 px wide before any
  desktop breakpoint is considered. No horizontal page scroll at 320, 360, 390, 768, 1024, 1280 or
  1440 px; wide content (tables, code, transcripts, diagrams) scrolls inside its own
  `overflow-x: auto` container.
- **WCAG 2.2 AA** (D036), checked with axe in Playwright: zero serious or critical violations at
  390 px and 1280 px in both themes. Text contrast ≥ 4.5:1 (≥ 3:1 for large text and UI
  boundaries); body prose aims past 7:1. Clay as _text_ is `--cc-accent`, which clears AA on
  `--cc-paper`; `--cc-ink-faint` does not, so it is for micro labels beside another signal, never
  for running text.
- **Touch targets ≥ `--cc-tap` (44 px)** for every interactive element, including icon-only
  buttons, nav rows, chips, the language and theme controls, quiz options and pagination.
- Focus is always visible: `:focus-visible` gets a 2 px `--cc-accent` outline at 2 px offset, from
  the global rule in `app.css`. Never `outline: none` without an equivalent replacement.
- `.sr-only` is defined once, globally, in `app.css`. Components must not redefine it.
- Semantic HTML first: real `<button>`, `<a href>`, `<nav>`, one `<h1>` per page, headings in order,
  every image with meaningful `alt` (empty `alt=""` only for decoration).
- Never convey state by colour alone — pair it with an icon, label or shape.

## Motion

- Durations and easings come from the motion tokens (`--cc-dur-fast` 120 ms, `--cc-dur` 200 ms,
  `--cc-dur-slow` 320 ms, `--cc-ease`). Motion explains; it never decorates.
- Only the terminal caret animates. Everything else is a short transition, not an animation.
- **Everything animated is wrapped in `@media (prefers-reduced-motion: no-preference)`**, or
  disabled inside `@media (prefers-reduced-motion: reduce)`. Test both states.

## Content Security Policy

- **No inline `<script>` bodies.** The site ships `script-src 'self'`; an inline script body is
  blocked at runtime. Put behaviour in a real module under `src/` or `public/` and reference it by
  `src=`. `astro.config.ts` sets `vite.build.assetsInlineLimit: 0` so Astro does not inline hoisted
  scripts — keep that when adding search, analytics or anything script-shaped.
- `scripts/check-no-inline-script.mjs` runs in `npm run lint` and again against `dist/` in
  `postbuild`. Zero inline scripts is the passing condition, not "few".
- No third-party script tags, no external font or CSS hosts: fonts are bundled via `@fontsource*`.

## Content is read-only

`content/**` — lessons, frontmatter, transcripts — is not a design surface. If a lesson renders
wrong, the component is wrong (KILN §9). Never edit an MDX file to fix a layout.

## Evidence for UI changes

A PR that touches rendered pages pastes real output from `npx playwright test` (including axe) and
attaches screenshots at **390 px and 1280 px, in both themes**. Screenshots are attached to the PR,
never committed to the repo.
