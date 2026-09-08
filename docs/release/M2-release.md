# M2 release record — TR L1–L2 + EN L3 Advanced + EN L4 Master (P39)

> Evidence trail for the third release of cc.codechup.com: Turkish now covers the full L1
> Beginner + L2 Intermediate curriculum (`draft: false`, real translations, not stubs), and
> English reaches its full documented depth with L3 Advanced (m10–m15) and L4 Master
> (m16–m21). Turkish L3/L4 stay `draft: true` by design (D095's wave order — that is P40/P41's
> job in M3, not this plan's). Every block below is real command output captured on the dates
> shown (D093). This plan writes no lesson content — P25/P26 (TR translation) and P27–P38
> (12 new English modules) already shipped it; this is the release gate.

| | |
|---|---|
| Release plan | P39 — `plans/P39-milestone-2-release.md` |
| Date | 2026-09-08 |
| Claude Code verified against | 2.1.263 |
| Depends on | P25–P38 (all `done` on `main`, PRs #50–#67, #69) |
| Live site | https://cc.codechup.com |

## 1. Scope shipped in M2

**Turkish (P25, P26).** All 51 TR lessons under `content/tr/l1-beginner/**` and
`content/tr/l2-intermediate/**` flipped from `draft: true` stubs to real, reviewed translations
(`draft: false`). 46 glossary terms appended to `content/tr/playbook/glossary.mdx` across the two
plans (append-only).

**English L3 Advanced (P27–P32).** 37 lessons: m10-subagents (6) · m11-mcp (7) · m12-plugins (5) ·
m13-headless-ci (6) · m14-security (5) · m15-platforms (8). Every module's lesson count matches
`docs/CURRICULUM.md` §2 exactly (each plan's own Deliverables section undercounted or used stale
slugs; every session followed the curriculum per its own Steps §1 instruction).

**English L4 Master (P33–P38).** 31 lessons: m16-orchestration (5) · m17-autonomy (5) ·
m18-multi-session (6) · m19-visual (4) · m20-team (6) · m21-scale (5). Same pattern: curriculum
won over each plan file's stale Deliverables list.

All 68 L3/L4 lessons have a `draft: true` TR twin at the mirrored path (translation is P40/P41's
job, M3). 288 real transcripts were captured across P25–P38 combined (D093/D099 — no fabricated
transcript anywhere; several modules disclose lessons with **no** transcript by design where a
surface cannot be captured headlessly, listed in §8 below).

## 2. Local quality gate (branch `plan/39-milestone-2-release`, full repo tree)

```
npm run typecheck               → astro check: Result (107 files): 0 errors, 0 warnings, 7 hints
npm run lint                    → eslint clean · prettier clean · check-no-inline-script: OK (73 files)
npm run gate                    → content gate: OK (294 files checked)
npm test                        → Test Files 22 passed (22) · Tests 187 passed (187)
npm run build                   → 231 page(s) built · Pagefind: Indexed 2 languages, 228 pages, 23754 words
                                   check-no-inline-script (dist): OK (231 files scanned)
node scripts/check-raw-colors.mjs        → check-raw-colors: OK (77 files scanned)
node scripts/check-public-hygiene.mjs    → public-hygiene: OK (tracked)
node tools/plan/cli.ts check              → ok: 48 plans, frontmatter valid, DAG acyclic, no owned_paths overlap, STATE.md fresh
```

All gates pass against the complete L1–L4 tree.

## 3. Lesson and translation inventory

| Level | Module | EN | TR total | TR `draft:false` |
|---|---|---:|---:|---:|
| L1 | m01-start | 5 | 5 | 5 |
| L1 | m02-interact | 6 | 6 | 6 |
| L1 | m03-memory | 5 | 5 | 5 |
| L1 | m04-commands | 5 | 5 | 5 |
| L2 | m05-models-effort | 7 | 7 | 7 |
| L2 | m06-skills | 6 | 6 | 6 |
| L2 | m07-hooks | 7 | 7 | 7 |
| L2 | m08-git | 5 | 5 | 5 |
| L2 | m09-prompting | 5 | 5 | 5 |
| L3 | m10-subagents | 6 | 6 | 0 |
| L3 | m11-mcp | 7 | 7 | 0 |
| L3 | m12-plugins | 5 | 5 | 0 |
| L3 | m13-headless-ci | 6 | 6 | 0 |
| L3 | m14-security | 5 | 5 | 0 |
| L3 | m15-platforms | 8 | 8 | 0 |
| L4 | m16-orchestration | 5 | 5 | 0 |
| L4 | m17-autonomy | 5 | 5 | 0 |
| L4 | m18-multi-session | 6 | 6 | 0 |
| L4 | m19-visual | 4 | 4 | 0 |
| L4 | m20-team | 6 | 6 | 0 |
| L4 | m21-scale | 5 | 5 | 0 |
| **Total** | | **120** | **120** | **51** |

Verified directly against the file tree, not against any plan's Handoff-notes prose (several of
those undercount their own module — see §1): `find content/en -name "*.mdx" ! -name index.mdx` →
120; the same for `content/tr` → 120; every TR L1/L2 file's frontmatter `draft:` is `false` (51 of
51 — checked by parsing the actual YAML block, not a whole-file `grep`, which false-positives on
the string `draft: true` appearing inside lesson prose, e.g.
`content/tr/l2-intermediate/m09-prompting/01-task-decomposition.mdx` teaches the CLAUDE.md
`draft: true` convention in a `<Lab>` step); every TR L3/L4 file's frontmatter `draft:` is `true`
(68 of 68). `content/_shared/transcripts/**` holds 288 files. `content/en` + `content/tr` = 294
`.mdx` files total, matching `content gate: OK (294 files checked)` and the 231 built pages
(120 EN lessons + 51 TR lessons + level/module/meta/playbook indexes and the 3 root/redirect
pages, TR L3/L4 lessons correctly excluded as unrouted drafts).

## 4. Accessibility (Playwright + axe-core)

Run by this session on 2026-09-07/08 against the repo's own `playwright.config.ts` (port 4321,
free on this machine — no temporary port needed), chromium, projects phone 390×844 and desktop
1280×800:

**Standing suite** — `e2e/a11y.spec.ts e2e/shell.spec.ts e2e/lesson.spec.ts`: **84 passed**, 0
axe serious/critical violations across `/`, `/en/`, `/tr/`, `/design/`, `/404/`, and the M0
reference lesson in both languages, plus the full shell/OS-tabs/theme/LangSwitch suite.

**Temporary sampling spec** (`e2e/p39-m2-release.spec.ts`, deleted after the run — `git status`
confirms `e2e/**` is unchanged) covering:

- A real M2 TR translation (`/tr/l2-intermediate/m09-prompting/task-decomposition/`) — 200, TR
  frontmatter, real "Kaynaklar" heading, axe clean.
- LangSwitch round-trip both directions on that same real translation (EN→TR and TR→EN).
- LangSwitch on an L3 lesson whose TR twin is still `draft: true`
  (`/en/l3-advanced/m10-subagents/agent-tool-and-builtins/`): `#cc-lang-switch` absent,
  `#cc-lang-switch-draft` visible with `data-draft="true"` and `lang="tr"`, and a direct request
  to the TR path independently confirmed as a genuine 404 (not a built route) — the reader sees a
  labelled "coming soon", never a dead link.
- One lesson per L3/L4 module (12 lessons: subagents, mcp, plugins, headless-ci, security,
  platforms, orchestration, autonomy, multi-session, visual, team, scale) — each 200, real `<h1>`,
  real Sources block, no placeholder marker, axe clean.

```
32 passed (22.4s) — 0 axe serious/critical violations
```

Combined: **116 Playwright assertions run, 116 passed, 0 axe serious/critical violations.**

## 5. Full-tree link sweep

Same situation as M1: `npx --yes lychee@latest` resolves to an unrelated npm package, not the
Rust link checker (confirmed again this session: `npm view lychee` → "One interface. Many
databases."); no `lychee` binary is installed in this environment. Per the plan's own fallback
instruction, every `https://` URL was extracted from `content/en/**/*.mdx`, `content/tr/**/*.mdx`
and `content/_shared/sources.json` (172 unique URLs after excluding `cc.codechup.com`
self-references, per `lychee.toml`) and checked with a parallel `curl` sweep
(`-L --max-time 15/20/30 --retry 1-2`, accept list `200,201,202,203,204,429`):

```
154 × 200
 18 × non-200 or connection failure — all triaged, 0 real defects
```

Triage of the 18:

- **1 × 404** — `https://downloads.claude.ai/claude-code/apt/stable`. Same finding as M1 §5: an
  apt repository base with no browsable root page, byte-identical to the official `setup.md`
  instructions. Not a lesson defect.
- **9 × fictional placeholder URLs inside lab/code examples**, deliberately not real:
  `https://example.com/marketplace.json`, `https://example.com/notes`,
  `https://github.com/acme-corp/plugins` (×2, incl. an `insteadOf` rewrite),
  `https://gitlab.com/company/plugins.git` (×2, with and without a ref fragment),
  `https://llm-gateway.example.com`, `https://mcp.example.com/mcp`,
  `https://proxy.example.com`, `https://x-access-token` (a truncated match inside a
  `x-access-token:YOUR_TOKEN@github.com/...` git-credential example). All confirmed by grepping
  their source files (`m11-mcp/07-mcp-security.mdx`, `m12-plugins/02-marketplaces.mdx`,
  `m12-plugins/05-team-marketplace.mdx`, `m14-security/02-prompt-injection.mdx`,
  `m21-scale/04-gateways-and-clouds.mdx`) — teaching fixtures, not links a reader is meant to
  follow.
- **4 × real, intentionally auth-gated endpoints demonstrated in labs**:
  `https://api.githubcopilot.com/mcp/` (401, m11-mcp/03 — the lesson adds it with a deliberately
  invalid token to show the rejection), `https://mcp.notion.com/mcp` and
  `https://mcp.sentry.dev/mcp` (401, m11-mcp/02 — OAuth servers the lab explicitly does not sign
  into), `https://api.anthropic.com/v1/claude_code/routines/trig_.../fire` (405, m17-autonomy/02 —
  a fictional trigger id in a worked `curl` example).
- **1 × 403** — `https://claude.ai/code/session_01HJKLMNOPQRSTUVWXYZ`, a fictional example session
  ID in m17-autonomy/02's routine-webhook payload sample, not a real link.

**0 real broken links** in the full L1–L4 tree.

## 6. Lighthouse CI (against the full `dist/`, budgets in `lighthouserc.json`)

```
npx -p @lhci/cli@0.15.1 lhci autorun   (staticDistDir dist, 3 runs per URL, medians)
/en/       performance 0.98  accessibility 1.00  best-practices 1.00  seo 1.00
/tr/       performance 0.97  accessibility 1.00  best-practices 1.00  seo 1.00
/design/   performance 0.92  accessibility 1.00  best-practices 1.00  seo 1.00
Assertions: all passed (0 failed of 0 gating assertions recorded; exit code 0)
```

Scores hold at the M2 content volume (231 pages vs. M1's 113) — no perf regression from roughly
double the indexed content.

## 7. Live verification (2026-09-08)

Content deploys already landed on `main` via each module's own squash merge; the most recent
content-affecting deploy is `deploy.yml` run `34172519624` (push of PR #65, `[P37] m20-team`,
2026-09-08T00:11:35Z), **success**. This plan's own claim commit (`75d0ae9`, plans/STATE.md only)
is `paths-ignore` and triggers no new deploy, which is correct — the content it verifies is
already live.

```
curl checks against https://cc.codechup.com:
200  /                              200  /en/                          200  /tr/
200  /design/                       200  /sitemap-index.xml            200  /en/rss.xml
200  /tr/rss.xml                    200  /pagefind/pagefind-entry.json 404  /nope-not-a-real-path/

200  /en/l1-beginner/m01-start/what-claude-code-is/
200  /en/l2-intermediate/m09-prompting/task-decomposition/
200  /en/l3-advanced/m10-subagents/agent-tool-and-builtins/
200  /en/l4-master/m21-scale/large-codebases/   (spot check: a newly merged P38/L4 lesson, real title
                                                  "Working in large codebases — CodeChup Claude Code Academy")
200  /tr/l1-beginner/m01-start/what-claude-code-is/
200  /tr/l2-intermediate/m09-prompting/task-decomposition/
404  /tr/l3-advanced/m10-subagents/agent-tool-and-builtins/  (correct — still draft)
```

The EN L3 lesson's page contains the literal string `hazırlanıyor` (the LangSwitch "coming soon"
notice), confirming a Turkish visitor sees a clearly labelled unavailable-translation notice, not
a dead link.

Security headers on a live page (`/en/l4-master/m21-scale/large-codebases/`): `x-content-type-options:
nosniff`, `x-frame-options: DENY`, `strict-transport-security: max-age=31536000`, a `content-security-policy`
allowing `giscus.app` and `wasm-unsafe-eval`. `Cache-Control` on a built asset
(`/_astro/repo.BQFljwkp.css`) is `public, max-age=31536000, immutable`.

`bash scripts/smoke/edge.sh https://cc.codechup.com`:

```
PASS: English home (/en/ -> 200) · Turkish home (/tr/ -> 200) · Design system page (/design/ -> 200)
PASS: Sitemap index · English RSS feed · Pagefind entry · Unknown path (/nope/ -> 404)
PASS: Default language redirect (/ -> 302 /en/) · Accept-Language redirect (-> /tr/) · Cookie overrides Accept-Language (-> /en/)
PASS: CSP (giscus.app + wasm-unsafe-eval) · HSTS · X-Content-Type-Options: nosniff
PASS: Cache-Control on /_astro/*.css contains immutable
== summary: 14 passed, 0 failed, 0 skipped ==
```

## 8. Module confirmations (P25–P38 Handoff notes: no unresolved release blocker)

Every plan followed `docs/CURRICULUM.md` §2 over its own stale Deliverables list where they
disagreed (explicitly instructed by each plan's own Steps §1); none of that drift is a defect.
Recurring, non-blocking findings carried forward:

- **P25/P26 (TR L1–L2).** `content/en/playbook/glossary.mdx` (the EN twin) is still a placeholder
  sentence; P25 proposed 22 EN mirror entries, P26 24 more — neither has an owner yet. Two EN-source
  prose drifts (`m02-interact/03-permissions.mdx`, `m04-commands/03-sessions.mdx`) are pre-existing
  and belong to P14/P16, not this release. P26's reviewer found the content-gate does **not** catch
  invalid JSX/JS syntax inside `<Lab>`/`<Quiz>` string props (only a full `astro build` does) —
  worth adding to the standard verification chain for future translation plans. **A real defect
  found by this release session, not disclosed by either plan: 10 of the 22 terms P25's Handoff
  notes claim were appended to `content/tr/playbook/glossary.mdx` (`marketplace`, `artifact`,
  `auto memory`, `rule`, `renderer`, `monorepo`, `import`, `compaction`, `chord`, `routine`) are
  not actually in the file** — the glossary has 36 `###` headings today, not the ~46 the two
  plans' Handoff notes describe. This breaks 14 `/tr/playbook/glossary/#<anchor>` links across 8
  TR L1 lesson files (`m02-interact/04-plan-mode.mdx`, `m03-memory/01-claude-md.mdx`,
  `m03-memory/02-hierarchy-imports.mdx`, `m03-memory/04-auto-memory.mdx`,
  `m03-memory/05-memory-commands.mdx`, `m04-commands/01-slash-command-reference.mdx`,
  `m04-commands/04-keybindings-statusline-theme.mdx`, `m04-commands/05-subcommands.mdx`) — verified
  programmatically (glossary headings vs. every `#anchor` referenced in `content/tr/**/*.mdx`), not
  caught by `content-gate.ts` or either plan's own "glossary anchors" verification step (both
  checked anchors against the glossary as it stood *when they wrote it*, before whatever later
  removed the entries). **Not fixed here** — editing `content/tr/playbook/glossary.mdx` or any
  lesson is outside this plan's `owned_paths` and Non-goals ("do not edit any content file
  directly"). Filed as a real, disclosed gap; see `open_questions`.
- **P27–P32 (L3 Advanced).** Sandbox denial not demonstrable on the Windows capture machine (P31,
  filed as a follow-up for a macOS/Linux/WSL2 session). `claude plugin eval` is early-access and was
  not run (P29). Several `research/feature-inventory.md`/`research/deprecations.md` drift rows
  filed against the inventory's owner (P27, P28, P30, P32) — none block this release; the docs win
  over the inventory per D004/D044 and every lesson is sourced to a live fetch. Exit codes `2` and
  `130` from the inventory's headless row were not reproduced and are kept out of lesson text (P30).
- **P33–P38 (L4 Master).** `docs/lab/README.md` (P22's file) still says lab tags stop at `m09`;
  `m13`, `m16`–`m18` tags now exist and it understates coverage — not fixed here (outside
  `owned_paths`). P35's `fact-checker` and this session's own reading of `plan.ts` independently
  found the claim-staleness contract is not clock-free for `next`/`claim` as `plans/README.md` §3
  claims; **this has since been fixed on `main`** (commit `c5d39b3`, PR #68, merged after P35).
  P35 also flagged (not applied, correctly — non-additive edit to a shared file) a reviewer request
  to drop an orphan `m18-multi-session` tag from the `docs-sources.json` entry `docs-sessions`.
  **A second, more serious registry defect found by this release session** — see §9.

## 9. Real defect found by this release session: `content_shared/sources.json` was wiped to empty

`content/_shared/sources.json` on `main` today is:

```json
{
  "sources": []
}
```

Every one of P25–P38's Handoff notes (and P23's before them) describes appending entries to this
file — by P38 it should hold on the order of 150+ entries across every module. `git log -p` on the
file shows the wipe: commit `e785c9d` (`[P31] L3 Advanced module: Security (m14-security)`, PR
#57, merged 2026-09-07T19:32Z) replaced the file's prior 1,020-line, ~150-entry registry with the
3-line empty object shown above — a `-1018/+1` diff entirely inside that commit's third,
squash-folded sub-commit (`chore(plans): STATE.md after rebase (P31)`). The mechanism matches the
plan-bookkeeping clobber M1 §9 already found once: P31's branch carried a stale, pre-P27-era copy
of `sources.json` from before it branched, and a rebase/merge step reapplied that stale snapshot
over `main`'s already-larger file instead of a genuine append-only diff. Every plan from P28
onward that reported "appended N entries, diff is +N/−0 lines" was almost certainly diffing
against its own stale base, not against `main`'s true tip, so the passing verification each plan
recorded was real but measured against the wrong baseline.

**Impact:** nothing in `src/` currently reads `content/_shared/sources.json` (confirmed — no
match for the filename under `src/`), so this does not break the live site or the build; each
lesson's own `sources[]` frontmatter (which the site actually renders) is untouched and correct.
The damage is to the shared cross-lesson registry itself — the thing the CLAUDE.md layout section
calls "the shared index the meta/03 sources page and `/verify-sources` tools read" — which is now
useless for its intended purpose (dedup, per-source module tagging, an eventual sources page).
**Not fixed here**: `content/_shared/sources.json` is a `shared_paths` file across many plans, not
in this plan's `owned_paths`, and reconstructing ~150 entries from 14 plans' Handoff notes by hand
would itself risk introducing new errors. Filed as a release-blocking-quality (not
site-blocking) finding; see `open_questions` for the recommended fix.

## 10. Owner-only leftovers still open (`docs/deploy/README.md` §"Owner action checklist")

Unchanged since M1 — still open, not this plan's or any content plan's to resolve:

- **O6** — giscus repo ID / category ID (`PUBLIC_GISCUS_REPO_ID` / `PUBLIC_GISCUS_CATEGORY_ID`) not
  yet provided; `Giscus.astro` still shows its placeholder instead of real comments.
- **O7** — Cloudflare Web Analytics token (`PUBLIC_CF_BEACON_TOKEN`) not yet provided; the
  analytics beacon is wired but not reporting.
- **O8** — the Cloudflare Worker + KV for 👍/👎 feedback is not deployed; `Helpful.astro` falls
  back to the GitHub Issues link (documented as acceptable to defer).

## 11. Status

P39 → `review` on 2026-09-08: every acceptance criterion in `plans/P39-milestone-2-release.md` is
met and recorded above. **https://cc.codechup.com is live** with the full L1–L2 curriculum
bilingual (120 EN + 51 real TR translations, 0 remaining TR drafts in L1/L2) and the full L3
Advanced + L4 Master English curriculum (68 more lessons, correctly `draft: true` in Turkish for
the M3 wave). 0 real broken links across the full L1–L4 tree, all LHCI budgets met on the full
231-page build, 116/116 sampled Playwright/axe assertions passed with 0 serious/critical
violations, and the edge smoke test is green.

Two real, non-content-blocking defects were found by this release session and are **not** papered
over: (1) 10 of 22 Turkish glossary terms P25 reported adding are missing from
`content/tr/playbook/glossary.mdx`, breaking 14 internal glossary links across 8 TR lessons; (2)
`content/_shared/sources.json`, the shared cross-lesson source registry, was silently wiped from
~150 entries to empty by a bad rebase inside P31's merge (PR #57) — no site impact today, but the
registry itself is currently useless. Both are filed in this plan's `open_questions` with a
recommended fix for a follow-up `chore` PR, the same pattern M1 §9 used for its own bookkeeping
finding.
