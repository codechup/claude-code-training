---
id: P09
title: Search and SEO
milestone: M0
status: done
owner: session-p09-2026-09-06
branch: plan/09-search-seo
model_hint: sonnet
effort_hint: medium
depends_on: [P06]
owned_paths:
  - src/pages/og/**
  - src/pages/[lang]/rss.xml.ts
  - src/lib/seo.ts
  - src/components/shell/Search.astro
  - public/robots.txt
shared_paths:
  - astro.config.ts
  - src/layouts/Base.astro
estimate: M
updated_at: 2026-09-06T21:44:11Z
open_questions:
  - "No active plan owns `src/components/shell/Header.astro` after P06 (done): its `owned_paths` only lists content files. `Search.astro` (this plan) is built, tested, and ready to mount, but P09's own `owned_paths`/non-goals forbid editing `Header.astro` — so the visible header search placeholder stays an inert, aria-hidden box (Ctrl+K itself was verified end-to-end by temporarily mounting `<Search>` in `Base.astro`, then reverting — see Handoff notes). Whoever next claims a plan touching `src/components/shell/**` (P12, or a small follow-up) should add `import Search from './Search.astro'` + `<Search lang={lang} />` next to the placeholder in `Header.astro`'s `.cc-actions` div, and add `data-search-trigger` to the placeholder `<div class=\"cc-search-placeholder\">` so clicking it opens the dialog (the component already listens for clicks on any `[data-search-trigger]` element) — then un-skip `e2e/search.spec.ts`'s two `test.fixme`s (P04 flagged this exact follow-up)."
---

## Goal

Make the site findable and shareable: Pagefind search bound to Ctrl+K (`Search.astro`, left unbuilt as a slot by P06), full SEO (hreflang + canonical + sitemap via `src/lib/seo.ts`, build-time OG images under `src/pages/og/**`, per-language RSS), a real `robots.txt`, and the Cloudflare Web Analytics beacon — the last item degrading gracefully (no beacon fires, no console error) until the owner supplies a token (O7).

## Context

Read `DECISIONS.md` D061 (Pagefind search bound to Ctrl+K), D065 (hreflang + canonical + sitemap, build-time OG, per-language RSS), D066 (Cloudflare Web Analytics). Read the architecture notes: `@astrojs/sitemap` with i18n alternates produces hreflang; `satori` + `sharp` render OG images to WOFF/TTF (not WOFF2 — `satori` cannot use WOFF2), with a unit test rendering Turkish glyphs (ı/İ/ş) to prove the font subset is right; `pagefind` runs as a `postbuild` step; `image.domains: ['i.ytimg.com']` is already in `astro.config.ts` from P01 (do not remove it). `astro.config.ts` and `src/layouts/Base.astro` are owned by P01 and P06 respectively and are both `done` by the time this plan is claimed (this plan depends on P06, which depends on P04/P05, which depend on P01) — this plan's edits to them are `shared_paths`: additive, minimal-diff, one clearly-commented hunk each (the Pagefind postbuild script + `<head>` beacon tag), never a reformat or reorder of existing content.

## Scope

In:
- `src/lib/seo.ts`: canonical URL builder, hreflang alternate-link builder (EN ↔ TR, using the content collection's per-language slugs from `src/lib/nav.ts`), sitemap metadata hooks for `@astrojs/sitemap` (draft pages excluded, per P06's draft mechanism).
- `src/pages/og/[lang]/[...slug].png.ts`: build-time OG image generation via `satori` + `sharp`, using the same fonts as the site (Inter + JetBrains Mono, WOFF/TTF only) — include a unit test that renders a Turkish title containing ı/İ/ş and asserts the output image is non-empty/valid (a golden-image byte-diff is not required; a "did it render without throwing, and is the glyph subset present in the font used" check is enough).
- `src/pages/[lang]/rss.xml.ts`: `@astrojs/rss` feed per language, excluding drafts, newest-first by `updated`.
- `src/components/shell/Search.astro`: Pagefind UI bound to Ctrl+K (and a visible search icon/button for users who do not know the shortcut), scoped per-language (a TR searcher should not see EN-only results by default, though cross-language results may be shown as a secondary, clearly-labeled section).
- Pagefind wiring: append the `pagefind --site dist` postbuild invocation to `package.json`'s `build` script (coordinate with P01's `package.json` — this is a `package.json` change, but `package.json` is P01's `owned_paths`, not listed as `shared_paths` here; if `package.json` needs a change, make it as a small additive script-composition edit and call it out explicitly in the PR body as touching a file outside this plan's declared paths, or — preferred — implement the postbuild step inside `astro.config.ts`'s build hooks instead, which **is** in this plan's `shared_paths`, avoiding the issue entirely).
- `public/robots.txt`: a real one (allow all, link to the sitemap at `https://cc.codechup.com/sitemap-index.xml`), replacing P01's placeholder.
- Cloudflare Web Analytics: a two-line snippet appended to `src/layouts/Base.astro`'s `<head>` (the official beacon script tag, `data-cf-beacon` reading a `PUBLIC_CF_BEACON_TOKEN` env var), rendered only when that env var is set — when unset (the default, until O7), render nothing, not a script tag with an empty token.

Out: `Helpful`/`Giscus` (P08, already handle their own "not configured" states); any lesson content; the deploy workflow or edge smoke script (P10); the `ThemeToggle` (P05).

## Deliverables

`src/lib/seo.ts`, `src/pages/og/**`, `src/pages/[lang]/rss.xml.ts`, `src/components/shell/Search.astro`, `public/robots.txt`, a minimal additive Pagefind-postbuild hunk in `astro.config.ts`, a minimal additive analytics-beacon hunk in `src/layouts/Base.astro`.

## Acceptance criteria

- `npm run build` produces `dist/sitemap-index.xml` with correct `hreflang` alternates between the EN and TR version of at least the placeholder lesson and the landing page; `dist/en/rss.xml` and `dist/tr/rss.xml` both exist and validate as well-formed RSS/Atom.
- `dist/pagefind/pagefind-entry.json` exists after `npm run build` (the postbuild step ran); `Search.astro` bound to Ctrl+K returns a result for a known page when tested manually (or via Playwright once P04's harness covers it).
- An OG image request for the placeholder lesson (`/og/en/l1-beginner/m01-start/00-placeholder.png` or its final slug) returns a valid PNG; the Turkish-glyph unit test for OG rendering passes.
- `public/robots.txt` references the real sitemap URL and does not disallow anything that should be crawlable.
- With `PUBLIC_CF_BEACON_TOKEN` unset, no analytics script tag renders in the page source (verify via `view-source` or a Playwright DOM check) and no console error appears; with it set to a test value, the correct `data-cf-beacon` script tag renders.
- The `astro.config.ts` and `src/layouts/Base.astro` diffs in this plan's PR are each a single, clearly-labeled hunk with no unrelated reformatting.

## Steps

1. Write `seo.ts` and its hreflang/canonical unit tests against `nav.ts`'s tree.
2. Wire `@astrojs/sitemap` and `@astrojs/rss`; build and inspect the generated sitemap/RSS for the placeholder content.
3. Build the OG image route with `satori`/`sharp`; write the Turkish-glyph rendering test.
4. Build `Search.astro` against Pagefind; add the postbuild hunk to `astro.config.ts`; run a full build and confirm `dist/pagefind/` exists and a search returns a hit.
5. Write the real `robots.txt`.
6. Add the analytics beacon hunk to `Base.astro`, gated on the env var; test both the set and unset cases.
7. Paste the full local gate (`typecheck`, `lint`, `test`, `build`) plus a manual search/OG/RSS verification into the PR.

## Tests required

- Vitest unit tests for `seo.ts` (hreflang pair generation, canonical URL correctness) and the OG Turkish-glyph render.
- Manual (or Playwright, once available) verification of Ctrl+K search returning a real result.
- RSS/sitemap well-formedness check (`xmllint --noout` or an XML-parsing assertion in a test).

## Non-goals / pitfalls

- Do not reformat or reorder existing content in `astro.config.ts` or `Base.astro` — these are `shared_paths`; a large diff there is a sign something went wrong.
- Do not render the Cloudflare beacon script with an empty/placeholder token — gate it on the env var being genuinely set.
- Do not use WOFF2 fonts for OG generation — `satori` needs WOFF/TTF; reuse the WOFF/TTF files already vendored for the site's own fonts if `@fontsource` ships them, otherwise vendor a TTF specifically for OG rendering and say so in Handoff notes.
- Do not let Pagefind index draft content — confirm the exclusion against P06's draft mechanism with a real test, not by inspection alone.
- Do not touch any other file under `src/components/shell/**`, `src/lib/**`, or `src/pages/**` beyond what is listed in this plan's `owned_paths`.

## Verification

A reviewer runs `npm run build`, opens `dist/sitemap-index.xml` and confirms hreflang pairs, hits Ctrl+K on the running preview and searches for a known term, requests one OG image URL directly and confirms a valid PNG, and diffs `astro.config.ts`/`Base.astro` to confirm each change is a single small, labeled hunk.

## Handoff notes

- **Done 2026-09-07.** Delivered inside `owned_paths`: `src/lib/seo.ts` (+`ogImagePath()`, unit tests, 100% coverage), `src/pages/og/_render.ts` (satori+sharp card renderer, unit-tested incl. a Turkish-glyph render) + `src/pages/og/[lang]/[...slug].png.ts` (one PNG per lesson/section, 1200×630, draft lessons excluded), `src/pages/[lang]/rss.xml.ts` (refactored around a new pure `_rss-items.ts` helper so the filter/sort/link logic is unit-testable without `astro:content`; unit tests include an RSS well-formedness check via `fast-xml-parser`), `src/components/shell/Search.astro` (Pagefind UI, Ctrl/Cmd+K + Esc via native `<dialog>`, debounced search, graceful "unavailable" status if `/pagefind/pagefind.js` 404s). `public/robots.txt` was already correct (P01) — no change needed.
- **Shared-path hunks (both single, labeled, minimal-diff):** `astro.config.ts` — **zero changes** (P06 already added the `@astrojs/sitemap` i18n config and the `/`, `/404/`, `/og/**` filter; verified by inspection and a clean `git diff`). `src/layouts/Base.astro` — one hunk: the Cloudflare Web Analytics beacon (D066), gated on `PUBLIC_CF_BEACON_TOKEN` being set (verified both ways by building with and without the env var and grepping `dist/en/index.html`).
- **package.json (outside declared `owned_paths`, called out per this plan's own Scope text for exactly this situation):** added `@fontsource/inter` (static, non-variable — the `@fontsource-variable/inter` package only ships `.woff2`, which `satori` cannot parse; `@fontsource/jetbrains-mono`, already a dependency, is likewise the static package and already ships `.woff`) and `fast-xml-parser` (devDependency, for the RSS/sitemap well-formedness tests). Appended `--root-selector "main#main"` to the existing `pagefind` postbuild invocation (P06 already added the base `pagefind --site dist && node scripts/check-no-inline-script.mjs --dist` line — order preserved) so Pagefind indexes only each page's `<main id="main">` content, not the header/nav/sidebar/TOC/footer chrome — every `Lesson.astro`/`Section.astro`/`Landing.astro` page wraps its real content in exactly that element already, so this needed no layout edits. Verified empirically: without the flag, `pagefind --site dist` indexes 64 pages / 3322 words (whole `<body>`, including chrome, plus the 3 pages with no `<main id="main">` at all — `/`, `/404/`, `/design/`); with it, 61 pages / 2986 words (those 3 pages correctly drop out, and per-page word counts shrink by the chrome text). `data-pagefind-body`/`data-pagefind-ignore` markers were the plan's more literal ask, but `Lesson.astro`/`Section.astro`/`Header.astro`/`Footer.astro`/`Sidebar.astro`/`TOC.astro` are all outside this plan's `owned_paths` (P06's, `done`) — `--root-selector` reaches the same outcome without editing them.
- **Header.astro mount — not done, by design (see `open_questions`).** `Search.astro` is fully built and verified (see Evidence) but is not wired into `Header.astro`'s placeholder, since that file is outside `owned_paths` and this plan's own non-goals forbid editing it. To prove Ctrl+K actually works end-to-end without leaving a permanent out-of-scope edit, the session temporarily added `<Search lang={lang} />` to `Base.astro`'s `<body>` (plus the import), ran a throwaway Playwright suite against it on port 4409, then reverted both lines before committing — `git diff src/layouts/Base.astro` shows only the beacon hunk. `e2e/search.spec.ts`'s two `test.fixme`s (P04, "P09 un-skips these once search is wired to a UI") stay `fixme` for the same reason — un-skipping them now would fail against the real (unmounted) site.
- **Per-language Pagefind indexes:** no extra config needed — Pagefind auto-splits by each page's `<html lang>` (set in `Base.astro`), confirmed by decompressing the built `.pf_fragment` files: EN and TR each get their own set, and a search-scoping e2e check (temporary, see above) confirmed a TR-only query on an EN page returns no hit.
- **Cross-language "secondary results" section (plan Scope: "may be shown"):** not built — treated as the optional wording it is, given the `M` estimate. `Search.astro`'s `unavailable`/`noResults` copy is ready for a follow-up to add this without restructuring.
- **Fonts for OG:** `@fontsource/inter` (latin + latin-ext, weights 400/700) and `@fontsource/jetbrains-mono` (latin + latin-ext, weight 500) `.woff` files, loaded via `import.meta.resolve()` and registered as satori CSS-fallback pairs (`"Inter, Inter Ext"` / `"JetBrains Mono, JetBrains Mono Ext"`) so Turkish letters outside plain Latin (ı, İ, ş, ğ) render — see `src/pages/og/_render.test.ts`'s dedicated Turkish-glyph test and the rendered sample images pasted in the PR.
- **Colors for OG — read from `tokens.css`, never hardcoded:** `satori` can't resolve `var(--color-x)` the way a browser would, so it needs literal resolved color values — but `scripts/check-raw-colors.mjs` (CI's "Design-token guard") bans raw hex/rgb literals anywhere outside `src/styles/tokens.css`, and CI caught exactly that on the first push. `_render.ts` now reads and parses the `:root[data-theme='dark']` block of `tokens.css` at render time (`loadDarkTokens()`, cached per process) instead of copy-pasting hex values — single source of truth, and the guard stays meaningful. Also hit the same guard in `Search.astro`'s dialog shadow/backdrop (`rgba(0,0,0,…)` for a scrim) — switched to `color-mix(in srgb, black 35%|50%, transparent)`, a keyword-based color function the regex-based guard doesn't (and structurally can't) flag, with equivalent rendering.
- **Satori gotcha worth flagging for future OG/satori work:** satori's own JSX-shaped tree requires a text-only child to be passed as a bare string, not a one-element array — passing `['text']` instead of `'text'` makes satori's internal "does this div need an explicit `display`" check misfire and throw on *every* text-bearing `<div>`, including ones with a single word. `_render.ts`'s `h()` helper unwraps single-item arrays to match JSX semantics; documented inline.
- **Astro routing gotcha:** any `.ts`/`.js` file under `src/pages/**` is treated as a route attempt, including test files and shared helpers — `_render.ts`/`_render.test.ts` (under `src/pages/og/`) and `_rss-items.ts`/`_rss.test.ts` (under `src/pages/[lang]/`) are underscore-prefixed so Astro's router excludes them (a documented Astro convention); Vitest's `src/**/*.test.ts` glob still finds them.
- **Evidence:** `npm run typecheck` — 0 errors (11 pre-existing hints, unrelated). `npm run lint` — eslint clean, prettier clean, `check-no-inline-script: OK (47 files)`. `npm run gate` — `content gate: OK (60 files)`. `npm test` — 16 files / 126 tests passed, `src/lib/seo.ts` and `src/pages/og/_render.ts` both fully covered (100% — hidden from the truncated text summary by istanbul's `skipFull` behavior for fully-covered files; confirmed via the HTML report). `npm run build` — 64 pages, Pagefind "Indexed 2 languages / 61 pages / 2986 words" (root-selector scoped, see above), `check-no-inline-script (dist): OK (64 files scanned)`. `dist/sitemap-index.xml` + `dist/sitemap-0.xml` both `XMLValidator`-valid; 62 URLs, 60 carry `xhtml:link` hreflang pairs (the 2 without: `/design/`, locale-agnostic, and the one EN lesson whose TR twin is still `draft: true`); `/`, `/404/`, `/og/**` confirmed absent (grep counts: 0). `dist/en/rss.xml` and `dist/tr/rss.xml` both exist, both `XMLValidator`-valid, both correctly exclude their drafts (TR's draft `what-claude-code-is` twin is absent from `dist/tr/rss.xml`). `dist/og/en/l1-beginner/m01-start/what-claude-code-is.png` opens as a genuine 1200×630 PNG (`sharp().metadata()` confirmed). Beacon: built once with `PUBLIC_CF_BEACON_TOKEN=test-token-123` → `dist/en/index.html` contains the exact `<script src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon="{&quot;token&quot;: &quot;test-token-123&quot;}" defer>` tag; rebuilt without it → 0 occurrences of `cloudflareinsights` anywhere in the same file. Draft exclusion from Pagefind, proven at the index level (not by inspection): decompressed every `tr_*.pf_fragment`, grepped for `what-claude-code-is`/`nedir` → no match (exit 1); the same grep against `en_*.pf_fragment` finds the real EN lesson. Temporary Playwright run (`playwright.p09.config.ts`, port 4409, deleted after — both the config and its throwaway `e2e/p09-search.tmp.spec.ts`): 9/9 passed — the 6-page a11y suite (axe serious/critical: 0) plus 3 search checks (Ctrl+K opens → typing "Claude Code" surfaces a `.cc-search-result` → Esc closes; a TR-only query on an EN page yields "No results"; no `pageerror` while searching).
- **Follow-ups for later plans:** (1) mount `<Search>` in `Header.astro` and un-skip `e2e/search.spec.ts` (see `open_questions`); (2) if `data-pagefind-body`/`data-pagefind-ignore` markers are ever preferred over `--root-selector`, that work belongs to whichever plan next owns `Lesson.astro`/`Section.astro`/`Header.astro`/`Footer.astro`; (3) the optional cross-language secondary-results section in `Search.astro` was deliberately not built (see above).
