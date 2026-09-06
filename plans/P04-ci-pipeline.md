---
id: P04
title: Continuous integration pipeline
milestone: M0
status: todo
owner: null
branch: plan/04-ci-pipeline
model_hint: sonnet
effort_hint: medium
depends_on: [P01, P02]
owned_paths:
  - .github/workflows/ci.yml
  - .github/workflows/links-weekly.yml
  - scripts/content-gate.ts
  - scripts/check-no-inline-script.mjs
  - scripts/check-raw-colors.mjs
  - src/integrations/content-gates.ts
  - e2e/**
  - playwright.config.ts
  - lighthouserc.json
  - lychee.toml
shared_paths: []
estimate: L
updated_at: 2026-09-06T00:00:00Z
open_questions: []
---

## Goal

Give every PR a real quality gate before any content or design work lands: `ci.yml` runs the full quality job (typecheck, lint, the content gate, the plan-tool check, gitleaks, unit tests with coverage, build) plus an `e2e` job (Playwright + axe) and a `links` job (lychee on changed files), and `links-weekly.yml` runs a full-repo lychee sweep on a schedule and opens an issue on failure. `scripts/content-gate.ts` (called both standalone and from `astro:build:start` via `src/integrations/content-gates.ts`) enforces EN/TR route parity, the frontmatter schema, and required code-fence languages; `scripts/check-no-inline-script.mjs` and `scripts/check-raw-colors.mjs` are the two CSP/design-system lint guards the rest of the project relies on never regressing.

## Context

Read `DECISIONS.md` D036 (WCAG 2.2 AA + axe in CI), D043 (WebFetch during authoring + lychee in CI), D068 (build gates: EN/TR parity, zod schema, code-fence language tags, LHCI). This plan runs after P01 (the stub `src/**` tree, including a stub `src/content.config.ts`/`content/schema.ts` and stub pages, must already build) and P02 (`node tools/plan/cli.ts check` must already work against the real `plans/` directory). **Content does not exist yet** — P06 (which owns the real routes, nav, and landing page) has not run, and no lesson exists until P13. Write the `e2e` job's specs now, against what P01's stubs actually serve (`/`, `/en/`, `/tr/`, `/design/`, `/404/`), and mark the lesson/level-page and search specs as present-but-explicitly-pending (a skipped test with a comment naming P06/P07/P08/P09/P12, not a silently-passing no-op) — P12 (the M0 release plan) is the one that un-skips them once real content exists, as part of its own acceptance criteria.

## Scope

In:
- `ci.yml` (`pull_request`, `push: main`, `workflow_call`), `runs-on: ${{ vars.RUNNER_LABEL || 'ubuntu-latest' }}`, SHA-pinned actions throughout (no floating `@v4`-style tags):
  - **quality** job: `npm ci` → `npm run typecheck` → `npm run lint` (eslint + prettier + the two `check-*.mjs` guards) → `node tools/plan/cli.ts check` → `node scripts/content-gate.ts` → `gitleaks detect --no-git -v` → `npm test` (coverage ≥ 70% lines on `src/lib`, `tools/plan`, `scripts`) → `npm run build` (includes the pagefind postbuild once P09 wires it; a missing pagefind output before P09 must not fail this job — check for it only if `src/pages/index.astro` beyond the P01 stub signals search is wired, otherwise assert only `dist/en/index.html`, `dist/tr/index.html`, and `dist/design/index.html` from the P01 stub) → upload the `dist/` folder as artifact `site-dist`.
  - **e2e** job: Playwright, phone (390×844) and desktop (1280×800) projects, axe-core (serious/critical = 0) over every route P01's stub currently serves (`/`, `/en/`, `/tr/`, `/design/`, `/404/`); theme toggle and OS-tab-persistence specs written against P05's eventual `ThemeToggle`/`OSTabs` components but `test.fixme()`-skipped with a comment until P05/P07 land; lesson/level-page and search specs likewise `test.fixme()`-skipped until P06/P09 land, each skip comment naming the plan that unblocks it.
  - **links** job: `lychee` on files changed in the PR under `content/**`, `docs/**`, `research/**` (nothing to check yet before P03/P06, so this job is a correct no-op until then — do not special-case that, just point lychee at the changed-file diff and let it report zero files).
  - **lighthouse** job: LHCI against the `site-dist` artifact, budgets perf ≥ 0.9, a11y ≥ 0.95, best-practices ≥ 0.9, seo ≥ 0.95, mobile config — run against whatever P01's stub currently serves; the numeric budgets stand from day one so a later plan cannot quietly regress them.
- `scripts/content-gate.ts`: validates every `content/**/*.mdx` frontmatter against `src/content/schema.ts` (P06 owns the schema file itself; this script only imports and uses it — coordinate the import path so it does not break when P06 lands), checks EN/TR path parity (every `content/en/<level>/<module>/NN-slug.mdx` has a `content/tr/<level>/<module>/NN-slug.mdx` counterpart, `draft: true` or not), checks every fenced code block has a language tag, checks `level`/`module` frontmatter fields match the file's own path, and accepts a `--no-drafts` flag (used only by P45) that additionally fails if any lesson is still `draft: true`.
- `src/integrations/content-gates.ts`: a tiny Astro integration hook that calls `scripts/content-gate.ts`'s check function from `astro:build:start`, so a local `npm run build` cannot produce a `dist/` with bad content even without running CI.
- `scripts/check-no-inline-script.mjs` (fails if any `.astro` file contains `is:inline` or an inline `<script>` without `is:inline` — the CSP in the (owner-managed, private) host-side vhost change has no `'unsafe-inline'` for scripts), `scripts/check-raw-colors.mjs` (fails on a raw hex/rgb/hsl color literal outside `src/styles/tokens.css`).
- `playwright.config.ts` (phone + desktop projects, `webServer` running `npm run preview` against the built `dist/`), `e2e/{a11y.spec.ts,shell.spec.ts,lesson.spec.ts,search.spec.ts}` and `e2e/helpers/axe.ts`.
- `lighthouserc.json`, `lychee.toml` (reasonable timeout/retry defaults; excludes `localhost`/`127.0.0.1` links if any placeholder ones exist in stub content).
- `.github/workflows/links-weekly.yml` (`schedule: cron`, full-repo lychee sweep, `workflow_dispatch` too; opens a GitHub issue with the failing links on failure, does not fail the run itself).

Out: `deploy.yml` and anything deploy-related (P10); the actual `src/content/schema.ts` file content (P06 owns it — this plan only imports it, and must tolerate it not existing yet at scaffold time by importing the P01 stub); any lesson content; the design canvas or tokens.

## Deliverables

`.github/workflows/{ci.yml,links-weekly.yml}`, `scripts/content-gate.ts`, `scripts/check-no-inline-script.mjs`, `scripts/check-raw-colors.mjs`, `src/integrations/content-gates.ts`, `playwright.config.ts`, `e2e/**`, `lighthouserc.json`, `lychee.toml`.

## Acceptance criteria

- On a clean checkout at this plan's own PR (before P06 exists), `ci.yml`'s **quality** job passes end to end against the P01 stub tree.
- `npx playwright test` passes for every non-`fixme` spec at both viewport projects, with axe reporting 0 serious/critical violations on `/`, `/en/`, `/tr/`, `/design/`, `/404/`; every `fixme`'d spec has a comment naming the plan that unblocks it (P05, P06, P07, P08, or P09).
- `node scripts/content-gate.ts` run with no content present exits 0 (nothing to check yet is not a failure); run against one deliberately-broken fixture MDX file (missing language tag on a fence, or an EN lesson with no TR counterpart) exits non-zero with a clear message — include this fixture check as a unit test, not just a manual run.
- `node scripts/check-no-inline-script.mjs` and `node scripts/check-raw-colors.mjs` both exit 0 against the current tree and exit non-zero against a deliberately-broken fixture file each.
- LHCI runs against the `site-dist` artifact and reports scores; the budgets in `lighthouserc.json` match the numbers in this plan's Scope exactly (a lower number "to make it pass for now" is not acceptable — if the P01 stub cannot hit these numbers, that is itself a signal for `open_questions`, not a reason to lower the bar).
- `.github/workflows/links-weekly.yml` validates with `actionlint` (or `gh workflow view` parses it without error) and its cron expression is syntactically valid.

## Steps

1. Write `scripts/content-gate.ts` and its unit tests first (against fixture MDX files under `scripts/__fixtures__/` you create for this purpose), independent of CI, so it is provable locally before wiring it into a workflow.
2. Write `src/integrations/content-gates.ts` and register it in `astro.config.ts` (a `shared_paths`-style minimal addition — coordinate with P01/P06 if either's version of `astro.config.ts` is mid-flight; append, do not reorder existing integrations).
3. Write `check-no-inline-script.mjs` and `check-raw-colors.mjs` with their own fixture-based tests.
4. Write `playwright.config.ts` and the four `e2e/*.spec.ts` files; run locally against `npm run preview`; mark the not-yet-possible specs `test.fixme()` with a plan-naming comment.
5. Write `ci.yml`'s four jobs; push a throwaway branch and confirm all four jobs run and pass (or correctly no-op) via `gh run list`/`gh run view`.
6. Write `lighthouserc.json`, `lychee.toml`, and `links-weekly.yml`.
7. Paste a real `gh run view` (or equivalent CI log excerpt) for all four jobs into the PR.

## Tests required

- Unit tests (Vitest) for `content-gate.ts`, `check-no-inline-script.mjs`, `check-raw-colors.mjs` against fixture files (good and bad cases each).
- `e2e/a11y.spec.ts`, `e2e/shell.spec.ts` passing against the P01 stub; `e2e/lesson.spec.ts` and `e2e/search.spec.ts` present with explicit `fixme` skips and naming comments.
- A real CI run (this plan's own PR) showing all four `ci.yml` jobs green or correctly no-op.

## Non-goals / pitfalls

- Do not lower an LHCI budget or an axe severity threshold to make this plan's own PR pass against the still-mostly-empty stub site — fix the stub (in coordination with P01's Handoff notes) or file `open_questions`, never the gate.
- Do not silently `test.skip()` a spec with no explanation — every pending spec is `test.fixme()` with a comment naming the exact plan that unblocks it, so `next` sessions know it is not forgotten.
- Do not import `src/content/schema.ts` in a way that only works once P06's real version lands — the P01 stub version must already satisfy the import.
- Do not write the deploy workflow, even as a "quick" placeholder — that is entirely P10's.
- Do not touch `content/**` — nothing in it exists yet and none of it is this plan's to create.

## Verification

A reviewer opens the CI run for this plan's own PR, confirms all four jobs (`quality`, `e2e`, `links`, `lighthouse`) ran, reads the `fixme` comments in `e2e/**` to confirm each names a real plan id, and runs `node scripts/content-gate.ts` and the two `check-*.mjs` guards locally against one good and one deliberately-broken fixture each.

## Handoff notes

- _Filled by the executing session: what changed, decisions, follow-ups, blockers._
