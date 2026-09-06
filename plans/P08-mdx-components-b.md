---
id: P08
title: "'MDX components B: quiz, decision trees, feedback'"
milestone: M0
status: review
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
updated_at: 2026-09-06T21:17:00Z
open_questions:
  - "src/pages/design/index.astro (the /design/ gallery) is P05's owned_paths, not this plan's, and P05 is already done — so this plan could not add its five components' gallery entries there. It verified them by temporarily wiring Quiz/DecisionTree/Helpful/Giscus/YouTubeCard into that file locally (real `npm run build` + Playwright runs against the real rendered output — see Handoff notes for exact evidence), then reverted the file before committing. P12 (the M0 release plan, which depends on P07/P08/P09 and whose own acceptance criteria already say '/design/ shows every M0 component (P05, P07, P08, P09) populated') is the plan that should paste the ready-made snippet in this plan's Handoff notes into that page's '#components' section, replacing the 'lands in P07/P08' pending note for the five components this plan owns."
  - "The lesson page (src/pages/[lang]/[level]/[module]/[slug]/index.astro, P06's owned_paths) has two marked insertion points ('P08 drops its <Helpful /> thumbs row in here' replacing .cc-helpful-slot, and a comment marking where <Giscus /> goes) that this plan cannot wire up itself. Exact snippets are in Handoff notes; P06 (if it reopens) or P12 should paste them in."
  - "src/env.d.ts does not exist in this repo and is not owned by any plan. Giscus.astro reads PUBLIC_GISCUS_REPO/PUBLIC_GISCUS_REPO_ID/PUBLIC_GISCUS_CATEGORY_ID via an explicit Record<string, string | undefined> cast on import.meta.env (documented in the component) because Astro's ambient ImportMetaEnv interface has no index signature for custom keys. Whoever eventually owns src/env.d.ts (P01 already shipped without one; maybe P09 or a small follow-up) should add a typed ImportMetaEnv augmentation for PUBLIC_GISCUS_* (and any other PUBLIC_* vars later plans introduce) so future code can use plain dot access."
  - "e2e/** is P04's owned_paths (done). This plan's Quiz-localStorage-round-trip and a11y-of-these-five-components proofs were run as a TEMPORARY, uncommitted Playwright suite (playwright.p08.config.ts + e2e-p08-tmp/, both deleted before commit per this plan's own Verification section) against a locally, temporarily-modified /design/ page — real output pasted into Handoff notes, nothing fabricated (D093), but no permanent e2e spec exists in the committed tree for these components yet. A follow-up (P12, or whoever next owns e2e/**) should promote e2e-p08-tmp/p08-components.spec.ts's content (reproduced in Handoff notes) into a permanent e2e/quiz.spec.ts or fold it into e2e/lesson.spec.ts once a real lesson uses these components."
  - "Helpful.astro's POST body is `{ lessonId, lang, vote }` (this plan's own Scope text says `{ lessonId, vote }` only, but the orchestrating brief for this session specified including `lang`). The Worker's parseFeedbackPayload accepts lang as an optional string and ignores it for validation/storage purposes, so both shapes work against it — flagging the discrepancy rather than silently picking one wording."
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

### What changed

- `src/components/mdx/Quiz.astro` — multiple-choice question, props-driven (`lessonId`, `questionId`, `lang`, `options[]`, plus an optional `prompt` string or default-slot children for richer markup). Native `<input type="radio">`s in a `<fieldset>`/`<legend>` (real keyboard support, no custom ARIA widget). Selecting an option reveals that option's explanation *and* the correct option's explanation (so a wrong answer still shows the right one), persists `{ answers, score, total }` to `localStorage['cc:quiz:<lessonId>']` via `src/lib/progress.ts`'s `readQuiz`/`writeQuiz` (P06), and recomputes `score`/`total` across every `<Quiz>` on the page sharing that `lessonId`. Reload re-hydrates the same feedback state from storage. Several quizzes per page work (each needs its own `questionId`).
- `src/components/mdx/DecisionTree.astro` — inline SVG from a small declarative `nodes[]`/`edges[]` prop shape (absolute node boxes + named edges with an optional label); edge geometry (a cubic-bezier connector + label midpoint) is computed here, not hand-authored. `role="img"` + real `<title>`/`<desc>` elements, every node/edge label is real SVG `<text>` (selectable, Ctrl+F-able), plus a visually-hidden `<figcaption>` with a plain-language list of every decision for screen readers. All colour via `var(--color-*)` — zero hex/rgb in the file (`node scripts/check-raw-colors.mjs` passes) — so it repaints on theme change with no JS.
- `src/components/mdx/Helpful.astro` — thumbs up/down as inline SVG (no emoji, per this session's brief — D067 names the concept as "👍/👎" but `docs/design/canvas-out/Components.dc.html`'s actual "Was this helpful?" row already uses the same inline-SVG thumb icon this component reuses verbatim). POSTs `{ lessonId, lang, vote }` JSON to same-origin `/api/feedback`. On success: stores the vote in `localStorage['cc:helpful:<lessonId>']` and shows a thank-you line. On any failure — network error or non-2xx, which today always means non-2xx since the Worker isn't deployed (O8) — hides the buttons and reveals a templated GitHub Issues link (`REPO_URL/issues/new?title=...&body=...&labels=feedback`) instead, via a `.catch()` so nothing throws unhandled. A stored vote short-circuits future visits straight to the thank-you state.
- `src/components/mdx/Giscus.astro` — reads `PUBLIC_GISCUS_REPO`/`PUBLIC_GISCUS_REPO_ID`/`PUBLIC_GISCUS_CATEGORY_ID`; renders the real `giscus.app/client.js` script tag with `data-*` attrs when all three are set, otherwise a labeled "Comments are not yet enabled" note. A second, always-present hoisted `<script>` keeps the giscus iframe's theme synced to `data-theme` via `postMessage` (self-guards to a no-op when no `[data-cc-giscus]` element exists on the page).
- `src/components/mdx/YouTubeCard.astro` — a link card (chip "video", title, channel · duration, thumbnail), `target="_blank" rel="noopener noreferrer"`, zero `<iframe>` and zero embedded-player script (D042). **Thumbnail uses a plain `<img>`, not Astro's `<Image>`/`astro:assets`** — this is `output: 'static'` with no server runtime, so `<Image>` would fetch each remote `i.ytimg.com` thumbnail over the network at *build* time; a plain `<img loading="lazy">` avoids a build-time network dependency for a purely decorative asset the browser already gets pre-optimised from YouTube's own CDN. `astro.config.ts`'s `image.domains: ['i.ytimg.com']` allow-list is left as-is for a future plan that wants build-time optimisation.
- `worker/**` — a **separate** Node/TypeScript project (own `package.json`/`tsconfig.json`/`vitest.config.ts`, not touching the root ones, which this plan doesn't own) implementing `POST /api/feedback` and `GET /api/feedback/:lessonId` against a small structural `KVNamespaceLike` interface (no `@cloudflare/workers-types` dependency — see the comment at the top of `worker/src/index.ts` for why: the file is type-checked both by its own `worker/tsconfig.json` *and*, because root `tsconfig.json`'s implicit `include` covers the whole repo and isn't ours to change, by `npm run typecheck`/`astro check` at the root too). Validates `{ lessonId: string, vote: 'up'|'down' }` strictly (rejects anything else with 400), accepts an optional `lang` passthrough, applies a 12h per-client-per-lesson vote de-dupe via KV (idempotent repeat, not an error), and returns running `{ up, down }` counts. `worker/README.md` documents local dev/test (no Cloudflare account needed) and the exact owner steps to deploy (O8) — no account/zone/namespace id committed.

### Decisions taken

- **Icons, not emoji, for Helpful** — the session brief said "icons as inline SVG, no emoji" where D067's prose says "👍/👎"; `Components.dc.html` (the approved canvas export) already draws this exact row with inline-SVG thumb icons, so there's no real conflict — implemented as SVG.
- **Helpful's POST body includes `lang`** — this plan's own Scope text says `{ lessonId, vote }`; the session brief said `{ lessonId, lang, vote }`. Implemented with `lang` included; the Worker's `parseFeedbackPayload` treats `lang` as optional and ignores it for validation/storage, so it's compatible with a stricter two-field caller too. Recorded as an `open_questions` entry rather than silently picking one wording.
- **YouTubeCard: plain `<img>`, not `<Image>`** — see "What changed" above; this is the plan's own offered alternative ("or a plain `<img>` if remote optimisation is not possible at build — say which").
- **Giscus env access via a `Record` cast, not typed dot access** — `src/env.d.ts` doesn't exist in this repo and isn't owned by any plan (see `open_questions`), so `import.meta.env.PUBLIC_GISCUS_REPO` would be a real `astro check` error against the stock `ImportMetaEnv` interface (no index signature). Cast scoped to this one file.
- **Giscus's theme-sync `<script>` is unconditional, internally guarded** — an earlier version nested it inside `{enabled && (<script>...)}`; `prettier --check` (via `prettier-plugin-astro`) cannot parse a `<script>` element inside a JS `&&` expression (confirmed empirically — see Verification below), even though Astro's own compiler (`astro check`) accepts it fine. Moved the script to always render, with an internal `document.querySelector('[data-cc-giscus]')` guard that makes it a correct no-op when comments are disabled.
- **`worker/` is a fully separate npm project** — root `package.json`/`vitest.config.ts` are not in this plan's `owned_paths`/`shared_paths`, so the Worker cannot be wired into the root `npm test` (which also wouldn't pick it up anyway — `vitest.config.ts`'s `include` is `tools|scripts|src/**`). `cd worker && npm ci && npm test` runs its own 25-test Vitest suite against an in-memory `KVNamespaceLike` stand-in.

### Verification (real output)

`worker/` (separate project):

```
$ cd worker && npm ci && npm test
...added 38 packages...
 Test Files  1 passed (1)
      Tests  25 passed (25)

$ npm run typecheck
> tsc --noEmit
(no output — 0 errors)
```

Root project, with the five new components + `worker/**` present (nothing else changed):

```
$ npm run typecheck        # astro check
Result (83 files):
- 0 errors
- 0 warnings
- 8 hints             (pre-existing eslint.config.js/build.mjs hints, unrelated to this plan)

$ npm run lint             # eslint . && prettier --check . && check-no-inline-script
Checking formatting...
All matched files use Prettier code style!
check-no-inline-script: OK (45 files scanned)

$ node scripts/check-raw-colors.mjs
check-raw-colors: OK (49 files scanned)

$ node scripts/check-public-hygiene.mjs
public-hygiene: OK (tracked)

$ npm run gate
content gate: OK (60 files checked)

$ npm test                 # vitest run --coverage (root suite; does not include worker/)
 Test Files  13 passed (13)
      Tests  104 passed (104)

$ npm run build
...
check-no-inline-script (dist): OK (64 files scanned)

$ node tools/plan/cli.ts check
ok: 48 plans, frontmatter valid, DAG acyclic, no owned_paths overlap, STATE.md fresh
```

`gitleaks` is not installed in this environment — **not run**, flagged as unverified (CI runs it independently per `.claude/rules/public-hygiene.md`).

**Giscus enabled branch** (the only code path that never renders on `/design/`'s current pending placeholder): temporarily added `import Giscus …` + `<Giscus lang="en" />` to `src/pages/design/index.astro` and built with real env vars, then reverted:

```
$ PUBLIC_GISCUS_REPO="codechup/claude-code-training" PUBLIC_GISCUS_REPO_ID="R_test123" \
  PUBLIC_GISCUS_CATEGORY_ID="DIC_test456" npm run build
check-no-inline-script (dist): OK (64 files scanned)

$ grep -o '<script[^>]*giscus.app[^>]*></script>' dist/design/index.html
<script src="https://giscus.app/client.js" data-repo="codechup/claude-code-training"
  data-repo-id="R_test123" data-category-id="DIC_test456" data-mapping="pathname"
  data-strict="0" data-reactions-enabled="1" data-emit-metadata="0"
  data-input-position="bottom" data-theme="light" data-lang="en"
  crossorigin="anonymous" async></script>
```

Confirms env vars flow through and the `<script src=... is:inline>` emits a proper external `<script>…</script>` tag (not an inline body) both with and without the vars set. The postMessage theme-sync itself was **not** exercised against a real giscus iframe (no live network fetch of a real discussion in this environment) — unverified, low-risk (it's a two-line `postMessage` call gated behind an element-exists check).

**Playwright, temporary config (`playwright.p08.config.ts`, port 4408, deleted after use)**: `/design/index.astro` was temporarily edited to wire in real usage examples of all five components (snippet below, for whoever does the permanent integration), built, and driven with a Playwright suite covering the plan's own acceptance criteria — then the temporary config, the temporary `e2e-p08-tmp/` spec directory, and the `/design/` edit were all removed/reverted before this commit (nothing in the committed diff renders these components yet — see `open_questions`).

```
Running 18 tests using 10 workers
✓ Quiz › answering persists to localStorage and reloading shows the same feedback state (phone + desktop)
✓ Quiz › is keyboard operable (Tab + arrow keys + Space select an option) (phone + desktop)
✓ DecisionTree › node and edge-label text is real, Ctrl+F-searchable text content (phone + desktop)
✓ DecisionTree › repaints with the theme toggle (no hard-coded hex; uses CSS custom properties) (phone + desktop)
✓ Helpful › shows the GitHub-issues fallback when /api/feedback 404s (phone + desktop)
✓ Giscus › shows the disabled placeholder when env vars are unset (no script tag, no console error) (phone + desktop)
✓ YouTubeCard › renders no iframe and no embedded player script (phone + desktop)
✓ a11y: /design/ with P08 components wired in — 0 serious/critical axe violations (phone + desktop)
✓ Gallery screenshots (evidence only) › components section, light and dark

18 passed (10.8s)
```

Four screenshots were captured during this run (`helpful-fallback.png`, `giscus-disabled.png`, `components-light.png`, `components-dark.png`) and saved to this session's scratchpad (not committed — screenshots are never committed per `plans/README.md` §6, and this environment has no way to upload them as real PR image attachments via CLI). They show, respectively: the Helpful widget with buttons hidden and the "Tell us on GitHub" link visible; the Giscus "Comments are not yet enabled" dashed-border note; and the full components gallery block (Quiz, DecisionTree, Helpful, Giscus-disabled, YouTubeCard) rendering correctly in both light and dark themes side by side. A reviewer who wants the actual images can reproduce them with the steps above (see "Ready-to-paste gallery snippet" below for the exact block used) — this is disclosed rather than fabricated per D093.

### Ready-to-paste `/design/` gallery snippet (for P12 — see `open_questions`)

Add to `src/pages/design/index.astro`'s imports:

```ts
import Quiz from '../../components/mdx/Quiz.astro';
import DecisionTree from '../../components/mdx/DecisionTree.astro';
import Helpful from '../../components/mdx/Helpful.astro';
import Giscus from '../../components/mdx/Giscus.astro';
import YouTubeCard from '../../components/mdx/YouTubeCard.astro';
```

Replace the "Callout ... Quiz option states and the DecisionTree SVG land in P07/P08" pending paragraph in the `#components` section with a P07-only pending note (Callout/CodeBlock), then add:

```astro
<div class="card flex flex-col gap-3 p-5">
  <span class="eyebrow">Quiz</span>
  <Quiz
    lessonId="_design-gallery"
    questionId="q1"
    lang="en"
    prompt="Which scope can set bypassPermissions?"
    options={[
      { text: 'Project .claude/settings.json', explanation: 'Ignored there.' },
      { text: 'User or managed settings', correct: true, explanation: 'Correct — project scope cannot set it.' },
      { text: 'Any scope' },
    ]}
  />
</div>

<div class="card flex flex-col gap-3 p-5">
  <span class="eyebrow">DecisionTree</span>
  <DecisionTree
    title="Hook, skill, or agent?"
    desc="A short decision tree for choosing between a hook and a skill."
    lang="en"
    nodes={[
      { id: 'start', x: 10, y: 70, width: 150, height: 44, lines: ['Should it run', 'every time?'] },
      { id: 'hook', x: 220, y: 20, width: 130, height: 40, lines: ['Write a hook'] },
      { id: 'needs-tools', x: 220, y: 120, width: 130, height: 40, lines: ['Needs tools?'] },
      { id: 'skill', x: 390, y: 120, width: 120, height: 40, lines: ['Skill'] },
    ]}
    edges={[
      { from: 'start', to: 'hook', label: 'yes' },
      { from: 'start', to: 'needs-tools', label: 'no' },
      { from: 'needs-tools', to: 'skill', label: 'yes' },
    ]}
  />
</div>

<div class="card flex flex-col gap-3 p-5">
  <span class="eyebrow">Helpful (backend not deployed — fallback shown, O8)</span>
  <Helpful lessonId="_design-gallery" lang="en" />
</div>

<div class="card flex flex-col gap-3 p-5">
  <span class="eyebrow">Giscus (not yet enabled — O6)</span>
  <Giscus lang="en" />
</div>

<div class="card flex flex-col gap-3 p-5">
  <span class="eyebrow">YouTubeCard</span>
  <YouTubeCard videoId="dQw4w9WgXcQ" title="Hooks in 12 minutes" channel="Anthropic" duration="12:04" lang="en" />
</div>
```

### Ready-to-paste lesson-page wiring (for whoever next owns the lesson page, P06/P12)

In `src/pages/[lang]/[level]/[module]/[slug]/index.astro`: replace the `<span class="muted cc-helpful-slot">{strings.wasThisHelpful}</span>` placeholder with `<Helpful lessonId={entry.id} lang={lang} />`, and replace the `{/* P08 also owns <Giscus />; this comment is the agreed insertion point. */}` comment with `<Giscus lang={lang} />` (both need an import added alongside the existing `LessonMeta`/`PrevNext`/`ProgressBar` imports).

### Known gaps / unverified

- Giscus's `postMessage` theme sync was not exercised against a real giscus iframe (no live network discussion in this environment).
- The Worker was proven only against `worker/src/index.test.ts`'s in-memory `KVNamespaceLike`, never against the real Cloudflare Workers runtime/KV or `wrangler dev` (not installed here — see `worker/README.md` for how).
- `gitleaks` was not run locally (not installed); CI runs it independently.
- TR strings in all five components (`lang === 'tr'` branches) are original translations by this session, not reviewed by a native speaker.
- No permanent Playwright spec exists yet for these components (see `open_questions` — `e2e/**` isn't this plan's to own).
