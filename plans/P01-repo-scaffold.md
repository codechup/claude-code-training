---
id: P01
title: "Repo scaffold: Astro, MDX, Tailwind, i18n, tooling"
milestone: M0
status: done
owner: fable-lead-2026-09-06
branch: plan/01-repo-scaffold
model_hint: sonnet
effort_hint: medium
depends_on: []
owned_paths:
  - package.json
  - package-lock.json
  - astro.config.ts
  - tsconfig.json
  - eslint.config.js
  - .prettierrc
  - vitest.config.ts
  - .gitleaks.toml
  - .nvmrc
  - .editorconfig
  - .gitattributes
  - .gitignore
  - LICENSE
  - README.md
  - SECURITY.md
  - .github/PULL_REQUEST_TEMPLATE.md
  - .github/dependabot.yml
  - scripts/git-hooks/pre-push
  - src/**
shared_paths: []
estimate: L
updated_at: 2026-09-06T20:15:00Z
open_questions: []
---

## Goal

Stand up a working Astro site that builds and runs end to end: static output, MDX, Tailwind v4, self-hosted fonts, i18n routing for `en`/`tr`, TypeScript project config, linting/formatting/unit-test tooling, and the repo-hygiene files a public MIT project needs (PR template, dependabot, a pre-push hook that blocks direct pushes to `main`). `npm run build` must succeed and produce a `dist/` from the very first commit, even though most of the interesting pages are placeholders that later plans (P04–P09) will replace.

## Context

Read `DECISIONS.md` D013–D017 (Astro static output, MDX, `content/en`/`content/tr` parallel trees, EN-source + `/` Accept-Language redirect), D081 (Node 24 + npm 11, `.nvmrc`), D082 (Docker only for `nginx -t`, not used here). This plan runs first (`depends_on: []`) and several root files already exist in the repository ahead of this plan (`LICENSE`, `README.md`, `SECURITY.md`, `.editorconfig`, `.gitattributes`, `.gitignore`, `.nvmrc`) — **read each one before touching it**; adjust only what is inconsistent with this plan's deliverables (for example, if `README.md`'s script list does not exactly match the `package.json` you write, fix the mismatch in whichever file is wrong, never leave them disagreeing). Do not recreate `DECISIONS.md` — it already exists at the repo root, authored by the planning session, and covers D001–D100; this plan and every later plan only ever reads it.

This plan creates minimal, working **stub** versions of every file that P04 through P09 will later own in full: `src/pages/index.astro` (a JS-redirect fallback per D017), `src/pages/404.astro`, `src/pages/design/index.astro`, `src/layouts/{Base,Lesson,Section,Landing,Design}.astro`, `src/content.config.ts` and `src/content/schema.ts`, `src/lib/{nav,slugs,progress,os-pref,seo}.ts`, `src/lib/i18n/ui.ts`, `src/styles/{tokens,fonts,app,shiki}.css`, `src/integrations/content-gates.ts`, `src/components/mdx/*`, `src/components/lesson/*`, `src/components/shell/*`, and `public/theme-init.js`/`public/robots.txt`. Every one of these stubs exists only so `npm run build` succeeds and the later plans have a real file to edit rather than create from nothing. **Ownership of each file transfers, in full, to the plan named for it the moment that plan is claimed** (P04 → `src/integrations/content-gates.ts`; P05 → `src/styles/**`, `public/theme-init.js`, `src/components/shell/ThemeToggle.astro`, `src/pages/design/**`; P06 → `src/content.config.ts`, `src/content/**`, `src/lib/**`, `src/layouts/**`, `src/pages/[lang]/**`, `src/pages/404.astro`, `src/pages/index.astro`, `src/components/lesson/**`, `src/components/shell/{Header,Footer,LangSwitch}.astro`; P07 → `src/components/mdx/{Callout,CodeBlock,OSTabs,Transcript,Sources,WhenNotToUse,Lab}.astro`; P08 → `src/components/mdx/{Quiz,DecisionTree,Helpful,Giscus,YouTubeCard}.astro` + `worker/**`; P09 → `src/pages/og/**`, `src/pages/[lang]/rss.xml.ts`, `src/lib/seo.ts`, `public/robots.txt`, `src/components/shell/Search.astro`, pagefind config). P01 never edits any of those files again once its own PR merges — this is the same scaffold-then-handoff shape P06 later uses for `content/**` (see P06's plan).

## Scope

In:
- `package.json` with scripts matching `README.md` exactly: `dev`, `build` (runs the content gate then `astro build` then pagefind postbuild), `preview`, `typecheck` (`astro check`), `lint` (eslint + `prettier --check` + the inline-script guard), `format` (`prettier --write`), `test` (vitest with coverage), `test:e2e` (playwright — the binary and config are P04's, but the script entry lives here), `gate` (content gate alone), `plan` (`tools/plan/cli.ts` — the binary is P02's, the script entry lives here).
- `astro.config.ts`: `output: 'static'`, `trailingSlash: 'always'`, `build.format: 'directory'`, `site: 'https://cc.codechup.com'`, i18n `{ defaultLocale: 'en', locales: ['en', 'tr'], routing: { prefixDefaultLocale: true, redirectToDefaultLocale: false } }`, `@astrojs/mdx`, `@astrojs/sitemap`, `@astrojs/rss`, `@tailwindcss/vite`, `image.domains: ['i.ytimg.com']`.
- `tsconfig.json` (strict), `eslint.config.js` (flat config, TypeScript + Astro + MDX), `.prettierrc`, `vitest.config.ts` (coverage provider configured; thresholds are asserted by P04's CI job, not here).
- Fonts: `@fontsource-variable/inter` and `@fontsource/jetbrains-mono` (latin + latin-ext subsets, so Turkish ş/ğ/ı/İ render) as dependencies, imported from the `src/styles/fonts.css` stub.
- Stub files listed in Context — each minimal but real: `index.astro` renders a plain link to `/en/`, `404.astro` a plain "not found" message, layouts render `<slot />` with no styling opinion yet, `content.config.ts` defines empty `lessons`/`sections` collections, `lib/*.ts` export typed no-op or trivial implementations, `styles/*.css` are near-empty valid CSS, mdx/lesson/shell components render their children or a placeholder with the right prop signature.
- `.github/PULL_REQUEST_TEMPLATE.md` (sections: Plan · What changed · How to try it · Evidence · DoD checklist · Handoff notes, mirroring `plans/README.md` §6 once P02 writes it — coordinate the wording, do not block on it), `.github/dependabot.yml` (npm + github-actions ecosystems, weekly).
- `scripts/git-hooks/pre-push` (POSIX sh, blocks a direct push to `main`) plus a one-line `README.md` note on how to install it (`git config core.hooksPath scripts/git-hooks` or a copy step).
- Reviewing and, if needed, correcting the existing root files (`LICENSE`, `README.md`, `SECURITY.md`, `.editorconfig`, `.gitattributes`, `.gitignore`, `.nvmrc`) for consistency with what this plan actually ships.

Out: `plans/README.md`, `tools/plan/**` (P02); `DECISIONS.md` (already exists, owner-PR-only); any CI workflow (P04); the design canvas or tokens (P00/P05); any real lesson content (P06 onward); `docs/CURRICULUM.md` (P03).

## Deliverables

`package.json`, `package-lock.json`, `astro.config.ts`, `tsconfig.json`, `eslint.config.js`, `.prettierrc`, `vitest.config.ts`, `.gitleaks.toml`, `.github/PULL_REQUEST_TEMPLATE.md`, `.github/dependabot.yml`, `scripts/git-hooks/pre-push`, and the full `src/**` stub tree described in Context, plus `public/theme-init.js` (a no-op placeholder; P05 fills in the real theme logic) and `public/robots.txt` (a permissive placeholder; P09 fills in the real one).

## Acceptance criteria

- `npm ci && npm run build` succeeds and produces `dist/en/index.html`, `dist/tr/index.html` (or the i18n-routed equivalent), and `dist/404.html`.
- `npm run typecheck` (`astro check`) passes with zero errors.
- `npm run lint` passes (eslint + prettier check) on a clean checkout.
- `npm test` runs (it is fine for it to report "no tests yet" as long as the vitest binary and config work — P04 onward add real coverage).
- `npm run dev` serves `/en/`, `/tr/`, and `/` (redirecting client-side to `/en/` per the JS fallback, D017) without a console error.
- `scripts/git-hooks/pre-push` rejects a push whose current branch is `main` (test locally: `git checkout main && ./scripts/git-hooks/pre-push` exits non-zero) and allows any other branch.
- `README.md`'s script list and `package.json`'s `scripts` block are identical in the set of names they mention.

## Steps

1. `npm init` + install Astro, `@astrojs/mdx`, `@astrojs/sitemap`, `@astrojs/rss`, Tailwind v4 (`@tailwindcss/vite`), the two `@fontsource*` packages, TypeScript, ESLint + the Astro/MDX plugins, Prettier, Vitest.
2. Write `astro.config.ts` with the i18n block and integrations from Scope; confirm `npm run dev` serves a page.
3. Write the stub tree file by file (layouts → pages → content.config.ts → lib → styles → components); after each group, re-run `npm run build` to keep it green rather than debugging a big-bang failure at the end.
4. Write `tsconfig.json`, `eslint.config.js`, `.prettierrc`, `vitest.config.ts`; run `typecheck`/`lint`/`test` and fix everything they flag.
5. Write `.github/PULL_REQUEST_TEMPLATE.md`, `.github/dependabot.yml`, `scripts/git-hooks/pre-push`; test the hook locally as in Acceptance criteria.
6. Reconcile `README.md`'s script list, then a final `npm ci && npm run build && npm run typecheck && npm run lint && npm test` pass, pasted into the PR.

## Tests required

- `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` all green (pasted output in the PR).
- Manual: `scripts/git-hooks/pre-push` blocks `main`, allows a feature branch.

## Non-goals / pitfalls

- Do not write real lesson content, real tokens, real navigation logic, or real SEO/search — every stub exists only to make the build graph compile; a later plan replaces its content and takes over its `owned_paths` entry.
- Do not add a CI workflow file — that is P04's `owned_paths`, even though this plan's `npm run …` scripts are what CI will call.
- Do not touch `DECISIONS.md` — it is already correct and out of scope for every plan except an owner PR.
- Windows note: this repo is developed on Windows with Git Bash available; `scripts/git-hooks/pre-push` must be POSIX sh (`.gitattributes` already forces `eol=lf` on shell scripts — verify it still does after your edits, do not narrow that rule).
- Do not let a stub component's prop signature diverge from what its real implementing plan's Deliverables promise (check P07/P08's plan files for the exact component list) — a mismatched signature turns a later "implement the real component" plan into an unplanned refactor.

## Verification

A reviewer runs `npm ci && npm run build && npm run dev`, loads `/`, `/en/`, `/tr/`, `/design/`, and a nonexistent path, confirms each responds sensibly (even if plain/unstyled), then runs `npm run typecheck && npm run lint && npm test` and reads the pasted output in the PR.

## Handoff notes

- Done 2026-09-06 by the lead session (delegated to a Sonnet session under supervision). Verified: `npm run typecheck`, `npm run lint`, `npm run gate`, `npm test` (40 tests), `npm run build` (EN/TR/design + Pagefind index for 2 languages).
- **Deviation:** `typescript` pinned to `6.0.3` instead of `7.0.2` — `@astrojs/check` and `typescript-eslint` still require the classic compiler API. Re-pin to 7.x when both support the native compiler (follow-up for P04 or P47).
- **Deviation:** `scripts/check-no-inline-script.mjs` allows `is:inline` **with** `src=` (Astro 7 requires it to skip bundling for `/theme-init.js`); it still fails on inline script bodies, which is the actual CSP concern.
- `tsconfig.json` must not exclude `.astro/` (that is where `astro:content` types live).
- Created initial versions of files later owned by P04–P09 (content gate, layouts, pages, seed content) — those plans take ownership from here.
- `npm audit`: 2 moderate advisories in transitive deps, not investigated — track in P47.
- A bootstrap `CLAUDE.md` was added by the lead session so the next sessions can start; P11 replaces it with the full version.
