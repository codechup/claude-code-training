---
id: P03
title: Curriculum map and currency research
milestone: M0
status: in_progress
owner: fable-lead-2026-09-06
branch: plan/03-curriculum-map
model_hint: fable
effort_hint: high
depends_on: [P01]
owned_paths:
  - docs/CURRICULUM.md
  - research/**
shared_paths: []
estimate: L
updated_at: 2026-09-06T18:55:09Z
open_questions: []
---

## Goal

Turn the approved curriculum outline (21 modules across four levels, plus Playbook and Meta) into `docs/CURRICULUM.md`, the document every content plan (P13–P44) treats as authoritative for final lesson slugs, order, and objectives — resolving anything the outline left as a floor rather than a ceiling (D009). Alongside it, produce `research/feature-inventory.md` and `research/deprecations.md`: a real, source-checked inventory of Claude Code as of `verified_version: 2.1.263` (September 2026), so lesson writers cite research, never training-data memory. Resolve every item currently marked UNVERIFIED (Academy/Skilljar course URLs, the Anthropic YouTube playlist, the awesome-claude-code list URL, a community blog shortlist) before this plan is done — anything still unresolved becomes an explicit `open_questions` entry, never lesson text.

## Context

Read `DECISIONS.md` D001–D012 (audience, scope, source priority), D021–D024 (per-level module lists), D041–D044 (sources block, YouTube-as-cards, WebFetch + lychee verification, "Changed" notes), D073–D080 (per-topic lesson content requirements for models, effort, CLI, plan mode, memory, IDE, team, anti-patterns), D096 (`verified_version` pinning), D098 (researcher-agent pattern later content plans use — this plan is effectively that pattern's first, largest run, done once up front for the whole curriculum). This plan runs before P11 exists, so there is no `lesson-researcher` agent yet to delegate to — do the research directly with WebFetch/WebSearch against `https://code.claude.com/docs/en/*` and the sources D012 prioritizes.

## Scope

In:
- `docs/CURRICULUM.md`: for every one of the 21 modules (`m01-start` … `m21-scale`) plus `playbook` and `meta`, a final lesson list (numbered slug + one-line objective + rough duration/difficulty), confirming or adjusting the floor list already implied by the approved outline; a short "source policy" section restating D012/D041–D044 in this repo's terms; a table mapping each module to the D-numbers its content decisions come from (so a content plan's Context section can cite this table instead of re-deriving it).
- `research/feature-inventory.md`: hook events (grouped: lifecycle, prompt, tools, agents/tasks, elicitation) with exit-code semantics; skill frontmatter keys; agent frontmatter keys and built-ins; permission modes and settings precedence; the model family and aliases with effort levels; headless flags and exit codes; session commands; supported platforms; plugin anatomy and commands; MCP transports/scopes — each item cited to the specific official-doc URL it came from, fetched this session (not recalled from training data).
- `research/deprecations.md`: every "Changed" note a lesson will need (the list already identified — `keybindingFlavor` ignored, project-scope `defaultMode` ignored, `/btw` history keys, stricter Bash permission rule syntax, the GitHub Action's `@beta`→`@v1` migration and removed inputs, `disableArtifact`→`enableArtifact`, MCP SSE deprecation, `MultiEdit` removal — plus anything new this session's research turns up), each with what changed, since when (best known), and what a 2025-era tutorial would get wrong.
- Resolving every UNVERIFIED item: find (or conclusively fail to find, and say so) the Anthropic Academy/Skilljar course URL, the official YouTube Claude Code playlist, a maintained `awesome-claude-code`-style list, and a short list of community blogs worth citing later; record findings (including "not found, do not cite" outcomes) in `research/feature-inventory.md`'s source list.

Out: writing any lesson content (P13 onward); `plans/README.md`/`ROADMAP.md` (already exist, owned by the planning session/P02); any code.

## Deliverables

`docs/CURRICULUM.md`, `research/feature-inventory.md`, `research/deprecations.md`.

## Acceptance criteria

- Every module in `docs/CURRICULUM.md` has a lesson list whose lesson count is at least the number implied by the approved outline's `·`-separated topics for that module (D009 — never fewer, more is fine if genuinely warranted).
- Every factual claim in `research/feature-inventory.md` and `research/deprecations.md` carries a source URL that was fetched (not recalled) this session; run `lychee` (or, if P04 has not shipped it yet, a plain `curl -sfI` loop) against every URL in both files and paste the all-green result in the PR.
- The UNVERIFIED list from the approved plan has zero remaining entries in these two files — each is either resolved with a citation or explicitly marked "not found as of `2026-09-06`, do not cite" so a later session does not re-search it blindly.
- `docs/CURRICULUM.md`'s module → D-number table covers all 21 modules plus Playbook and Meta.
- A spot check of three lesson objectives against `DECISIONS.md`'s corresponding D-entries shows no contradiction.

## Steps

1. Re-read the approved outline's per-module topic lists; for each module, WebFetch the relevant `https://code.claude.com/docs/en/*` page(s) and confirm the topics are current for `2.1.263`; expand into a numbered lesson list.
2. Build `research/feature-inventory.md` section by section (hooks, skills, agents, permissions, models/effort, headless, sessions, platforms, plugins, MCP), citing every claim.
3. Build `research/deprecations.md` from the known "Changed" list plus anything new found in step 1/2's doc fetches.
4. Resolve each UNVERIFIED item with WebSearch/WebFetch; record the outcome either way.
5. Assemble `docs/CURRICULUM.md`'s module table and source-policy section; cross-check every module's lesson count and D-number citations.
6. Run link verification on every URL cited in both research files; fix or annotate any that fail.

## Tests required

No unit tests (documentation plan). Evidence instead: the link-verification run from Acceptance criteria, pasted in the PR, and a list of every WebFetch/WebSearch query used (so a reviewer can spot-check one or two).

## Non-goals / pitfalls

- Do not write from training-data memory of Claude Code — every factual claim needs a same-session fetch; if a fetch fails or the page does not confirm the claim, mark it UNVERIFIED rather than asserting it.
- Do not shrink a module's lesson list below the outline's floor to save effort (D009); if a topic genuinely does not warrant its own lesson, fold it into an adjacent lesson and say so in `docs/CURRICULUM.md`, do not just drop it silently.
- Do not write actual lesson prose here, even as a preview — this plan produces a map and a research inventory, not content.
- Do not leave an UNVERIFIED item unresolved without an explicit "not found" note — a silently-missing entry looks like an oversight to every later session that reads this file.

## Verification

A reviewer opens `docs/CURRICULUM.md`, counts the lesson totals against the outline's floor per module, opens three cited URLs at random from `research/feature-inventory.md` to confirm they say what is claimed, and checks that no UNVERIFIED item from the approved plan is missing from either research file.

## Handoff notes

- Lead session drafted `research/feature-inventory.md` and `research/deprecations.md` on 2026-09-06 from the official docs (Claude Code 2.1.263). Three items are marked UNVERIFIED (Academy/Skilljar URLs, Anthropic YouTube playlist, community list) — resolve them here before W1 and record the answers in `open_questions` if still unresolved.
