# M0 release record — infrastructure, design, pipeline (P12)

> Evidence trail for the first release of cc.codechup.com. Every block below is real command output captured on the dates shown (D093). The static-host gate (vhost live) is owner-managed; see §6.

| | |
|---|---|
| Release plan | P12 — `plans/P12-milestone-0-release.md` |
| Date | 2026-09-07 |
| Claude Code verified against | 2.1.263 |
| Sample lesson | `/en/l1-beginner/m01-start/what-claude-code-is/` · `/tr/…/what-claude-code-is/` |

## 1. Scope shipped in M0

P00 design canvas · P01 scaffold · P02 plan tool · P03 curriculum + research · P04 CI · P05 tokens/theme/`/design/` · P06 content pipeline + landing + section scaffold · P07 MDX components A · P08 MDX components B + feedback Worker · P09 search/SEO/OG/RSS/analytics · P10 deploy workflow + edge smoke · P11 dogfooded `.claude/` · P12 this release (real bilingual lesson, integration wiring).

## 2. Local quality gate (branch `plan/12-milestone-0-release`)

_(filled from the gate run — see below)_

```
node tools/plan/cli.ts check  → ok: 48 plans, frontmatter valid, DAG acyclic, no owned_paths overlap, STATE.md fresh
npm run typecheck             → astro check: 0 errors
npm run lint                  → eslint clean · prettier clean · check-no-inline-script: OK (73 files) · public-hygiene: OK · raw colours: OK (77 files)
npm run gate                  → content gate: OK (58 files checked)
npm test                      → Test Files 22 passed · Tests 183 passed
npm run build                 → 60 pages · Pagefind: Indexed 2 languages, 60 pages, 3754 words · check-no-inline-script (dist): OK (63 files)
og:image                      → 58 lesson/section pages reference a generated PNG; 0 missing (checked against dist/og/)
```

## 3. Accessibility (Playwright + axe-core)

Run by the P12 authoring session on 2026-09-07 with a temporary Playwright config (port 4412), chromium, projects phone 390×844 and desktop 1280×800, specs `e2e/a11y.spec.ts e2e/shell.spec.ts e2e/lesson.spec.ts`:

```
52 passed (phone + desktop)
axe serious/critical violations: 0 on /, /en/, /tr/, /design/, /404/, and the lesson in both languages
```

CI re-runs the same suites on the PR (job `e2e`).

## 4. Lighthouse CI (against `dist/`, budgets in `lighthouserc.json`)

```
npx -p @lhci/cli@0.15.1 lhci autorun   (staticDistDir dist, 3 runs per URL, medians)
/en/       performance 0.98  accessibility 1.00  best-practices 1.00  seo 1.00
/tr/       performance 0.96  accessibility 1.00  best-practices 1.00  seo 1.00
/design/   performance 0.92  accessibility 1.00  best-practices 1.00  seo 1.00
Assertions: all passed (budgets perf ≥ 0.9, a11y ≥ 0.95, best-practices ≥ 0.9, seo ≥ 0.95)
```

## 5. Deploy path verified before the flip

This section records **what the gate proved**, not how the host is built. Host-side details are owner-managed and live outside this public repo.

- 2026-09-06: a dedicated **restricted** deploy key (rsync-only forced command, no shell, no pty, write-only into the site root) was installed for the low-privilege deploy account.
- Real two-phase rsync push through that key: `phase1 ok`, `phase2 ok`; files landed in the site root only; test files removed afterwards.
- Two escape attempts (a relative traversal and an absolute path) were **refused** (`code 12` / `code 3`); nothing outside the site root was written.
- A plain shell over the restricted key is refused: the forced command rejects anything that is not the expected rsync invocation.
- Repository secrets set: `SSH_HOST`, `SSH_USER`, `SSH_KEY`, `DEPLOY_PATH`, `HYGIENE_EXTRA_PATTERNS`. (Values live only in GitHub secrets — never here.)

## 6. Owner gate and the flip

`DEPLOY_ENABLED`:

```
gh variable set DEPLOY_ENABLED --body true      # 2026-09-07, after PR #16's CI was green (D089: proceed-to-live instruction from the owner)
gh variable list → DEPLOY_ENABLED  true
```

Static-host gate (vhost live, host-side health check → 200): **met on 2026-09-07 ~00:20 UTC.** The owner had already added the proxied DNS record for `cc`; the lead session created the origin certificate for `cc.codechup.com` (CSR generated locally, private key never entered in a browser; certificate issued in the Cloudflare dashboard via Claude in Chrome) and the host-side vhost change (owner-managed, private repo) was merged, whose deploy ran green. SSL mode Full (strict) was already in effect (an earlier 526 proved strict validation).

```
deploy.yml run 34064306489 (push of the P12 squash-merge to main, 2026-09-06 22:34 UTC)
  gate                 success
  ci / quality         success · ci / e2e success · ci / lighthouse success · ci / links skipped (no content diff on push)
  deploy               failure — only the last step failed:
    Phase 1: sync content-addressed assets (no delete)   ✓  (rsync dist/_astro, dist/pagefind)
    Phase 2: sync full site (delete stale files)          ✓  (rsync --delete dist/)
    Edge smoke test                                       ✗  https://cc.codechup.com does not resolve yet (owner gate: DNS record + origin certificate)
On-box check through the low-privilege deploy account (D088), 2026-09-07:
  site root: 273 files present, matching the built `dist/` file count — PASS
  spot-check of a deployed lesson page: correct <title> served — PASS
Conclusion: the full pipeline (CI → artifact → restricted-key rsync → files on the host) works end to end; only the public edge is missing.
```

## 7. Review pipeline (D071)

```
D071 pipeline run on 2026-09-07 via `claude -p` delegating to the repo's own agents (read-only, plan mode):
- `fact-checker` on the EN lesson: ~30 claims CONFIRMED against research/ and live fetches of overview/how-claude-code-works/quickstart/setup/tools-reference/model-config; every install command matches setup.md character-for-character; 1 claim CONTRADICTED (TodoWrite listed as a current tool — it is disabled by default, superseded by the Task* tools) → fixed in EN+TR and recorded in research/deprecations.md; 0 UNVERIFIABLE.
- `reviewer` on EN+TR+transcripts: template order, evidence rule, schema, hygiene all clean; findings applied — TR first-use glossary links + glossary seeded (12 terms), P12 owned_paths corrected to the real file names, Anthropic Academy course added to the sources of both lessons, heading wording aligned with CURRICULUM §3. The per-language transcript choice (TR embeds the Turkish-language capture of the same step) is documented in the transcripts README and kept.
```

## 7b. Live verification (2026-09-07)

Origin, through the low-privilege deploy path (`curl --resolve`): the host-side health check → 200; `/` → `302 Location: https://cc.codechup.com/en/` with `Cache-Control: private, no-store` and `Vary: Accept-Language, Cookie`.

Edge, through Cloudflare (`bash scripts/smoke/edge.sh https://cc.codechup.com`):

```
PASS: English home (/en/ -> 200) · Turkish home (/tr/ -> 200) · Design system page (/design/ -> 200)
PASS: Sitemap index · English RSS feed · Pagefind entry · Unknown path (/nope/ -> 404)
PASS: Default language redirect (/ -> 302 /en/) · Accept-Language redirect (-> /tr/) · Cookie overrides Accept-Language (-> /en/)
PASS: CSP (giscus.app + wasm-unsafe-eval) · HSTS · X-Content-Type-Options: nosniff
PASS: Cache-Control on /_astro/*.css contains immutable
== summary: 14 passed, 0 failed, 0 skipped ==
```

Lesson routes live in both languages: `/en/l1-beginner/m01-start/what-claude-code-is/` and `/tr/…` → 200. `deploy.yml` run 34070728909 (`workflow_dispatch`) recorded below.

```
deploy.yml run 34070728909 (workflow_dispatch, 2026-09-07) → success
  gate: success
  ci / quality: success
  ci / links: skipped
  ci / lighthouse: success
  ci / e2e: success
  deploy: success
  deploy steps: Phase 1 rsync ✓ · Phase 2 rsync ✓ · Edge smoke test ✓ (14 passed, 0 failed)
```

## 8. Status

P12 → `done` on 2026-09-07: every acceptance criterion is met and recorded above; **https://cc.codechup.com is live** in both languages with the M0 sample lesson.
