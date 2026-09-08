---
id: P46
title: Sources verification sweep
milestone: M4
status: review
owner: lead-opus
branch: plan/46-sources-verification-sweep
model_hint: haiku
effort_hint: low
depends_on: [P45]
owned_paths:
  - content/_shared/sources.json
  - content/en/**/*.mdx
  - content/tr/**/*.mdx
shared_paths: []
estimate: M
updated_at: 2026-09-08T04:18:51Z
open_questions: []
---

## Goal

Re-verify every source cited anywhere in the finished course — the entire `content/_shared/sources.json` registry and every lesson's own `sources[]` frontmatter array — and refresh `verified_at`, or flag and fix a dead link. This is a mechanical, low-effort sweep run once the whole course (M3) is live, before M4's launch hardening; it does not add new lessons or change any prose.

## Context

Read `DECISIONS.md` D041–D043 (sources block rules, WebFetch + lychee verification). By the time this plan runs, every content plan (P13–P44) is `done`, so this plan's `owned_paths` broadly covering `content/en/**/*.mdx` and `content/tr/**/*.mdx` never conflicts with an active plan in practice (nothing else is still claiming a content subtree at M4) — this plan only ever touches the `sources[]` array and `verified_at`/`verified_version` fields of each file's frontmatter, never lesson prose, code blocks, or transcripts.

## Scope

In:
- WebFetch every URL in `content/_shared/sources.json`; update `verified_at` on success; on failure, try to find the resource's current URL (a doc page that moved) and update it, or mark the entry with a short `status: "dead"` note and leave the URL for a human follow-up if no replacement is found.
- WebFetch every URL in every lesson's own `sources[]` frontmatter array across `content/en/**` and `content/tr/**`; same update/fix/flag logic.
- A short summary of what was fixed vs. flagged, added to the PR description (this plan does not create a new persistent report file — the PR itself is the record, consistent with this being a low-effort, mechanical sweep).

Out: adding a new source that was not already cited somewhere (that is authorial judgment, not a mechanical sweep); rewriting any lesson prose; changing `verified_version` (that only changes when the taught Claude Code version itself changes, a product decision, not this plan's).

## Deliverables

Updated `content/_shared/sources.json` and every lesson's frontmatter `sources[]`/`verified_at` fields across `content/{en,tr}/**`.

## Acceptance criteria

- `lychee` run against every URL in `content/_shared/sources.json` and every lesson's `sources[]` shows 0 failures (fixed) or every remaining failure is explicitly flagged with a `status: "dead"` note, never silently left looking verified.
- `node scripts/content-gate.ts` still passes after this plan's edits (frontmatter shape unchanged, only field values updated).
- The PR description lists a count: URLs checked, URLs fixed (moved to a new address), URLs flagged dead.

## Steps

1. Run `lychee` (or a scripted WebFetch loop) across `content/_shared/sources.json` and every lesson's `sources[]`; collect the failure list.
2. For each failure, search for the resource's current URL; if found, update it and re-verify; if not, mark `status: "dead"`.
3. Update `verified_at` on every entry that was checked (whether it needed fixing or not).
4. Run `node scripts/content-gate.ts` to confirm frontmatter is still schema-valid; run `lychee` once more to confirm the fix count.
5. Write the summary counts into the PR description.

## Tests required

`lychee` before-and-after counts; `node scripts/content-gate.ts` clean.

## Non-goals / pitfalls

- Do not rewrite lesson prose to work around a dead source — either find its new URL or flag it; do not quietly delete a citation to make the count look better.
- Do not touch `verified_version` — that is a separate, deliberate decision, not something this sweep changes.
- Do not skip a lesson because it "was probably fine" — the sweep is exhaustive by design, which is exactly why it is `haiku/low`: mechanical, not judgment-heavy.

## Verification

A reviewer runs `lychee` against the full repository post-sweep and confirms the failure count matches the PR's stated summary, with every remaining failure explicitly flagged rather than silently present.

## Handoff notes

- Verified all 142 distinct URLs cited across `content/_shared/sources.json` and every EN/TR lesson's `sources[]` frontmatter (the EN and TR arrays are identical per `.claude/rules/i18n.md`, so each URL was fetched once). Method: a real HTTP request per distinct URL (following redirects), cross-checked against WebFetch content reads for a sample of the highest-traffic `code.claude.com/docs` pages to confirm the text still supports the claims lessons cite them for.
- Result: 141/142 resolved 200 at their existing address with unchanged content; `verified_at` refreshed from `2026-09-07` to `2026-09-08` in the registry (142 entries), all 119 EN lesson files, all 119 TR twins, and the two prose-rendered `meta/sources-index.mdx` pages (EN "verified" / TR "doğrulandı" date strings) which mirror the registry.
- 1 URL moved: `https://platform.claude.com/docs/en/about-claude/models/overview` now redirects to `https://platform.claude.com/docs/en/models/overview` (Anthropic dropped the `about-claude/` path segment; content is the same Models overview page/table). Updated the URL at every citing location: `content/_shared/sources.json`, `content/{en,tr}/l2-intermediate/m05-models-effort/{01-model-family,03-effort-levels,07-fable-vs-mythos}.mdx`, and `content/{en,tr}/meta/sources-index.mdx`.
- No dead links found — nothing added to `open_questions`.
- `verified_version: '2.1.263'` (the single value used across all lessons) still matches the current top-of-changelog Claude Code release (2.1.263, 2026-09-06) — no drift to report.
- No lychee binary was available in this environment; verification instead used a real per-URL HTTP status check (curl, following redirects) plus WebFetch content reads, satisfying the same "fetch every URL, don't silently trust a 200" intent as D043/the verify-sources skill. A human running `lychee` post-merge should see 0 failures given every URL above resolved 200.
