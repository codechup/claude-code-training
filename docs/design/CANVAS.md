# CANVAS.md — the design canvas for CodeChup Claude Code Academy (P00)

> **TL;DR:** The visual design is authored **first** as a Claude Design canvas by the lead session (D084), approved by the owner (O9), and only then turned into `src/styles/tokens.css` (P05) and the living `/design` page. The artboards are generated from `docs/design/canvas-src/build.mjs` — that script is the verbatim, reproducible "prompt" (D029–D032 encoded as code), so every value on the canvas is traceable to a line in it.

| | |
|---|---|
| **Canvas** | `CodeChup Claude Code Academy` — the owner's private design canvas artifact (URL held outside this repo). Regenerate from `docs/design/canvas-src/build.mjs`. |
| **Authored by** | lead session (Fable 5.1), 2026-09-06, via the `/design` skill |
| **Source** | `docs/design/canvas-src/build.mjs` → `docs/design/canvas-out/*.dc.html` + `canvas.json` (regenerate with `node docs/design/canvas-src/build.mjs`) |
| **Design version** | `2026.09.1` |
| **Owner approval** | pending — see §4 |

---

## 1. Inputs and decisions honoured

- D029 dark-leaning "terminal" aesthetic; D030 dark + light following the system with a toggle; D031 Inter + JetBrains Mono; D032 CodeChup sub-brand; D035 mobile-first at 390 px; D036 WCAG 2.2 AA; D061–D063 navigation and lesson meta; D019 code blocks with OS tabs, copy, annotations and real transcripts; D064 quiz; D067 feedback; D091/D092 inline SVG decision trees and diagrams.
- Brand lineage: the CodeChup **sigil** (3×3 rounded cells on a 24-unit grid — cell 6, gap 2, margin 1 — one gold cell top-right) is shared with the rest of the CodeChup family and is never rotated, recoloured or moved. The wordmark is lowercase `codechup` in JetBrains Mono with the CodeChup signal-red caret; the academy line is uppercase mono at 0.18 em tracking.
- Owner override noted: Inter is the chosen body face (D031) even though generic design guidance flags it as overused; the terminal voice (mono eyebrows with `//`, mono numerals, real transcripts) carries the personality instead.

## 2. Artboards

| # | Artboard (file) | Frame | What it settles | Implemented by |
|---|---|---|---|---|
| 01 | `Brand.dc.html` | 1200×900 | sigil sizes + one-colour + favicon, three lockups, voice, social card 1200×630 | P05 (`Sigil`, `Lockup`, favicon, OG template in P09) |
| 02 | `Tokens.dc.html` | 1200×1250 | full dark **and** light palettes with roles, type scale, radii, spacing, motion, focus ring | P05 (`tokens.css`) |
| 03 | `Main.dc.html` (Landing 1280) | 1280×1950 | header (search, EN/TR, theme), hero with real transcript, level cards with progress, curriculum map, "what changed", playbook card, footer | P06 landing |
| 04 | `Landing390.dc.html` | 390×1950 | phone landing, 44 px targets, stacked level cards | P06 |
| 05 | `Lesson1280.dc.html` | 1280×1900 | sidebar tree · lesson body (meta, You will, When not to use, OS-tab code block with annotations, Lab card with transcript, Changed callout, Quiz, Sources, helpful/edit, prev/next + progress) · TOC | P06, P07, P08 |
| 06 | `Lesson390.dc.html` | 390×2700 | the same lesson on a phone with breadcrumb strip | P06, P07, P08 |
| 07 | `LessonLight.dc.html` | 1280×1900 | the lesson page in the light theme (same tokens, swapped values) | P05 (theme), P06 |
| 08 | `Components.dc.html` | 1200×1550 | buttons/chips/kbd, callouts (note / when-not-to-use / changed), code block + OS tabs, transcript, quiz states, decision-tree SVG, meta + sources + feedback, search/lang/theme | P07, P08, P09 |
| 09 | `DesignPage.dc.html` | 1280×1750 | `/design`: sticky TOC, principles, live token swatches + contrast matrix, component states, canvas card, changelog | P05 skeleton, P07/P08 entries |

## 3. Token values (as drawn; P05 copies these into `tokens.css`)

| Token | Dark | Light | Role |
|---|---|---|---|
| `bg-0` | `#0b0d12` | `#f6f3ec` | page ground |
| `bg-1` | `#11141b` | `#fbf9f4` | code, terminal |
| `bg-2` | `#171b24` | `#ffffff` | cards |
| `bg-3` | `#1f2430` | `#efece4` | raised, chips |
| `ink` | `#efe9dc` | `#16181d` | primary text |
| `ink-soft` | `#b9b3a6` | `#4c4f57` | secondary |
| `ink-muted` | `#958f84` | `#666a72` | meta, placeholders |
| `line` | `rgba(239,233,220,.10)` | `rgba(22,24,29,.12)` | hairlines |
| `line-strong` | `rgba(239,233,220,.32)` | `rgba(22,24,29,.36)` | input borders, ghost buttons |
| `accent` | `#e6b731` | `#c99a12` | primary CTA, sigil cell, progress |
| `accent-ink` | `#22190a` | `#1c1503` | text on accent |
| `accent-text` | `#e6b731` | `#7a5c00` | gold used as text (code annotations, links) |
| `caret` | `#ff4d3d` | `#e63b2c` | prompt caret, "Changed" |
| `prompt` | `#8fd3ff` | `#1d6fa8` | shell prompt glyph |
| `success` / `warning` / `danger` / `info` | `#61cb7c` / `#fe8c2c` / `#f75e51` / `#6ac5e8` | `#1f8f45` / `#c4620b` / `#d0362a` / `#1d7fb0` | states, level badges |

Type: Inter 400/500/600/700, JetBrains Mono 400/500/700 (tabular numerals); scale 11 12 13 14 16 18 20 24 32 40 56; body 16/1.5, measure 65ch; eyebrow mono 12 uppercase 0.08 em prefixed `// ` in caret red. Radii 4 (chips, tabs) · 6 (buttons, inputs) · 10 (cards, code) · 16 (dialogs). Spacing 4-pt; gutter 16 phone / 32–64 desktop; sections 48–80. Motion `--dur-1 120ms --dur-2 200ms --dur-3 320ms`, `--ease-out cubic-bezier(.2,0,0,1)`; only the caret blinks; `prefers-reduced-motion` stops it. Focus: 2 px accent outline, 2 px offset. Targets ≥ 44 px on phone.

Contrast is computed in `build.mjs` (WCAG relative luminance) and printed on the `/design` artboard; after a second-look review, `ink-muted` was lifted in both themes and a separate `accent-text` token was added because raw gold as text fails AA on light paper. P05 recomputes from the final `tokens.css` and renders the matrix live on `/design`.

## 4. Owner approval

Pending. The owner approves on the canvas (comment or edit + Save) or by commenting "approved" on the P00 PR. Record the evidence here (link or screenshot) and set P00 to `done`. Anything the owner changes on the canvas after this file was written is folded into §3 by the session that closes P00.

## 5. Deltas and judgement calls (for the owner to overrule)

- **Light-theme accent** is a darker gold (`#c99a12`) for buttons and the sigil cell; gold as *text* uses `accent-text` (`#7a5c00` light / `#e6b731` dark) so annotations pass AA on paper.
- **Wordmark** uses the lowercase mono `codechup` + red caret lineage rather than a new academy logotype; the academy is expressed as a second mono line, so the sigil stays the only pictorial mark.
- **Landing hero** is a real-looking transcript rather than an illustration; the "terminal animation" (D062) is the blinking caret plus a typed-line reveal, nothing more.
- **Progress** is shown as a thin gold bar on level cards and under prev/next — the only places gold appears besides the CTA and sigil.
- Exports: the canvas link is the full-fidelity source; PNG/PDF export is available from the canvas toolbar. No raster exports are committed in this pass (the `.dc.html` sources are the reproducible artefact).

## 6. Handoff per implementing plan

- **P05 (tokens + theme + `/design` skeleton):** copy §3 verbatim into `tokens.css` as `--color-*` on `:root` (dark) and `[data-theme="light"]`; fonts latin + latin-ext; implement the sigil and lockup from `build.mjs` (`sigil()`, `lockup()`); the `/design` page follows `DesignPage.dc.html` (sticky TOC order: brand, tokens, type, space, motion, components, transcript, a11y, canvas, changelog) and computes the contrast matrix at build time.
- **P06 (content pipeline + landing + lesson shell):** header/sidebar/TOC/prev-next/progress exactly as `Lesson1280.dc.html` and `Lesson390.dc.html`; landing sections in the order of `Main.dc.html`; phone breadcrumb strip; level badges `level-1…4` colours from §3.
- **P07 (MDX components A):** Callout variants note / when-not-to-use (warning border) / changed (caret border) with mono eyebrow; CodeBlock = terminal frame (title bar with three dots, copy affordance, line numbers, gold `←` annotations) under an OS tab strip; Transcript roles `›` prompt (prompt colour), `⏺` tool (muted), `✓`/`✗` result (success/caret); Lab card with numbered steps and expected-result line.
- **P08 (MDX components B):** Quiz option states rest / correct (success border + filled radio) / wrong (danger); DecisionTree SVG style (bg-3 nodes, muted edges, gold mono edge labels); Helpful thumbs row; YouTube card = sources row with `video` chip, title, channel · duration.
- **P09 (SEO/OG):** OG image = Brand artboard's social card (lockup top-left, eyebrow + title, 8 px gold bar at the bottom).
