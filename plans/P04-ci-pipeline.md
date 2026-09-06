---
id: P04
title: Continuous integration pipeline
milestone: M0
status: done
owner: sonnet-p04-2026-09-06
branch: plan/04-ci-pipeline
model_hint: sonnet
effort_hint: medium
depends_on: [P01, P02]
owned_paths:
  - .github/workflows/ci.yml
  - .github/workflows/links-weekly.yml
  - scripts/content-gate.ts
  - scripts/content-gate.test.ts
  - scripts/check-no-inline-script.mjs
  - scripts/check-no-inline-script.test.ts
  - scripts/check-raw-colors.mjs
  - scripts/check-raw-colors.test.ts
  - scripts/__fixtures__/**
  - src/integrations/content-gates.ts
  - e2e/**
  - playwright.config.ts
  - lighthouserc.json
  - lychee.toml
shared_paths: []
estimate: L
updated_at: 2026-09-06T19:48:07Z
open_questions:
  - "package.json's `lint` script does not actually run check-public-hygiene.mjs or check-raw-colors.mjs (the public-hygiene rule doc claims lint already covers it — it doesn't). package.json is outside P04's owned_paths, so ci.yml's quality job runs both checkers as their own steps instead. Whoever next owns package.json (or a small follow-up plan) should add both to the `lint` script for local/pre-commit parity with CI."
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

- Owner request 2026-09-06: CI must run `node scripts/check-public-hygiene.mjs` (already inside `npm run lint`) with the repo secret `HYGIENE_EXTRA_PATTERNS` exported (project-specific private names; the owner mirrors the machine-local `.hygiene.local.json` into it), plus gitleaks with `.gitleaks.toml`. Add `HYGIENE_EXTRA_PATTERNS` to the owner checklist in `docs/deploy/README.md` (P10).

- _Filled by the executing session: what changed, decisions, follow-ups, blockers._

**Executed 2026-09-06 by sonnet-p04-2026-09-06.**

What changed:
- Added `.github/workflows/ci.yml` (`quality`, `e2e`, `links`, `lighthouse` jobs; triggers `pull_request` / `push: main` / `workflow_call`) and `.github/workflows/links-weekly.yml` (Monday 06:17 UTC cron + `workflow_dispatch`, full-repo lychee sweep, opens a GitHub issue via `gh issue create` on failure, never fails the run itself).
- Added `scripts/check-raw-colors.mjs` (fails on a raw hex/`rgb()`/`rgba()`/`hsl()`/`hsla()` literal anywhere under `src/**` outside `src/styles/tokens.css`; a negative lookbehind keeps it from misreading HTML numeric entities like `&#9788;` as hex colors — caught this against the real `ThemeToggle.astro` sun/moon glyph during testing).
- Refactored `scripts/check-no-inline-script.mjs` (and wrote `check-raw-colors.mjs` from the start) to export a `check*(root)` function used by both the CLI entry point and Vitest, matching `content-gate.ts`'s existing testable shape. CLI behavior/output is unchanged.
- Added Vitest fixture-based unit tests: `scripts/content-gate.test.ts`, `scripts/check-no-inline-script.test.ts`, `scripts/check-raw-colors.test.ts`, with fixtures under `scripts/__fixtures__/{content-gate,inline-script,raw-colors}/`. `content-gate.test.ts` covers: empty content root (ok), a valid EN/TR pair (ok), a fence missing its language tag (fails), an EN lesson with no TR counterpart (fails), and `draft: true` allowed/rejected with/without `--no-drafts`.
- Added `e2e/shell.spec.ts` (header/footer/`html[lang]`/lang-switch across en+tr, theme toggle click + reload persistence — real tests, not fixme, since P01 already shipped a working `ThemeToggle`/`LangSwitch`) and `e2e/lesson.spec.ts` (level/module/lesson pages against the one real seed lesson P01 shipped, plus the TR counterpart's `draft: true` gating). Added `e2e/search.spec.ts` (fully `test.fixme()` — no search UI exists yet). `test.fixme()` only for: OS-tab component (naming P07 — `OSTabs` doesn't exist yet), lesson prev/next nav and a TOC (naming P07/P08), and full curriculum navigation (naming P13+, to be un-skipped by P12 per this plan's Context). Updated `e2e/a11y.spec.ts` to add `/` to the checked routes (with a `waitForURL` guard so axe doesn't run mid-navigation on the 0-second meta-refresh page).
- Updated this plan's own `owned_paths` to add `scripts/content-gate.test.ts`, `scripts/check-no-inline-script.test.ts`, `scripts/check-raw-colors.test.ts`, and `scripts/__fixtures__/**` — the original list only named the three `.mjs`/`.ts` implementation files, not the test/fixture files the plan's own "Tests required" section calls for. Verified no other plan's `owned_paths` overlaps these before adding them.

Decisions taken (repo state had moved ahead of / behind this plan's written text — built against actual repo state per D045, discrepancies below):
- **Content already exists.** This plan's Context says "content does not exist yet" and that lesson/level-page specs should be `test.fixme()`'d until P06. In reality P01's scaffold already shipped one real EN lesson + its `draft: true` TR stub, with working level/module/lesson routing. Wrote real (non-fixme) tests against that seed instead of fixme-ing working functionality — fixme is reserved for things that genuinely don't exist yet (OSTabs, prev/next nav, TOC, search UI, full curriculum).
- **ThemeToggle already exists.** The plan's Scope describes it as "P05's eventual `ThemeToggle`" to be fixme'd; P01 already shipped a working one (`src/components/shell/ThemeToggle.astro` + `public/theme-init.js`). Wrote a real test (click flips `data-theme`, persists across reload) rather than fixme-ing it.
- **gitleaks: action, not raw CLI.** The plan's Scope literally says `gitleaks detect --no-git -v`; the task's action-pinning instructions asked me to resolve `gitleaks/gitleaks-action`. Used the pinned action (`@v3.0.0`, SHA `e0c47f4f8be36e29cdc102c57e68cb5cbf0e8d1e`) with `GITLEAKS_CONFIG: .gitleaks.toml` instead of a raw CLI call — it's the maintained, SHA-pinnable path and scans git history (via `fetch-depth: 0`) rather than only the working tree. Confirmed via `gh api users/codechup --jq .type` → `User`, so no `GITLEAKS_LICENSE` secret is required (that's only for GitHub Organization accounts) — could not otherwise test gitleaks locally (binary isn't installed in this sandbox); this needs confirming green on the real PR's CI run.
- **package.json left untouched.** The Handoff note below (owner request) assumes `check-public-hygiene.mjs` is "already inside `npm run lint`" — it isn't (`package.json`'s `lint` script is `eslint . && prettier --check . && node scripts/check-no-inline-script.mjs`, no hygiene or raw-colors call). `package.json` is outside P04's `owned_paths` and not listed in its `shared_paths`, so rather than edit a shared file this plan doesn't own, `ci.yml`'s `quality` job runs `node scripts/check-public-hygiene.mjs` and `node scripts/check-raw-colors.mjs` as their own steps (both with `HYGIENE_EXTRA_PATTERNS` set only on the steps that need it, never job-wide, so it isn't exposed to the gitleaks/setup-node third-party actions). Filed as an `open_questions` entry for whoever next touches `package.json`.
- **`workflow_call` secrets.** Declared `on.workflow_call.secrets.HYGIENE_EXTRA_PATTERNS` (`required: false`) so P10's `deploy.yml` gets it automatically only if it passes `secrets: inherit` or names it explicitly — P10 should do one of those or its reused `quality` job will silently run without the private hygiene patterns (still safe, just less thorough).
- **`links` job scope.** Gated with `if: github.event_name == 'pull_request'` (per-PR changed-file diff against `github.event.pull_request.base.sha`) rather than trying to special-case `push`/`workflow_call` events where there is no PR diff to compute; guarded with `if: steps.changed.outputs.files != ''` so an empty diff is a correct no-op rather than lychee falling back to scanning the whole repo.
- **Coverage threshold enforced via CLI flag, not `vitest.config.ts`.** `vitest.config.ts` has no `coverage.thresholds` block and isn't in this plan's `owned_paths`; `ci.yml` runs `npm test -- --coverage.thresholds.lines=70`. Verified locally that this flag both passes at the real ~72–90% line coverage and genuinely fails (exit 1) when set above the actual number.

Verified locally (see PR body for pasted output):
- `npm run typecheck`, `npm run lint`, `npm run gate`, `node tools/plan/cli.ts check`, `node scripts/check-raw-colors.mjs`, `node scripts/check-public-hygiene.mjs` — all green.
- `npm test -- --coverage.thresholds.lines=70` — 58/58 tests pass, 89.77% lines overall (72.52% on `content-gate.ts` alone, still above 70%).
- `npm run build` — builds cleanly; `dist/en/index.html`, `dist/tr/index.html`, `dist/design/index.html` all present.
- `npx playwright install chromium` (no `--with-deps` — Windows) then `npx playwright test` — 32 passed, 10 `fixme`'d (skipped), 0 failed, both `phone` and `desktop` projects.
- `npx @lhci/cli@0.15.1 autorun` against `dist/` with the real `lighthouserc.json` budgets: all four categories scored 1.0 on `/en/`, `/design/`, and `/tr/` when run one URL at a time. The multi-URL run in one pass crashed on this Windows sandbox during Chrome-process cleanup between URLs (`EPERM` removing a temp dir — a known Windows-only `chrome-launcher` issue, unrelated to Lighthouse scoring); this doesn't reproduce on Linux, but the real multi-job `lighthouse` job on `ubuntu-latest` in this PR's own CI run is the actual proof and should be checked.

Could not verify locally / needs confirming on the real CI run (Ubuntu, this PR):
- `gitleaks/gitleaks-action` (no local gitleaks binary in this sandbox).
- `lycheeverse/lychee-action` (both the PR `links` job and `links-weekly.yml`'s full sweep) — not invoked locally; `lychee.toml`'s config was reused as-is from the P01 scaffold (already present in `owned_paths`, no changes made to it).
- The full multi-URL `lighthouse` job in one pass (see above — verified per-URL instead due to a local Windows-only crash).
- `treosh/lighthouse-ci-action` and `gh issue create` in `links-weekly.yml` (schedule-triggered; only exercised via local `@lhci/cli`/`gh` equivalents, not the actual Action wrapper).

Follow-ups for later plans:
- P10 (`deploy.yml`): reuse `ci.yml` via `workflow_call`, download the `site-dist` artifact this plan uploads, pass/inherit `HYGIENE_EXTRA_PATTERNS` if the reused `quality` job should have it, and add `HYGIENE_EXTRA_PATTERNS` to the owner secrets checklist in `docs/deploy/README.md` (per the owner's request below).
- Whoever next touches `package.json`: add `check-public-hygiene.mjs` and `check-raw-colors.mjs` to the `lint` script for local/pre-commit parity with CI (see `open_questions`).
- P12 (M0 release): un-skip the `test.fixme()`'d "full curriculum navigation" spec in `e2e/lesson.spec.ts` once real lesson content exists, per this plan's own Context/Acceptance criteria.
- P07/P08: un-skip the OSTabs and prev/next-nav/TOC `fixme` specs once those MDX components land.
- P09: un-skip `e2e/search.spec.ts` once a search UI is wired to the already-working `pagefind` postbuild step.
- Consider adding `.lighthouseci/` to `.gitignore` (a local LHCI run creates it) — not done here since `.gitignore` is outside `owned_paths`; this session deleted its local copy before committing rather than editing a shared file.

Blockers: none.
