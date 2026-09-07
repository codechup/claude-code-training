---
id: P28
title: "L3 Advanced module: MCP (m11-mcp)"
milestone: M2
status: review
owner: opus-p28-2026-09-07
branch: plan/28-l3-m11-mcp
model_hint: opus
effort_hint: high
depends_on: [P24]
owned_paths:
  - content/en/l3-advanced/m11-mcp/**
  - content/tr/l3-advanced/m11-mcp/**
  - content/_shared/transcripts/m11-mcp/**
shared_paths:
  - content/_shared/sources.json
estimate: L
updated_at: 2026-09-07T19:09:00Z
open_questions:
  - "Lab repo (P22 owns it): the `.mcp.json` shipped at tags lesson/m11-03-start..m11-06-start launches `@modelcontextprotocol/server-github`, which npm marks deprecated ('Package no longer supported', version 2025.4.8). The live docs teach the remote HTTP server at https://api.githubcopilot.com/mcp/ with a PAT header. Suggest re-tagging with an HTTP `github` entry using `${GITHUB_TOKEN}` in a header."
  - "Lab repo (P22 owns it): `node src/cli.ts done <id>` rejects the 8-character id prefix that `node src/cli.ts list` prints, and exits with an unhandled InvalidTaskError stack trace rather than a message. Not listed in BUGS.md as a seeded defect; if unintended, worth a fix or a BUGS.md entry."
  - "research/ owner: expand the MCP row of research/feature-inventory.md (line 37) — see Handoff notes for the specific gaps." 
---

## Goal

Author every lesson of MCP (`m11-mcp`), the 7-lesson next module of Advanced (l3-advanced), in English: the reader connects three real MCP servers, then writes and connects their own minimal server, and finishes able to reason about MCP supply-chain risk. Each lesson follows the fixed template (D006): Objectives + prerequisites, When NOT to use, Concept, Hands-on lab, Anti-patterns, Quiz, Sources. Every command shown was actually run against the lab repo and every claim is backed by real output (D093) — this plan produces no lesson content from memory alone.

## Context

Read first: `docs/CURRICULUM.md` (P03) — it is the **authoritative** source for this module's final lesson slugs, objectives, and order; the lesson list below is the floor the approved plan set, not a ceiling. Also read `research/feature-inventory.md` and `research/deprecations.md` (P03) for what is current vs. "Changed" as of `verified_version: 2.1.263`; `content/_shared/sources.json` (P23) for the vetted source list to pull from and append to; `.claude/rules/content.md`, `.claude/skills/new-lesson/SKILL.md` and the `lesson-researcher`/`lesson-writer`/`fact-checker`/`reviewer` agents (all P11) for the exact authoring workflow; `content/schema.ts` (P06) for the frontmatter zod schema; `docs/design/CANVAS.md` and `/design/` (P05) for the lesson-page visual reference; and the outline text this module was scoped from:

> `m11-mcp`: MCP concepts & transports · add/list/remove, scopes, OAuth (labs: GitHub, Playwright/Chrome, SQLite/Postgres) · writing a minimal MCP server with the TS SDK (lab) · MCP security & supply chain

No lesson in this module exists yet; `content/en/l3-advanced/m11-mcp/**` starts from the level/module `index.mdx` stub P06 created.

Decisions this module leans on beyond the shared pipeline decisions below: (D057).

## Scope

In:
- 7 lesson files under `content/en/l3-advanced/m11-mcp/`, numbered `01-`…`07-`, each a complete MDX file following D006's seven sections.
- The matching Turkish draft stub for each lesson under `content/tr/l3-advanced/m11-mcp/` (`draft: true`, created by the `/new-lesson` skill in the same commit as the EN lesson — D016, D018; P25/P26/P40/P41 translate it later, never this plan).
- One raw lab transcript per lesson with a hands-on lab, saved under `content/_shared/transcripts/m11-mcp/`, plus the simplified `<Transcript>` rendering embedded in the lesson (D099).
- This module's entries appended to `content/_shared/sources.json` (D041, D043; append-only — never rewrite another module's entries).
- Updating `l3-advanced/index.mdx` and `m11-mcp/index.mdx` module-index copy if this module's final lesson list differs from the stub P06 left (rare; only if `docs/CURRICULUM.md` changed the outline).

Out: Turkish translation of these lessons (P25/P26/P40/P41 own `content/tr/l3-advanced/m11-mcp/**` after this plan hands it off); any other module's content; MDX component code (P07/P08 own those; if a lesson needs a component that does not exist, write it into `open_questions` and do not build it here); changes to `content/schema.ts`, `src/lib/nav.ts`, or any route/layout file; the lab repo itself (P22 owns `codechup/claude-code-lab`; this plan clones and runs it, never edits it in place — a bug fix needed there goes into `open_questions` naming the tag).

## Deliverables

- `content/en/l3-advanced/m11-mcp/NN-<slug>.mdx` (7 files):
01. **MCP concepts and transports** — `01-mcp-concepts-and-transports.mdx`
02. **Adding, listing, and removing servers: scopes and OAuth** — `02-add-list-remove-scopes-and-oauth.mdx`
03. **The GitHub MCP server** — `03-github-mcp.mdx` (hands-on lab: connecting and using the GitHub MCP server)
04. **The Playwright/Chrome MCP server** — `04-playwright-chrome-mcp.mdx` (hands-on lab: browser automation over MCP)
05. **A database MCP server** — `05-sqlite-postgres-mcp.mdx` (hands-on lab: querying SQLite/Postgres over MCP)
06. **Writing a minimal MCP server** — `06-writing-a-minimal-mcp-server.mdx` (hands-on lab: a hand-written MCP server with the TypeScript SDK)
07. **MCP security and supply chain** — `07-mcp-security-and-supply-chain.mdx`
- `content/tr/l3-advanced/m11-mcp/NN-<slug>.mdx` (7 files) — `draft: true` stubs with EN frontmatter fields carried over and `title`/`description` left in English (translation is not this plan's job; the stub exists so routing/parity gates pass).
- `content/_shared/transcripts/m11-mcp/NN-<slug>.md` — one per lesson that has a hands-on lab, containing the raw terminal transcript.
- Updated `content/_shared/sources.json` with this module's sources block entries.

## Acceptance criteria

- `node scripts/content-gate.ts` passes for this module: every lesson's frontmatter validates against `content/schema.ts`, every code fence has a language tag, EN/TR path parity holds (the TR draft exists at the same slug), and `level`/`module` in frontmatter match the file path.
- Every lesson has `verified_version: 2.1.263` and a non-empty `sources` array with at least one `type: "doc"` entry whose URL was fetched successfully by `/verify-sources` (D041, D043) — paste the WebFetch/lychee evidence in the PR.
- Every lesson with a hands-on lab has a transcript file under `content/_shared/transcripts/m11-mcp/` whose content matches, verbatim, a real run of the commands shown in the lesson (D093, D099) — no lesson may show output that was not captured this way.
- `npm run typecheck && npm run lint && npm test` pass; `npm run build` succeeds and `dist/en/l3-advanced/m11-mcp/` contains 7 lesson pages plus the index.
- `npx playwright test e2e/lesson.spec.ts` passes against at least one lesson in this module (axe: 0 serious/critical violations at 390 px and 1280 px).
- The `fact-checker` agent's report (pasted into the PR) shows no unresolved discrepancy against `research/feature-inventory.md`; the `reviewer` agent's report confirms the D006 template order and the evidence rule on every lesson.

## Steps

1. Read `docs/CURRICULUM.md` §m11-mcp and confirm the lesson list/order below still matches; if it drifted, follow the doc, not this plan, and note the delta in Handoff notes.
2. Run the `lesson-researcher` agent once per lesson (D098): official doc URL(s) + 2–3 web/YouTube sources, summarized against `research/feature-inventory.md`; save nothing permanent yet, this feeds step 4.
3. Clone `codechup/claude-code-lab` (P22) into a scratch directory; for every lesson with a hands-on lab, check out its start tag (`lesson/m11-mcp-NN-start`), do the exercise for real, and capture the full terminal transcript.
4. Write each lesson MDX with `/new-lesson l3-advanced/m11-mcp/<slug>` (creates the EN file and the TR draft stub together); fill Objectives, When NOT to use, Concept (grounded in the researcher's summary, never invented), Hands-on lab (the exact commands from step 3), Anti-patterns, Quiz, Sources.
5. Save the raw transcript from step 3 under `content/_shared/transcripts/m11-mcp/NN-<slug>.md`; embed the simplified version with the `<Transcript>` component (P07) in the lesson.
6. Append this lesson's sources to `content/_shared/sources.json` (P23's schema); run `/verify-sources content/en/l3-advanced/m11-mcp/NN-<slug>.mdx` to stamp `verified_at`.
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

A reviewer opens `npm run dev`, visits each of the 7 lessons at `/en/l3-advanced/m11-mcp/<slug>/`, confirms the OS tabs, transcript, quiz, and sources block render, spot-checks two Sources links by hand, and reads the fact-checker/reviewer agent reports pasted in the PR before merging.

## Handoff notes

**Shipped.** 7 EN lessons under `content/en/l3-advanced/m11-mcp/`, 7 TR `draft: true` stubs (translated title/description + a Turkish summary paragraph with glossary links, per the content-plan brief), 22 real transcripts under `content/_shared/transcripts/m11-mcp/<NN-slug>/`, and 3 new `repo` entries plus one module tag appended to `content/_shared/sources.json` (additive diff only).

**Deltas from this plan's text** (CURRICULUM and the standing brief win, per the brief's step 1):

- **Slugs.** `docs/CURRICULUM.md` §2 names `01-mcp-concepts`, `02-add-list-remove-scopes`, `03-github-mcp`, `04-browser-mcp`, `05-database-mcp`, `06-write-your-own-server`, `07-mcp-security`. This plan's Deliverables listed longer names; the CURRICULUM slugs shipped.
- **Transcript layout.** The brief's `content/_shared/transcripts/<module>/<NN-slug>/<kk>-<name>.txt` with a `# ` provenance header, not this plan's single `NN-<slug>.md`.
- **TR stubs.** The brief asks for a translated title and a one-paragraph Turkish summary; this plan said leave them English. The brief was followed.

**Labs — what was actually run** (D093/D099). Every command was executed on 2026-09-07 against Claude Code 2.1.263, Node 24.18.0, Windows 11 + Git Bash, in throwaway copies of the `lesson/m11-0N-start` trees; every MCP server added at `--scope local` was removed afterwards, so this machine's `~/.claude.json` is unchanged. No real credential was used and nothing was created on any remote service: lesson 03 adds GitHub's documented HTTP server with a visibly fake token and captures the server's own `HTTP 400` rejection, plus Sentry's `! Needs authentication` for contrast. Lesson 04 runs a real browser against a local static page on port 4429. Lesson 05 runs a real `@bytebase/dbhub` server over a scratch SQLite file and captures both a real query and a real `READONLY_VIOLATION`. Lesson 06 writes, hand-verifies and calls the lab's own TS server.

**Drift found against the live docs and packages:**

- `@modelcontextprotocol/server-github` (version `2025.4.8`) is marked deprecated on npm ("Package no longer supported"). The lab tags `m11-03`..`m11-06` ship a `.mcp.json` whose `github` entry launches it over stdio. The lessons teach the documented remote HTTP server (`https://api.githubcopilot.com/mcp/`) instead and carry a "Changed" callout. See `open_questions`.
- DBHub's `--readonly` flag is gone: it now errors with `--readonly flag is no longer supported. Use dbhub.toml with [[tools]] configuration instead:`. Lesson 05 teaches the `dbhub.toml` form and carries a "Changed" callout. The docs' PostgreSQL example (which does not use `--readonly`) is unaffected.
- A relative SQLite DSN (`sqlite://file.db`) connects successfully but against an empty database; the absolute `sqlite:///…` form is required. Taught as the lesson's headline failure mode.
- The MCP TypeScript SDK's stable line is now v2 (`@modelcontextprotocol/server`, Standard Schema, 2026-07-28 spec); the lab's server is 1.x. Lesson 06 teaches the 1.x code that was run and carries a "Changed" callout.
- `research/feature-inventory.md`'s MCP row (line 37) is accurate but much thinner than the live `mcp.md` — it omits scope precedence, tool-search defaults, `MCP_TIMEOUT`/`MAX_MCP_OUTPUT_TOKENS`, `claude mcp login`/`logout`, `managed-mcp.json` and the `anthropic/requiresUserInteraction`/`maxResultSizeChars` annotations, all of which these lessons take from direct doc fetches. Worth expanding by whichever plan owns `research/`.
- Lab tags `lesson/m11-02-start`..`m11-06-start` were pushed to `origin` during this session and were verified present with `git ls-remote --tags` before commit.

**Review counts.** `fact-checker`: 0 claims contradicted across all 7 lessons; ~19 flagged "unverifiable" purely because that session's `WebFetch` was denied `github.com` and `npmjs.com` — every one of them was verified in this session by direct `curl` of the SDK README, `npm view`, or the lesson's own real command output, and the two it thought unsourced ("2 KB truncation of tool descriptions and server instructions", "no fixed per-server tool cap") are both in `mcp.md`'s tool-search section. `reviewer`: 3 blockers + 2 majors + 4 minors, all fixed — "Changed" callouts moved to their D006 slot after Anti-patterns (matching the m01/m07 precedent; no `## Changed` heading exists anywhere in this repo), lesson 01's lab and OS tabs rewritten to the server the recording actually used, lesson 06 step 8 given the `--mcp-config`/`--strict-mcp-config` flags that were really run plus a step creating that file, TR stubs given glossary links, the `--settings en.json` provenance line added to the eight headless recordings, and the example token changed to `EXAMPLE-TOKEN-DO-NOT-COMMIT` (re-captured, not edited) so no `sk-`-shaped string ships.

**Two lab steps were rewritten because reality disagreed with the draft.** Narrowing lesson 04's allowlist to `browser_navigate` alone still answers a console-error question, because that tool's own result carries the snapshot and the console messages — so the step now teaches that, with a second capture showing what a genuinely blocked MCP tool looks like. And lesson 05's read-only proof needed an explicit instruction: on a plainer prompt the model refused the `DELETE` on its own judgement before the server's guard was ever exercised.


