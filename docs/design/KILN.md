# Kiln — the design language of cc.codechup.com

Kiln replaces the first design system wholesale. It is warm paper, dark ink, one clay
accent, and terminals that actually look like terminals. Nothing here is inherited from
any other CodeChup property; the palette, the type pairing, the mark and the layout were
drawn for this site.

**Reference point.** The course teaches Claude Code, so the surface should feel adjacent
to the tools it teaches: a cream canvas rather than the blue-slate every other AI product
uses, a single warm accent used sparingly, editorial serif headlines over a neutral sans,
and dark surfaces reserved for code. The three-column documentation layout (rail, prose,
context) is the pattern developers already know from the best docs sites, and it is what
this site adopts.

Everything below is normative. If a screen disagrees with this document, the screen is
wrong.

---

## 1. Principles

1. **The prose is the product.** Chrome recedes: hairlines over boxes, space over rules,
   one accent instead of five. A lesson page should read like a well-set book with a
   terminal beside it.
2. **Terminals are dark, always.** In both themes. A recorded session is a physical
   artefact of the course (D070, D099) and it gets a real terminal surface, never a
   washed-out paragraph.
3. **One accent, spent carefully.** Clay marks the interactive and the current. If
   everything is clay, nothing is.
4. **Warm neutrals only.** Every grey carries a little red-yellow. No blue-grey anywhere,
   in either theme.
5. **Mobile is the same page, not a lesser one.** At 390 px every affordance survives:
   brand, search, language, theme, navigation, progress.
6. **Motion explains, never decorates.** 120–320 ms, ease-out, and nothing at all under
   `prefers-reduced-motion`.
7. **Contrast is a floor, not a target.** WCAG 2.2 AA minimum everywhere; body text aims
   past 7:1.

---

## 2. Colour

All colour ships as custom properties in `src/styles/tokens.css`. No raw hex, `rgb()` or
`hsl()` literal may appear in any other file — `scripts/check-raw-colors.mjs` enforces it.

### 2.1 Ramps (source values)

Warm neutral ramp, from paper to ink:

| Token | Light | Dark |
|---|---|---|
| `--cc-paper` | `#FAF8F3` | `#12100E` |
| `--cc-paper-raised` | `#FFFFFF` | `#1A1714` |
| `--cc-paper-sunken` | `#F2EEE5` | `#0C0A09` |
| `--cc-line` | `#E5DED1` | `#2C2723` |
| `--cc-line-strong` | `#D3C9B8` | `#3D3630` |
| `--cc-ink` | `#171412` | `#F4EFE8` |
| `--cc-ink-muted` | `#57504A` | `#B0A498` |
| `--cc-ink-faint` | `#847A70` | `#7E736A` |

Clay accent:

| Token | Light | Dark |
|---|---|---|
| `--cc-accent` | `#B75434` | `#E08A66` |
| `--cc-accent-hover` | `#9C4429` | `#EDA184` |
| `--cc-accent-wash` | `#F7EAE3` | `#2A1A13` |
| `--cc-accent-line` | `#E8C9B8` | `#4A2C1E` |
| `--cc-on-accent` | `#FFFFFF` | `#1B0F09` |

Semantic:

| Token | Light | Dark | Use |
|---|---|---|---|
| `--cc-ok` | `#2F6B4A` | `#6FBF92` | verified, passed, success callout |
| `--cc-warn` | `#8A5B12` | `#E0B25E` | changed/deprecated callout |
| `--cc-danger` | `#A33224` | `#F08A7A` | anti-pattern, destructive |
| `--cc-info` | `#2B5D75` | `#7FB8D1` | note callout |

Each semantic colour also gets `-wash` (tinted surface) and `-line` (border) variants,
derived the same way as the accent.

### 2.2 Terminal surface (identical in both themes)

| Token | Value |
|---|---|
| `--cc-term-bg` | `#17130F` |
| `--cc-term-bar` | `#221C17` |
| `--cc-term-line` | `#33291F` |
| `--cc-term-fg` | `#EDE4D8` |
| `--cc-term-dim` | `#9C8F80` |
| `--cc-term-prompt` | `#E0A06A` |
| `--cc-term-tool` | `#8FB8C9` |
| `--cc-term-ok` | `#8CC79E` |
| `--cc-term-err` | `#EC8A78` |
| `--cc-term-path` | `#D9C48A` |

### 2.3 Level hues

Wayfinding only: the level chip, the rail marker, the progress ring. Never a background
fill larger than a chip.

| Level | Light | Dark |
|---|---|---|
| L1 Beginner | `#3F7A5E` | `#77C39C` |
| L2 Intermediate | `#2F6585` | `#7FB4D4` |
| L3 Advanced | `#6B4A93` | `#B394DA` |
| L4 Master | `#9A5A1F` | `#DFA357` |

### 2.4 Theme switching

`:root` carries the light values. Dark is redefined in exactly two places and nowhere
else: `@media (prefers-color-scheme: dark)` guarded as `:root:not([data-theme='light'])`,
and `:root[data-theme='dark']`. A colour must never be defined for the first time inside
one of those blocks.

---

## 3. Type

### 3.1 Faces

| Role | Face | Package | Notes |
|---|---|---|---|
| Display | **Fraunces Variable** | `@fontsource-variable/fraunces` | `wght` + `opsz`; `SOFT 0`, `WONK 0`. Headings, hero, wordmark, level names. |
| UI / body | **Inter Variable** | `@fontsource-variable/inter` | already installed |
| Code | **JetBrains Mono** | `@fontsource/jetbrains-mono` | already installed |

Latin **and latin-ext** subsets are mandatory (ı İ ş ğ ç ö ü). Self-hosted, preloaded for
the display and body faces, `font-display: swap`, with a real fallback stack on every
declaration. Fraunces is loaded for display only — never for body copy.

### 3.2 Scale

Fluid, clamped, 8 steps. `--cc-text-*` tokens:

| Token | Min → Max | Face | Tracking | Use |
|---|---|---|---|---|
| `display` | 2.5 → 4rem | Fraunces 600 | −0.02em | hero only |
| `h1` | 2 → 2.85rem | Fraunces 600 | −0.018em | page title |
| `h2` | 1.5 → 1.95rem | Fraunces 600 | −0.012em | section |
| `h3` | 1.2 → 1.35rem | Inter 650 | −0.005em | subsection |
| `lead` | 1.06 → 1.18rem | Inter 400 | 0 | deck under a title |
| `body` | 1 → 1.0625rem | Inter 400 | 0 | prose |
| `small` | 0.875rem | Inter 450 | 0.005em | meta, captions |
| `micro` | 0.75rem | Inter 600 | 0.06em | chips, eyebrows (uppercase) |

Line heights: display/h1/h2 `1.1`, h3 `1.3`, body `1.7`, small `1.55`, code `1.65`.
Prose measure is capped at **68ch**.

### 3.3 Retired mannerisms

The `//` eyebrow prefix, monospace section labels, and letter-spaced monospace headings
are gone. Eyebrows are `micro` in Inter, uppercase, `--cc-ink-faint`, no punctuation
prefix. Monospace is for code, paths, commands and terminal output — nothing else.

---

## 4. Space, radius, elevation, motion

- **Space**: 4 px base. `--cc-space-1 … -16` = 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80,
  96 px. Section rhythm on a lesson page is `--cc-space-9` (48) between blocks,
  `--cc-space-11` (80) between major sections.
- **Radius**: `--cc-radius-sm` 6, `-md` 10, `-lg` 14, `-xl` 20, `-pill` 999.
- **Elevation**: two only. `--cc-shadow-1` (resting card) and `--cc-shadow-2` (overlay,
  drawer, command palette), both warm-tinted, never neutral black. Cards prefer a
  `--cc-line` hairline over a shadow; shadows are for things that float.
- **Motion**: `--cc-dur-fast` 120 ms, `--cc-dur` 200 ms, `--cc-dur-slow` 320 ms;
  `--cc-ease` `cubic-bezier(.2,.7,.3,1)`. Every transition sits inside
  `@media (prefers-reduced-motion: no-preference)`.
- **Focus**: one ring everywhere — 2 px `--cc-accent` outline, 2 px offset, on
  `:focus-visible` only.
- **Targets**: 44×44 px minimum for anything tappable, including nav rows and chips.

---

## 5. Brand

### 5.1 Mark

A rounded-square tile (radius `--cc-radius-md` at 32 px, scaling proportionally) filled
`--cc-accent`, containing two glyphs in `--cc-on-accent`:

- a chevron `›` drawn as two 2-px strokes meeting at a point, left of centre;
- a solid cursor block, 2×7 units, to its right, with a 1-unit gap.

It reads as a prompt waiting for input: the whole course in one glyph. Drawn on a 32-unit
grid, stroke 2.5, joins rounded. It has a one-colour variant (mark in `currentColor`, no
tile) for dense contexts, and never rotates, never gains a gradient, never changes hue.
Minimum size 20 px. Clear space equals the tile's corner radius on all sides.

### 5.2 Wordmark and lockup

- Wordmark: **Claude Code Academy** set in Fraunces 600, −0.02em, sentence case.
- Lockup: mark + wordmark, baseline-aligned, gap `--cc-space-3`.
- Publisher line: `by CodeChup` in Inter `small`, `--cc-ink-faint`. It appears in the
  footer and in the mobile drawer — **not** in the desktop header, which carries the
  lockup alone.
- Under 640 px the header shows the mark alone; the wordmark returns in the drawer.
- Favicon and OG mark: the tile, on `--cc-paper`.

The previous 3×3 grid sigil, the lowercase monospace `codechup` wordmark and the
letter-spaced `CLAUDE CODE ACADEMY` line are retired everywhere, including the favicon and
the OG template.

---

## 6. Icons

One custom set, inline SVG, no icon library (CSP forbids external scripts and the set must
be theme-aware). Rules: 24×24 viewBox, 1.75 px stroke, round caps and joins,
`stroke="currentColor"`, `fill="none"` unless the glyph is intrinsically solid, optically
balanced at 20 px. Every icon ships from a single `Icon.astro` with a `name` prop so the
set stays consistent and tree-shakes to inline paths.

Required names: `search`, `menu`, `close`, `sun`, `moon`, `system`, `language`, `copy`,
`check`, `chevron-right`, `chevron-down`, `arrow-right`, `arrow-up-right`, `external`,
`terminal`, `book`, `clock`, `gauge`, `lab`, `quiz`, `hook`, `skill`, `agent`, `mcp`,
`plugin`, `shield`, `sparkle`, `github`, `rss`, `link`, `alert`, `info`, `check-circle`,
`x-circle`, `play`, `list`.

Decorative icons carry `aria-hidden="true"`; an icon that is the only content of a control
needs an accessible name on the control.

---

## 7. Layout

### 7.1 Grid

Page max width `--cc-max-page` 1360 px, gutters `--cc-space-6` (24) rising to
`--cc-space-8` (40) above 1024 px.

Lesson and section pages use three columns:

```
[ rail 264px ][ prose 1fr, max 68ch ][ context 232px ]
```

- ≥ 1240 px: all three, rail and context sticky under the header, independently
  scrollable, thin scrollbars.
- 900–1239 px: context column collapses into an "On this page" disclosure pinned above
  the prose.
- < 900 px: rail becomes a slide-in drawer opened from the header; prose is full width.

Landing, playbook and meta pages use a single centred column with full-bleed section
bands.

### 7.2 Header

56 px tall, sticky, `--cc-paper` at 88 % with a backdrop blur where supported and a solid
fallback, hairline bottom border that only appears once the page is scrolled.

Desktop: lockup left; nav centre (`Curriculum`, `Playbook`, `Meta`) as text links with a
2 px clay underline on the current section; right cluster = search button showing `⌘K`,
language toggle, theme button.

The theme control is **one icon button** that cycles system → light → dark with a tooltip
and an `aria-label` naming the next state. The current three-segment control is retired.

Mobile: mark, search icon, menu icon. The drawer holds nav, the full curriculum tree,
language, theme and the publisher line.

### 7.3 Footer

Three groups on desktop, stacked on mobile: the lockup with the publisher line and the
licence; course links; project links (repository, contributing, sources index, RSS,
changelog). Verified-version line last, `small`, `--cc-ink-faint`.

---

## 8. Components

Every component below has an entry on `/design` with a live example, its states and its
props.

### 8.1 Terminal (`Transcript`) — the component that must be rebuilt

Today's rendering is broken: lines become separate blocks separated by huge vertical gaps,
the container is `white-space: normal` in the body font, commands wrap mid-token, and
there is no terminal surface at all. A single recording renders over 2000 px tall. It is
rebuilt as follows.

**Structure**

```
figure.cc-term
  ├ div.cc-term__bar      — dot cluster, title (working dir · command), badge, copy button
  ├ div.cc-term__body     — pre > code, the recording
  └ figcaption.cc-term__cap — legend + link to the raw transcript
```

**Rules**

- The body is a single `<pre><code>` with `white-space: pre` and
  `overflow-x: auto`; it never re-wraps a command. `overscroll-behavior-x: contain`, thin
  scrollbar, and a right-edge fade mask that disappears when scrolled to the end.
- Font `--cc-font-mono` at `0.8125rem` / `1.65`, `tab-size: 2`,
  `font-variant-ligatures: none`.
- Surface `--cc-term-bg` in **both** themes; bar `--cc-term-bar`; radius
  `--cc-radius-lg`; hairline `--cc-term-line`.
- Blank lines keep exactly one line height. No block-level margin may ever apply to a
  line inside the body — reset `p`, `div` and `br` inside `.cc-term__body` to
  `display: inline`/`margin: 0`, or emit text nodes only.
- Line roles are coloured, not restyled: a prompt line (starts `>` or `$`) uses
  `--cc-term-prompt` for the sigil and `--cc-term-fg` for the command; tool lines
  (`•`) use `--cc-term-tool`; success (`✓`) `--cc-term-ok`; failure (`✗`, `Error`)
  `--cc-term-err`; paths and file names `--cc-term-path`; everything else
  `--cc-term-fg`, with wrapped continuation dimmed to `--cc-term-dim`.
- Colouring happens at **build time** from the raw text. No inline `<script>`, no runtime
  parsing, no ANSI escape codes left in the output.
- A recording longer than 24 lines collapses to 24 with a "Show all N lines" button
  (a `<details>`, no JS). Collapsed height is capped at `32rem`.
- The bar carries a `Real recording` badge (D070/D099) and, on the right, a copy button
  that copies the raw text. The caption keeps the role legend and the link to the raw
  file.
- At 390 px the component keeps its full width, scrolls horizontally, and the bar title
  truncates with an ellipsis rather than wrapping.
- `role="figure"` with an `aria-label` naming the recording; the body is focusable
  (`tabindex="0"`) so it can be scrolled by keyboard, with a visible focus ring.

### 8.2 CodeBlock

Filename or language chip in a slim header, copy button, `overflow-x: auto`, no wrapping,
optional highlighted lines with a clay left marker and a wash background, optional
annotation gutter. Light theme uses `--cc-paper-sunken`; dark uses `--cc-paper-raised`.
Shiki dual theme stays; its palette is re-tuned to the warm neutrals so code does not look
imported from another site.

### 8.3 OSTabs

Segmented control, `--cc-radius-pill`, three or four tabs, selected tab filled
`--cc-paper-raised` with a hairline and the label in `--cc-ink`; the rest transparent with
`--cc-ink-muted`. Choice persists in `localStorage` and applies across the page. Roving
tabindex, `role="tablist"`, arrow-key navigation, 44 px targets.

### 8.4 Callout

Left rule 3 px in the tone colour, tone wash background, icon + label row in `micro`
uppercase, body in `body`. Tones: note (`info`), tip (`ok`), changed (`warn`), warning
(`danger`), plus the dedicated **When NOT to use** variant which uses `danger` with the
`shield` icon and a stronger label. No `//` prefixes.

### 8.5 Lab

A numbered step list with a 2 px rail down the left, each step's number in a clay disc.
Steps hold prose, code and expected output. The lab header shows the repo tag (or "no
repo needed"), the estimated time and a difficulty gauge. An "Expected result" panel
closes each lab, tinted `--cc-ok-wash`. Checkboxes persist per lesson in `localStorage`.

### 8.6 Quiz

One card per question: prompt in `h3`, answers as full-width pill buttons with 44 px
height. Correct answer turns `--cc-ok-wash` with a check; wrong turns `--cc-danger-wash`
with an x and reveals the explanation. State per lesson in `localStorage`; a reset link.
Answers are announced via `aria-live="polite"`.

### 8.7 Sources

A compact list, each row: type chip (`official`, `article`, `video`, `repo`), title as a
link with an `arrow-up-right` icon, host in `small` `--cc-ink-faint`, and the verified
date right-aligned. Video rows carry channel and duration. No cards, no thumbnails.

### 8.8 Navigation pieces

- **Rail**: level groups with a coloured 2 px marker, module rows with a chevron
  disclosure, lesson rows 36 px tall with a 2 px clay marker when current and a small
  check when completed. The current lesson is scrolled into view on load.
- **Context column**: "On this page" list with active-section highlighting, then lesson
  meta (duration, difficulty, updated, verified version), then a progress ring for the
  module.
- **Prev/next**: two large tappable cards at the end of a lesson, each with direction
  label, lesson title and module name.
- **Breadcrumb**: level › module, `small`, above the title, with the level chip.

### 8.9 Cards

One card idiom across the site: `--cc-paper-raised`, hairline, `--cc-radius-lg`,
`--cc-space-6` padding, hover raises to `--cc-shadow-1` and moves the accent underline of
the title. Variants: level card (progress ring, lesson count, hours), module card, page
card (playbook/meta), changelog entry.

### 8.10 Search

The header button opens a centred command palette: `--cc-shadow-2`, 640 px wide, input
with the `search` icon, grouped results (lesson, playbook, meta) with level chips,
keyboard navigation, Esc to close, focus trapped and restored. Pagefind supplies results.
On mobile it is a full-screen sheet.

---

### 8.11 Root causes behind the broken terminal (diagnosed, must all be fixed)

1. **JSX indentation leaks into `<pre>`.** `Transcript.astro` writes its per-line markup
   across several source lines inside a `.map()`, so Astro emits the literal newlines and
   8–12 spaces of indentation as text nodes, and the three false `{cond && …}` branches
   emit three more blank lines. Under `white-space: pre-wrap` every recorded line renders
   as roughly seven physical lines. `CodeBlock.astro` has the identical defect. Emit each
   line's markup with **no literal whitespace between elements** — build the line as a
   single expression, or strip it deliberately.
2. **The lesson page overrides the components.** `.cc-body :global(pre)` and
   `.cc-body :global(code)` in the lesson route compile to a higher specificity than the
   component-scoped rules, adding a second border and radius inside the terminal frame,
   double-padding code blocks so highlight rows no longer reach the edge, and forcing 14px
   code against a 13px line height. Prose styling moves to `src/styles/prose.css` and must
   never reach inside a component: scope it so a component's own surfaces win.
3. **`pre-wrap` and `overflow-x: auto` fight.** The wrap wins, so the scroller never
   engages, and there is no `overflow-wrap` guard, so a 2536-character line still escapes.
   The terminal body is `white-space: pre` with horizontal scrolling, full stop.
4. **Roles do not read apart.** Body text sits at muted-on-muted with only a 1.4em glyph
   carrying colour. Use the `--cc-term-*` role palette on the text itself.
5. **Content hazards to handle:** one transcript uses hard tabs (`tab-size: 2`), three use
   box-drawing characters (the mono face must actually load — preload it), most begin with
   a `#` provenance line that callers skip via `range`, and an unparseable or reversed
   `range` currently returns the whole file silently — it must fail the build instead.
6. **`OSTabs` panels have no surface** while the active tab draws connecting chrome, and
   its tabs are 32 px tall. Give the panel the surface and the tabs 44 px.

## 9. Content-side defects to fix while redesigning

These are rendering bugs, not content bugs — the MDX must not change.

1. **Missing spaces around inline code in generated prose**: `updated2026-09-07` on lesson
   meta and `andpublic/favicon.svg` on `/design`. Find every place a component
   concatenates text and `<code>` without whitespace and fix the component.
2. **Objectives lists render without markers** on lesson pages, so consecutive objectives
   read as one paragraph. Restore list semantics and spacing.
3. **Sidebar level headings wrap mid-label** ("LEVEL 2 · INTERMEDIATE"). The new rail uses
   a single-line label with the level chip.
4. **Hero terminal overflows** at 390 px instead of scrolling.
5. **Dark theme is blue-black while light is warm** — unified to warm neutrals.

---

## 10. Acceptance

A screen is done when all of the following hold.

- No raw colour literal outside `tokens.css` (`scripts/check-raw-colors.mjs`).
- No inline `<script>` in source or in `dist` (`scripts/check-no-inline-script.mjs`).
- Axe: zero serious or critical violations at 390 px and 1280 px, in both themes.
- Every interactive target ≥ 44 px; visible focus ring on every focusable element;
  keyboard path through header, rail, prose, quiz and palette with no trap.
- `prefers-reduced-motion: reduce` removes every transition and animation.
- No horizontal page scroll at 320, 360, 390, 768, 1024, 1280 and 1440 px. Wide content
  scrolls inside its own container.
- Lighthouse: performance ≥ 0.9, accessibility 1.0, best practices ≥ 0.9, SEO ≥ 0.95.
  The one documented exception is `/design/` itself, budgeted at performance
  ≥ 0.85 in `lighthouserc.json`: this page is a type specimen, so it renders
  the Turkish diacritics line (§10, last bullet) in all three faces at every
  weight and therefore downloads seven font files — 330 kB — where a reader
  page downloads three. That payload is the page's content, not overhead, and
  it is the only route on the site that pays for it. Accessibility, best
  practices and SEO stay at the full bar there.
- A terminal recording of 20 lines renders under 600 px tall and scrolls horizontally
  rather than wrapping.
- Both language trees render identically; Turkish diacritics are correct in every face at
  every weight.
