---
id: P44
title: "TR translation: Playbook and Meta"
milestone: M3
status: review
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
updated_at: 2026-09-08T03:18:05Z
open_questions:
  - >-
    The "ajan" calque for agent survives in eight TR module index.mdx files outside this
    plan's owned_paths (content/tr/l1-beginner/m01-start/index.mdx,
    content/tr/l2-intermediate/m06-skills/index.mdx, content/tr/l3-advanced/index.mdx,
    content/tr/l3-advanced/m10-subagents/index.mdx,
    content/tr/l3-advanced/m13-headless-ci/index.mdx,
    content/tr/l3-advanced/m14-security/index.mdx, content/tr/l4-master/index.mdx,
    content/tr/l4-master/m16-orchestration/index.mdx) plus one lesson body
    (content/tr/l4-master/m16-orchestration/01-workflows.mdx) and one module title itself
    (content/tr/l2-intermediate/m09-prompting/index.mdx title "Ajanlar için prompt
    yazmak"). P44's owned_paths cover only content/tr/playbook/** and content/tr/meta/**,
    so these were left untouched per D048 (never edit another plan's files) rather than
    fixed silently. A follow-up plan with owned_paths over those index files should
    replace "ajan" with "agent" plus a Turkish gloss on first use, matching the merged
    TR lessons in the same modules.
  - >-
    Five glossary terms (canvas, connector, devcontainer, gateway, teammate) are used by
    merged TR L4/L3 lessons but have no English twin in content/en/playbook/glossary.mdx.
    Added as a TR-only "Ek terimler" section per .claude/rules/i18n.md's rule for
    encountering an unglossed term; proposing EN twin entries for P42/P43's owning plan
    (or a follow-up) to add to the English glossary in the same order.
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

**What changed.** Full Turkish translation of all 6 Playbook pages and all 4 Meta pages
against the merged English sources (P42, P43): `index`, `decision-trees`,
`best-practices` (93 practices), `anti-patterns` (141 anti-patterns), `glossary`,
`changelog` (25 changed-since-2025 entries) under `content/tr/playbook/`, and `index`,
`how-this-site-was-built`, `contributing`, `sources-index` (142-source registry, 23
modules) under `content/tr/meta/`. None of these pages use the lesson `draft` mechanism
(confirmed: `src/content/schema.ts` documents Playbook/Meta as "not lessons and
deliberately not subject to the draft mechanism"), so there was no `draft: true` to flip.

**Glossary.** Rebuilt `content/tr/playbook/glossary.mdx` from scratch in the English
glossary's term order (58 terms + the "Terms that mean something else" trio), reusing
every one of P25/P26/P40/P41's 46 existing Turkish definitions (light editing only, no
technical rewrites) and adding Turkish definitions for the 12 EN terms the stub was
missing (agent team, channel, CLAUDE.md, fast mode, goal, lab, monitor, prompt caching,
prompt injection, session, slash command, ultracode). Every one of the 58 entries now
links to the Turkish lesson that introduces it (previously the stub had zero lesson
links) — all 58 target files were confirmed present and `draft: false` before linking.
Added a TR-only "Ek terimler" section for 5 terms lessons use but the English glossary
does not yet define (canvas, connector, devcontainer, gateway, teammate) — see
`open_questions`.

**Terminology decided (per the coordinator's follow-up questions, matching the merged TR
L1–L4 lessons rather than a fresh preference):** *teammate* stays English with Turkish
suffixes (`teammate'ler`, `teammate'in`), matching the majority pattern across
m10-subagents and m16-orchestration — one lesson (`03-agent-teams-messaging.mdx`) glosses
it the other way round ("takım arkadaşının (teammate)") on its very first use only; that
looks like a one-off, not the convention, so it was not followed. *connector* stays
English, matching `m17-autonomy/02-routines.mdx`'s consistent usage (a few `m11-mcp`/
`m15-platforms` lessons use "bağlayıcı" instead — flagged, not fixed, out of owned_paths).
*repository* and *environment* are translated (`depo`, `ortam`) — this is the overwhelming
majority usage across L1–L4 lessons already merged.

**Link/anchor verification (mechanical, before and after).** Before touching the
glossary: extracted every `playbook/glossary/#anchor` reference across all of
`content/tr/**` (46 anchors) and confirmed each already had a matching `###` header in
the old stub — baseline had zero broken anchors. After the rewrite: re-extracted the same
46 references and confirmed every one still resolves against the rebuilt glossary's
generated heading ids (script-checked, see Verification below) — no anchor was
renumbered or removed. Also verified all 58 new lesson links in the glossary, and every
internal `/tr/...` link across all 10 translated files, resolve to a real `index.html` in
the built `dist/`, and that anchored links (`#agent-team` etc.) land on a real `id=`.

**DecisionTree components.** Per "component props stay byte-identical to the English
twin", all four `<DecisionTree>` invocations in `decision-trees.mdx` (node ids, `lines`,
`labels`, `title`, `desc`) were left completely unchanged from English — only the prose
paragraphs around them were translated. Verified with a script diff: all 4 blocks are
byte-identical EN vs. TR.

**Review pipeline.** `claude -p` delegating to the `reviewer` subagent
(`--permission-mode plan`) ran but the workspace-trust warning in this sandbox
("Ignoring 10 permissions.allow entries... this workspace has not been trusted") limited
it to a shallow pass that mostly flagged the then-unfilled Handoff notes rather than
producing the requested prioritised terminology/structure findings. Given that
limitation, this session ran the structural/terminology checks itself instead:
DecisionTree byte-identity (script diff, all 4 identical), internal-link/anchor
resolution (script check against `dist/`, zero broken), stray `/en/` links (grep, zero
found outside the one intentional EN-glossary cross-reference in `glossary.mdx` and the
untouched `DecisionTree` `desc` props), and a diacritics/ASCII-fication spot check
(none found). Counts: 0 broken anchors found, 0 broken internal links found, 0 stray
`/en/` page links found, 4/4 DecisionTree blocks byte-identical.

**Verification run (real output, this session, from the worktree root):**
`node tools/plan/cli.ts check` → `ok: 48 plans, frontmatter valid, DAG acyclic, no
owned_paths overlap, STATE.md fresh`. `npm run gate` → `content gate: OK (308 files
checked)`. `npm run typecheck` → `astro check`: 0 errors, 0 warnings, 7 pre-existing
hints unrelated to this change. `npm run lint` → eslint, `prettier --check` (after
`npx prettier --write` on the touched files), `check-no-inline-script`,
`check-public-hygiene`, `check-raw-colors` all OK. `npm test` → 187 tests passed across
22 files. `npm run build` → 313 pages built including all 10 translated routes, ending
`check-no-inline-script (dist): OK (313 files scanned)`. Temporary
`playwright.p44.config.ts` (port 4445) plus a temporary `e2e/p44-tr-playbook-meta.spec.ts`
covering all 10 translated routes ran 20 tests (10 routes × 2 viewports, 390/1280) — all
20 passed with zero serious/critical axe violations; both temporary files were deleted
afterwards.

**Follow-ups / blockers** — see `open_questions` for the two items a later plan should
pick up: the "ajan" calque in eight out-of-scope module `index.mdx` files (plus one
lesson body and one module title), and the five glossary terms proposed for the English
twin.
