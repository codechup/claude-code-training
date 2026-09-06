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

- 2026-09-06: a dedicated, **restricted** deploy key (`command="/usr/bin/rrsync -wo <cc static root>",restrict`) was installed for the low-privilege deploy account on the static host; the previous `authorized_keys` was backed up first.
- Real two-phase rsync push through that key (from WSL, rsync 3.4.1 → host rsync 3.2.7): `phase1 ok`, `phase2 ok`; files landed in the cc static root only; two escape attempts (`../<neighbour>/…` and an absolute path) were refused by rrsync (`code 12` / `code 3`); the neighbouring site was untouched; test files removed.
- A plain shell over the restricted key is refused: `rrsync error: SSH_ORIGINAL_COMMAND does not run rsync`.
- Repository secrets set: `SSH_HOST`, `SSH_USER`, `SSH_KEY`, `DEPLOY_PATH` (`.`, i.e. the rrsync root), `HYGIENE_EXTRA_PATTERNS`.

## 6. Owner gate and the flip

`DEPLOY_ENABLED`:

```
gh variable set DEPLOY_ENABLED --body true      # 2026-09-07, after PR #16's CI was green (D089: proceed-to-live instruction from the owner)
gh variable list → DEPLOY_ENABLED  true
```

Static-host gate (vhost live, on-box `/healthz` → 200): **not met at release time** — the host-side vhost change is prepared and green in its own private repository but cannot be merged until the owner (a) creates the origin certificate for `cc.codechup.com` and stores it as that repository's secrets, (b) enables that repository's deploy switch, and (c) adds the DNS record for `cc`. Until then `deploy.yml`'s rsync step succeeds and the edge smoke step fails by design.

```
deploy.yml run 34064306489 (push of the P12 squash-merge to main, 2026-09-06 22:34 UTC)
  gate                 success
  ci / quality         success · ci / e2e success · ci / lighthouse success · ci / links skipped (no content diff on push)
  deploy               failure — only the last step failed:
    Phase 1: sync content-addressed assets (no delete)   ✓  (rsync dist/_astro, dist/pagefind)
    Phase 2: sync full site (delete stale files)          ✓  (rsync --delete dist/)
    Edge smoke test                                       ✗  https://cc.codechup.com does not resolve yet (owner gate: DNS record + origin certificate)
On-box check through the low-privilege deploy account (D088), 2026-09-07:
  cc static root: 273 files — 404.html _astro/ design/ en/ favicon.svg index.html og/ pagefind/ robots.txt sitemap-0.xml sitemap-index.xml theme-init.js tr/
  en/l1-beginner/m01-start/what-claude-code-is/index.html → "<title>What Claude Code is and how it works — CodeChup Claude Code Academy…"
Conclusion: the full pipeline (CI → artifact → restricted-key rsync → files on the host) works end to end; only the public edge is missing.
```

## 7. Review pipeline (D071)

```
D071 pipeline run on 2026-09-07 via `claude -p` delegating to the repo's own agents (read-only, plan mode):
- `fact-checker` on the EN lesson: ~30 claims CONFIRMED against research/ and live fetches of overview/how-claude-code-works/quickstart/setup/tools-reference/model-config; every install command matches setup.md character-for-character; 1 claim CONTRADICTED (TodoWrite listed as a current tool — it is disabled by default, superseded by the Task* tools) → fixed in EN+TR and recorded in research/deprecations.md; 0 UNVERIFIABLE.
- `reviewer` on EN+TR+transcripts: template order, evidence rule, schema, hygiene all clean; findings applied — TR first-use glossary links + glossary seeded (12 terms), P12 owned_paths corrected to the real file names, Anthropic Academy course added to the sources of both lessons, heading wording aligned with CURRICULUM §3. The per-language transcript choice (TR embeds the Turkish-language capture of the same step) is documented in the transcripts README and kept.
```

## 8. Status

P12 → `blocked` with reason: "static host vhost not live (owner gate: origin cert secrets, host deploy switch, DNS record)". Everything else in the acceptance criteria is met and recorded above. When the gate is met: re-run `deploy.yml` (push or `workflow_dispatch`), run `bash scripts/smoke/edge.sh https://cc.codechup.com`, paste both here, set P12 `done`.
