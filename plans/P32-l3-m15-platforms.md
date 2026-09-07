---
id: P32
title: "L3 Advanced module: Platforms (m15-platforms)"
milestone: M2
status: done
owner: opus-p32-2026-09-07
branch: plan/32-l3-m15-platforms
model_hint: opus
effort_hint: high
depends_on: [P24]
owned_paths:
  - content/en/l3-advanced/m15-platforms/**
  - content/tr/l3-advanced/m15-platforms/**
  - content/_shared/transcripts/m15-platforms/**
shared_paths:
  - content/_shared/sources.json
estimate: L
updated_at: 2026-09-07T19:40:36Z
open_questions:
  - 'research/feature-inventory.md is missing Dispatch, the --tmux flag, /web-setup, /autofix-pr and /ios|/android, and does not record that `claude remote-control` is a real subcommand absent from the `Commands:` list in `claude --help` for 2.1.263 — P03 owns that file, so the drift is recorded here rather than edited in.'
  - 'The fact-checker asked for three inventory rows to be enriched, because each was too thin to have caught an error this module made: the IDE row does not record that VS Code exposes two model-visible `ide` tools (getDiagnostics plus the non-read-only executeCode) while JetBrains exposes one; the Desktop/web row does not record Desktop''s third-party-provider matrix, permission-mode set or worktree default path; the Claude Tag row does not record Access bundles, the ephemeral sandbox, the DM billing exception, routines, or that the claude.com Claude Tag docs carry a Public Beta label.'
  - 'research/deprecations.md has no entry for the three Changed facts this module teaches (--remote deprecated in favour of --cloud; Chrome integration kept off for API-key/setup-token sessions since v2.1.216; Claude Code in Slack being retired for Team/Enterprise in favour of Claude Tag). P03/P42 should add them so the Playbook changelog page stays in sync.'
  - 'codechup/claude-code-lab has only process-only tags for this module (lesson/m15-01-* and lesson/m15-06-*, both at the m14-03 solution tip), so six of the eight lessons use repo_tag: none. A lab-repo plan would need real start/solution state before the Desktop or JetBrains labs could check out anything.'
  - 'TR translation (P25/P26/P40/P41) will need glossary coverage for worktree, routine, permission mode, MCP server, transcript and headless; content/tr/playbook/glossary.mdx is not in this plan''s shared_paths so it was not edited.'
---

## Goal

Author every lesson of Platforms (`m15-platforms`), the 7-lesson next module of Advanced (l3-advanced), in English: this module is the platform survey D011/D078 call for — every surface beyond the plain CLI gets a short, hands-on lesson. Each lesson follows the fixed template (D006): Objectives + prerequisites, When NOT to use, Concept, Hands-on lab, Anti-patterns, Quiz, Sources. Every command shown was actually run against the lab repo and every claim is backed by real output (D093) — this plan produces no lesson content from memory alone.

## Context

Read first: `docs/CURRICULUM.md` (P03) — it is the **authoritative** source for this module's final lesson slugs, objectives, and order; the lesson list below is the floor the approved plan set, not a ceiling. Also read `research/feature-inventory.md` and `research/deprecations.md` (P03) for what is current vs. "Changed" as of `verified_version: 2.1.263`; `content/_shared/sources.json` (P23) for the vetted source list to pull from and append to; `.claude/rules/content.md`, `.claude/skills/new-lesson/SKILL.md` and the `lesson-researcher`/`lesson-writer`/`fact-checker`/`reviewer` agents (all P11) for the exact authoring workflow; `content/schema.ts` (P06) for the frontmatter zod schema; `docs/design/CANVAS.md` and `/design/` (P05) for the lesson-page visual reference; and the outline text this module was scoped from:

> `m15-platforms`: VS Code · JetBrains · Desktop app (scheduled tasks) · web app & cloud sessions · Remote Control & mobile · Chrome · Claude Tag (Slack)

No lesson in this module exists yet; `content/en/l3-advanced/m15-platforms/**` starts from the level/module `index.mdx` stub P06 created.

Decisions this module leans on beyond the shared pipeline decisions below: (D078), (D011).

## Scope

In:
- 7 lesson files under `content/en/l3-advanced/m15-platforms/`, numbered `01-`…`07-`, each a complete MDX file following D006's seven sections.
- The matching Turkish draft stub for each lesson under `content/tr/l3-advanced/m15-platforms/` (`draft: true`, created by the `/new-lesson` skill in the same commit as the EN lesson — D016, D018; P25/P26/P40/P41 translate it later, never this plan).
- One raw lab transcript per lesson with a hands-on lab, saved under `content/_shared/transcripts/m15-platforms/`, plus the simplified `<Transcript>` rendering embedded in the lesson (D099).
- This module's entries appended to `content/_shared/sources.json` (D041, D043; append-only — never rewrite another module's entries).
- Updating `l3-advanced/index.mdx` and `m15-platforms/index.mdx` module-index copy if this module's final lesson list differs from the stub P06 left (rare; only if `docs/CURRICULUM.md` changed the outline).

Out: Turkish translation of these lessons (P25/P26/P40/P41 own `content/tr/l3-advanced/m15-platforms/**` after this plan hands it off); any other module's content; MDX component code (P07/P08 own those; if a lesson needs a component that does not exist, write it into `open_questions` and do not build it here); changes to `content/schema.ts`, `src/lib/nav.ts`, or any route/layout file; the lab repo itself (P22 owns `codechup/claude-code-lab`; this plan clones and runs it, never edits it in place — a bug fix needed there goes into `open_questions` naming the tag).

## Deliverables

- `content/en/l3-advanced/m15-platforms/NN-<slug>.mdx` (7 files):
01. **Claude Code in VS Code** — `01-vscode.mdx`
02. **Claude Code in JetBrains IDEs** — `02-jetbrains.mdx`
03. **The Desktop app and scheduled tasks** — `03-desktop-app-and-scheduled-tasks.mdx`
04. **The web app and cloud sessions** — `04-web-app-and-cloud-sessions.mdx`
05. **Remote Control and mobile** — `05-remote-control-and-mobile.mdx`
06. **Claude in Chrome** — `06-chrome.mdx`
07. **Claude Tag in Slack** — `07-claude-tag-slack.mdx`
- `content/tr/l3-advanced/m15-platforms/NN-<slug>.mdx` (7 files) — `draft: true` stubs with EN frontmatter fields carried over and `title`/`description` left in English (translation is not this plan's job; the stub exists so routing/parity gates pass).
- `content/_shared/transcripts/m15-platforms/NN-<slug>.md` — one per lesson that has a hands-on lab, containing the raw terminal transcript.
- Updated `content/_shared/sources.json` with this module's sources block entries.

## Acceptance criteria

- `node scripts/content-gate.ts` passes for this module: every lesson's frontmatter validates against `content/schema.ts`, every code fence has a language tag, EN/TR path parity holds (the TR draft exists at the same slug), and `level`/`module` in frontmatter match the file path.
- Every lesson has `verified_version: 2.1.263` and a non-empty `sources` array with at least one `type: "doc"` entry whose URL was fetched successfully by `/verify-sources` (D041, D043) — paste the WebFetch/lychee evidence in the PR.
- Every lesson with a hands-on lab has a transcript file under `content/_shared/transcripts/m15-platforms/` whose content matches, verbatim, a real run of the commands shown in the lesson (D093, D099) — no lesson may show output that was not captured this way.
- `npm run typecheck && npm run lint && npm test` pass; `npm run build` succeeds and `dist/en/l3-advanced/m15-platforms/` contains 7 lesson pages plus the index.
- `npx playwright test e2e/lesson.spec.ts` passes against at least one lesson in this module (axe: 0 serious/critical violations at 390 px and 1280 px).
- The `fact-checker` agent's report (pasted into the PR) shows no unresolved discrepancy against `research/feature-inventory.md`; the `reviewer` agent's report confirms the D006 template order and the evidence rule on every lesson.

## Steps

1. Read `docs/CURRICULUM.md` §m15-platforms and confirm the lesson list/order below still matches; if it drifted, follow the doc, not this plan, and note the delta in Handoff notes.
2. Run the `lesson-researcher` agent once per lesson (D098): official doc URL(s) + 2–3 web/YouTube sources, summarized against `research/feature-inventory.md`; save nothing permanent yet, this feeds step 4.
3. Clone `codechup/claude-code-lab` (P22) into a scratch directory; for every lesson with a hands-on lab, check out its start tag (`lesson/m15-platforms-NN-start`), do the exercise for real, and capture the full terminal transcript.
4. Write each lesson MDX with `/new-lesson l3-advanced/m15-platforms/<slug>` (creates the EN file and the TR draft stub together); fill Objectives, When NOT to use, Concept (grounded in the researcher's summary, never invented), Hands-on lab (the exact commands from step 3), Anti-patterns, Quiz, Sources.
5. Save the raw transcript from step 3 under `content/_shared/transcripts/m15-platforms/NN-<slug>.md`; embed the simplified version with the `<Transcript>` component (P07) in the lesson.
6. Append this lesson's sources to `content/_shared/sources.json` (P23's schema); run `/verify-sources content/en/l3-advanced/m15-platforms/NN-<slug>.mdx` to stamp `verified_at`.
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

A reviewer opens `npm run dev`, visits each of the 7 lessons at `/en/l3-advanced/m15-platforms/<slug>/`, confirms the OS tabs, transcript, quiz, and sources block render, spot-checks two Sources links by hand, and reads the fact-checker/reviewer agent reports pasted in the PR before merging.

## Handoff notes

**Session:** `opus-p32-2026-09-07`, worktree `../cct-wt-32`, branch `plan/32-l3-m15-platforms`.

### What was written

Eight EN lessons under `content/en/l3-advanced/m15-platforms/` plus eight `draft: true` TR stubs, ten captured transcripts under `content/_shared/transcripts/m15-platforms/<NN-slug>/`, and two new entries in `content/_shared/sources.json`.

### Deltas from the plan file (CURRICULUM wins, per step 1)

The plan listed **7** lessons with different slugs; `docs/CURRICULUM.md` §2 lists **8**. Followed CURRICULUM. Renames: `01-vscode`→`01-vs-code`, `02-jetbrains` (same), `03-desktop-app-and-scheduled-tasks`→`03-desktop-app`, `04-web-app-and-cloud-sessions`→`04-web-and-cloud-sessions`, `05-remote-control-and-mobile`→`05-remote-control-mobile`, `06-chrome` (same), `07-claude-tag-slack`→`07-slack-claude-tag`, plus the new `08-tmux-multi-session`.

Two more places where `docs/authoring/CONTENT-PLAN-BRIEF.md` was followed over the plan file, as the brief instructs: transcripts live at `transcripts/<module>/<NN-slug>/<kk>-<name>.txt` with a `# ` provenance first line (not `transcripts/<module>/NN-<slug>.md`), and the TR stubs carry a **translated** title/description plus a one-paragraph Turkish summary (not English titles).

### Evidence and honesty limits (D093, D099)

This module is overwhelmingly UI-driven. Every surface is described from a live doc fetch with exact commands and settings in `<CodeBlock>`; **nothing was staged as a screenshot or a fake session.** Only what could be captured honestly was captured, all against `lesson/m15-01-start` / `lesson/m15-06-start` (both "process-only" tags pointing at the m14-03 solution tip, so the repo runs as-is):

- `01-vs-code`: `claude --version`; `claude --help` `--ide` entry.
- `04-web-and-cloud-sessions`: `claude --help` `--cloud` / `--teleport` entries; the `ultrareview` subcommand entry.
- `05-remote-control-mobile`: `claude --help` `--remote-control` entries; the full `claude remote-control --help` flag list.
- `06-chrome`: `claude --help` `--chrome` / `--no-chrome`; a **real** headless `claude -p --chrome` run against the lab checkout that was refused by the Chrome extension's site permissions. That capture answers in Turkish because this machine's global Claude Code preferences ask for Turkish — the same phenomenon the m01 reference lesson documents. The lesson calls both facts out rather than hiding them.
- `08-tmux-multi-session`: `claude --help` `--tmux` / `--worktree` entries; a real `tmux -V` / `new-session` / `list-windows` / `list-sessions` run in WSL (tmux 3.6).

Lessons `02-jetbrains`, `03-desktop-app` and `07-slack-claude-tag` have **no transcript**: the JetBrains plugin, the Desktop GUI and Claude Tag in Slack (Team/Enterprise, Owner-only) have nothing capturable headlessly. Their labs are step lists with an explicit expected result and a checklist, as the plan brief allows.

### Inventory drift found (docs win, D004/D044)

`research/feature-inventory.md` does not mention these, all confirmed live on 2026-09-07:

- **Dispatch** — message a task from the Claude mobile app, Desktop spawns a Code session (`desktop.md#sessions-from-dispatch`, `platforms.md`). Pro/Max only.
- **`--tmux`** — real flag in `claude --help` for 2.1.263; requires `--worktree`.
- **`/web-setup`**, **`/autofix-pr`**, **`/ios`** / **`/android`** (aliases of `/mobile`) — in `commands.md` / `web-quickstart.md` but not the inventory's command list.
- **`claude remote-control` is a real subcommand** but is **not listed** under `Commands:` in `claude --help` for 2.1.263; `claude remote-control --help` prints its own flag list (captured). Worth an inventory note.
- **iOS Simulator pane** is documented as *not* computer use (it drives the simulator directly); the inventory's one-line entry does not make that distinction.
- The **Claude Tag** authoritative docs live at `claude.com/docs/claude-tag/*`; `code.claude.com/docs/en/claude-tag.md` is a short pointer page. Both are cited so the mandatory `code.claude.com` official entry is satisfied.

### Sources registry

15 of the 17 official URLs this module cites were already tagged `m15-platforms` in `content/_shared/sources.json` by an earlier plan. Only `desktop-scheduled-tasks.md` and `terminal-config.md` needed the module tag appended, and two new entries were added (`docs-claude-tag-overview`, `docs-claude-tag-routines`, both on `claude.com`). Diff is 18 insertions / 2 deletions — no existing entry rewritten or reordered.

### Verification

`npm run gate` (OK, 174 files) · `npm run typecheck` (0 errors) · `npm run lint` (clean after `prettier --write` on the eight EN files) · `npm test` (22 files, 184 tests) · `npm run build` (ends `check-no-inline-script (dist): OK`, `dist/en/l3-advanced/m15-platforms/` has 8 lesson pages + index) · `node scripts/check-raw-colors.mjs` · `node scripts/check-public-hygiene.mjs` · `node tools/plan/cli.ts check`. Playwright on port **4432** with a temporary `playwright.p32.config.ts` and a temporary `e2e/p32-m15.spec.ts`: **34 passed** at 390 px and 1280 px (`e2e/a11y.spec.ts` plus both module indexes and all 8 EN lesson routes). Both temporary files were deleted afterwards. TR lesson routes are `draft: true` and deliberately do not render, so they are not in the route list.

Two MDX build failures were found and fixed: an escaped `\"` inside a double-quoted `<Quiz prompt="…">` attribute is not valid MDX (`05` and `04`); both prompts were reworded.

### Review pipeline (D071)

Both agents were run read-only from the worktree root and both returned CHANGES REQUESTED. Everything they raised was either fixed or answered against a primary source.

**`reviewer` — 4 blockers, 0 majors, 3 minors, 2 nits. All addressed.** The blockers were three misplaced `<Callout variant="changed">` blocks (before `## Anti-patterns` instead of after it — D006 / CURRICULUM §3 order) in lessons 04, 06 and 07, and the raw IPv4 in the JetBrains WSL2 firewall example, which the pre-commit hygiene hook had already caught and which is now a `$Subnet` placeholder. Minors and nits fixed: lesson 04's `expected=` quoted `Sent to cloud session.` as though it were captured output (now paraphrased, since it is doc text and not a recording from this session); lesson 05's transcript range cut an entry mid-line and its caption implied a slash command could appear in `claude --help`; lesson 01's lab said "committed text" where `git diff` shows the working tree; and this plan's `open_questions` was empty while the Handoff listed real follow-ups.

**`fact-checker` — 3 WRONG, all fixed; 4 UNVERIFIABLE, 3 resolved and 1 kept with evidence; ~120 claims CONFIRMED across the eight lessons.**

Fixed (WRONG):

1. `01-vs-code` claimed the `ide` MCP server exposes exactly one model-visible tool. That is true of **JetBrains**; VS Code exposes **two** — `mcp__ide__getDiagnostics` (read-only) and `mcp__ide__executeCode`, which runs Python in the active Jupyter kernel behind a Quick Pick confirmation. The lesson now carries both, and the confirmation flow.
2. `03-desktop-app`'s `WhenNotToUse` said Bedrock and Foundry need the CLI or an IDE extension. `desktop.md`'s feature-comparison table says the Code tab can run on all three third-party providers through the separate "Claude Desktop on 3P" setup. Rewritten, and the genuinely-absent Desktop features (agent teams, inline suggestions) named instead.
3. `06-chrome` said "Two constraints on uploads" and then listed three. The docs call them three restrictions — permissions, size, hard links — and the lesson now does too.

Resolved (UNVERIFIABLE):

4. The `claude remote-control --help` capture was missing `--spawn`, `--capacity` and `--create-session-in-dir`, which the docs list — because the original capture was piped through `head -22`. **Re-captured in full (52 lines), the header now says "Complete, untruncated output", and the lesson renders the whole OPTIONS block.** This was a real evidence defect and the most valuable thing either agent found.
5. `06-chrome` attributed the captured refusal specifically to the Chrome extension's site permissions. The agent is right that the transcript cannot establish which layer refused: the same capture's first line shows Claude Code's own permission layer dropping the workspace's `permissions.allow` entries. The lesson now says exactly that — the transcript proves *a* permission stopped the action, not *which* one — and points at the interactive dialog as where the distinction is visible.
6. `08-tmux-multi-session` said "the transcript below is a real run" above an eight-step lab evidenced by two steps. It now names which steps the recording covers and says plainly that the rest are performed and observed by the reader. The "tmux is a POSIX tool" line was softened to a claim about `~/.tmux.conf`, which the cited doc does make.

Kept, with primary-source evidence against the agent (one item):

7. Lesson 04's setup-script advice to "drop long retry sleeps" was flagged as absent from `cloud-environments.md`. It is absent there, but it is verbatim in `web-quickstart.md`, which is also one of that lesson's cited sources: *"Remove long retry sleeps from the setup script, since a stalled retry loop counts against the budget."* Kept. The same applies to the `/status` **Login method** row, which is in `web-quickstart.md`; lesson 05 does not cite that page, so its wording was loosened rather than the claim removed.

Both agents independently recommended enriching `research/feature-inventory.md`; those recommendations are in `open_questions` below.

### Open questions / follow-ups

- No `<Callout variant="changed">` in `01`, `02`, `03`, `05`, `08` — `research/deprecations.md` has no item for those surfaces and CURRICULUM §3 makes the callout conditional ("where relevant"). Three lessons do carry one (`--remote` → `--cloud`; Chrome integration off for API-key/`setup-token` sessions since v2.1.216; Claude Code in Slack being retired for Team/Enterprise in favour of Claude Tag).
- P22 tagged only `m01`–`m09` labs; `m15-01`/`m15-06` exist as process-only tags. Six of the eight lessons use `repo_tag: 'none'`. If a later plan wants real lab state for the Desktop or JetBrains lessons, it needs new tags in `codechup/claude-code-lab`.
- TR translation of these eight lessons belongs to P25/P26/P40/P41. Turkish glossary terms these lessons will need on translation and that may not exist yet: `worktree`, `routine`, `permission mode`, `MCP server`, `transcript`, `headless` (most are already listed in `.claude/rules/i18n.md`'s kept-terms list; the glossary was not edited by this plan since it is not in `shared_paths`).

