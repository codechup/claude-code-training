---
id: P43
title: Meta section (EN)
milestone: M3
status: todo
owner: null
branch: plan/43-meta-en
model_hint: opus
effort_hint: high
depends_on: [P39]
owned_paths:
  - content/en/meta/**
shared_paths: []
estimate: M
updated_at: 2026-09-06T00:00:00Z
open_questions: []
---

## Goal

Build the English Meta section: "How this site was built" — the course's own worked example of everything it teaches, using this very repository's `.claude/` setup, plan files, and CI as the case study (D051) — plus a Contributing page and a Sources index. This is the one part of the course explicitly allowed, by design, to describe this project's own tooling in detail; it still never names or describes the owner's other, private projects (D026 still applies to its own text).

## Context

Read `CLAUDE.md`, `.claude/**` (P11, all `done`), `plans/README.md` and `plans/ROADMAP.md` (P02), `DECISIONS.md` in full — this page is a guided tour of all three, written for a reader who has finished the course and wants to see the pattern applied for real, not a re-explanation of the m18-multi-session lesson (P35) that already teaches the mechanics; this page is the case study, m18 is the lesson. `DECISIONS.md` D026 (never name or describe the owner's other, private projects) and D052 (public MIT repo — this page can and should link directly to the real repository, since it *is* that repository).

## Scope

In:
- `content/en/meta/index.mdx` (replace P06's placeholder with a real overview linking the three pages below).
- `content/en/meta/how-this-site-was-built.mdx`: a guided tour of `CLAUDE.md`, `.claude/rules/**`, the three hooks, four skills, five agents (P11); the plan-file system (`plans/`, `STATE.md`, `tools/plan/**`, P02); the CI/CD pipeline (P04/P10); and the design-canvas-first workflow (P00) — each with a real link into this repository (it is public, D052, so direct GitHub links are appropriate and encouraged here specifically). Written as narrative reflection ("here is what we built and why"), not a duplicate of m18-multi-session's mechanics lesson.
- `content/en/meta/contributing.mdx`: how an outside contributor would propose a fix or addition — the PR template, the plan-claim protocol as it applies to an external contributor (who cannot claim a plan the same way an internal session does, but can open an issue/PR against a `done` plan's content), the MIT licensing implication (D052) for any content they contribute.
- `content/en/meta/sources-index.mdx`: a single page aggregating every source cited anywhere in the course (drawing from `content/_shared/sources.json`, fully populated by this point) grouped by module, so a reader who wants "just the links" has one place to find them.

Out: `content/tr/meta/**` (P44); rebuilding or re-describing plan-tool mechanics already taught in m18-multi-session (P35) — link to that lesson instead of repeating it; anything about the owner's other private projects, even as an anonymized "inspired by" aside (D026 — say only that the pattern was "proven on a prior project," exactly as `DECISIONS.md` D045 itself is worded).

## Deliverables

`content/en/meta/{index,how-this-site-was-built,contributing,sources-index}.mdx`.

## Acceptance criteria

- `node scripts/content-gate.ts` passes for `content/en/meta/**`.
- `how-this-site-was-built.mdx` contains at least one real, working link into this repository for each of: `CLAUDE.md`, a rule file, a hook, a skill, an agent, a plan file, `STATE.md`, `ci.yml` — verified by `lychee` (internal repo links resolve; this requires the repository to actually be public and pushed, per D052 — if it is not yet public at authoring time, use relative repo-root paths and note in Handoff notes that `lychee`'s external-link check for these specific URLs should be re-run once the repo goes public).
- `contributing.mdx` correctly describes the actual PR template and plan-claim protocol as `plans/README.md` (P02) defines them — cross-check line by line, not from memory.
- `sources-index.mdx` groups every entry from `content/_shared/sources.json` by module and the count of entries shown matches the registry's real content.
- A grep for the owner's other private-project names or the forbidden infrastructure details (an IP address, an absolute server filesystem path) across all four files returns nothing.

## Steps

1. Read `CLAUDE.md`, `.claude/**`, `plans/README.md`, `plans/ROADMAP.md` end to end.
2. Draft `how-this-site-was-built.mdx`, linking directly into the repository for every concrete artifact mentioned; link to m18-multi-session rather than re-explaining plan mechanics.
3. Draft `contributing.mdx` against the actual PR template and plan protocol.
4. Draft `sources-index.mdx` by programmatically grouping `content/_shared/sources.json`'s entries by module (a small one-off script is fine, it does not need to persist).
5. Draft `index.mdx`'s overview; run the full local gate, `lychee`, and the forbidden-word grep from Acceptance criteria.

## Tests required

`content-gate.ts`; `lychee` on this plan's internal links; the forbidden-word grep from Acceptance criteria.

## Non-goals / pitfalls

- Do not re-teach plan-file mechanics that m18-multi-session already covers — link, don't duplicate.
- Do not describe or name the owner's other, private projects, even in passing — this page's greater latitude to talk about "this project's own tooling" does not extend to other projects.
- Do not let `sources-index.mdx`'s grouping logic silently drop an entry from `content/_shared/sources.json` — the count must match exactly.

## Verification

A reviewer opens all four Meta pages, clicks every internal repository link to confirm it resolves, cross-checks `contributing.mdx` against the real `plans/README.md`, and runs the forbidden-word grep themselves.

## Handoff notes

- _Filled by the executing session: what changed, decisions, follow-ups, blockers._
