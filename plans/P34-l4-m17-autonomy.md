---
id: P34
title: "L4 Master module: Autonomy (m17-autonomy)"
milestone: M2
status: review
owner: lead-fable
branch: plan/34-l4-m17-autonomy
model_hint: opus
effort_hint: high
depends_on: [P24]
owned_paths:
  - content/en/l4-master/m17-autonomy/**
  - content/tr/l4-master/m17-autonomy/**
  - content/_shared/transcripts/m17-autonomy/**
shared_paths:
  - content/_shared/sources.json
estimate: L
updated_at: 2026-09-07T23:36:13Z
open_questions:
  - 'research/feature-inventory.md has no rows for /loop, /goal, Monitor, ScheduleWakeup, channels or desktop scheduled tasks — only the doc-slug map (lines 11, 15) names them, and the Routines row (line 45) is a one-line summary that misses the /schedule "Unknown command" nuance the fact-checker caught. This module was therefore written entirely from live doc fetches (2026-09-07), which content.md §6 allows, but it makes this plan''s "no discrepancy against the inventory" acceptance criterion unfalsifiable. P03 owns research/ — backfill rows for these six areas.'
  - 'Three labs in this module cannot be captured end to end and say so inline: routine creation (02) is a claude.ai/Desktop web form, the desktop scheduled task (04) is entirely the Desktop app UI, and installing/pairing a channel (05) needs Bun plus a third-party bot token. Those halves are taught as step lists from the official docs with no transcript, per the brief. A future plan with access to the Desktop app could capture 04 for real.'
  - 'The Git Bash / MSYS_NO_PATHCONV=1 behaviour in 03-goal.mdx is observed in this session''s own transcript, not documented in goal.md or headless.md. It is presented as a shell quirk, explicitly not as Claude Code behaviour. Worth re-checking if a Windows-shells page ever lands in the docs.'
  - 'e2e/lesson.spec.ts (P04/P12) is still hardcoded to the M0 lesson, so this plan verified accessibility with a temporary playwright.p34.config.ts (port 4434) and e2e/p34-m17.spec.ts, both deleted afterwards — the same workaround P19 recorded. Generalising that spec would remove the need.'
---

## Goal

Author every lesson of Autonomy (`m17-autonomy`), the 5-lesson next module of Master (l4-master), in English: the reader sets up one real recurring or triggered automation end to end and understands the guardrails autonomous runs need. Each lesson follows the fixed template (D006): Objectives + prerequisites, When NOT to use, Concept, Hands-on lab, Anti-patterns, Quiz, Sources. Every command shown was actually run against the lab repo and every claim is backed by real output (D093) — this plan produces no lesson content from memory alone.

## Context

Read first: `docs/CURRICULUM.md` (P03) — it is the **authoritative** source for this module's final lesson slugs, objectives, and order; the lesson list below is the floor the approved plan set, not a ceiling. Also read `research/feature-inventory.md` and `research/deprecations.md` (P03) for what is current vs. "Changed" as of `verified_version: 2.1.263`; `content/_shared/sources.json` (P23) for the vetted source list to pull from and append to; `.claude/rules/content.md`, `.claude/skills/new-lesson/SKILL.md` and the `lesson-researcher`/`lesson-writer`/`fact-checker`/`reviewer` agents (all P11) for the exact authoring workflow; `content/schema.ts` (P06) for the frontmatter zod schema; `docs/design/CANVAS.md` and `/design/` (P05) for the lesson-page visual reference; and the outline text this module was scoped from:

> `m17-autonomy`: `/loop` · routines (cron / API / GitHub triggers) · `/goal` · desktop scheduled tasks · monitors

No lesson in this module exists yet; `content/en/l4-master/m17-autonomy/**` starts from the level/module `index.mdx` stub P06 created.

Decisions this module leans on beyond the shared pipeline decisions below: .

## Scope

In:
- 5 lesson files under `content/en/l4-master/m17-autonomy/`, numbered `01-`…`05-`, each a complete MDX file following D006's seven sections.
- The matching Turkish draft stub for each lesson under `content/tr/l4-master/m17-autonomy/` (`draft: true`, created by the `/new-lesson` skill in the same commit as the EN lesson — D016, D018; P25/P26/P40/P41 translate it later, never this plan).
- One raw lab transcript per lesson with a hands-on lab, saved under `content/_shared/transcripts/m17-autonomy/`, plus the simplified `<Transcript>` rendering embedded in the lesson (D099).
- This module's entries appended to `content/_shared/sources.json` (D041, D043; append-only — never rewrite another module's entries).
- Updating `l4-master/index.mdx` and `m17-autonomy/index.mdx` module-index copy if this module's final lesson list differs from the stub P06 left (rare; only if `docs/CURRICULUM.md` changed the outline).

Out: Turkish translation of these lessons (P25/P26/P40/P41 own `content/tr/l4-master/m17-autonomy/**` after this plan hands it off); any other module's content; MDX component code (P07/P08 own those; if a lesson needs a component that does not exist, write it into `open_questions` and do not build it here); changes to `content/schema.ts`, `src/lib/nav.ts`, or any route/layout file; the lab repo itself (P22 owns `codechup/claude-code-lab`; this plan clones and runs it, never edits it in place — a bug fix needed there goes into `open_questions` naming the tag).

## Deliverables

- `content/en/l4-master/m17-autonomy/NN-<slug>.mdx` (5 files):
01. **/loop** — `01-loop-command.mdx`
02. **Routines: cron, API, and GitHub triggers** — `02-routines-cron-api-github-triggers.mdx`
03. **/goal** — `03-goal-command.mdx`
04. **Desktop scheduled tasks** — `04-desktop-scheduled-tasks.mdx`
05. **Monitors** — `05-monitors.mdx`
- `content/tr/l4-master/m17-autonomy/NN-<slug>.mdx` (5 files) — `draft: true` stubs with EN frontmatter fields carried over and `title`/`description` left in English (translation is not this plan's job; the stub exists so routing/parity gates pass).
- `content/_shared/transcripts/m17-autonomy/NN-<slug>.md` — one per lesson that has a hands-on lab, containing the raw terminal transcript.
- Updated `content/_shared/sources.json` with this module's sources block entries.

## Acceptance criteria

- `node scripts/content-gate.ts` passes for this module: every lesson's frontmatter validates against `content/schema.ts`, every code fence has a language tag, EN/TR path parity holds (the TR draft exists at the same slug), and `level`/`module` in frontmatter match the file path.
- Every lesson has `verified_version: 2.1.263` and a non-empty `sources` array with at least one `type: "doc"` entry whose URL was fetched successfully by `/verify-sources` (D041, D043) — paste the WebFetch/lychee evidence in the PR.
- Every lesson with a hands-on lab has a transcript file under `content/_shared/transcripts/m17-autonomy/` whose content matches, verbatim, a real run of the commands shown in the lesson (D093, D099) — no lesson may show output that was not captured this way.
- `npm run typecheck && npm run lint && npm test` pass; `npm run build` succeeds and `dist/en/l4-master/m17-autonomy/` contains 5 lesson pages plus the index.
- `npx playwright test e2e/lesson.spec.ts` passes against at least one lesson in this module (axe: 0 serious/critical violations at 390 px and 1280 px).
- The `fact-checker` agent's report (pasted into the PR) shows no unresolved discrepancy against `research/feature-inventory.md`; the `reviewer` agent's report confirms the D006 template order and the evidence rule on every lesson.

## Steps

1. Read `docs/CURRICULUM.md` §m17-autonomy and confirm the lesson list/order below still matches; if it drifted, follow the doc, not this plan, and note the delta in Handoff notes.
2. Run the `lesson-researcher` agent once per lesson (D098): official doc URL(s) + 2–3 web/YouTube sources, summarized against `research/feature-inventory.md`; save nothing permanent yet, this feeds step 4.
3. Clone `codechup/claude-code-lab` (P22) into a scratch directory; for every lesson with a hands-on lab, check out its start tag (`lesson/m17-autonomy-NN-start`), do the exercise for real, and capture the full terminal transcript.
4. Write each lesson MDX with `/new-lesson l4-master/m17-autonomy/<slug>` (creates the EN file and the TR draft stub together); fill Objectives, When NOT to use, Concept (grounded in the researcher's summary, never invented), Hands-on lab (the exact commands from step 3), Anti-patterns, Quiz, Sources.
5. Save the raw transcript from step 3 under `content/_shared/transcripts/m17-autonomy/NN-<slug>.md`; embed the simplified version with the `<Transcript>` component (P07) in the lesson.
6. Append this lesson's sources to `content/_shared/sources.json` (P23's schema); run `/verify-sources content/en/l4-master/m17-autonomy/NN-<slug>.mdx` to stamp `verified_at`.
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

A reviewer opens `npm run dev`, visits each of the 5 lessons at `/en/l4-master/m17-autonomy/<slug>/`, confirms the OS tabs, transcript, quiz, and sources block render, spot-checks two Sources links by hand, and reads the fact-checker/reviewer agent reports pasted in the PR before merging.

## Handoff notes

Executed by session `opus-p34-2026-09-07` in worktree `../cct-wt-34`.

**Written.** Five EN lessons under `content/en/l4-master/m17-autonomy/` plus five `draft: true` TR stubs at mirrored slugs, and nine transcripts under `content/_shared/transcripts/m17-autonomy/`.

**Slug drift from this plan's Deliverables list.** `docs/CURRICULUM.md` §2 wins (Steps §1), and it names shorter slugs than this plan's deliverable list did. Written as: `01-loop`, `02-routines`, `03-goal`, `04-desktop-scheduled-tasks`, `05-monitors-and-channels` — not `01-loop-command`, `02-routines-cron-api-github-triggers`, `03-goal-command`, `05-monitors`. Lesson 5 also covers channels and wake-ups, per the CURRICULUM title, which the plan's one-word "Monitors" omitted.

**Lab tags.** `lesson/m17-01-start` and `lesson/m17-02-start` exist in `codechup/claude-code-lab` and were used (`01-loop`, `02-routines`). `03-goal` reuses `lesson/m17-01-start` because its goal is proved against lesson 1's `scripts/loop-check.sh`; `04` and `05` carry `repo_tag: 'none'` (Desktop UI and channel-plugin work, no repo state to check out).

**What could and could not be captured.** Real captures: `bash scripts/loop-check.sh`; a headless run driving `CronCreate`/`CronList`/`CronDelete` (the create line is itself the evidence for "session-only … auto-expires after 7 days"); a headless `/goal` whose JSON `modelUsage` names both `claude-sonnet-5` and `claude-haiku-4-5-20251001`, i.e. the evaluator on the bill; a `/goal` that burned every turn against too narrow an allowlist and ended `Error: Reached max turns (6)`; the Git Bash path-conversion pair; a `Monitor` streaming four lines; a `claude --help` scan matching zero lines containing "channel" (which is what `channels.md` says to expect in research preview); an audit of the lab's routine brief; and the end-of-module check that nothing was left scheduled. Not capturable, taught as documented step lists and said so in the lesson: routine creation on claude.ai/Desktop, the whole Desktop scheduled-task UI, and channel plugin install/pairing. **Language of the captures (re-run 2026-09-08).** The capturing machine's user settings carry `"language": "Turkish"`, so five of the original captures came back in Turkish. On review feedback (D016: this is an English-source module, and a learner reproducing the lab would not see Turkish) every one of them was **re-run for real** against the same tags with `--settings` pointing at a one-key file setting `"language": "English"` — an override of the machine preference only, nothing else about the commands changed — and the transcript files replaced with the new verbatim output. Nothing was hand-translated (D070/D093). Re-captured: `01-loop/02-cron-tools.txt`, `02-routines/01-routine-brief-review.txt`, `03-goal/01-goal-json.txt`, `03-goal/03-git-bash-path-conversion.txt`, `05-monitors-and-channels/01-monitor.txt`. `03-goal/02-goal-max-turns.txt` contained no model prose (`Error: Reached max turns (6)`) and was kept; its header now records that the same command resolved on the 2026-09-08 re-run, so the max-turns overrun is non-deterministic — the lesson was reworded to teach the ceiling rather than promise the failure. The re-run also *improved* the Git Bash capture: in English the session explains that `/goal …` reached it as `C:/Program Files/Git/goal …` and refuses it as a likely prompt injection, which is a better illustration than the original.

**Nothing left scheduled.** Every cron task created was deleted in the same run (`CronList` → `No scheduled jobs.`), and that clean-up is itself the second transcript. No routine, desktop task or Windows scheduled task was created. Verified after the fact: `~/.claude/scheduled-tasks` does not exist, zero `*cron*`/`loop.md` files under `~/.claude`, zero Windows scheduled tasks matching "claude".

**Review counts (D071).** fact-checker: 134 claims — 131 confirmed, 3 wrong, 1 unverifiable (at 2 locations); all 4 fixed. The three wrong: the `/schedule` "Unknown command" prose and its quiz both conflated a Console API key / Anthropic profile (which gets the Enterprise-migration message) with a cloud-provider login (which gets `Unknown command`); and `/goal` status gates the **turn count and most recent reason** on the first evaluation, not the token spend. The unverifiable was the MSYS claim, now reframed as an observed shell quirk (see `open_questions`). reviewer: CHANGES REQUESTED, 0 blockers / 3 major / 6 minor — all applied: transcript header and lesson step 6 now carry the verbatim prompt actually sent; the routines and channels-help steps match their transcript headers; `03-goal` frontmatter `repo_tag` corrected from `none` to `lesson/m17-01-start`; the "both halves" claim about the Git Bash transcript softened to what it actually shows; TR frontmatter apostrophes normalised to the straight form `.claude/rules/i18n.md` uses (which required those title/description scalars to move to double quotes). Majors 2 and 3 were the plan file itself — this section and `open_questions`.

**Sources.** Each lesson's `sources[]` carries its official pages with `verified_at: 2026-09-07`. `content/_shared/sources.json` was touched append-only: `m17-autonomy` added to the `modules` array of ten existing entries (`docs-tools-reference`, `docs-hooks`, `docs-env-vars`, `docs-cloud-environments`, `docs-permission-modes`, `docs-plugins-reference`, `docs-headless`, `docs-mcp`, `docs-desktop`, `repo-claude-code-lab`). The four m17-specific doc entries (`docs-scheduled-tasks`, `docs-routines`, `docs-goal`, `docs-desktop-scheduled-tasks`, plus `docs-channels`/`docs-channels-reference`) were already registered by P23 and needed no change.

**Not done here.** TR prose (P25/P26/P40/P41 own it), and no module `index.mdx` edit was needed — the CURRICULUM list matched the stub.

