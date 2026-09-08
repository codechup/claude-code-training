---
id: P38
title: "L4 Master module: Scale (m21-scale)"
milestone: M2
status: review
owner: lead-fable
branch: plan/38-l4-m21-scale
model_hint: opus
effort_hint: high
depends_on: [P24]
owned_paths:
  - content/en/l4-master/m21-scale/**
  - content/tr/l4-master/m21-scale/**
  - content/_shared/transcripts/m21-scale/**
shared_paths:
  - content/_shared/sources.json
estimate: L
updated_at: 2026-09-07T23:45:31Z
open_questions:
  - 'research/feature-inventory.md has no facts row for gateways, Amazon Bedrock, Google Cloud''s Agent Platform, Microsoft Foundry, network-config or devcontainer — only the docs-map slug listing on line 18. This module fell through to live docs (correct per the source policy), but P03 should close the coverage gap so the next lesson in this area does not re-fetch eight pages.'
  - 'The lab repository has no lesson/m21-scale-* tags (its README documents this as deliberate: m21 is process/strategy, not a change to that repo). Every lab here therefore uses repo_tag: "none" against a throwaway clone of main. If a later plan tags m21, these five lessons should be revisited.'
  - '04-gateways-and-clouds ships with no transcript, by design: verifying any provider path needs an AWS/GCP/Azure/gateway account this course does not sign in to, and /status is interactive-only. Recorded here so a reviewer does not read the absence as an omission.'
---

## Goal

Author every lesson of Scale (`m21-scale`), the 4-lesson next module of Master (l4-master), in English: this closing L4 module addresses the scale problems a reader only meets after everything else in the course: codebases too big for one context window, and enterprise gateway deployment options. Each lesson follows the fixed template (D006): Objectives + prerequisites, When NOT to use, Concept, Hands-on lab, Anti-patterns, Quiz, Sources. Every command shown was actually run against the lab repo and every claim is backed by real output (D093) — this plan produces no lesson content from memory alone.

## Context

Read first: `docs/CURRICULUM.md` (P03) — it is the **authoritative** source for this module's final lesson slugs, objectives, and order; the lesson list below is the floor the approved plan set, not a ceiling. Also read `research/feature-inventory.md` and `research/deprecations.md` (P03) for what is current vs. "Changed" as of `verified_version: 2.1.263`; `content/_shared/sources.json` (P23) for the vetted source list to pull from and append to; `.claude/rules/content.md`, `.claude/skills/new-lesson/SKILL.md` and the `lesson-researcher`/`lesson-writer`/`fact-checker`/`reviewer` agents (all P11) for the exact authoring workflow; `content/schema.ts` (P06) for the frontmatter zod schema; `docs/design/CANVAS.md` and `/design/` (P05) for the lesson-page visual reference; and the outline text this module was scoped from:

> `m21-scale`: large codebases · context engineering · prompt caching · gateways/Bedrock/Vertex/Foundry overview

No lesson in this module exists yet; `content/en/l4-master/m21-scale/**` starts from the level/module `index.mdx` stub P06 created.

Decisions this module leans on beyond the shared pipeline decisions below: .

## Scope

In:
- 4 lesson files under `content/en/l4-master/m21-scale/`, numbered `01-`…`04-`, each a complete MDX file following D006's seven sections.
- The matching Turkish draft stub for each lesson under `content/tr/l4-master/m21-scale/` (`draft: true`, created by the `/new-lesson` skill in the same commit as the EN lesson — D016, D018; P25/P26/P40/P41 translate it later, never this plan).
- One raw lab transcript per lesson with a hands-on lab, saved under `content/_shared/transcripts/m21-scale/`, plus the simplified `<Transcript>` rendering embedded in the lesson (D099).
- This module's entries appended to `content/_shared/sources.json` (D041, D043; append-only — never rewrite another module's entries).
- Updating `l4-master/index.mdx` and `m21-scale/index.mdx` module-index copy if this module's final lesson list differs from the stub P06 left (rare; only if `docs/CURRICULUM.md` changed the outline).

Out: Turkish translation of these lessons (P25/P26/P40/P41 own `content/tr/l4-master/m21-scale/**` after this plan hands it off); any other module's content; MDX component code (P07/P08 own those; if a lesson needs a component that does not exist, write it into `open_questions` and do not build it here); changes to `content/schema.ts`, `src/lib/nav.ts`, or any route/layout file; the lab repo itself (P22 owns `codechup/claude-code-lab`; this plan clones and runs it, never edits it in place — a bug fix needed there goes into `open_questions` naming the tag).

## Deliverables

- `content/en/l4-master/m21-scale/NN-<slug>.mdx` (4 files):
01. **Working in large codebases** — `01-large-codebases.mdx`
02. **Context engineering** — `02-context-engineering.mdx`
03. **Prompt caching** — `03-prompt-caching.mdx`
04. **Gateways: Bedrock, Vertex, and Foundry overview** — `04-gateways-bedrock-vertex-foundry-overview.mdx`
- `content/tr/l4-master/m21-scale/NN-<slug>.mdx` (4 files) — `draft: true` stubs with EN frontmatter fields carried over and `title`/`description` left in English (translation is not this plan's job; the stub exists so routing/parity gates pass).
- `content/_shared/transcripts/m21-scale/NN-<slug>.md` — one per lesson that has a hands-on lab, containing the raw terminal transcript.
- Updated `content/_shared/sources.json` with this module's sources block entries.

## Acceptance criteria

- `node scripts/content-gate.ts` passes for this module: every lesson's frontmatter validates against `content/schema.ts`, every code fence has a language tag, EN/TR path parity holds (the TR draft exists at the same slug), and `level`/`module` in frontmatter match the file path.
- Every lesson has `verified_version: 2.1.263` and a non-empty `sources` array with at least one `type: "doc"` entry whose URL was fetched successfully by `/verify-sources` (D041, D043) — paste the WebFetch/lychee evidence in the PR.
- Every lesson with a hands-on lab has a transcript file under `content/_shared/transcripts/m21-scale/` whose content matches, verbatim, a real run of the commands shown in the lesson (D093, D099) — no lesson may show output that was not captured this way.
- `npm run typecheck && npm run lint && npm test` pass; `npm run build` succeeds and `dist/en/l4-master/m21-scale/` contains 4 lesson pages plus the index.
- `npx playwright test e2e/lesson.spec.ts` passes against at least one lesson in this module (axe: 0 serious/critical violations at 390 px and 1280 px).
- The `fact-checker` agent's report (pasted into the PR) shows no unresolved discrepancy against `research/feature-inventory.md`; the `reviewer` agent's report confirms the D006 template order and the evidence rule on every lesson.

## Steps

1. Read `docs/CURRICULUM.md` §m21-scale and confirm the lesson list/order below still matches; if it drifted, follow the doc, not this plan, and note the delta in Handoff notes.
2. Run the `lesson-researcher` agent once per lesson (D098): official doc URL(s) + 2–3 web/YouTube sources, summarized against `research/feature-inventory.md`; save nothing permanent yet, this feeds step 4.
3. Clone `codechup/claude-code-lab` (P22) into a scratch directory; for every lesson with a hands-on lab, check out its start tag (`lesson/m21-scale-NN-start`), do the exercise for real, and capture the full terminal transcript.
4. Write each lesson MDX with `/new-lesson l4-master/m21-scale/<slug>` (creates the EN file and the TR draft stub together); fill Objectives, When NOT to use, Concept (grounded in the researcher's summary, never invented), Hands-on lab (the exact commands from step 3), Anti-patterns, Quiz, Sources.
5. Save the raw transcript from step 3 under `content/_shared/transcripts/m21-scale/NN-<slug>.md`; embed the simplified version with the `<Transcript>` component (P07) in the lesson.
6. Append this lesson's sources to `content/_shared/sources.json` (P23's schema); run `/verify-sources content/en/l4-master/m21-scale/NN-<slug>.mdx` to stamp `verified_at`.
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

A reviewer opens `npm run dev`, visits each of the 4 lessons at `/en/l4-master/m21-scale/<slug>/`, confirms the OS tabs, transcript, quiz, and sources block render, spot-checks two Sources links by hand, and reads the fact-checker/reviewer agent reports pasted in the PR before merging.

## Handoff notes

Executed by session `opus-p38-2026-09-07` in worktree `../cct-wt-38`.

### Drift from this plan (CURRICULUM won, per Steps 1)

`docs/CURRICULUM.md` §2 lists **five** lessons for m21-scale, not the four this plan's Deliverables
section named. The shipped set follows the curriculum:

| Shipped | This plan said |
|---|---|
| `01-large-codebases` | same |
| `02-context-engineering` | same |
| `03-prompt-caching` | same |
| `04-gateways-and-clouds` | `04-gateways-bedrock-vertex-foundry-overview` (slug changed) |
| `05-devcontainers` | not listed |

`l4-master/index.mdx` and `m21-scale/index.mdx` already described the five-lesson shape, so neither
needed editing.

### What was written

- 5 EN lessons under `content/en/l4-master/m21-scale/`, each with the full D006 section order.
- 5 TR `draft: true` stubs with a Turkish `## Özet` and the repo's established
  `<Callout label="Çeviri bekleniyor">` notice. Translation belongs to P25/P26/P40/P41.
- 7 transcripts under `content/_shared/transcripts/m21-scale/`, all captured this session against a
  throwaway clone of the lab repo's `main` (`../cct-lab-38`) plus, for lesson 05, a real
  `@devcontainers/cli` build. Absolute paths and the home directory are redacted as `<path-to>` /
  `<home>`; nothing else was altered.
- 3 new `content/_shared/sources.json` entries (`docs-devcontainer`, `docs-corporate-launcher`,
  `containers-dev-spec`) plus `m21-scale` appended to 17 existing entries. Append-only; no entry
  removed or reordered.

### Evidence captured (D093/D099)

- **01** — an A/B pair of byte-identical `claude -p` runs differing only by `--add-dir`: refused,
  then `60_000`. Both runs also show `permissions.allow` entries being ignored in an untrusted
  workspace, which the lesson teaches as the realistic rollout failure mode.
- **02** — the same seven-file read run directly vs. delegated to the `Explore` subagent:
  8,596 vs 1,185 cache-creation tokens into the main conversation, $0.064 vs $0.128 total. The
  lesson teaches the honest trade-off rather than "subagents save money". Plus a capture proving
  `/context` has no headless form.
- **03** — two consecutive `-p` runs, the second `--resume`d, showing `cache_read_input_tokens`
  66,548 / 68,756 against four uncached input tokens; then the same prompt with
  `DISABLE_PROMPT_CACHING=1` ($0.137, 67,572 uncached) and `FORCE_PROMPT_CACHING_5M=1` ($0.095,
  written under `ephemeral_5m_input_tokens`).
- **04** — no transcript; see `open_questions`.
- **05** — a real `npx @devcontainers/cli build` that failed on the documented missing-Node path and
  succeeded after adding the node feature.

### Doc drift found while writing

- **`autoCompactAt` does not exist.** The settings keys are `autoCompactEnabled` and
  `autoCompactWindow`; the command is `/autocompact <tokens>`. This closes the open item
  `research/feature-inventory.md` line 51 flagged for P14 ("the setting name behind it must be
  quoted from the live settings.md, not assumed").
- **Auto-compact precedence** is `CLAUDE_CODE_AUTO_COMPACT_WINDOW` > `--autocompact` flag >
  `autoCompactWindow` setting. An earlier draft had this reversed; the fact-checker caught it.
- **`network-config.md`'s live H1 is "Enterprise network configuration"**, not "Network
  configuration". Corrected in both lessons that cite it and in the shared registry.
- **`google-vertex-ai.md` is now written as "Google Cloud's Agent Platform"** throughout; only the
  login prompt still shows the "Google Vertex AI" label. Lessons use the current name.
- **The devcontainer feature's real failure string** is `Node.js and npm are required but could not
  be installed!`, while `devcontainer.md` describes it as `Failed to install Node.js and npm`; the
  feature's own suggested fix uses the `:1` major tag where the docs show `:1.0`. Lesson 05 says so
  explicitly rather than quoting the doc string as if it were the output.

### Review pipeline (D071)

- **fact-checker** (`claude -p`, read-only, plan mode): 01 PASS (0 wrong, 2 unverifiable — both
  claims about the lab repo's own tag state, which this session verified directly by reading the lab
  README); 02 3 findings; 03 PASS clean; 04 1 finding; 05 1 precision finding. **Applied:** the
  auto-compact precedence reversal (body + quiz), the over-broad "hooks add whatever they print",
  the `network-config.md` title, and the v2.1.210+ gate on Remote Control / agent-teams launcher
  coverage. **Rejected with evidence:** its claim that `DISABLE_AUTO_COMPACT` does not exist — it is
  documented in `env-vars.md` and `settings-reference.md`, both re-read to confirm, so the lesson
  text stands.
- **reviewer** (`claude -p`, read-only, plan mode): 4 major + 3 minor, 0 blockers. All 7 applied —
  cited the registry's `third-party-integrations` entry from lesson 04, made the `network-config`
  title consistent, filled these Handoff notes, reworded lesson 04's `/status` lab step so it reads
  as an observe-it-yourself check rather than an implied captured run, aligned source titles with
  the registry's existing strings for shared URLs, switched the TR stubs to the repo's
  `<Callout label="Çeviri bekleniyor">` convention, and de-duplicated lesson 04's two "no
  transcript" callouts.

### Verification

`npm run gate` (202 files) · `npm run typecheck` (110 files, 0 errors) · `npm run lint` ·
`npm test` (22 files, 184 tests) · `npm run build` ending `check-no-inline-script (dist): OK` with
all 5 lesson pages plus the index in `dist/en/l4-master/m21-scale/` · `check-raw-colors` ·
`check-public-hygiene` · `tools/plan/cli.ts check` · Playwright 30/30 at 390 px and 1280 px on a
temporary `playwright.p38.config.ts` (port 4438) and a temporary spec covering every m21-scale route
in both languages, both deleted afterwards.

### For the translation plan

The TR twins are stubs. Terms used in the EN prose that the glossary may not carry yet, noted here
rather than added (`content/tr/playbook/glossary.mdx` is not in this plan's paths): *sparse
checkout*, *devcontainer*, *gateway*, *prompt caching*, *TTL*, *egress*, *corporate launcher*.

