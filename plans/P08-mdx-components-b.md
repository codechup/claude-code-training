---
id: P08
title: "'MDX components B: quiz, decision trees, feedback'"
milestone: M0
status: in_progress
owner: session-p08-2026-09-06
branch: plan/08-mdx-components-b
model_hint: sonnet
effort_hint: medium
depends_on: [P06]
owned_paths:
  - src/components/mdx/Quiz.astro
  - src/components/mdx/DecisionTree.astro
  - src/components/mdx/Helpful.astro
  - src/components/mdx/Giscus.astro
  - src/components/mdx/YouTubeCard.astro
  - worker/**
shared_paths: []
estimate: M
updated_at: 2026-09-06T20:22:07Z
open_questions: []
---

## Goal

Implement the five interactive/social MDX components — `Quiz` (multiple choice, instant feedback, `localStorage` results), `DecisionTree` (inline theme-aware SVG), `Helpful` (👍/👎 feedback posting to a Cloudflare Worker + KV), `Giscus` (GitHub Discussions comments wrapper), `YouTubeCard` (link card, no embed) — plus the Worker source itself under `worker/**`. Two of these depend on owner setup that may not exist yet (giscus needs O6, the feedback Worker needs O8 and may be deferred per the approved plan); both components must degrade visibly and gracefully rather than break the page when their backend is not configured.

## Context

Read `DECISIONS.md` D064 (quiz mechanics), D067/D069 (feedback: 👍/👎 via Worker+KV, folded; templated GitHub Issues link; giscus), D091–D092 (Playbook decision trees, inline SVG, theme-aware). Read the architecture note on `Helpful`: "posts to same-origin `/api/feedback`, served by a Cloudflare Worker route `cc.codechup.com/api/*` + KV; origin nginx answers 404 for `/api/` and the component hides on failure (O8 may defer this)" — build exactly this contract: the component always tries the POST, and on any non-2xx response (including the expected 404 when the Worker is not yet deployed) it falls back to showing the templated GitHub Issues link instead of a broken control, never a JS error in the console. `Giscus.astro` needs the owner's repo/category IDs (O6); until they exist, render nothing (or a clearly-labeled "comments not yet enabled" note) rather than an embed pointed at placeholder IDs. `content/schema.ts` (P06) does not carry quiz data in frontmatter — quiz questions live in the MDX body as a component prop, per the lesson template's own Quiz section.

## Scope

In:
- `Quiz.astro`: multiple-choice questions (prop-driven, authored inline in the lesson MDX), instant per-question feedback (correct/incorrect + a one-line explanation), a result stored in `localStorage['cc:quiz:<lessonId>']` (via `src/lib/progress.ts` from P06), wrapped in try/catch.
- `DecisionTree.astro`: renders an inline `<svg>` (no external image, no diagramming library) representing a yes/no or multi-branch decision tree, theme-aware (uses `currentColor`/CSS custom properties so it repaints correctly in dark/light without a second asset) and accessible (each node/edge has real text content, not text-as-path, so it is screen-reader- and Ctrl+F-navigable).
- `Helpful.astro`: two buttons (👍/👎), POSTs `{ lessonId, vote }` to `/api/feedback`; on success shows a thank-you state; on any failure (network error, non-2xx, or the expected 404 pre-O8) falls back to a "was this helpful? tell us on GitHub" link using the GitHub Issues template URL — the fallback path must be exercised and screenshotted since `/api/feedback` will 404 until O8 is done.
- `Giscus.astro`: a thin wrapper around the real giscus embed script, reading repo/category IDs from an Astro public env var (`PUBLIC_GISCUS_REPO_ID`/`PUBLIC_GISCUS_CATEGORY_ID`) that is unset until O6 is done; when unset, render a labeled "comments not yet enabled" placeholder instead of a broken script tag.
- `YouTubeCard.astro`: title + duration + channel + thumbnail (`i.ytimg.com`, already allow-listed in `astro.config.ts`'s `image.domains` by P01) as a plain link card — no `<iframe>`, ever (D042).
- `worker/`: the Cloudflare Worker source for `/api/feedback` (`worker/src/index.ts` or equivalent, `wrangler.toml`), a KV binding for vote counts keyed by `lessonId`, basic rate limiting/validation (reject anything that is not `{lessonId: string, vote: 'up'|'down'}`), and a short `worker/README.md` explaining it is deployed separately from the static site (Cloudflare Workers, not the static host) and listing the one owner step (O8: `wrangler login` or a `CLOUDFLARE_API_TOKEN` secret) that activates it — this plan ships the Worker's source and local test but does not itself deploy it (deployment, if the owner wants it before P45, is a follow-up `open_questions` entry naming this plan).
- Gallery entries for all five components in `/design/`, including a visible "not yet enabled" state screenshot for `Giscus` and a "backend not deployed, fallback shown" state for `Helpful`.

Out: `Callout`, `CodeBlock`, `OSTabs`, `Transcript`, `Sources`, `WhenNotToUse`, `Lab` (P07); any lesson content; deploying the Worker to production (owner action, O8); the static site's own deploy workflow (P10).

## Deliverables

`src/components/mdx/{Quiz,DecisionTree,Helpful,Giscus,YouTubeCard}.astro`, `worker/**` (source + `wrangler.toml` + tests + README), gallery entries in `/design/`.

## Acceptance criteria

- `Quiz` records a result in `localStorage['cc:quiz:<lessonId>']` after answering, verified with a Vitest/JSDOM or Playwright check; reloading the page shows the previously-selected answer's feedback state (do not silently reset progress).
- `DecisionTree`'s SVG text is selectable/searchable (Ctrl+F finds a node label) and repaints correctly when the theme toggles (no hard-coded hex inside the SVG).
- `Helpful` posting to a nonexistent `/api/feedback` (the real state until O8) shows the GitHub Issues fallback link, not a console error or a stuck spinner — screenshot this state for the PR.
- `Giscus` with unset env vars shows the "not yet enabled" placeholder, not a broken script tag or a console error; screenshot this state too.
- `YouTubeCard`'s rendered HTML contains no `<iframe>` and no embedded player script.
- `worker/` has its own test suite (`npm test` scoped to `worker/` or a separate `vitest` project) covering the request-validation logic, runnable locally without a real Cloudflare account (`wrangler dev` or a mocked KV).
- `npx playwright test e2e/a11y.spec.ts` against `/design/`'s gallery (once P04 exists) shows 0 serious/critical violations from these five components.

## Steps

1. Build `YouTubeCard` and `DecisionTree` first (no backend dependency); verify the SVG accessibility property by hand (Ctrl+F test) and the theme repaint.
2. Build `Quiz` against `progress.ts`; test the localStorage round-trip.
3. Build the `worker/` source and its tests independent of the Astro site; run `wrangler dev` locally (or the mocked-KV test suite) to prove the request contract works before wiring the component to it.
4. Build `Helpful.astro` against the real (currently 404-ing) `/api/feedback` path; verify and screenshot the fallback behavior.
5. Build `Giscus.astro` with the env-var-gated placeholder; screenshot the disabled state.
6. Wire all five into `/design/`'s gallery, including the fallback/placeholder states as visible, labeled examples (not hidden behind a toggle a reviewer would miss).

## Tests required

- Vitest/JSDOM (or Playwright) test for `Quiz`'s localStorage round-trip.
- `worker/`'s own request-validation test suite.
- Manual, screenshotted verification of `Helpful`'s fallback and `Giscus`'s disabled placeholder (paste both screenshots in the PR).
- `e2e/a11y.spec.ts` against `/design/`'s gallery once P04 exists.

## Non-goals / pitfalls

- Do not deploy the Worker to a real Cloudflare account from this plan — ship the source and a local test only; deployment needs O8 and is a follow-up action, not this plan's job.
- Do not hard-code a real giscus repo/category ID "to make the demo look nice" — those are the owner's real GitHub Discussions IDs (O6) and must come from env vars, unset by default.
- Do not let `Helpful` throw an unhandled promise rejection when the fetch fails — the whole point of this component is a graceful, screenshotted fallback.
- Do not build `DecisionTree`'s content as a rasterized image or via an external charting library — inline SVG only, per D092.
- Do not touch any file under `src/components/mdx/` that P07 owns.

## Verification

A reviewer opens `/design/`'s gallery, answers a `Quiz` question and reloads to confirm persistence, Ctrl+F-searches a `DecisionTree` node label, clicks `Helpful`'s thumbs-up and confirms the fallback GitHub link appears (since `/api/feedback` still 404s), and confirms `Giscus` shows its disabled placeholder rather than a broken embed.

## Handoff notes

- _Filled by the executing session: what changed, decisions, follow-ups, blockers._
