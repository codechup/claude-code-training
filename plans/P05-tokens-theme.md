---
id: P05
title: Tokens and theme from the approved canvas
milestone: M0
status: done
owner: sonnet-p05-2026-09-06
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
updated_at: 2026-09-06T19:48:08Z
open_questions:
  - "docs/design/CANVAS.md §6 says P05 implements the sigil and lockup from build.mjs, but this plan's own owned_paths does not list src/components/brand/** (nor does public/** beyond the single file public/theme-init.js). Per the conservative-reading rule (plans/README.md §8), P05 did NOT create src/components/brand/{Sigil,Lockup}.astro or edit public/favicon.svg — it inlined the exact build.mjs sigil()/lockup() geometry directly into src/pages/design/index.astro's brand section instead (a page-local, non-reusable copy). A follow-up plan (P06, which owns src/layouts/** and the header/footer chrome that will need the sigil/lockup, or a new small plan) should own extracting src/components/brand/Sigil.astro and Lockup.astro and updating public/favicon.svg to the sigil on a bg-0 rounded square. Whoever picks this up should reuse the exact cell coordinates in src/pages/design/index.astro's `sigil()` helper (24-unit grid, cell 6, gap 2, margin 1) so the design page and the real component never drift."
  - "scripts/check-raw-colors.mjs does not exist yet and scripts/** is outside P05's owned_paths, so P05 could not add it. tokens.css documents the no-raw-colour rule in a comment and P05 self-checked manually (grep for hex/rgb literals outside src/styles/tokens.css found none), but there is no automated CI gate for it yet. P04 (continuous integration pipeline) owns scripts/** — flagging this so P04 (or a small follow-up) adds scripts/check-raw-colors.mjs and wires it into `npm run lint`."
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

**What changed**

- `src/styles/tokens.css`: full replacement. Every token from `docs/design/CANVAS.md` §3 (18 colors) plus type scale (11/12/13/14/16/18/20/24/32/40/56, as rem), radii (4/6/10/16), 4-pt spacing scale (4→80), motion (`--dur-1/2/3`, `--ease-out`) and focus (2px/2px, accent) as `--color-*`/`--text-*`/`--radius-*`/`--space-*`/`--dur-*`/`--ease-out`/`--focus-ring-*` custom properties. Light values on bare `:root`, dark values overridden in `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {...} }` and in `:root[data-theme="dark"] {...}` — literally per this plan's own Scope wording (light on `:root`, dark as the override), not the dark-on-`:root` phrasing in some paraphrases of this plan; both blocks are byte-identical for the color tokens by construction.
- `src/styles/fonts.css`: left as the P01 stub wrote it — already correct (verified against the actual `@font-face` `unicode-range` blocks in `node_modules/@fontsource-variable/inter` and `@fontsource/jetbrains-mono`: the base + "latin-ext" ranges together cover ş ğ ı İ ö ü ç).
- `src/styles/app.css`: full replacement. Imports tokens/fonts/shiki, a minimal Tailwind v4 `@theme` bridge, and base resets/typography wired to the tokens (headings, `.eyebrow`, `.mono`, `.caret` with a blink keyframe stopped under `prefers-reduced-motion`, focus-visible ring).
- `src/styles/shiki.css` (new): dual-theme Shiki wiring for `defaultColor: false` (`--shiki-light`/`--shiki-dark` per the two-block pattern), chrome (background/border/radius/font) from `--color-bg-1`/`--color-line`/`--radius-3`/`--font-family-mono`, not from Shiki's own theme background.
- `public/theme-init.js`: kept the P01 logic (already correct) and expanded the comment to document the three-state contract with `ThemeToggle.astro` (`'light'|'dark'` always win; `'system'` or anything else/missing resolves via `matchMedia` — `tokens.css` has no `[data-theme="system"]` block, this file is where "system" always gets resolved to a concrete value before paint).
- `src/components/shell/ThemeToggle.astro`: full replacement — three real `<button>`s (system/dark/light, not one cycling button) with `aria-pressed`, `role="group"`, writes `localStorage['cc:theme']`, live-updates `data-theme`, and follows OS changes live while "system" is selected.
- `src/pages/design/index.astro`: full replacement. Sticky TOC (brand, tokens, type, space, motion, components, transcript, a11y, canvas, changelog — exact order from `docs/design/CANVAS.md` §6/`DesignPage.dc.html`), principles quote, live token swatches + a live 6-pair contrast matrix (both read from `getComputedStyle(document.documentElement)` at view time via a client `<script>`, re-run on `data-theme` mutation and on OS-preference change — never a hand-typed value, so it cannot drift from `tokens.css`), type scale + Turkish glyph check (rendered in both Inter and JetBrains Mono), spacing/radii swatches, motion tokens + button rest/hover/focus/disabled states, `components`/`transcript` sections left as explicit "pending — lands in P07/P08" placeholders (per this plan's non-goals — no fake Callout/CodeBlock/Quiz/Transcript), a11y rules list, a link to the canvas artifact, and a changelog entry `2026.09.1`.

**Decisions taken**

- Light-on-`:root`, dark-as-override (not the reverse) — followed this plan's own literal Scope wording over a paraphrase that said the opposite; CSS behavior is identical either way once `theme-init.js` resolves `data-theme` before paint, so this is a documentation-fidelity choice, not a product one.
- Tailwind v4 `@theme` bridge only re-exposes the *old* placeholder names still used by other-plans' already-merged files (`bg-bg`, `text-fg`, `text-fg-muted`, `border-border`, `text-link`, `font-mono`/`font-sans` — see `Header.astro`, `Footer.astro`, `LangSwitch.astro`, `Base.astro`, `404.astro`, `src/pages/[lang]/**`, all outside `owned_paths`), each mapped to a *differently-named* canvas token (e.g. `--color-bg: var(--color-bg-0)`). Deliberately did **not** also declare `--color-bg-0: var(--color-bg-0)` etc. for the canvas names themselves — that is a self-referencing CSS custom property (a real cycle, invalid at computed-value time; verified empirically by inspecting the compiled `dist/_astro/*.css`, where Tailwind's `@theme` output lives in `@layer theme` and tokens.css's plain `:root` — unlayered — correctly wins the cascade). Canvas-named tokens (`--color-bg-0`, `--color-ink`, …) are used directly via `var()` everywhere including `/design/`; nothing needed a same-named Tailwind utility class.
- `--font-sans`/`--font-mono` in tokens.css would have collided with Tailwind's own default theme keys of the same name, so the raw properties are named `--font-family-sans`/`--font-family-mono` in tokens.css, bridged to Tailwind's `--font-sans`/`--font-mono` in `app.css`'s `@theme` block (safe: different names, no cycle).
- Brand (sigil/lockup) and `public/favicon.svg`: **not built as reusable components** — see `open_questions` above; inlined once, page-locally, in `/design/`'s brand section instead, using the exact cell geometry from `docs/design/canvas-src/build.mjs`'s `sigil()` (with `currentColor` for ink cells and `var(--color-accent)` for the gold cell, so one markup works in both themes without a per-theme literal export).
- The "components"/"transcript" TOC sections show real button/chip/kbd primitives (matching `DesignPage.dc.html`'s own "Components · every state" — rest/hover/focus/disabled) but explicitly mark the full MDX vocabulary (Callout, CodeBlock, Quiz, Transcript, DecisionTree) as pending for P07/P08, per this plan's non-goals.
- The tokens-section copy originally claimed all 6 contrast pairs must hit ≥4.5:1; corrected after computing real ratios — `caret` (prompt caret / "Changed" callout border, a large glyph/UI marker, not paragraph text) is 3.8:1 in the light theme, clearing only the ≥3:1 large-text/UI floor, not ≥4.5:1. This is inherited verbatim from the approved `CANVAS.md` §3 values (not something this plan changed) and matches `build.mjs`'s own two-tier "AA pass"/"AA large only" badge logic — flagged transparently on the page and here rather than silently rounded up.

**Verification performed (real output, see PR body for full transcripts)**

- `npm run typecheck && npm run lint && npm run gate && npm test && npm run build` all green.
- `node tools/plan/cli.ts check` → `ok: 48 plans, frontmatter valid, DAG acyclic, no owned_paths overlap, STATE.md fresh`.
- Playwright (chromium, already a devDependency) against `astro preview`'s static output, both viewports (390/1280) × both `colorScheme` preferences: `document.documentElement.scrollWidth <= clientWidth` in all four combinations (no horizontal overflow).
- No-FOUC: fresh context, `colorScheme: 'dark'`, no stored key → `data-theme="dark"` and the correct dark `body` background color are already present at first evaluated paint (no client-side flash observed). Explicit override (clicking "Light") persists across `page.reload()` even though the OS preference stayed dark; switching back to "System" restores OS-driven behavior.
- Live contrast matrix cross-checked against an independent Node computation of the same WCAG relative-luminance formula from `build.mjs`: dark theme 16.1/8.3/5.4/9.2/9.8/5.9 (:1), light theme 16.0/8.2/5.4/7.0/5.9/3.8 (:1) — all pass ≥4.5:1 except light-theme `caret` (3.8, ≥3:1 only — see Decisions above).
- `@axe-core/playwright` against `/design/` at 390px and 1280px: 0 violations at both (42 and 41 passing checks respectively) after fixing three issues this plan introduced: two inline links relying on color alone inside a sentence (`link-in-text-block` — added `text-decoration: underline` and switched to `--color-ink`), a horizontally-scrollable contrast-table wrapper with no keyboard access (`scrollable-region-focusable` — added `tabindex="0" role="region" aria-label="…"`), and the AA-result badge text using `--color-success`/`--color-warning` directly as small text on `bg-0` in the light theme, which is below 4.5:1 (`color-contrast` — result text now always renders in `--color-ink`, the semantic color is now a decorative, non-text status dot only).
- Turkish glyph check: `Değişiklik: çşğıöü ÇŞĞİÖÜ — ışık, güneş, hüzün.` renders in both Inter and JetBrains Mono on `/design/` (confirmed present, no tofu, in the built `dist/design/index.html`).

**Follow-ups / blockers**

- See `open_questions` above: reusable `src/components/brand/{Sigil,Lockup}.astro` + `public/favicon.svg` update (candidate owner: P06 or a new small plan), and `scripts/check-raw-colors.mjs` + wiring into `npm run lint` (candidate owner: P04).
- Not blocked. No changes needed to `docs/design/CANVAS.md` (not in this plan's `shared_paths`) or `src/layouts/Base.astro` (P06's file; already wires `theme-init.js` and `favicon.svg` correctly, no change requested).
