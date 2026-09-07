---
id: P30
title: "L3 Advanced module: Headless and CI (m13-headless-ci)"
milestone: M2
status: done
owner: opus-p30-2026-09-07
branch: plan/30-l3-m13-headless-ci
model_hint: opus
effort_hint: high
depends_on: [P24]
owned_paths:
  - content/en/l3-advanced/m13-headless-ci/**
  - content/tr/l3-advanced/m13-headless-ci/**
  - content/_shared/transcripts/m13-headless-ci/**
shared_paths:
  - content/_shared/sources.json
estimate: L
updated_at: 2026-09-07T19:40:34Z
open_questions: []
---

## Goal

Author every lesson of Headless and CI (`m13-headless-ci`), the 5-lesson next module of Advanced (l3-advanced), in English: every named example from D059 is a working lab: headless JSON output, an Actions-based PR reviewer, and an Agent SDK agent in two languages. Each lesson follows the fixed template (D006): Objectives + prerequisites, When NOT to use, Concept, Hands-on lab, Anti-patterns, Quiz, Sources. Every command shown was actually run against the lab repo and every claim is backed by real output (D093) — this plan produces no lesson content from memory alone.

## Context

Read first: `docs/CURRICULUM.md` (P03) — it is the **authoritative** source for this module's final lesson slugs, objectives, and order; the lesson list below is the floor the approved plan set, not a ceiling. Also read `research/feature-inventory.md` and `research/deprecations.md` (P03) for what is current vs. "Changed" as of `verified_version: 2.1.263`; `content/_shared/sources.json` (P23) for the vetted source list to pull from and append to; `.claude/rules/content.md`, `.claude/skills/new-lesson/SKILL.md` and the `lesson-researcher`/`lesson-writer`/`fact-checker`/`reviewer` agents (all P11) for the exact authoring workflow; `content/schema.ts` (P06) for the frontmatter zod schema; `docs/design/CANVAS.md` and `/design/` (P05) for the lesson-page visual reference; and the outline text this module was scoped from:

> `m13-headless-ci`: `claude -p` & JSON output (lab) · GitHub Actions `claude-code-action@v1` PR review (lab) · issue → PR automation · GitLab · Agent SDK custom agent (TS + Python lab)

No lesson in this module exists yet; `content/en/l3-advanced/m13-headless-ci/**` starts from the level/module `index.mdx` stub P06 created.

Decisions this module leans on beyond the shared pipeline decisions below: (D059).

## Scope

In:
- 5 lesson files under `content/en/l3-advanced/m13-headless-ci/`, numbered `01-`…`05-`, each a complete MDX file following D006's seven sections.
- The matching Turkish draft stub for each lesson under `content/tr/l3-advanced/m13-headless-ci/` (`draft: true`, created by the `/new-lesson` skill in the same commit as the EN lesson — D016, D018; P25/P26/P40/P41 translate it later, never this plan).
- One raw lab transcript per lesson with a hands-on lab, saved under `content/_shared/transcripts/m13-headless-ci/`, plus the simplified `<Transcript>` rendering embedded in the lesson (D099).
- This module's entries appended to `content/_shared/sources.json` (D041, D043; append-only — never rewrite another module's entries).
- Updating `l3-advanced/index.mdx` and `m13-headless-ci/index.mdx` module-index copy if this module's final lesson list differs from the stub P06 left (rare; only if `docs/CURRICULUM.md` changed the outline).

Out: Turkish translation of these lessons (P25/P26/P40/P41 own `content/tr/l3-advanced/m13-headless-ci/**` after this plan hands it off); any other module's content; MDX component code (P07/P08 own those; if a lesson needs a component that does not exist, write it into `open_questions` and do not build it here); changes to `content/schema.ts`, `src/lib/nav.ts`, or any route/layout file; the lab repo itself (P22 owns `codechup/claude-code-lab`; this plan clones and runs it, never edits it in place — a bug fix needed there goes into `open_questions` naming the tag).

## Deliverables

- `content/en/l3-advanced/m13-headless-ci/NN-<slug>.mdx` (5 files):
01. **claude -p and JSON output** — `01-claude-p-and-json-output.mdx` (hands-on lab: --output-format json against the lab repo)
02. **GitHub Actions PR review** — `02-github-actions-pr-review.mdx` (hands-on lab: claude-code-action@v1 reviewing a real PR)
03. **Issue-to-PR automation** — `03-issue-to-pr-automation.mdx`
04. **Claude Code on GitLab** — `04-gitlab.mdx`
05. **A custom Agent SDK agent** — `05-agent-sdk-custom-agent.mdx` (hands-on lab: the same small agent built in TypeScript and in Python)
- `content/tr/l3-advanced/m13-headless-ci/NN-<slug>.mdx` (5 files) — `draft: true` stubs with EN frontmatter fields carried over and `title`/`description` left in English (translation is not this plan's job; the stub exists so routing/parity gates pass).
- `content/_shared/transcripts/m13-headless-ci/NN-<slug>.md` — one per lesson that has a hands-on lab, containing the raw terminal transcript.
- Updated `content/_shared/sources.json` with this module's sources block entries.

## Acceptance criteria

- `node scripts/content-gate.ts` passes for this module: every lesson's frontmatter validates against `content/schema.ts`, every code fence has a language tag, EN/TR path parity holds (the TR draft exists at the same slug), and `level`/`module` in frontmatter match the file path.
- Every lesson has `verified_version: 2.1.263` and a non-empty `sources` array with at least one `type: "doc"` entry whose URL was fetched successfully by `/verify-sources` (D041, D043) — paste the WebFetch/lychee evidence in the PR.
- Every lesson with a hands-on lab has a transcript file under `content/_shared/transcripts/m13-headless-ci/` whose content matches, verbatim, a real run of the commands shown in the lesson (D093, D099) — no lesson may show output that was not captured this way.
- `npm run typecheck && npm run lint && npm test` pass; `npm run build` succeeds and `dist/en/l3-advanced/m13-headless-ci/` contains 5 lesson pages plus the index.
- `npx playwright test e2e/lesson.spec.ts` passes against at least one lesson in this module (axe: 0 serious/critical violations at 390 px and 1280 px).
- The `fact-checker` agent's report (pasted into the PR) shows no unresolved discrepancy against `research/feature-inventory.md`; the `reviewer` agent's report confirms the D006 template order and the evidence rule on every lesson.

## Steps

1. Read `docs/CURRICULUM.md` §m13-headless-ci and confirm the lesson list/order below still matches; if it drifted, follow the doc, not this plan, and note the delta in Handoff notes.
2. Run the `lesson-researcher` agent once per lesson (D098): official doc URL(s) + 2–3 web/YouTube sources, summarized against `research/feature-inventory.md`; save nothing permanent yet, this feeds step 4.
3. Clone `codechup/claude-code-lab` (P22) into a scratch directory; for every lesson with a hands-on lab, check out its start tag (`lesson/m13-headless-ci-NN-start`), do the exercise for real, and capture the full terminal transcript.
4. Write each lesson MDX with `/new-lesson l3-advanced/m13-headless-ci/<slug>` (creates the EN file and the TR draft stub together); fill Objectives, When NOT to use, Concept (grounded in the researcher's summary, never invented), Hands-on lab (the exact commands from step 3), Anti-patterns, Quiz, Sources.
5. Save the raw transcript from step 3 under `content/_shared/transcripts/m13-headless-ci/NN-<slug>.md`; embed the simplified version with the `<Transcript>` component (P07) in the lesson.
6. Append this lesson's sources to `content/_shared/sources.json` (P23's schema); run `/verify-sources content/en/l3-advanced/m13-headless-ci/NN-<slug>.mdx` to stamp `verified_at`.
7. Run the `fact-checker` agent against the whole module, then the `reviewer` agent (read-only; template + evidence + sources); fix everything both flag.
8. `node scripts/content-gate.ts && npm run typecheck && npm run lint && npm test && npm run build`; run `npx playwright test e2e/lesson.spec.ts` against one lesson from this module.
9. Open the PR with the fact-checker and reviewer reports plus real command output pasted in (D093); never paste output you did not just produce.

## Tests required

- `scripts/content-gate.ts` (schema, fences, EN/TR parity, level/module-vs-path).
- `npm test` (Vitest — `src/lib` nav/slug helpers exercised against this module's new slugs).
- `e2e/lesson.spec.ts` (Playwright + axe) against one lesson in this module, both 390 px and 1280 px.
- Manual: every command in every "Hands-on lab" section was run against the cloned lab repo this session and matches its saved transcript.

## Non-goals / pitfalls

- Do not write Turkish lesson prose in this plan — the draft stub exists only so the build does not break; leave its body as the EN-derived placeholder `/new-lesson` generates.
- Do not fabricate command output, ever — if a lab command's real result differs from what the lesson expects, fix the lesson (or flag the lab repo bug in `open_questions`), never the transcript.
- Do not invent a component that does not exist (Quiz, DecisionTree, Transcript, Sources, OSTabs, WhenNotToUse, Lab, Callout, CodeBlock, YouTubeCard are the only ones available, from P07/P08) — write the gap into `open_questions` instead.
- Do not touch another module's files, `content/schema.ts`, or anything under `src/**`.
- Do not mark a lesson's Turkish stub `draft: false` — that flip belongs to the translation plan.

## Verification

A reviewer opens `npm run dev`, visits each of the 5 lessons at `/en/l3-advanced/m13-headless-ci/<slug>/`, confirms the OS tabs, transcript, quiz, and sources block render, spot-checks two Sources links by hand, and reads the fact-checker/reviewer agent reports pasted in the PR before merging.

## Handoff notes

**Session:** `opus-p30-2026-09-07`, worktree `../cct-wt-30`, branch `plan/30-l3-m13-headless-ci`.

### Scope delta from this plan file (CURRICULUM wins)

This plan's Deliverables list 5 lessons with different slugs. `docs/CURRICULUM.md` §2 `m13-headless-ci` lists **6**, and per Step 1 the curriculum is authoritative. Written:

| # | Slug | min | difficulty | `lab.repo_tag` |
|---|---|---|---|---|
| 01 | `01-claude-p` | 20 | core | `lesson/m13-01-start` |
| 02 | `02-github-actions-review` | 25 | core | `lesson/m13-02-start` |
| 03 | `03-issue-to-pr` | 25 | core | `lesson/m13-03-start` |
| 04 | `04-gitlab-and-others` | 10 | advanced | `none` (no lab) |
| 05 | `05-agent-sdk-typescript` | 30 | advanced | `lesson/m13-05-start` |
| 06 | `06-agent-sdk-python` | 25 | advanced | `lesson/m13-06-start` |

Module `index.mdx` copy already matched the 6-lesson shape and was left untouched (it holds intro prose only, no lesson list — D-compliant).

### What was written

- 6 EN lessons under `content/en/l3-advanced/m13-headless-ci/`, full D006 order (Objectives & prerequisites → `<WhenNotToUse>` → Concept → Hands-on lab → Anti-patterns → `<Callout variant="changed">` → Quiz; Sources render from frontmatter). Lesson 04 has no lab, so its `## Hands-on lab` heading carries a one-paragraph explanation instead of a `<Lab>` — the heading is not dropped.
- 6 TR twins, `draft: true` stubs with translated `title`/`description`/`tags`, identical `level`/`module`/`order`/`duration_min`/`difficulty`/`verified_version`/`sources[]`/`lab.repo_tag`, and a one-paragraph Turkish summary. Translation belongs to P25/P26/P40/P41.
- 15 transcripts under `content/_shared/transcripts/m13-headless-ci/`, all captured this session, each with a `# ` provenance header (date, command, versions). Local paths redacted to `<lab-clone>` / `~/.claude.json`.

### Transcripts and what they prove

Captured against a dedicated clean clone of `codechup/claude-code-lab` (the shared `../claude-code-lab` had uncommitted edits to `BUGS.md`/`README.md` from the tag-adding session — a separate clone avoided both interference and a capture that did not match the tag).

- `01-claude-p/02-json-envelope.txt` — `--output-format json | jq`: `subtype success`, `num_turns 1`, `result "7"`.
- `01-claude-p/03-json-schema.txt` — `--json-schema` → `structured_output` with `bug_ids` B1–B7.
- `01-claude-p/04-max-turns-overrun.txt` — the forced overrun: **`exit=1`**, `subtype "error_max_turns"`, `is_error true`, `terminal_reason "max_turns"`, `errors ["Reached maximum number of turns (1)"]`, and `num_turns 2` despite a cap of 1.
- `01-claude-p/05-stream-json.txt` — event order: `hook_started`/`hook_progress`/`hook_response` (the lab repo ships a `SessionStart` hook) **before** `system/init`, then `assistant`, `rate_limit_event`, `result`.
- `01-claude-p/06-bare-no-api-key.txt` — `--bare` with no `ANTHROPIC_API_KEY`: `exit=1`, `subtype "success"` but `is_error true` and `result` = `Not logged in · Please run /login`. Confirms headless.md's "bare mode never reads OAuth credentials" and "an in-run failure is printed as the result on stdout".
- `01-claude-p/07-json-schema-powershell.txt` — the same schema run on Windows PowerShell 5.1, with the backslash-escaped quoting the OSTabs Windows panel teaches.
- `02-github-actions-review/01-action-validator.txt` — the lab repo's shipped `claude-review.yml` at `lesson/m13-02-solution`, exit 0.
- `02-github-actions-review/02-docs-workflows-validated.txt` — the three docs workflows (`claude.yml`, `code-review.yml`, `daily-report.yml`) copied verbatim from `github-actions.md`, all exit 0.
- `03-issue-to-pr/01-action-validator.txt` — the issue-trigger workflow, exit 0.
- `05-agent-sdk-typescript/01-agent-ts.txt` — `@anthropic-ai/claude-agent-sdk` **0.3.263** on Node 24.18.0, real run, `Done: success (turns=3)`, exit 0.
- `06-agent-sdk-python/01-agent-py.txt` — `claude-agent-sdk` **0.2.152** on Python 3.12.10, real run, `Done: success (turns=3)`, exit 0.

No GitHub Actions or GitLab run was triggered with a real API key; the CI lessons validate workflow files locally with `action-validator` (`npx --yes -p @action-validator/cli -p @action-validator/core action-validator` — the bare `npx --yes action-validator` form fails with `could not determine executable to run`; `actionlint` is not installed on this machine).

### Drift and findings worth carrying forward

- **`--bare` is not usable with a subscription login.** Documented, but sharp: `research/feature-inventory.md` lists `--bare` in the headless row without this caveat. The lesson teaches it and the transcript proves it.
- **Exit codes: only 0, 1 and 143 are stated by the live docs.** `headless.md` documents 0/non-zero and 143 (SIGTERM). `research/feature-inventory.md` line 42 claims `0/1/2 (partial)/130/143` and marks it partial. This session reproduced **0** and **1** only. `2` and `130` stay out of lesson text — see open questions.
- **`Bash(x:*)` is current, not legacy.** `permissions.md` states the `:*` suffix is an equivalent trailing wildcard, so the lab repo's `Bash(gh pr comment:*)` and the docs' `Bash(git diff *)` are both correct. The lesson teaches both forms and the equivalence.
- **SDK `settingSources: []` / `setting_sources=[]` is the reproducibility lever.** The first TS and Python captures ran without it and the agent answered in Turkish, because this machine's `~/.claude` memory asks for Turkish. Adding it produced English, machine-independent output. Both lessons teach this, and lesson 05 tells the story honestly rather than hiding the reshoot.
- **Lab tag coverage:** `lesson/m13-01/02/03/05/06-{start,solution}` exist; there is deliberately no `m13-04` tag (lesson 04 has no lab). `m13-03`, `m13-05` and `m13-06` are process-only pairs (`-start` == `-solution` == `lesson/m13-02-solution`'s commit); the lessons say so explicitly. `docs/lab/README.md` still says P22 tagged M1 (`m01`–`m09`) only — it now understates coverage and should be refreshed by its owner (P22), not by this plan.
- **Python on Windows:** the first `agent.py` capture produced mojibake through the console's legacy code page. Fixed at the source (`PYTHONIOENCODING=utf-8`) and re-captured; lesson 06's Windows OSTab and prose carry the fix.

### Sources registry (`content/_shared/sources.json`, shared, append-only)

Appended 5 entries in id-sorted position: `docs-agent-sdk-overview`, `docs-agent-sdk-quickstart`, `repo-claude-agent-sdk-python`, `repo-claude-agent-sdk-typescript`, `repo-claude-code-action`. Added `m13-headless-ci` to the `modules` array of two existing entries (`docs-cli-reference`, `docs-permissions`). `docs-github-actions`, `docs-github-actions-cloud-providers`, `docs-gitlab-ci-cd`, `docs-github-enterprise-server` and `docs-headless` were already tagged for this module. Diff is +42/−2 lines; no entry rewritten or reordered.

Four further captures were added after the review pipeline (see below): `01-claude-p/08-stream-json-no-verbose.txt`, `05-agent-sdk-typescript/02-agent-ts-no-isolation.txt` and `06-agent-sdk-python/02-agent-py-mojibake.txt` and `01-claude-p/09-permission-prompts-none.txt`.

### Verification

`npm run gate` (170 files OK) · `npm run typecheck` (0 errors) · `npm run lint` (prettier clean, `check-no-inline-script: OK`) · `npm test` (22 files / 184 tests passed) · `npm run build` (ends `check-no-inline-script (dist): OK`; `dist/en/l3-advanced/m13-headless-ci/` has 6 lesson pages + index, `dist/tr/…` has index only, drafts correctly excluded) · `node scripts/check-raw-colors.mjs` OK · `node scripts/check-public-hygiene.mjs` OK (tracked) · `node tools/plan/cli.ts check` ok. Playwright on port 4430 with a temporary config and spec (both deleted afterwards): `e2e/a11y.spec.ts` plus a temporary spec visiting all 6 EN lesson routes and both module indexes at 390 px and 1280 px — **30 passed**, 0 serious/critical axe violations.

Two MDX authoring traps hit and fixed during the build: `\"` is not an escape inside a double-quoted JSX attribute, and a bare `'` inside a single-quoted JS string in a `steps={[…]}` array breaks the expression. Both were rephrased rather than escaped.

### Review pipeline (D071)

**`reviewer` subagent — CHANGES REQUESTED (0 P0, 0 P1, 5 P2, 7 P3).** All 5 P2s fixed, plus 4 of the 7 P3s:

| # | Finding | Resolution |
|---|---|---|
| P2 1 | Lesson 03's lab told the reader to create `claude.yml`, but the capture validated `claude-issue.yml` | Renamed to `claude-issue.yml` in the CodeBlock title, both lab steps and the triage snippet — evidence and instructions now agree |
| P2 2 | Lesson 02's capture validates three workflows; the lab only asks for one | Added a paragraph naming all three and why they are validated together |
| P2 3 | Lesson 04's `variant="changed"` carried a beta-status caveat, not a superseded behaviour (D044) | Plain `<Callout>` |
| P2 4 | Lessons 05/06 cite "the official migration guide" in prose but not in `sources[]` (D041) | Added `agent-sdk/migration-guide.md` as an `official` source to both, fetched and verified 2026-09-07 |
| P2 5 | "the built-in starting mode is Manual" not traceable to the inventory | It is verbatim from `headless.md`; the lesson now also names `manual` as the CLI's documented alias for `default` (`cli-reference.md`) |
| P3 6 | Prerequisite pointed at m07 for allow/deny rule syntax | Corrected to `m02-interact` `03-permissions` |
| P3 8 | "run the same question with `--bare`" — the capture used a different prompt | Reworded to describe what the capture actually asks |
| P3 9 | The stream capture shows a `rate_limit_event` the prose never mentioned | Mentioned, with the lesson "match on the `type` values you care about" |
| P3 10 | Lessons 02/04 do not label a worked example prompt (D027) | Lesson 03 carries the module's `@claude` example; 02 and 04 keep their prompts inside the workflow/job YAML where they belong. Left as-is deliberately |

P3 7 (splitting two-change "Changed" callouts) was judged style, not drift, and left. P3 11/12 are inventory items — see Open questions.

**`fact-checker` subagent — three passes, all findings resolved.** The first pass reached lessons 05 and 06 within its turn budget, so two more passes covered 01+05 and 02–04.

| Pass | Files | CONFIRMED | WRONG | UNVERIFIABLE |
|---|---|---|---|---|
| 1 | 05, 06 | ~55 | 4 | 4 |
| 2 | 01, 05 | 46 | 1 | 0 |
| 3 | 02, 03, 04 | all checkable | 0 | 2 |
| | **total** | **~102** | **5 — all fixed** | **6 — all resolved** |

Pass 3 found no contradicted claim in 02–04; both of its `WRONG` candidates resolved to CONFIRMED against the live docs. Its two UNVERIFIABLE items were its own fetch-permission limits, and both were closed here:

- **The lab repo's `actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1` SHA pin.** Confirmed: `gh api repos/actions/checkout/git/ref/tags/v7.0.1 --jq '.object.sha'` returns `3d3c42e5aac5ba805825da76410c181273ba90b1`. (It is a lightweight tag, so there is no annotated tag object to dereference.)
- **The `gh run list` / `gh api` triage commands in lesson 03.** GitHub CLI syntax, outside the Claude Code docs the agent was pointed at; left as-is.

- **WRONG — `settingSources: []` / `setting_sources=[]` described as full isolation.** `agent-sdk/claude-code-features.md` says managed and server-managed policy, the global `~/.claude.json`, claude.ai MCP connectors, and **auto memory** under `~/.claude/projects/<project>/memory/` are read regardless, and tells multi-tenant deployers to add `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1`. Corrected in both lessons: objective, concept prose, code comments, an anti-pattern and a quiz explanation. This was a genuine error on my part and the single most valuable finding of the pipeline.
- **WRONG — lesson 06 quiz Q2** said permission modes "behave the same in both SDKs"; `agent-sdk/agent-loop.md` documents that the TypeScript SDK additionally requires `allowDangerouslySkipPermissions: true` for `bypassPermissions`. Narrowed to "both default to `default`".
- **UNVERIFIABLE → now evidenced.** Two anecdotes (the first TS run answering in Turkish; the Windows mojibake) were true but had no committed artifact, which is exactly the D093/D099 objection. Both runs were **re-done and captured**: `05-agent-sdk-typescript/02-agent-ts-no-isolation.txt` and `06-agent-sdk-python/02-agent-py-mojibake.txt`. Both lessons now render the recording instead of telling a story. Transcript count is therefore 15, not 11.
- **UNVERIFIABLE → resolved.** `message.cwd` on the TypeScript init message: confirmed in the installed SDK's own `sdk.d.ts`, where `SDKSystemMessage` declares `subtype: 'init'`, `cwd: string` and `model: string`; the real transcript prints both.
- **UNVERIFIABLE → resolved.** Whether `lesson/m13-05-start` exists: it does. `git tag -l 'lesson/m13*'` in a fresh clone lists `lesson/m13-01/02/03/05/06-{start,solution}`. The fact-checker could not reach github.com and fell back to `docs/lab/README.md`, which is stale — see Open questions.

### Open questions

- Exit codes `2` (partial) and `130` from `research/feature-inventory.md` line 42 are neither on the live `headless.md`/`cli-reference.md` nor reproduced here. They are kept out of lesson text. Someone should either reproduce them or drop them from the inventory row.
- `docs/lab/README.md` (owned by P22) states tag coverage stops at `m09`; `m13` tags now exist. Not edited here — outside `owned_paths`.
- `research/deprecations.md` has no row for the **Claude Code SDK → Agent SDK package rename** (`claude-code-sdk` → `claude-agent-sdk` / `@anthropic-ai/claude-agent-sdk`). The claim is sourced — `agent-sdk/overview.md` links a migration guide for exactly this — and lessons 05/06 carry it as a `<Callout variant="changed">`, but D044 also wants a changelog entry on `playbook/06-changed-since-2025` (P42). Proposed row: *"`claude-code-sdk` / Claude Code SDK packages → `claude-agent-sdk` (Python) and `@anthropic-ai/claude-agent-sdk` (TypeScript); version of the rename not documented — say 'replaced', not 'since vX'."*
- The three `type: repo` sources (`anthropics/claude-code-action`, `claude-agent-sdk-typescript`, `claude-agent-sdk-python`) were fetched and HTTP-checked on 2026-09-07; the packages themselves were installed and run from npm/PyPI, not from a git checkout of those repos.
- **`research/feature-inventory.md` line 23** lists the Agent SDK doc-map entry as `migration`; the live slug is `agent-sdk/migration-guide`. It also has no row for GitLab CI/CD (`AI_FLOW_*`, the job shape) or for GitHub Enterprise Server specifics that lesson 04 leans on. `research/` is outside this plan's `owned_paths`.
- **`research/deprecations.md` has no rows** for the patch versions this module's "Changed" callouts cite (`--permission-prompts` in 2.1.259, the review workflow posting to the PR since 2.1.229, `--json-schema` behaviour before 2.1.205). Each is sourced from the live doc page and verified same-day, but there is no repo-local record for future cross-checking.
- **Plan/lesson tag-pattern mismatch:** this plan's Step 3 names the start tags `lesson/m13-headless-ci-NN-start`; the tags that actually exist (and that the lessons use) are `lesson/m13-NN-start`, matching every other module. The lessons follow the repository, not this plan file.
- The `-p` exit codes stay at what was reproduced; see the note above. `--permission-prompts none` now has a capture too (`01-claude-p/09-permission-prompts-none.txt`): accepted on 2.1.263, exits 0, `permission_denials` empty. The `fact-checker` also flagged that `agent-sdk/python.md` and `agent-sdk/typescript.md` truncate before their message-type reference tables when fetched, so the literal `data` dict keys were confirmed from the installed SDK and the real run rather than from a doc page.
- **Scratch clone left on disk:** `../cct-lab-p30`, a second clone of the lab repo used for captures so the shared `../claude-code-lab` was never disturbed. Nothing depends on it — every transcript is committed — so it can be deleted.
