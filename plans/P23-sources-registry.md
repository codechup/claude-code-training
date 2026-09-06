---
id: P23
title: Sources registry
milestone: M1
status: todo
owner: null
branch: plan/23-sources-registry
model_hint: haiku
effort_hint: low
depends_on: [P03]
owned_paths:
  - content/_shared/sources.json
shared_paths: []
estimate: S
updated_at: 2026-09-06T00:00:00Z
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

- _Filled by the executing session: what changed, decisions, follow-ups, blockers._
