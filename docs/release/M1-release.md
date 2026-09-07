# M1 release record — L1 Beginner + L2 Intermediate (P24)

> Evidence trail for the second release of cc.codechup.com: the full Beginner and Intermediate
> curriculum in English, live, with Turkish shown as "Türkçesi hazırlanıyor" via the draft
> mechanism (P06) rather than missing or broken. Every block below is real command output captured
> on the dates shown (D093). This plan writes no lesson content — P13–P21 (modules) and P22–P23
> (lab repo, sources registry) already shipped it; this is the release gate.

| | |
|---|---|
| Release plan | P24 — `plans/P24-milestone-1-release.md` |
| Date | 2026-09-07 |
| Claude Code verified against | 2.1.263 |
| Depends on | P13–P23 (all `done` as of `a62ab3c`, PR #42) |
| Live site | https://cc.codechup.com |

## 1. Scope shipped in M1

P13 m01-start (5 lessons) · P14 m02-interact (6) · P15 m03-memory (5) · P16 m04-commands (5) ·
P17 m05-models-effort (7) · P18 m06-skills (6) · P19 m07-hooks (7) · P20 m08-git (5) ·
P21 m09-prompting (5) · P22 lab repository (`codechup/claude-code-lab`, 46 tags covering every
`Lab`-tagged M1 lesson) · P23 sources registry (101 entries, all 23 module/topic ids tagged).
51 EN lessons total across nine modules; every one has a `draft: true` TR twin (the M0 sample
lesson `m01-start/01-what-claude-code-is` remains the one fully translated lesson).

## 2. Local quality gate (branch `plan/24-milestone-1-release`, full L1–L2 tree)

```
node scripts/content-gate.ts   → content gate: OK (158 files checked)
npm run typecheck              → astro check: Result (107 files): 0 errors, 0 warnings, 7 hints
npm run lint                   → eslint clean · prettier clean · check-no-inline-script: OK (73 files)
node scripts/check-raw-colors.mjs        → check-raw-colors: OK (77 files scanned)
node scripts/check-public-hygiene.mjs    → public-hygiene: OK (tracked)
npm test                       → Test Files 22 passed (22) · Tests 184 passed (184)
npm run build                  → 113 pages built · Pagefind: Indexed 2 languages, 110 pages, 8486 words
                                  check-no-inline-script (dist): OK (113 files scanned)
node tools/plan/cli.ts check   → ok: 48 plans, frontmatter valid, DAG acyclic, no owned_paths overlap, STATE.md fresh
```

All gates pass against the complete L1–L2 tree (49 EN lessons under `content/en/l1-beginner` +
`content/en/l2-intermediate`, plus the M0 `m01-start` lesson already shipped = 51 total), with
their TR twins still correctly `draft: true`.

## 3. Lesson inventory (EN vs. `docs/CURRICULUM.md` §2 floor)

| Module | Floor | Shipped EN | TR total | TR draft |
|---|---:|---:|---:|---:|
| m01-start | 5 | 5 | 5 | 4 (lesson 01 is the M0 live translation) |
| m02-interact | 6 | 6 | 6 | 6 |
| m03-memory | 5 | 5 | 5 | 5 |
| m04-commands | 5 | 5 | 5 | 5 |
| m05-models-effort | 7 | 7 | 7 | 7 |
| m06-skills | 6 | 6 | 6 | 6 |
| m07-hooks | 7 | 7 | 7 | 7 |
| m08-git | 5 | 5 | 5 | 5 |
| m09-prompting | 5 | 5 | 5 | 5 |
| **Total** | **51** | **51** | **51** | **50** |

Every module meets its curriculum floor exactly (no module ships fewer or more lessons than
§2 lists). Every EN lesson has a TR file at the mirrored path; 50 of 51 are `draft: true` (the
intended M1 state, D095's wave order — TR translation is a later wave), and the one non-draft TR
lesson is the M0 sample already live since P12.

## 4. Accessibility (Playwright + axe-core)

Run by this session on 2026-09-07 with a temporary Playwright config (`playwright.p24.config.ts`,
port 4424, `ASTRO_PREVIEW_BACKGROUND=1`), chromium, projects phone 390×844 and desktop 1280×800,
specs `e2e/a11y.spec.ts e2e/shell.spec.ts e2e/lesson.spec.ts` plus a temporary
`e2e/p24-m1-release.spec.ts` visiting the landing page, one EN lesson per module (the nine routes
in §3's first-lesson slugs: `m01-start/what-claude-code-is`, `m02-interact/prompting-basics`,
`m03-memory/claude-md`, `m04-commands/slash-command-reference`, `m05-models-effort/model-family`,
`m06-skills/skills-vs-commands`, `m07-hooks/hook-anatomy`, `m08-git/commits-and-conventions`,
`m09-prompting/task-decomposition`), `/design/` and `/404/`:

```
78 passed (29.9s), 0 failed
axe serious/critical violations: 0 across all routes above, both viewports
```

The LangSwitch-on-a-TR-draft case was exercised explicitly against
`/en/l1-beginner/m02-interact/prompting-basics/` (its TR twin is `draft: true`):
`#cc-lang-switch` (the live-link anchor) is absent; `#cc-lang-switch-draft` is a `<span>` (not an
`<a>`) reading "Türkçesi hazırlanıyor", with `data-draft="true"` and `lang="tr"`; a direct request
to the TR path independently confirms it is not a built route (404) — so the reader sees a clearly
labelled unavailable-translation notice, never a dead link. Both temporary files
(`playwright.p24.config.ts`, `e2e/p24-m1-release.spec.ts`) were deleted after the run; `git status`
confirms `e2e/**` (P04's `owned_paths`) is unchanged.

## 5. Full link sweep (L1–L2 English content)

`npx --yes lychee@latest` does not resolve to the Rust link checker — npm's `lychee` package is an
unrelated database-interface tool (`npm view lychee` → "One interface. Many databases."); CI itself
only ever runs the real binary via `lycheeverse/lychee-action`, not through npx. Per the plan's own
fallback instruction, every `http(s)` URL was extracted from `content/en/l1-beginner/**/*.mdx`,
`content/en/l2-intermediate/**/*.mdx` and `content/_shared/sources.json` (127 unique URLs after
`lychee.toml`'s `cc.codechup.com` self-reference exclude) and checked with a `curl` loop
(`-sSL --max-time 20 --retry 2`, `lychee.toml`'s accept list of `200,201,202,203,204,429`):

```
126 × 200
  1 × 404  — https://downloads.claude.ai/claude-code/apt/stable  (content/en/l1-beginner/m01-start/02-install.mdx:185)
```

Triaged: that URL is an `apt` repository base (`deb [signed-by=...] https://downloads.claude.ai/claude-code/apt/stable stable main`),
not a browsable page — a bare `GET` to an apt repo root 404s the same way it does for any Debian
package mirror; `apt` itself resolves `dists/stable/Release` under it. Confirmed byte-identical to
the official `setup.md` (fetched this session, line 396) — no lesson error, no dead link, no
`content/_shared/sources.json` entry involved. **0 real broken links** in the L1–L2 English tree.

## 6. Lighthouse CI (against `dist/`, budgets in `lighthouserc.json`)

```
npx -p @lhci/cli@0.15.1 lhci autorun   (staticDistDir dist, 3 runs per URL, medians)
/en/       performance 0.98  accessibility 1.00  best-practices 1.00  seo 1.00
/tr/       performance 0.97  accessibility 1.00  best-practices 1.00  seo 1.00
/design/   performance 0.92  accessibility 1.00  best-practices 1.00  seo 1.00
Assertions: all passed (budgets perf ≥ 0.9, a11y ≥ 0.95, best-practices ≥ 0.9, seo ≥ 0.95)
```

Same three URLs as M0 (per `lighthouserc.json`'s fixed `url` list) — scores hold at the M1 content
volume; `/en/` and `/tr/` performance is effectively unchanged from M0 (0.98/0.96 → 0.98/0.97)
despite ~9x more indexed lesson pages.

## 7. Live verification (2026-09-07)

Content deploys already landed on `main` via each module's own squash merge (P13–P21 do not touch
`DEPLOY_ENABLED`, already `true` since P12); the most recent content-affecting deploy is
`deploy.yml` run `34110954780` (push of PR #36, `[P18] m06-skills`), all jobs green:

```
deploy.yml run 34110954780 (push, 2026-09-07T10:20:46Z) → success
  gate: success · ci/quality: success · ci/links: skipped (no content diff on this push)
  ci/e2e: success · ci/lighthouse: success · deploy: success
```

`bash scripts/smoke/edge.sh https://cc.codechup.com`:

```
PASS: English home (/en/ -> 200) · Turkish home (/tr/ -> 200) · Design system page (/design/ -> 200)
PASS: Sitemap index · English RSS feed · Pagefind entry · Unknown path (/nope/ -> 404)
PASS: Default language redirect (/ -> 302 /en/) · Accept-Language redirect (-> /tr/) · Cookie overrides Accept-Language (-> /en/)
PASS: CSP (giscus.app + wasm-unsafe-eval) · HSTS · X-Content-Type-Options: nosniff
PASS: Cache-Control on /_astro/*.css contains immutable
== summary: 14 passed, 0 failed, 0 skipped ==
```

One live lesson route per module, all 200:

```
200  /en/l1-beginner/m01-start/what-claude-code-is/
200  /en/l1-beginner/m02-interact/prompting-basics/
200  /en/l1-beginner/m03-memory/claude-md/
200  /en/l1-beginner/m04-commands/slash-command-reference/
200  /en/l2-intermediate/m05-models-effort/model-family/
200  /en/l2-intermediate/m06-skills/skills-vs-commands/
200  /en/l2-intermediate/m07-hooks/hook-anatomy/
200  /en/l2-intermediate/m08-git/commits-and-conventions/
200  /en/l2-intermediate/m09-prompting/task-decomposition/
```

The Turkish-visitor experience was checked live, not just locally: `https://cc.codechup.com/tr/l1-beginner/m02-interact/prompting-basics/`
(a draft TR lesson) → **404** — no such route is built — while the EN twin's page HTML contains
the literal string "hazırlanıyor" (the LangSwitch notice), i.e. a Turkish visitor sees a clearly
labelled "coming soon", never a broken link, exactly as D095/P06 designed it.

This plan's own merge to `main` (this PR) touches only `docs/release/M1-release.md`, `plans/**`
and `STATE.md`, all `paths-ignore` in `deploy.yml` — it will not itself trigger a new deploy, which
is correct: the content it verifies is already live, and `DEPLOY_ENABLED` is not re-flipped
(Non-goals).

## 8. Module confirmations (P13–P21 Handoff notes: no unresolved blocker)

**P13 (m01-start).** No blocker. Two open items, neither release-blocking: a Shiki `github-light`
colour-contrast gap on PowerShell `scriptblock` tokens (workaround applied in content; P05 owns the
theme fix), and a `research/feature-inventory.md` gap on default-permission-mode headless behaviour
(P03's file).

**P14 (m02-interact).** No blocker. One real defect worth tracking: inline glossary links in TR
prose fail axe `link-in-text-block` (colour-only distinction) — removed from the TR module index to
keep the build green; flagged for P05/P07 to add a non-colour affordance before the TR wave links
glossary terms inside lesson bodies. Also flags missing TR glossary terms (P25/P26/P40/P41's scope)
and two `research/` drift rows (P03's).

**P15 (m03-memory).** No blocker. `docs/CURRICULUM.md`/lab-repo tag-convention drift (P03/P22 to
reconcile: `lesson/m03-01-start` vs. the documented `lesson/m03-memory-01-start` shape) and a
`research/feature-inventory.md` memory-precedence wording gap, both filed as `open_questions`
against their owning files, not fixed here.

**P16 (m04-commands).** No blocker. Five lessons shipped (curriculum floor is 5, not the plan
file's stale 4). Several `docs/CURRICULUM.md` / `research/deprecations.md` corrections needed
(`/fullscreen` → `/tui fullscreen`, `claude config` → `/config`, `/btw` history keys) — all filed
as `open_questions` for P03, already partially fixed by the later `docs(research)` commits (`#37`,
`#40`, `#41`) merged to `main` after this module shipped.

**P17 (m05-models-effort).** No blocker. Real cross-model lab findings recorded (Sonnet finishing
inside a turn budget where Haiku/Opus hit `error_max_turns` with the fix already on disk); one
fact-checker false-negative on a Fable/Glasswing pricing claim was resolved by re-fetching raw HTML
(WebFetch had been permission-denied inside the review agent). A `research/deprecations.md` gap for
three Changed callouts was filed and has since been partly addressed by `docs(research)` commit
`be5ba0c` (#37).

**P18 (m06-skills).** No blocker. Notes an unreliable ~1-in-3/4 refusal rate when invoking a
`disable-model-invocation: true` skill headlessly on 2.1.263 (too small a sample to call causation,
stated as such) and a missing `research/deprecations.md` row for the slash-command→skill merge
(2.1.3) — filed, not release-blocking.

**P19 (m07-hooks).** No blocker. **Note:** this plan file's own Handoff notes section was
overwritten back to the empty placeholder by a later sibling squash merge (see §9) — the real notes
survive at commit `cc9e27b` (`plans/P19-l2-m07-hooks.md`). Content-level: three real
`research/feature-inventory.md`/`research/deprecations.md` drift rows filed (33 hook events not 32;
`permissionDecision` values `allow|deny|ask|defer` not `allow|deny|block`; blocking events span
more than the exit-code table) — since corrected by `docs(research)` commit `c0253d8` (#40).

**P20 (m08-git).** No blocker. **Note:** same Handoff-notes clobbering as P19 (see §9); real notes
survive at commit `7df3ff8`. Content-level: three missing `research/deprecations.md` rows and one
undocumented `includeCoAuthoredBy` deprecation version filed as `open_questions`, since partly
addressed by `docs(research)` commit `f07439d` (#41).

**P21 (m09-prompting).** No blocker. **Note:** same Handoff-notes clobbering as P19/P20 (see §9);
real notes survive at commit `96eb711`. Content-level: no lab-repo tags exist for `m09` (P22 tagged
m01–m08 only), so every lab runs against the lab repo's `main` tip with `repo_tag: 'none'` and an
explanatory callout — a real, disclosed limitation, not a defect; filed for a follow-up lab-tagging
plan. Two Windows scratch-path redactions were made and disclosed per `.claude/rules/content.md`.

## 9. Plan-bookkeeping finding (not a content defect)

While reading Handoff notes for this release, this session found that **P17, P19, P20 and P21's
plan files on `main` had their `status` reverted to `in_progress` and their Handoff notes wiped
back to the unfilled placeholder**, even though each module's content was correctly authored,
reviewed and squash-merged (PRs #33, #34, #38, #39). The cause: each of the four L2 module branches
carried its own copy of an earlier `chore(plans): claim P17–P21` commit, and each later squash merge
re-applied that stale snapshot over `main`'s already-`review` state. The real Handoff notes survive
in the respective merge-commit trees (`f909a64` for P17, `cc9e27b` for P19, `7df3ff8` for P20,
`96eb711` for P21) and are summarised in §8 above from those shas.

This session found the repo owner had independently diagnosed and fixed the status half of this
(commit `b4ee7ab`, `chore(plans): P13–P21 done; claim P24`, merged as PR #42 / `a62ab3c`) — all of
P13–P23 are now correctly `done` and P24 is claimed for this session. That commit did not, and
per this plan's `owned_paths` this plan does not, restore the four wiped Handoff-notes bodies
in-place — doing so would mean hand-editing another plan's file outside `docs/release/M1-release.md`.
**Recommended follow-up:** a small `chore(plans)` PR that copies the four real Handoff notes bodies
back from the shas above into `plans/P17-l2-m05-models-effort.md`, `plans/P19-l2-m07-hooks.md`,
`plans/P20-l2-m08-git.md` and `plans/P21-l2-m09-prompting.md`, so the plan files stop lying about
their own history. This is a documentation-integrity issue only — no lesson content was lost or
altered.

## 10. Status

P24 → `review` on 2026-09-07: every acceptance criterion is met and recorded above.
**https://cc.codechup.com is live** with the full L1 Beginner + L2 Intermediate curriculum (51 EN
lessons across 9 modules) in English, Turkish correctly shown as "Türkçesi hazırlanıyor" rather than
missing or broken, 0 real broken links, all LHCI budgets met, and the edge smoke test green. One
plan-bookkeeping follow-up is filed (§9); no content defect blocks this release.
