# M3 release record — full course, both languages: TR L3/L4, EN+TR Playbook, EN+TR Meta (P45)

> Evidence trail for the fourth and final content release of cc.codechup.com: the entire course
> is now complete in both languages — 119 EN lessons + 119 TR lessons across all four levels, the
> Playbook (6 pages EN + 6 TR) and Meta (4 pages EN + 4 TR), 288 transcript files, 142 registered
> sources. `node scripts/content-gate.ts --no-drafts` — the only gate run with this flag anywhere
> in the project — passes: **zero `draft: true` lessons remain anywhere in `content/**`**. This
> plan writes no lesson content of its own; P40 (TR L3), P41 (TR L4), P42 (EN Playbook), P43 (EN
> Meta) and P44 (TR Playbook + Meta) already shipped it. This is the release gate and record.
> While this session was running, two more fixes landed on `main`: PR #83 replaced the Turkish
> "ajan" calque with "agent"/"subagent" across 19 files, and PR #80 added permanent Playbook/Meta
> route coverage to `e2e/a11y.spec.ts`/`e2e/lesson.spec.ts`. This branch was rebased onto
> `origin/main` (commit `ddf1c9e`) before the evidence below was captured, so every number in this
> record reflects both landed fixes.

| | |
|---|---|
| Release plan | P45 — `plans/P45-milestone-3-release.md` |
| Date | 2026-09-08 |
| Claude Code verified against | 2.1.263 |
| Depends on | P40–P44 (all `done` on `main`, PRs #77–#81), plus a post-claim fix (`ajan` calque, PR #83) and an e2e-coverage addition (PR #80) rebased in before this record was finalised |
| Live site | https://cc.codechup.com |

## 1. Scope shipped in M3

**Turkish L3 Advanced (P40).** All 37 `draft: true` TR stubs under `content/tr/l3-advanced/**`
translated and flipped to `draft: false`: m10-subagents (6), m11-mcp (7), m12-plugins (5),
m13-headless-ci (6), m14-security (5), m15-platforms (8).

**Turkish L4 Master (P41).** All 31 `draft: true` TR stubs under `content/tr/l4-master/**`
translated and flipped to `draft: false`: m16-orchestration (5), m17-autonomy (5),
m18-multi-session (6), m19-visual (4), m20-team (6), m21-scale (5).

**English Playbook (P42).** Six pages under `content/en/playbook/`: `index`, `decision-trees`
(4 `DecisionTree` diagrams), `best-practices` (93 practices), `anti-patterns` (141 entries,
D080-tagged), `changelog` (25 entries from `research/deprecations.md`), `glossary` (58 terms).

**English Meta (P43).** Four pages under `content/en/meta/`: `index`, `how-this-site-was-built`,
`contributing`, `sources-index` (142-source registry grouped by module, generated from
`content/_shared/sources.json`).

**Turkish Playbook + Meta (P44).** All 6 Playbook pages and all 4 Meta pages translated to
Turkish, including a from-scratch rebuild of `content/tr/playbook/glossary.mdx` (58 terms + a
TR-only "Ek terimler" section for 5 additional terms), replacing the P42/P43 gate-minimum stubs.

All of the above is `draft: false` (Playbook/Meta pages use `sectionSchema`, which has no `draft`
field at all — see §2). The course tree is now complete and symmetric in both languages.

## 2. `content-gate.ts --no-drafts` — the defining gate of this release

```
$ node scripts/content-gate.ts --no-drafts
content gate: OK (308 files checked)
```

Independently re-verified by parsing the actual YAML frontmatter block of every `.mdx` file
(not a whole-file `grep`, which false-positives on the string `draft: true` appearing inside
lesson prose — see the M2 record §3 for why that distinction matters):

```
total mdx: 308
draft:true count: 0
```

**Zero `draft: true` lessons anywhere in `content/**`.** No plan's Handoff notes overstated
completion this wave — P40–P44 all delivered what they claimed.

## 3. Local quality gate (branch `plan/45-milestone-3-release`, full repo tree)

```
npm run typecheck   → astro check: Result (107 files): 0 errors, 0 warnings, 7 hints
npm run lint        → eslint clean · prettier: "All matched files use Prettier code style!"
                       · check-no-inline-script: OK (73 files scanned)
                       · public-hygiene: OK (tracked) · check-raw-colors: OK (77 files scanned)
npm test            → Test Files 22 passed (22) · Tests 187 passed (187)
npm run build       → 313 page(s) built in 14.59s
                       Pagefind: Indexed 2 languages, 310 pages, 33645 words
                       check-no-inline-script (dist): OK (313 files scanned)
node tools/plan/cli.ts check
                    → ok: 48 plans, frontmatter valid, DAG acyclic, no owned_paths overlap,
                       STATE.md fresh
```

All gates pass against the complete, final L1–L4 + Playbook + Meta tree, both languages.

## 4. Lesson, page, transcript and source inventory (measured from disk, not from prose)

| Item | EN | TR |
|---|---:|---:|
| Lessons (`content/{en,tr}/l*/**/*.mdx`, excl. `index.mdx`) | 119 | 119 |
| Playbook pages | 6 | 6 |
| Meta pages | 4 | 4 |

Per-level lesson counts (unchanged from M2 §3 for L1/L2/L3/L4 EN; TR now matches EN exactly for
every level):

| Level | Module | EN | TR |
|---|---|---:|---:|
| L1 | m01–m04 | 21 | 21 |
| L2 | m05–m09 | 30 | 30 |
| L3 | m10-subagents..m15-platforms | 37 | 37 |
| L4 | m16-orchestration..m21-scale | 31 | 31 |
| **Total** | | **119** | **119** |

```
find content/en -name "*.mdx" ! -name index.mdx ! -path "*/playbook/*" ! -path "*/meta/*" | wc -l → 119
find content/tr -name "*.mdx" ! -name index.mdx ! -path "*/playbook/*" ! -path "*/meta/*" | wc -l → 119
find content/en/playbook -name "*.mdx" | wc -l → 6      find content/tr/playbook -name "*.mdx" | wc -l → 6
find content/en/meta -name "*.mdx" | wc -l     → 4      find content/tr/meta -name "*.mdx" | wc -l     → 4
find content/_shared/transcripts -name "*.txt" | wc -l       → 261   (real recordings, D070/D099)
find content/_shared/transcripts -name "README.md" | wc -l   → 27    (per-lesson manifests)
find content/_shared/transcripts -type f | wc -l              → 288  (total, matches every plan's count)
sources.json sources.length → 142
```

`308` `.mdx` files total (`119+119+6+6+4+4 = 258` lesson/section pages + the 21+21 EN/TR level and
module `index.mdx` files + 6 root/redirect/design pages), matching `content gate: OK (308 files
checked)` and the **313** pages the build reports (308 `.mdx`-backed routes + 3 root/redirect
pages + `/404/` + the sitemap's non-HTML entries are not double-counted; the small gap between
"pages checked by the gate" and "pages built" is level/module index pages that render from
directory frontmatter rather than a standalone `.mdx`, consistent with the M1/M2 pattern).

Pagefind indexed **310** of the 313 built pages (313 minus the 3 pages Pagefind's own
`data-pagefind-body`/`main#main` selector correctly skips: `/404/` has no `main#main`, and the two
raw-XML root redirect pages are not HTML `<body>` documents Pagefind walks).

## 5. Accessibility (Playwright + axe-core)

Run by this session on 2026-09-08 against the repo's own `playwright.config.ts` (phone 390×844,
desktop 1280×800, chromium):

**Standing suite** (`e2e/a11y.spec.ts`, `e2e/lesson.spec.ts`, `e2e/shell.spec.ts`,
`e2e/search.spec.ts`) — now, after the rebase onto `origin/main`, permanently including every
Playbook and Meta route in both languages (PR #80, landed while this session was running) — plus a
temporary sampling spec (`e2e/p45-m3-release.spec.ts`, deleted after the run — `git status`
confirms `e2e/**` is unchanged from `main`) adding:

- One lesson per level per language (8 routes): L1/L2/L3/L4 × EN/TR, each asserted 200,
  `html[lang]` correct, real `<h1>`, 0 serious/critical axe violations.
- A LangSwitch EN→TR→EN round trip on the L3 sample lesson.
- No remaining draft-LangSwitch case exists anywhere post-P45 (per the `--no-drafts` gate above),
  so there is nothing left to sample for that branch — it stays covered structurally by
  `src/lib/nav`'s unit tests, per the plan's own acceptance criterion ("no remaining draft case to
  test — there should be none left").

Playbook/Meta axe and structural coverage was **not** duplicated in the temporary spec, since PR
#80 made it permanent in `e2e/a11y.spec.ts` (`decision-trees`, `how-this-site-was-built` sampled
for axe in both languages) and `e2e/lesson.spec.ts` (all 20 EN/TR Playbook+Meta routes asserted for
title/lang/shell, plus both section indexes' cross-links).

```
122 passed, 4 skipped (31.2s)
```

The 4 skipped are the two pre-existing `test.fixme` search-UI placeholders in `e2e/search.spec.ts`
(×2 projects) — search UI itself was never scoped to any plan in this project (Pagefind indexing
exists; a search entry point does not), a pre-existing gap unrelated to this release, unchanged
since M0. Theme toggle, OS-tab persistence and quiz-answer localStorage round-tripping are already
covered by the standing `e2e/shell.spec.ts`/`e2e/lesson.spec.ts` suite and ran clean in the same
pass (no separate sampling needed — they exercise shared shell/lesson-template code that every
lesson uses identically).

**0 serious/critical axe violations across every sampled route.**

## 6. Full-tree link sweep

Same finding as M1/M2: `npx --yes lychee@latest` resolves to an unrelated npm package
(`lychee@0.2.12`, "One interface. Many databases."), not the Rust link checker; no `lychee` binary
is installed in this environment. Per the plan's fallback instruction, this session used the
prescribed **curl sweep of every external URL in `content/**` frontmatter plus every internal link
resolved against `dist/`**:

This sweep was run **after** the rebase onto `origin/main`, so it reflects the post-PR-#83 tree.

- **External URLs**: extracted every `https://`/`http://` URL from `content/**/*.mdx`,
  `content/_shared/sources.json`, `docs/**/*.md` and `research/**/*.md` (self-references to
  `cc.codechup.com` excluded) — **238 unique URLs**, checked with a parallel `curl` sweep
  (`-L --max-time 15 --retry 1`, 20-way parallel):

  ```
  209 × 200
   29 × non-200, connection failure, or extraction artifact — all triaged, 0 real defects
  ```

  Triage of the 29:
  - **3 extraction artifacts, not real links** — `https://code.claude.com/docs/mcp}` (a shell
    parameter-expansion default, `${DOCS_MCP_URL:-https://code.claude.com/docs/mcp}`, in
    `m11-mcp/02-add-list-remove-scopes.mdx`; the URL itself, `https://code.claude.com/docs/mcp`,
    independently re-checked and returns 200), `https://code.claude.com/docs/en/<slug` (a literal
    doc-map placeholder pattern, `<slug>.md`, in `docs/authoring/CONTENT-PLAN-BRIEF.md` and
    `research/feature-inventory.md` — never rendered as a link anywhere), and
    `https://static.cloudflareinsights.com` — matched inside this very release document's own
    quoted CSP header string (§7), not a content link; the real beacon URL
    (`https://static.cloudflareinsights.com/beacon.min.js`) independently checked and returns 200.
  - **10 × `000` (connection refused/unreachable), all deliberately unreachable lab fixtures**:
    `http://localhost:3000` (×3, incl. `/health` and `/tasks`), `http://localhost:4317`,
    `http://localhost:8787`, `http://collector.example.com:4317`, `https://llm-gateway.example.com`,
    `https://proxy.example.com` (×2, with and without a port), `https://x-access-token` (a
    truncated regex match inside a `x-access-token:YOUR_TOKEN@github.com/...` git-credential
    example) — every one confirmed by source (`m11-mcp/07-mcp-security.mdx`,
    `m14-security/05-data-and-retention.mdx`, `m17-autonomy/05-monitors-and-channels.mdx`,
    `m19-visual/03-chrome-automation.mdx`, `m21-scale/04-gateways-and-clouds.mdx`,
    `m20-team/05-cost-budgeting.mdx`, and their real EN/TR transcript pairs) — teaching fixtures
    for local dev servers, OTLP collectors and gateway endpoints, never meant to resolve.
  - **1 × 404** — `https://downloads.claude.ai/claude-code/apt/stable`. Same finding as M1/M2 §5:
    an apt repository base with no browsable root page, byte-identical to the official `setup.md`
    instructions. Not a lesson defect.
  - **6 × fictional placeholder URLs inside lab/code examples**, deliberately not real:
    `https://example.com/marketplace.json`, `https://example.com/notes`,
    `https://github.com/acme-corp/plugins` (404), `https://x-access-token:YOUR_TOKEN@github.com/…`
    (404 and, with an ellipsis-character variant of the same example, 400), `https://gitlab.com/
    company/plugins.git` (403, with and without a ref fragment — counted once here, listed twice
    in the raw results).
  - **4 × real, intentionally auth-gated endpoints demonstrated in labs** (unchanged from
    M2): `https://api.githubcopilot.com/mcp/` (401), `https://mcp.notion.com/mcp` (401),
    `https://mcp.sentry.dev/mcp` (401), `https://api.anthropic.com/v1/claude_code/routines/trig_.../fire`
    (405, a fictional trigger id in `m17-autonomy/02-routines.mdx`'s worked `curl` example).
  - **1 × 403** — `https://claude.ai/code/session_01HJKLMNOPQRSTUVWXYZ`, a fictional example
    session ID in `m17-autonomy/02-routines.mdx`'s webhook payload sample, not a real link.

- **Internal links**: every `/en/...` or `/tr/...` path referenced in `content/**/*.mdx` — **290
  unique paths** — resolved against `dist/<path>/index.html` after a clean `npm run build`:

  ```
  checked: 290, broken: 0
  ```

**0 real broken links across the full, final content tree** (external and internal).

## 7. Lighthouse CI (against the full, rebased `dist/`, budgets in `lighthouserc.json`)

```
$ npx -p @lhci/cli@0.15.1 lhci autorun   (staticDistDir dist, 3 runs per URL, medians)
...
Checking assertions against 3 URL(s), 9 total run(s)
All results processed!
Uploading median LHR of http://localhost:57087/en/...success!
Uploading median LHR of http://localhost:57087/tr/...success!
Uploading median LHR of http://localhost:57087/design/...success!
Done running autorun.
```

`assertion-results.json` (LHCI writes only failures there) is `[]` — 0 failing gating assertions
of 9 runs across the 3 budgeted URLs, exit code 0. Median category scores per URL (all 3 runs per
URL identical to two decimal places), read from the 9 saved LHR JSON reports:

| URL | performance | accessibility | best-practices | seo |
|---|---:|---:|---:|---:|
| `/en/` | 0.99 | 1.00 | 1.00 | 1.00 |
| `/tr/` | 0.96 | 1.00 | 1.00 | 1.00 |
| `/design/` | 0.92 | 1.00 | 1.00 | 1.00 |

All four budgets (`performance ≥ 0.90`, `accessibility ≥ 0.95`, `best-practices ≥ 0.90`,
`seo ≥ 0.95`) are met on every URL, against the complete, final, rebased build — scores hold at
308-page content volume with no regression from the M2 baseline (which measured 231 pages).

## 8. Live verification (2026-09-08)

All content is already live on `main` via each plan's own squash merge; the most recent
content-affecting deploy is `deploy.yml` run `34184126667`
(`fix(content): replace ajan calque with agent/subagent in TR content`, 2026-09-08T03:36:58Z),
**success**. This plan's own PR touches only `docs/release/M3-release.md` and `plans/**`, which
is `paths-ignore` for `deploy.yml` and triggers no new deploy — correct, since the content it
verifies is already live.

```
curl checks against https://cc.codechup.com:
200  /                              200  /en/                          200  /tr/
200  /design/                       200  /sitemap-index.xml            200  /en/rss.xml
200  /tr/rss.xml                    200  /pagefind/pagefind-entry.json 404  /nope-not-a-real-path/

200  /en/l1-beginner/m01-start/what-claude-code-is/       200  /tr/l1-beginner/m01-start/what-claude-code-is/
200  /en/l2-intermediate/m05-models-effort/model-family/  200  /tr/l2-intermediate/m05-models-effort/model-family/
200  /en/l3-advanced/m10-subagents/agent-tool-and-builtins/  200  /tr/l3-advanced/m10-subagents/agent-tool-and-builtins/  (now live — TR L3 shipped this wave)
200  /en/l4-master/m16-orchestration/workflows/            200  /tr/l4-master/m16-orchestration/workflows/            (now live — TR L4 shipped this wave)

200  /en/playbook/best-practices/    200  /tr/playbook/best-practices/
200  /en/meta/sources-index/         200  /tr/meta/sources-index/
```

Every TR L3/L4/Playbook/Meta route that was still `draft: true` or a stub at M2 is now live and
served with real content — the milestone's headline change, confirmed directly against production.

**Redirects:**
```
/  (no headers)               → 302 Location: https://cc.codechup.com/en/
/  (Accept-Language: tr)      → 302 Location: https://cc.codechup.com/tr/
```

**Security headers** (`/en/l4-master/m21-scale/large-codebases/`):
```
x-content-type-options: nosniff
x-frame-options: DENY
strict-transport-security: max-age=31536000
content-security-policy: default-src 'self'; script-src 'self' 'wasm-unsafe-eval' https://giscus.app
  https://static.cloudflareinsights.com; connect-src 'self' https://cloudflareinsights.com;
  img-src 'self' data:; font-src 'self'; style-src 'self' 'unsafe-inline'; frame-src https://giscus.app;
  frame-ancestors 'none'; base-uri 'self'; form-action 'self'
```
`Cache-Control` on a built asset (`/_astro/repo.BQFljwkp.css`): `public, max-age=31536000, immutable`.

`bash scripts/smoke/edge.sh https://cc.codechup.com`:

```
PASS: English home (/en/ -> 200) · Turkish home (/tr/ -> 200) · Design system page (/design/ -> 200)
PASS: Sitemap index · English RSS feed · Pagefind entry · Unknown path (/nope/ -> 404)
PASS: Default language redirect (/ -> 302 /en/) · Accept-Language redirect (-> /tr/) · Cookie overrides Accept-Language (-> /en/)
PASS: CSP (giscus.app + wasm-unsafe-eval) · HSTS · X-Content-Type-Options: nosniff
PASS: Cache-Control on /_astro/*.css contains immutable
== summary: 14 passed, 0 failed, 0 skipped ==
```

## 9. Giscus (O6)

```
$ gh variable list
DEPLOY_ENABLED  true  2026-09-06T22:32:12Z
$ gh secret list
DEPLOY_PATH             2026-09-06T20:42:48Z
HYGIENE_EXTRA_PATTERNS  2026-09-06T20:42:50Z
SSH_HOST                2026-09-06T20:42:44Z
SSH_KEY                 2026-09-06T20:42:47Z
SSH_USER                2026-09-06T20:42:46Z
```

Neither `PUBLIC_GISCUS_REPO_ID` nor `PUBLIC_GISCUS_CATEGORY_ID` exist as a repository variable or
secret. **O6 is still open.** Per the plan's Steps §6 and Non-goals, no id was invented and none
was created. Confirmed live that `Giscus.astro` correctly renders its "not yet enabled" placeholder
(`giscus-disabled` markup) on a real lesson page rather than a broken embed or a silent gap — the
component behaves exactly as P08 designed it to for the not-yet-configured case. Deferred to M4
`open_questions`, same disposition as M1/M2 — additive, not release-blocking (per this plan's own
Non-goals: "do not block this entire release on O6").

## 10. Module confirmations (P40–P44 Handoff notes: no unresolved release blocker)

- **P40 (TR L3 Advanced).** Fixed build-breaking stray tool-call artifacts and unescaped-apostrophe
  JS/YAML string breaks; fixed a systemic "agent"→"ajan" calque (173 occurrences, D018 violation)
  across m10-subagents; added missing first-use glossary links across the module (324 links,
  verified resolving). The "ajan" calque it flagged as surviving in four pre-existing `index.mdx`
  files was independently fixed on `main` by PR #83 while this release session was running (see
  §9/§12) — re-checked here, confirmed clean.
- **P41 (TR L4 Master).** Multiple build-breaking string/YAML bugs found and fixed across several
  review passes (stray `</content>` tag, straight-apostrophe YAML/JS breaks, a misplaced glossary
  link, an English `session`→`oturum` normalisation, 5 untranslated `<Lab lessonId="en/...">` props
  that would have namespaced a Turkish reader's lab progress under the English lesson — a
  functional bug, not cosmetic, now fixed). A final sweep added first-use glossary links to 9
  lessons (`m20-team` ×4, all of `m21-scale`) that had had zero glossary links at all. Confirms
  the M2 record's own recommendation ("run a full `npm run build` from a clean cache before
  declaring a translation plan done") — several of these bugs were invisible to `gate`/`lint`/
  `typecheck` and surfaced only under a real MDX/JSX parse.
- **P42 (EN Playbook).** `fact-checker` found 2 WRONG + 1 UNVERIFIABLE claims (a one-hour
  background-subagent-limit version citation, a nonexistent `disableArtifact`→`enableArtifact`
  version number, an unverifiable exact date) — all three fixed or reattributed. Flagged, not
  fixed here (outside `owned_paths`): `research/deprecations.md`'s stale header date and its now-
  resolved Bash-permission-rule row; a live-docs disagreement about the background-shell timeout
  between `interactive-mode.md` and `tools-reference.md`/the changelog (the changelog wins, per
  this plan's own sourcing rule). **TR stub gap it left for P44** (now closed): the TR glossary had
  36 headings against the new EN glossary's 58 terms — P44 closed this (see below).
- **P43 (EN Meta).** `fact-checker` found 3 contradicted claims (a `check-public-hygiene.mjs`/
  `npm run lint` wiring claim that does not match reality, a transcript-count claim off by the
  README-vs-recording split, wrong `fact-checker` verdict vocabulary quoted) — all three fixed.
  Confirmed, not fixed here: `npm run lint` genuinely does not invoke
  `scripts/check-public-hygiene.mjs`/`check-raw-colors.mjs` locally, though CI runs both as
  separate steps (already an open P04 finding in `STATE.md`; natural fit for P47 hardening, M4).
- **P44 (TR Playbook + Meta).** Rebuilt `content/tr/playbook/glossary.mdx` from scratch (58 terms +
  5 TR-only "Ek terimler" entries for terms the EN glossary doesn't define yet: canvas, connector,
  devcontainer, gateway, teammate — flagged for the EN twin, not fixed here). Verified 0 broken
  glossary anchors and 0 broken internal links across all 10 translated files; all 4
  `<DecisionTree>` component invocations confirmed byte-identical to English (props must never
  drift in translation). Its "ajan" calque follow-up (8 module `index.mdx` files plus one lesson
  body and one module title) was also fixed by PR #83 — see §9/§12.

Across P40/P41, the recurring theme is the same one M1/M2 already flagged: `npm run gate` and
`npm run lint`/`typecheck` do not catch invalid JSX/JS string syntax inside `<Quiz>`/`<Lab>` props
or YAML frontmatter apostrophe breaks — only a full `astro build` (MDX/JSX parse) does. This
release's own `npm run build` (§3) is clean, but the standing recommendation for every future
content plan is unchanged: run a full build from a clean cache before declaring translation work
done.

## 11. Owner-only leftovers still open (`docs/deploy/README.md` §"Owner action checklist")

Unchanged since M1/M2 — still open, not this plan's or any content plan's to resolve:

- **O6** — giscus repo ID / category ID not yet provided (confirmed again this session, §9);
  `Giscus.astro` still shows its placeholder instead of real comments.
- **O7** — Cloudflare Web Analytics token (`PUBLIC_CF_BEACON_TOKEN`) not yet provided; the
  analytics beacon is wired but not reporting.
- **O8** — the Cloudflare Worker + KV for 👍/👎 feedback is not deployed; `Helpful.astro` falls
  back to the GitHub Issues link (documented as acceptable to defer).

The M2 record's own §9 finding (`content/_shared/sources.json` was wiped to empty by a bad rebase
in P31) has since been resolved: the file now holds **142 entries**, consistent with every plan
from P42 onward reading and citing it (P43's `sources-index.mdx` asserts all 142 ids appear at
least once, verified in that plan's own Handoff notes). This release re-confirms the count from
disk (§4) rather than assuming the M2 fix held.

## 12. Status

P45 → `review` on 2026-09-08: every acceptance criterion in `plans/P45-milestone-3-release.md` is
met and recorded above. **https://cc.codechup.com is live with the complete course**: 119 EN + 119
TR lessons across all four levels, the Playbook and Meta in both languages, 0 remaining
`draft: true` lessons anywhere (`--no-drafts` passes), 0 real broken links across the full tree
(238 external + 290 internal checked), all LHCI budgets met on the complete 313-page build, all
local gates green, 122/126 sampled Playwright assertions passed (4 pre-existing search-UI `fixme`
skips, unrelated to this release) with 0 serious/critical axe violations, and the edge smoke test
is green (14/14).

Giscus (O6) remains explicitly deferred — `PUBLIC_GISCUS_REPO_ID`/`PUBLIC_GISCUS_CATEGORY_ID` are
not yet set as repository variables, and `Giscus.astro` correctly shows its placeholder rather
than a broken embed. This does not block the release, per this plan's own Non-goals. The "ajan"
calque follow-up flagged by P40/P44 was independently fixed on `main` while this session was
running (PR #83, 34 occurrences across 19 files) — re-checked here and confirmed clean, with one
exception this session found and left alone on purpose: a real captured transcript
(`content/_shared/transcripts/m16-orchestration/04-pipeline-lab/03-workflow-result.txt`) still
says "ajan" three times because it is a byte-accurate recording of a real session (D070/D099) —
editing it would mean fabricating a transcript, which is worse than the terminology drift. Filed
in `open_questions` for the owner. One remaining content follow-up (5 EN glossary terms proposed
by P44 that the English `glossary.mdx` doesn't yet define) is filed in `open_questions` for a
follow-up `chore` PR — the same disposition M1/M2 used for their own bookkeeping findings. No new
content defect was found by this release session beyond what P40–P44 already disclosed.
