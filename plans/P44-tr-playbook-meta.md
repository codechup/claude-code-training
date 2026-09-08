---
id: P44
title: "TR translation: Playbook and Meta"
milestone: M3
status: in_progress
owner: sonnet-p44
branch: plan/44-tr-playbook-meta
model_hint: sonnet
effort_hint: medium
depends_on: [P40, P41, P42, P43]
owned_paths:
  - content/tr/playbook/**
  - content/tr/meta/**
shared_paths: []
estimate: M
updated_at: 2026-09-08T02:39:43Z
open_questions: []
---

## Goal

Translate the Playbook and Meta sections into Turkish, flip every page's `draft: true` to `false`, and give `content/tr/playbook/glossary.mdx` its final, edited form — merging the incremental entries P25, P26, P40, and P41 each appended while translating their own levels into one coherent, well-ordered glossary page that also reflects the structure of the newly-translated English glossary (P42).

## Context

Read `content/en/playbook/**` and `content/en/meta/**` (P42/P43, both `done`) as the translation source; `content/tr/playbook/glossary.mdx` as it stands after P25/P26/P40/P41's appends — read it in full before touching it, since this plan's job is to edit and finalize it, not append blindly like the earlier plans did. `.claude/rules/i18n.md` and the `translator` agent (P11) for the terminology policy (D016, D018) — identical rules to every other TR plan. This plan depends on P40 and P41 (not only P42/P43) specifically because they are the last two plans to append to the shared glossary stub; running before either finishes risks losing or conflicting with their appends.

## Scope

In:
- Full Turkish translation of `content/tr/playbook/{index,decision-trees,best-practices,anti-patterns,changelog}.mdx` from their English sources, `draft: false`.
- `content/tr/playbook/glossary.mdx`: edited into final form — every term from `content/en/playbook/glossary.mdx` has a Turkish entry (reusing/refining what P25/P26/P40/P41 already appended rather than rewriting from scratch), organized in the same order as the English glossary, with working links back to the Turkish lessons that introduce each term (not the English ones — fix any link left pointing at an EN lesson from an earlier plan's append).
- Full Turkish translation of `content/tr/meta/{index,how-this-site-was-built,contributing,sources-index}.mdx`, `draft: false` — `how-this-site-was-built.mdx`'s repository links stay as-is (a GitHub repository link does not need translation; only the surrounding prose does).

Out: touching any `content/en/**` file; re-litigating a glossary entry's technical accuracy (if one looks wrong, flag it in `open_questions` naming which earlier plan appended it, do not silently rewrite the technical claim — only its phrasing/organization is this plan's job).

## Deliverables

`content/tr/playbook/{index,decision-trees,best-practices,anti-patterns,glossary,changelog}.mdx`, `content/tr/meta/{index,how-this-site-was-built,contributing,sources-index}.mdx`, all `draft: false`.

## Acceptance criteria

- `node scripts/content-gate.ts` passes: full EN/TR parity across Playbook and Meta, zero remaining `draft: true`.
- Every glossary entry links to a real Turkish lesson URL (not an English one) — verified with `lychee`.
- `content/tr/playbook/glossary.mdx`'s term order matches `content/en/playbook/glossary.mdx`'s term order (a reader flipping between languages should find the same term in roughly the same place).
- The `reviewer` agent's report (D071) on the whole translated set shows no template-order or terminology-policy violation.
- `npx playwright test e2e/a11y.spec.ts` against the nine translated pages passes at both viewports.

## Steps

1. Read `content/tr/playbook/glossary.mdx`'s current state in full; diff its term list against `content/en/playbook/glossary.mdx`'s.
2. Run `/translate-lesson` (or a direct pass with the `translator` agent) against each Playbook and Meta page; for the glossary specifically, merge rather than re-append — edit existing entries into final phrasing and add any term the English page has that the Turkish stub is still missing.
3. Fix every glossary link to point at the Turkish lesson URL, not the English one.
4. Flip every page `draft: false`.
5. Run the `reviewer` agent over the full set; fix everything it flags.
6. Run the full local gate, `lychee`, and the axe check; paste results into the PR.

## Tests required

`content-gate.ts` (parity, no stray drafts); `lychee` on glossary links; `e2e/a11y.spec.ts` against all nine pages.

## Non-goals / pitfalls

- Do not silently rewrite a glossary entry's technical meaning — only its Turkish phrasing and its position in the page; a substantive correction goes into `open_questions` naming which plan's append it corrects.
- Do not leave any glossary link pointing at an English lesson URL — every link in the Turkish glossary must resolve to the Turkish lesson.
- Do not translate a GitHub repository link's URL itself (URLs never change) — only the surrounding sentence.

## Verification

A reviewer opens the Turkish Playbook and Meta pages, compares the glossary's term order against the English version, clicks three glossary links to confirm they land on Turkish lessons, and reads the `reviewer` agent's report.

## Handoff notes

- _Filled by the executing session: what changed, decisions, follow-ups, blockers._
