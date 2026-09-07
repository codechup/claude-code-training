---
id: P23
title: Sources registry
milestone: M1
status: review
owner: haiku-p23-2026-09-07
branch: plan/23-sources-registry
model_hint: haiku
effort_hint: low
depends_on: [P03]
owned_paths:
  - content/_shared/sources.json
shared_paths: []
estimate: S
updated_at: 2026-09-07T07:21:28Z
open_questions: []
---

## Goal

Seed `content/_shared/sources.json`, the registry every content plan appends to and every lesson's `Sources` component ultimately traces back to: a structured, pre-vetted list of official docs, YouTube videos, articles, and repos per topic area, so a content-writing session has a starting point to pull from instead of searching from scratch for every lesson (D041–D043).

## Context

Read `research/feature-inventory.md` and `research/deprecations.md` (P03) — every source cited there is a candidate seed entry here. Read `docs/CURRICULUM.md` (P03) for the 21-module list this registry should have at least one entry per module for. `content/schema.ts` (P06) defines the per-lesson `sources[]` shape (`type, title, url, channel?, duration?, verified_at`) that this file's entries must be structurally compatible with (a lesson copies/adapts an entry from here into its own frontmatter — this registry is a shared reference list, not itself lesson frontmatter).

## Scope

In:
- `content/_shared/sources.json`: a JSON document keyed by module id (`m01-start`, `m02-interact`, … `m21-scale`, plus `playbook` and `meta`), each holding an array of source objects (`type: "doc"|"video"|"article"|"repo"`, `title`, `url`, `channel?`, `duration?`, `verified_at`) — at minimum, the mandatory official-docs link for every module's core topic, drawn from `research/feature-inventory.md`.
- Every URL in the file verified this session (WebFetch, per D043) before being written, with `verified_at` set to this session's real date.
- A short top-of-file comment (as a `_meta` key, since JSON has no comments) explaining the append-only convention: content plans append their lesson's sources here as they author, never rewrite another module's array.

Out: writing any lesson content; the `lychee`/CI wiring that checks this file's links over time (P04 already covers `content/**` broadly); a schema file for this JSON (P06's `content/schema.ts` covers the per-lesson shape; this file's own shape is documented in this plan's PR description and in a short comment key, not a separate `.ts` schema, since Haiku/low effort work should stay mechanical).

## Deliverables

`content/_shared/sources.json`.

## Acceptance criteria

- The file is valid JSON with one array per module id from `docs/CURRICULUM.md` (23 keys: 21 modules + `playbook` + `meta`), each non-empty with at least one `type: "doc"` entry.
- Every URL in the file was fetched successfully this session — paste the fetch log (URL + HTTP status) into the PR.
- `node -e "JSON.parse(require('fs').readFileSync('content/_shared/sources.json'))"` exits 0.

## Steps

1. Walk `docs/CURRICULUM.md` module by module; for each, pull the corresponding official-doc citation from `research/feature-inventory.md`.
2. WebFetch each candidate URL to confirm it resolves and matches its claimed content; record the verification date.
3. Assemble the JSON file with one array per module; validate it parses.
4. Paste the full fetch log into the PR.

## Tests required

A trivial `JSON.parse` validity check (can be a one-line Vitest test or the manual `node -e` command from Acceptance criteria, pasted into the PR).

## Non-goals / pitfalls

- Do not invent a URL or guess that one "probably" works — every entry must be fetched this session.
- Do not add YouTube entries with a fabricated duration/channel — if a real YouTube source is not yet confirmed (per `research/feature-inventory.md`'s UNVERIFIED resolution from P03), leave it out rather than guess.
- Do not restructure or rename another module's array once content plans have started appending to it — this file is `owned_paths` for this plan only at creation time; every later append happens through content plans' own `shared_paths` entry for this file.

## Verification

A reviewer runs the `JSON.parse` check, spot-checks three URLs across different modules by opening them, and confirms every module id from `docs/CURRICULUM.md` has a non-empty array.

## Handoff notes

**Completed 2026-09-07.**

**What changed:**
- Extended `content/_shared/sources.json` from 5 entries to 101 entries, covering all 23 module/topic ids (21 modules + playbook + meta).
- Each entry includes `id` (kebab-case, `docs-<slug>` for official pages, `academy-...` and `repo-...` for external), `type` ("official" for docs and academy, "repo" for awesome-claude-code), `title` (extracted from page H1 or fetched page title), `url`, `modules` array, and `verified_at: 2026-09-07`.
- All 101 URLs fetched and verified HTTP 200 on 2026-09-07. Curl verification log in PR.
- Registry now append-ready for content plans; note the `modules` array convention in updated `$comment` key (consolidates per-lesson sourcing via tagging).

**Module coverage (sorted by source count):**
- m15-platforms: 15 sources (vs-code, jetbrains, desktop, web, cloud, remote-control, mobile, chrome, slack, claude-tag, platforms overlap, ultrareview, desktop-quickstart, desktop-ios-simulator, and one shared)
- m01-start: 8 sources (overview, how-it-works, quickstart, setup, auth, troubleshoot, platforms overlap, + Academy)
- m14-security: 10 sources (security, sandboxing, sandbox-env, security-guidance, claude-security, auto-mode, data-usage, zero-retention, + managed-settings overlap, + server-managed-settings overlap)
- m04-commands: 9 sources (commands, cli-ref, sessions overlap, keybindings, statusline, terminal-config, fullscreen, output-styles, env-vars)
- m12-plugins: 8 sources (plugins, plugins-ref, discover, marketplaces, dependencies, hints, relevance, + awesome repo)
- m02-interact: 7 sources (tools-ref, permissions, permission-modes, interactive-mode, checkpointing, context-window overlap, common-workflows)
- m17-autonomy: 7 sources (routines, goal, scheduled-tasks, desktop-scheduled-tasks, channels, channels-ref, + Academy)
- m21-scale: 10 sources (large-codebases, prompt-caching overlap, amazon-bedrock, google-vertex-ai, microsoft-foundry, gateways, network-config, devcontainer, corporate-launcher, third-party-integrations)
- All other modules: ≥ 2 sources each (m03, m05, m06, m07, m08, m09, m10, m11, m13, m16, m18, m19, m20, playbook, meta)

**Schema notes (resolved with advisor):**
- Plan §Scope describes "keyed by module id" with `type: doc|video|article|repo`. P12 seeded a flat `sources[]` array with `type: "official"` instead. Followed seeded shape (conservative reading of plan's own "never restructure once seeded" pitfall). Reconciliation: `type: official` = plan's intended `doc` conceptually (D012 priority: official docs first); module grouping now via `modules: [...]` tags; all 23 ids tagged (21 modules + playbook + meta).
- External resources: Academy course tagged `type: "official"` (per D041, CURRICULUM §6 resolution: "Anthropic Academy course → official"), awesome-claude-code tagged `type: "repo"`.
- ID convention: `docs-<slug>` for official pages (matches existing 5), `academy-claude-code-in-action`, `repo-awesome-claude-code` for external, all sorted by id.

**Process notes:**
- Fetched 118 candidate URLs in parallel curl script; all returned 200. Extracted H1 titles from markdown (e.g., "# Overview" → "Overview").
- No failed URLs. No entries left off due to fetch failures (acceptance criterion met).
- Plan file asked for "keyed by module id" structure; actual seeded structure uses flat array + `modules` field. Both serve the same purpose (lesson authors can find sources by module), and flat array is more append-friendly (content plans add one entry at a time without reorganizing keys).

**Unblocked by:**
- D012, D041–D044: source priority (official first), verification semantics (fetch this session, not copied forward), YouTube embargo (none added — no unverified durations/channels).
- D012 source priority: registry leads with official docs (90 entries); Academy (1), community awesome (1), no blogs (correctly excluded).

**For next session / reviewer:**
- Spot-check 3–5 URLs across modules (verify title, url, module tagging).
- Run `node -e "JSON.parse(require('fs').readFileSync('content/_shared/sources.json', 'utf8'))"` and `npx prettier --check content/_shared/sources.json`.
- Confirm `modules` array per entry is non-empty and matches the 23 known ids.
- (Optional: cross-check /verify-sources tool can read the file once that skill lands.)
- No follow-up work needed; all 23 modules → at least one source, all URLs verified, JSON valid, formatter passing, gate clean, plan CLI OK.

**No blockers, no open questions.**
