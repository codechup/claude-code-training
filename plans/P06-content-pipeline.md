---
id: P06
title: "'Content pipeline: collections, routes, and landing'"
milestone: M0
status: done
owner: fable-lead-2026-09-06
branch: plan/06-content-pipeline
model_hint: fable
effort_hint: high
depends_on: [P04, P05]
owned_paths:
  - src/content.config.ts
  - src/content/**
  - src/lib/**
  - src/layouts/**
  - src/pages/[lang]/**
  - src/pages/404.astro
  - src/pages/index.astro
  - src/components/lesson/**
  - src/components/shell/Header.astro
  - src/components/shell/Footer.astro
  - src/components/shell/LangSwitch.astro
  - content/**
shared_paths: []
estimate: L
updated_at: 2026-09-06T20:22:06Z
open_questions: []
---

## Goal

Build the real content pipeline: Astro content collections and the `content/schema.ts` zod schema, `src/lib/nav.ts` (the level/module/lesson tree every navigation component reads from) and its sibling helpers, the real layouts, the `[lang]/…` route tree (locale index, level index, module index, lesson page), the real `404.astro` and JS-fallback `index.astro`, the lesson-scoped shell components (`LessonMeta`, `PrevNext`, `ProgressBar`, `TOC`, `Sidebar`, `Helpful`, `Giscus` wrapper — wait, `Helpful`/`Giscus` proper are P08's MDX components; this plan's `lesson/**` set is the layout-adjacent ones only, see Scope), `Header`/`Footer`/`LangSwitch`, and the landing page (hero, level cards, curriculum map teaser, "what changed" feed, terminal animation). Alongside the code, this plan also **scaffolds the entire `content/` tree** — every level/module `index.mdx` in both languages, so routing and the content gate have real pages to build against before any lesson plan exists.

## Context

Read `docs/design/CANVAS.md` (P00, approved) and `/design/`'s token dump (P05) for the landing/lesson visual reference; `docs/CURRICULUM.md` (P03) for the full level/module list and slugs this plan's nav tree and content scaffold must match exactly; `DECISIONS.md` D013–D020 (Astro/MDX/i18n/content trees, EN source, root redirect, code block features, progress in localStorage), D061–D065 (nav shape, landing sections, lesson metadata, SEO hooks this plan must leave room for), D068 (build gates P04 already wrote against a stub schema — this plan's real `content/schema.ts` must keep the same import shape P04's `content-gate.ts` and `src/integrations/content-gates.ts` expect, or coordinate a matching update with P04 in the same PR). This plan's files exist today only as P01 stubs; this plan replaces them and becomes their permanent owner. `content/_shared/{sources.json,transcripts/**}` do not belong to this plan (P23 and each content plan respectively own them) — do not create anything under `content/_shared/` here.

Like P01 scaffolding `src/**` for P04–P09, this plan scaffolds `content/**` for every later content plan: it creates every level's and module's `index.mdx` (in both `en` and `tr`) and exactly one placeholder lesson pair (see Scope) so the nav tree, routing, and `content-gate.ts` have real, valid content to run against at the end of M0. **Ownership of each module's lesson files passes to the plan named for that module the moment that plan is claimed** (`m01-start` → P13, `m02-interact` → P14, … see `plans/ROADMAP.md`'s table for the full module → plan map); this plan never edits a lesson file again once P12 (which turns the placeholder into the first real lesson) is claimed.

## Scope

In:
- `src/content.config.ts` and `src/content/schema.ts`: `lessons` collection (glob `*/l*/m*/NN-*.mdx`) and `sections` collection (glob for level/module `index.mdx`), zod schema per the frontmatter spec: `title, description, level, module, order, duration_min, difficulty, tags[], verified_version, updated, draft, sources[]{type, title, url, channel?, duration?, verified_at}, lab?: {repo_tag}` — `lang`, `level`, `module`, `slug` are derived from the file path in a loader, never typed by the author.
- `src/lib/nav.ts` (builds the level → module → lesson tree, sorted by `order`, from the collections), `src/lib/slugs.ts`, `src/lib/progress.ts` (the `cc:progress:<lang>` / `cc:quiz:<lessonId>` localStorage helpers, wrapped in try/catch per D020), `src/lib/os-pref.ts` (the `cc:os` OS-tab-persistence helper), `src/lib/i18n/ui.ts` (UI-string dictionary for `en`/`tr` chrome text — not lesson content).
- `src/layouts/{Base,Lesson,Section,Landing,Design}.astro` (real implementations; `Design.astro` is the layout P05's `/design/` page uses — coordinate any prop-shape need with P05's Handoff notes rather than guessing).
- Routes: `src/pages/[lang]/index.astro` (locale landing — hero, level cards, curriculum map teaser, "what changed" feed reading from `research/deprecations.md`-derived content, terminal animation), `src/pages/[lang]/[level]/index.astro`, `src/pages/[lang]/[level]/[module]/index.astro`, `src/pages/[lang]/[level]/[module]/[slug]/index.astro` (the real lesson page, composing the MDX body with `LessonMeta`/`Sidebar`/`TOC`/`PrevNext`/`ProgressBar`); `src/pages/404.astro` (real, styled, per-locale-aware if feasible); `src/pages/index.astro` (the real JS-fallback redirect to `/en/`, honoring `document.cookie['cc_lang']` before `navigator.language`, per D017).
- `src/components/lesson/{LessonMeta,PrevNext,ProgressBar,TOC,Sidebar}.astro` (page-chrome components that read `nav.ts`/`progress.ts`; `Helpful` and `Giscus` are P08's MDX-facing components — if the lesson layout needs a slot for them, leave the slot and let P08 fill it, do not build a placeholder version of either here).
- `src/components/shell/{Header,Footer,LangSwitch}.astro` (`LangSwitch` swaps the first path segment and sets the `cc_lang` cookie per D017's architecture note — `ThemeToggle` and `Search` are P05's and P09's respectively; leave their slots in `Header.astro` empty/commented until those plans land).
- **Content scaffold**: `content/en/<level>/index.mdx` and `content/en/<level>/<module>/index.mdx` for all 21 modules across `l1-beginner`…`l4-master`, plus `content/en/playbook/index.mdx` and `content/en/meta/index.mdx`; the same set under `content/tr/**` (as real, non-draft section-index copy — section indexes are not lessons and are not subject to the draft mechanism); one placeholder lesson pair, `content/en/l1-beginner/m01-start/00-placeholder.mdx` and its `content/tr/**` counterpart, `draft: true` in both languages, clearly marked as a build-graph placeholder in an HTML comment — P12 replaces it with the real first lesson and deletes it.
- `content/tr/playbook/glossary.mdx`: an empty-but-valid stub (frontmatter only, a one-line "this page is built incrementally as lessons are translated" note) that later TR translation plans (P25, P26, P40, P41) append to and P44 finalizes.
- The draft mechanism itself: `content-gate.ts`'s parity check (P04) already expects a TR file to exist per EN file; this plan makes sure a `draft: true` lesson/section is excluded from `nav.ts`'s tree, from the sitemap/RSS inputs, and from Pagefind's indexing set, and that `LangSwitch` shows "Türkçesi hazırlanıyor" when the target-language page is a draft.

Out: the MDX components themselves (Callout, CodeBlock, OSTabs, Transcript, Sources, WhenNotToUse, Lab → P07; Quiz, DecisionTree, Helpful, Giscus, YouTubeCard → P08); Pagefind wiring, sitemap/RSS/OG, robots.txt, the `Search` component (P09); any real lesson content beyond the one placeholder (P12 onward); `content/_shared/**` (P23 and each content plan).

## Deliverables

`src/content.config.ts`, `src/content/schema.ts`, `src/lib/{nav,slugs,progress,os-pref}.ts`, `src/lib/i18n/ui.ts`, `src/layouts/{Base,Lesson,Section,Landing,Design}.astro`, the four `src/pages/[lang]/**` route files, `src/pages/404.astro`, `src/pages/index.astro`, `src/components/lesson/{LessonMeta,PrevNext,ProgressBar,TOC,Sidebar}.astro`, `src/components/shell/{Header,Footer,LangSwitch}.astro`, every `content/{en,tr}/<level>/index.mdx` and `<level>/<module>/index.mdx` (46 files: 4 levels + 21 modules + playbook + meta = 27, × 2 languages = 54 — recount exactly against `docs/CURRICULUM.md`'s module list and ship whatever that count actually is), the placeholder lesson pair, `content/tr/playbook/glossary.mdx`.

## Acceptance criteria

- `npm run build` succeeds; `dist/en/index.html`, `dist/tr/index.html`, `dist/en/l1-beginner/index.html`, `dist/en/l1-beginner/m01-start/index.html`, and `dist/en/l1-beginner/m01-start/00-placeholder/index.html` (or its final slug) all exist — same set under `dist/tr/`.
- `node scripts/content-gate.ts` passes against the full scaffolded tree (EN/TR parity holds for every section index and the placeholder lesson).
- Visiting `/en/` shows the hero, level cards linking to real level pages, a curriculum map teaser, and a "what changed" feed with at least one real entry sourced from `research/deprecations.md`; visiting `/tr/` shows the Turkish chrome text (from `lib/i18n/ui.ts`) with correct diacritics.
- The placeholder lesson is visitable at its real route and is visually marked as a placeholder (not indistinguishable from a real lesson) so nobody mistakes it for finished content in a screenshot.
- `LangSwitch` on the placeholder lesson, when the target language's version is `draft: true`, shows "Türkçesi hazırlanıyor" instead of navigating to a broken page (test both directions once real drafts exist from P13 onward — for this plan's own PR, verify the mechanism against the placeholder pair, which is `draft: true` in both languages, so verify the reverse case with a temporary fixture and remove the fixture before merging).
- `npx playwright test e2e/shell.spec.ts` (theme toggle is P05's, but LangSwitch round-trip and nav-tree rendering are this plan's) passes; `e2e/lesson.spec.ts`'s previously-`fixme`'d specs (P04) can now be un-skipped for at least the placeholder lesson route and pass.
- `localStorage['cc:progress:en']` and `localStorage['cc:quiz:<id>']` round-trip correctly when exercised manually (or via a Vitest DOM test) against `progress.ts`.

## Steps

1. Write `content/schema.ts` and `content.config.ts`; get one hand-written fixture lesson (later replaced by the real placeholder) validating.
2. Write `nav.ts` and the other `lib/*` helpers with unit tests before wiring any UI to them.
3. Write layouts, then the four route files, in order of the render tree (Base → Section/Lesson → the four pages) so each stage has something real to render against.
4. Write `404.astro` and the real `index.astro` fallback (test the cookie-vs-Accept-Language precedence by hand).
5. Write the lesson-chrome components and the shell components (leaving explicit, commented slots for P05's `ThemeToggle`, P09's `Search`, P08's `Helpful`/`Giscus`).
6. Scaffold every `content/**` section index and the placeholder lesson pair; run `content-gate.ts` and `astro check` after each language's batch, not only at the end.
7. Build the landing page's four sections against the real nav tree and a real (if sparse) "what changed" feed.
8. Un-skip the `e2e/lesson.spec.ts`/`shell.spec.ts` specs P04 marked `fixme` for this plan and confirm they pass; paste the full local gate run (`typecheck`, `lint`, `content-gate`, `test`, `build`, `playwright`) into the PR.

## Tests required

- Vitest unit tests for `nav.ts` (tree shape, ordering, draft exclusion), `progress.ts`/`os-pref.ts` (localStorage round-trip, try/catch on a throwing storage mock).
- `e2e/shell.spec.ts` (LangSwitch round-trip including the "Türkçesi hazırlanıyor" case) and the now-unskipped parts of `e2e/lesson.spec.ts` against the placeholder lesson.
- `node scripts/content-gate.ts` clean against the full scaffolded content tree.

## Non-goals / pitfalls

- Do not write real lesson prose for `00-placeholder.mdx` — it exists purely to prove the routing/build/gate pipeline; P12 deletes it.
- Do not build `Helpful`, `Giscus`, `Quiz`, `DecisionTree`, `YouTubeCard`, `Callout`, `CodeBlock`, `OSTabs`, `Transcript`, `Sources`, `WhenNotToUse`, or `Lab` — every one of those is P07's or P08's; leave a named, commented slot instead.
- Do not build `ThemeToggle` or `Search` — leave their slots in `Header.astro` for P05 and P09.
- Do not touch `content/_shared/**` — P23 seeds `sources.json`, and each content plan owns its own transcripts subfolder.
- Once a module's real lesson plan is claimed (P13 onward), never edit that module's `content/**` files again from this plan — this plan's ownership of `content/**` is scaffold-only and ends the moment a later plan takes over a given module (mirrors P01's `src/**` handoff).
- Windows/Turkish note: verify `content/tr/**` frontmatter and body text render diacritics correctly — a mis-encoded save (not UTF-8) will silently corrupt ş/ğ/ı/İ/ö/ü/ç.

## Verification

A reviewer runs `npm run dev`, browses `/en/` → a level → a module → the placeholder lesson, switches to `/tr/` via `LangSwitch` at each level, confirms the "Türkçesi hazırlanıyor" behavior on a temporarily-drafted fixture, and reads the Vitest/Playwright output pasted in the PR.

## Handoff notes

- **Done 2026-09-06 (lead session with two supervised sub-sessions: content scaffold on Sonnet, pipeline code on Opus).** Delivered: real schema + collections (lessons `*/*/*/NN-*.mdx`, sections incl. standalone `playbook/`/`meta/` pages), `src/lib/{nav,slugs,progress,os-pref,changes}.ts`, `src/lib/i18n/ui.ts`, layouts Base/Lesson/Section/Landing/Design, routes for locale landing / level / module / lesson / 404 / root fallback, lesson chrome (LessonMeta, PrevNext, ProgressBar, TOC, Sidebar), shell (Header with lockup, Footer, LangSwitch with cookie + draft-aware "Türkçesi hazırlanıyor"), landing (hero transcript, level cards, curriculum map, What changed feed from `src/lib/changes.ts`), and the full `content/` scaffold: 6 level/section indexes + 21 module indexes + glossary per language, one placeholder lesson pair.
- **Decisions taken:** placeholder lessons are `draft: false` with tag `placeholder` (visible banner) so the route exists and parity holds — P12 deletes them. Seed lesson renamed to `01-what-claude-code-is` to match CURRICULUM. `scripts/content-gate.ts` (P04) extended in this PR to accept depth-3 section pages under `playbook/`/`meta/` (coordinated update, as the plan's Context allowed).
- **CSP fix (cross-cutting):** Astro inlined small hoisted scripts into HTML, which `script-src 'self'` would block; `astro.config.ts` now sets `vite.build.assetsInlineLimit: 0` and `postbuild` runs `check-no-inline-script.mjs --dist` (0 inline scripts across 64 pages). P09 must keep this when adding search/analytics.
- **Evidence:** `npm run typecheck` 0 errors · lint green (prettier, inline-script, hygiene, raw colours) · gate OK (60 files) · vitest 12 files / 92 tests · build 64 pages + Pagefind (2 languages) · Playwright shell+lesson+a11y 44 passed / 4 skipped (remaining fixmes: P07 OSTabs, P12 full curriculum), axe serious/critical 0 at 390 and 1280.
- **Open for later plans:** P07/P08 replace the inline Sources list and fill the Helpful/Giscus slots; P09 owns sitemap/RSS/Pagefind draft exclusion and the search slot in Header; MDX drops HTML comments — placeholder marker is `{/* build-graph placeholder: replaced by P12 */}`.
