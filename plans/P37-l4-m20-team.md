---
id: P37
title: "L4 Master module: Team (m20-team)"
milestone: M2
status: done
owner: lead-fable
branch: plan/37-l4-m20-team
model_hint: opus
effort_hint: high
depends_on: [P24]
owned_paths:
  - content/en/l4-master/m20-team/**
  - content/tr/l4-master/m20-team/**
  - content/_shared/transcripts/m20-team/**
shared_paths:
  - content/_shared/sources.json
estimate: L
updated_at: 2026-09-08T00:13:06Z
open_questions:
  - "No lab-repo tags exist for m20-team (P22 owns codechup/claude-code-lab). All six labs run in throwaway scratch projects with repo_tag 'none'. If P22 later adds m20 tags, lessons 01, 03, 05 and 06 are the ones whose labs could be re-pointed at a seeded repo."
  - "Managed settings (lesson 02) are OS-level and were deliberately NOT installed on this machine, so no transcript of an enforced policy exists anywhere on this site. Verifying the /status 'Setting sources' labels and the 'Skipped sources' line against a real deployment needs an owner with an administered fleet or a Team/Enterprise org."
  - "The managed Code Review service (lesson 04) is a Team/Enterprise research preview; the check-run severity-count gate is documented but was not executed here. Same for server-managed settings (lesson 02), the analytics dashboards and org spend limits (lesson 05) — all described from the live docs, none exercised."
  - "research/feature-inventory.md and research/deprecations.md need three corrections found this session (list-key merging, the security-key exceptions table, and the v2.1.257 change to defaultMode auto/bypassPermissions). Both files are outside this plan's owned_paths."
  - "Lesson 06 (communications and champions) is the only lesson in this module with little official doc backing for its central topic: the docs cover the administrator decision list, verification and onboarding resources, but prescribe no champion structure. The lesson says so explicitly rather than inventing guidance. If the owner wants a specific rollout playbook taught, that is an owner decision this plan did not make."
---

## Goal

Author every lesson of Team (`m20-team`), the 4-lesson next module of Master (l4-master), in English: the reader leaves able to roll Claude Code out to a team with shared, managed settings and a cost budget they can actually track. Each lesson follows the fixed template (D006): Objectives + prerequisites, When NOT to use, Concept, Hands-on lab, Anti-patterns, Quiz, Sources. Every command shown was actually run against the lab repo and every claim is backed by real output (D093) — this plan produces no lesson content from memory alone.

## Context

Read first: `docs/CURRICULUM.md` (P03) — it is the **authoritative** source for this module's final lesson slugs, objectives, and order; the lesson list below is the floor the approved plan set, not a ceiling. Also read `research/feature-inventory.md` and `research/deprecations.md` (P03) for what is current vs. "Changed" as of `verified_version: 2.1.263`; `content/_shared/sources.json` (P23) for the vetted source list to pull from and append to; `.claude/rules/content.md`, `.claude/skills/new-lesson/SKILL.md` and the `lesson-researcher`/`lesson-writer`/`fact-checker`/`reviewer` agents (all P11) for the exact authoring workflow; `content/schema.ts` (P06) for the frontmatter zod schema; `docs/design/CANVAS.md` and `/design/` (P05) for the lesson-page visual reference; and the outline text this module was scoped from:

> `m20-team`: shared settings & allowlists · managed/server-managed settings · review-process integration · cost budgeting & analytics

No lesson in this module exists yet; `content/en/l4-master/m20-team/**` starts from the level/module `index.mdx` stub P06 created.

Decisions this module leans on beyond the shared pipeline decisions below: (D079).

## Scope

In:
- 4 lesson files under `content/en/l4-master/m20-team/`, numbered `01-`…`04-`, each a complete MDX file following D006's seven sections.
- The matching Turkish draft stub for each lesson under `content/tr/l4-master/m20-team/` (`draft: true`, created by the `/new-lesson` skill in the same commit as the EN lesson — D016, D018; P25/P26/P40/P41 translate it later, never this plan).
- One raw lab transcript per lesson with a hands-on lab, saved under `content/_shared/transcripts/m20-team/`, plus the simplified `<Transcript>` rendering embedded in the lesson (D099).
- This module's entries appended to `content/_shared/sources.json` (D041, D043; append-only — never rewrite another module's entries).
- Updating `l4-master/index.mdx` and `m20-team/index.mdx` module-index copy if this module's final lesson list differs from the stub P06 left (rare; only if `docs/CURRICULUM.md` changed the outline).

Out: Turkish translation of these lessons (P25/P26/P40/P41 own `content/tr/l4-master/m20-team/**` after this plan hands it off); any other module's content; MDX component code (P07/P08 own those; if a lesson needs a component that does not exist, write it into `open_questions` and do not build it here); changes to `content/schema.ts`, `src/lib/nav.ts`, or any route/layout file; the lab repo itself (P22 owns `codechup/claude-code-lab`; this plan clones and runs it, never edits it in place — a bug fix needed there goes into `open_questions` naming the tag).

## Deliverables

- `content/en/l4-master/m20-team/NN-<slug>.mdx` (4 files):
01. **Shared settings and allowlists** — `01-shared-settings-and-allowlists.mdx`
02. **Managed and server-managed settings** — `02-managed-and-server-managed-settings.mdx`
03. **Review-process integration** — `03-review-process-integration.mdx`
04. **Cost budgeting and analytics** — `04-cost-budgeting-and-analytics.mdx`
- `content/tr/l4-master/m20-team/NN-<slug>.mdx` (4 files) — `draft: true` stubs with EN frontmatter fields carried over and `title`/`description` left in English (translation is not this plan's job; the stub exists so routing/parity gates pass).
- `content/_shared/transcripts/m20-team/NN-<slug>.md` — one per lesson that has a hands-on lab, containing the raw terminal transcript.
- Updated `content/_shared/sources.json` with this module's sources block entries.

## Acceptance criteria

- `node scripts/content-gate.ts` passes for this module: every lesson's frontmatter validates against `content/schema.ts`, every code fence has a language tag, EN/TR path parity holds (the TR draft exists at the same slug), and `level`/`module` in frontmatter match the file path.
- Every lesson has `verified_version: 2.1.263` and a non-empty `sources` array with at least one `type: "doc"` entry whose URL was fetched successfully by `/verify-sources` (D041, D043) — paste the WebFetch/lychee evidence in the PR.
- Every lesson with a hands-on lab has a transcript file under `content/_shared/transcripts/m20-team/` whose content matches, verbatim, a real run of the commands shown in the lesson (D093, D099) — no lesson may show output that was not captured this way.
- `npm run typecheck && npm run lint && npm test` pass; `npm run build` succeeds and `dist/en/l4-master/m20-team/` contains 4 lesson pages plus the index.
- `npx playwright test e2e/lesson.spec.ts` passes against at least one lesson in this module (axe: 0 serious/critical violations at 390 px and 1280 px).
- The `fact-checker` agent's report (pasted into the PR) shows no unresolved discrepancy against `research/feature-inventory.md`; the `reviewer` agent's report confirms the D006 template order and the evidence rule on every lesson.

## Steps

1. Read `docs/CURRICULUM.md` §m20-team and confirm the lesson list/order below still matches; if it drifted, follow the doc, not this plan, and note the delta in Handoff notes.
2. Run the `lesson-researcher` agent once per lesson (D098): official doc URL(s) + 2–3 web/YouTube sources, summarized against `research/feature-inventory.md`; save nothing permanent yet, this feeds step 4.
3. Clone `codechup/claude-code-lab` (P22) into a scratch directory; for every lesson with a hands-on lab, check out its start tag (`lesson/m20-team-NN-start`), do the exercise for real, and capture the full terminal transcript.
4. Write each lesson MDX with `/new-lesson l4-master/m20-team/<slug>` (creates the EN file and the TR draft stub together); fill Objectives, When NOT to use, Concept (grounded in the researcher's summary, never invented), Hands-on lab (the exact commands from step 3), Anti-patterns, Quiz, Sources.
5. Save the raw transcript from step 3 under `content/_shared/transcripts/m20-team/NN-<slug>.md`; embed the simplified version with the `<Transcript>` component (P07) in the lesson.
6. Append this lesson's sources to `content/_shared/sources.json` (P23's schema); run `/verify-sources content/en/l4-master/m20-team/NN-<slug>.mdx` to stamp `verified_at`.
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

A reviewer opens `npm run dev`, visits each of the 4 lessons at `/en/l4-master/m20-team/<slug>/`, confirms the OS tabs, transcript, quiz, and sources block render, spot-checks two Sources links by hand, and reads the fact-checker/reviewer agent reports pasted in the PR before merging.

## Handoff notes

**What was written.** Six EN lessons (not four — see plan-file drift below), six TR `draft: true`
stubs with translated `title`/`description` and a one-paragraph Turkish summary each, and thirteen
raw transcripts across six folders under `content/_shared/transcripts/m20-team/`. The EN and TR
module `index.mdx` files were left untouched: they hold intro copy only and the module page renders
its own lesson list.

**Plan-file drift (this file was stale; `docs/CURRICULUM.md` §2 won, per step 1).**

| This plan said | CURRICULUM §2 (followed) |
| --- | --- |
| 4 lessons | 6 lessons |
| `01-shared-settings-and-allowlists` | `01-shared-settings` |
| `02-managed-and-server-managed-settings` | `02-managed-settings` |
| — (no marketplace lesson) | `03-team-marketplace` (15 min, core) |
| `03-review-process-integration` | `04-review-process` |
| `04-cost-budgeting-and-analytics` | `05-cost-budgeting` |
| — | `06-communications-and-champions` (10 min, advanced) |
| transcripts at `transcripts/m20-team/NN-<slug>.md` | `.claude/rules/content.md` §5 and the reference lesson use a folder per lesson with numbered `.txt` captures — followed that |
| lab tags `lesson/m20-team-NN-start` | **no m20 tags exist in the lab repo**; every lesson uses `repo_tag: 'none'` and a scratch folder, as the session brief directed |

**Labs and transcripts (D093, D099).** No lab-repo tag exists for this module, so all six labs run
in throwaway scratch projects. Every capture is real, taken on this machine on 2026-09-07 against
Claude Code 2.1.263:

- **01** — four headless runs proving the deny/ask/allow ordering and workspace trust: a committed
  `allow` rule skipped in `-p` with the real stderr warning, the same rule applied from
  `.claude/settings.local.json`, a project `deny` beating that personal `allow`, and a
  `Read(./secrets/**)` denial captured through `--output-format stream-json` as a `tool_result`
  with `is_error=true`.
- **02** — deliberately **no enforced-policy transcript**. Managed settings are an OS-level
  deployment and the brief forbade installing one here; the lesson says so in a callout and the two
  captures are `claude doctor`'s `Managed settings (remote)` line on an unmanaged machine and a
  PowerShell check showing the documented Windows policy paths and both registry keys are absent.
- **03** — a real marketplace built, `claude plugin validate .`, `marketplace add --scope project`,
  `plugin install`, `plugin list`, then `marketplace remove`, with the `extraKnownMarketplaces` and
  `enabledPlugins` keys the commands wrote and then emptied.
- **04** — a real `claude -p '/code-review medium'` run against a planted two-bug diff; the review
  found both defects with worked failing inputs. The GitHub Actions workflow is shown as a file to
  copy, not as a transcript: an Actions run cannot be captured from a laptop.
- **05** — `CLAUDE_CODE_ENABLE_TELEMETRY=1` with the `console` metrics exporter, producing real
  `claude_code.cost.usage` and `claude_code.token.usage` data points, plus the `modelUsage` block
  from a JSON envelope. Identity attributes (`user.email`, `user.id`, `session.id`,
  `organization.id`, `user.account_uuid`, `user.account_id`) are redacted to `<redacted>` per
  `.claude/rules/content.md` §5; nothing else was altered.
- **06** — a three-file starter kit whose project skill and `CLAUDE.md` both reach a headless
  session.

Three transcripts answer in Turkish because this machine's user-scope preferences ask for Turkish.
That is genuine captured output, not an error, and each lesson says so in prose rather than editing
the recording (D070).

**This repository as the worked example (D051).** Lesson 02 cites this repo's committed
`.claude/settings.json` as the small-scale shape of a team policy, and lesson 04 quotes its two
`PreToolUse` guard hooks and describes the deterministic CI steps in `.github/workflows/ci.yml` as
the gate that should not be an LLM. No private infrastructure is named anywhere (D026).

**Sources registry.** Nine existing entries were tagged with `m20-team`
(`settings`, `settings-reference`, `permissions`, `managed-settings`, `server-managed-settings`,
`plugin-marketplaces`, `plugins`, `discover-plugins`, `github-actions`, `code-review`, `costs`,
`commands`) and four new official entries appended: `docs-admin-setup`, `docs-analytics`,
`docs-monitoring-usage`, `docs-settings-example`. The file stays sorted by `id` and no existing
entry was removed or reordered. All 17 URLs cited by the six lessons were re-fetched this session
and returned HTTP 200.

**Doc-vs-inventory drift found while writing (docs win, per the brief).**

1. `research/feature-inventory.md`'s settings-precedence row is correct as far as it goes, but the
   live `settings.md` adds two behaviours worth recording: **list keys merge across scopes** rather
   than overriding (with `fallbackModel`, `modelPicker`, `availableModels` and `modelSettings` as
   the four documented exceptions), and there is a table of **security-sensitive keys where a
   stricter lower-scope value beats managed settings** (`disableClaudeAiConnectors`,
   `enableArtifact`, `isolatePeerMachines`, `remoteControlAtStartup`, `crossSessionInbound`,
   `useAutoModeDuringPlan`, `syncClaudeAiSkills`). Neither is in the inventory. **Whoever owns
   `research/feature-inventory.md` should add both** — outside this plan's `owned_paths`.
2. `research/deprecations.md` says `defaultMode: bypassPermissions` in a project file is "silently
   ignored; only user or managed scope". The live `settings.md` is more precise: **both `auto` and
   `bypassPermissions`** are ignored from project or local settings, and this changed in **v2.1.257**
   — before that, `bypassPermissions` took effect from any file. Lesson 01's Changed callout is
   written from the live page.
3. The live `costs.md` confirms `/cost` is now an **alias of `/usage`**, with `/stats` as a third
   alias; the inventory lists them as separate commands in its slash-command line.

**Verification counts.** The reviewer ran once; the fact-checker was run **twice** (the first
background launch inherited the wrong cwd and produced nothing, so it was relaunched, and a
fallback second pass completed later). Both fact-check passes are kept because the second found
real defects the first missed.

- **reviewer: 0 blockers, 1 major, 1 minor — both resolved.**
- **fact-check pass 1: 82 CONFIRMED, 4 reported WRONG, 1 UNVERIFIABLE.**
- **fact-check pass 2 (independent): 119 CONFIRMED, 12 reported WRONG, 2 UNVERIFIABLE** — it
  re-found pass 1's three real managed-only errors and added four more, of which three were real.

**Net across both passes: 7 real defects fixed, 5 findings rejected with evidence.**

Fixed:

1-3. **Lesson 02's managed-only key list** wrongly included five keys the settings reference gives
   as `Any file` scope (`allowedMcpServers`, `deniedMcpServers`, `allowedHttpHookUrls`,
   `forceLoginMethod`, and `forceLoginOrgUUID` as an enforcement nuance). Rewrote the section: it
   now lists only genuinely managed-only keys, gains `blockedMarketplaces` and the two sandbox
   locks that were missing, and states the distinction the error came from — **the lock is
   managed-only, the list it locks is not**.
4. **Lesson 02 outcome ordinal.** The `claude doctor` transcript shows `not fetched — requires an
   Enterprise or Team subscription`, which is the **fourth** documented outcome (a skipped fetch
   with its reason), not the second (organisation has none configured). Corrected.
5-6. **Lesson 03 overclaimed that declaring a marketplace installs its plugins.** Per
   `discover-plugins.md`, since Claude Code **2.1.195** adding a marketplace does **not** install a
   plugin from an external source (GitHub repo, npm package) on any path that loads plugins — each
   member must still run `claude plugin install`, and until then Claude Code reports it as not
   installed. Since the lesson's example uses a `github` source, four passages were wrong: the
   objective, the section heading, the main prose and the anti-pattern fix. All four now state the
   limit and give the two real ways to close it (`./` paths inside the marketplace repo, or
   `CLAUDE_CODE_PLUGIN_SEED_DIR`).
7. **Lesson 01's lab step said "move" when the recording proves "copy".** Transcript 02's stderr
   still names `.claude/settings.json`, which can only happen if the team file kept its copy of the
   rule. Per the brief, the step was fixed rather than the recording: the lab now says to *add* the
   rule to the local file leaving the team file intact, the prose explains why the warning persists
   (and turns it into the teaching point), and only the transcript's own provenance header — not a
   byte of captured output — was corrected.

The UNVERIFIABLE item from pass 1 — "aimed at developers scaling to longer sessions" describing the
Academy course in lesson 06 — traces to `docs/CURRICULUM.md` §6 but no official page, so it was cut
rather than defended.

Rejected, with evidence, rather than "fixed" by editing correct text (D093):

- **`/stats` is not a documented `/usage` alias** (raised by *both* passes, twice each). The live
  `commands.md` documents it twice: the `/usage` row ends "`/cost` and `/stats` are aliases", and a
  separate `/stats` row reads "Alias for `/usage`. Opens on the Stats tab". No change made.
- **The Read-denial string in transcript 04 is undocumented.** Pass 2 matched it against
  `errors.md`'s *Edit/Write* error (`File is covered by a Read deny rule…`). That entry is
  explicitly about the Edit and Write tools. The transcript records a **Read** refusal, and the
  exact string `File is in a directory that is denied by your permission settings.` was reproduced
  from a fresh scratch project this session before rejecting the finding.
- **"Claude Code has no default protocol" is unverifiable.** It is verbatim in
  `monitoring-usage.md`'s `OTEL_EXPORTER_OTLP_PROTOCOL` row.
- **The 2.1.251 / 2.1.260 cache-line version split.** Pass 2 was right that the *likely-cause* text
  needs 2.1.260 while the line itself needs 2.1.251 — but the lesson never attributes the
  likely-cause text to 2.1.251; it mentions the two facts in different sections. No claim to fix.
- **Lesson 06's Academy-URL Changed callout.** Pass 2 called it contradicted because the live
  `admin-setup.md` still links `anthropic.skilljar.com`. That is the point of the callout, and
  `research/deprecations.md` records the move; the stale cross-link on one doc page is noted below
  rather than treated as a lesson error.

The PR body carries both reports and the real command output for typecheck, lint, gate, test,
build, raw-colour, hygiene, plan check and the Playwright run (temporary
`playwright.p37.config.ts` on port 4437 plus a temporary module spec, both deleted afterwards;
28 checks passed at 390 px and 1280 px, re-run after the fact-check fixes).

**One more inventory note from the fact-checker.** The live `admin-setup.md` still links the Academy
courses at `anthropic.skilljar.com`, not `academy.claude.com`. `research/feature-inventory.md`
already hedges that the old URL points at the same course, so lesson 06's Changed callout is
correct today — but whoever refreshes the inventory should watch that link.

**Follow-ups for other plans.**

- The Playwright module spec covers the **EN routes only**. The TR twins are `draft: true`, so they
  are not routed yet; the translation plan that flips them should add the TR routes to its own axe
  run.
- Lesson 06 deliberately makes no claim about champion programmes beyond what the docs support —
  see `open_questions`.
- Scratch projects were created outside the repo at `C:\…\cct-scratch-37` and removed at the end of
  the session; nothing outside `owned_paths`/`shared_paths` was modified.

