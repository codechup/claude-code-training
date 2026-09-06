---
id: P09
title: Search and SEO
milestone: M0
status: todo
owner: null
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
updated_at: 2026-09-06T00:00:00Z
open_questions: []
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

- _Filled by the executing session: what changed, decisions, follow-ups, blockers._
