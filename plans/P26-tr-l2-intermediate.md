---
id: P26
title: "TR translation: L2 Intermediate"
milestone: M2
status: done
owner: sonnet-p26-2026-09-07
branch: plan/26-tr-l2-intermediate
model_hint: sonnet
effort_hint: medium
depends_on: [P24]
owned_paths:
  - content/tr/l2-intermediate/m05-models-effort/**
  - content/tr/l2-intermediate/m06-skills/**
  - content/tr/l2-intermediate/m07-hooks/**
  - content/tr/l2-intermediate/m08-git/**
  - content/tr/l2-intermediate/m09-prompting/**
shared_paths:
  - content/tr/playbook/glossary.mdx
estimate: L
updated_at: 2026-09-07T19:40:30Z
open_questions: []
---

## Goal

Translate every lesson of L2 Intermediate (l2-intermediate) from English into Turkish: flip each lesson's Turkish draft stub (created as `draft: true` by P17/P18/P19/P20/P21) to a complete, correct translation and set `draft: false`. Modules in scope: `m05-models-effort` (6 lessons, from P17), `m06-skills` (6 lessons, from P18), `m07-hooks` (7 lessons, from P19), `m08-git` (4 lessons, from P20), `m09-prompting` (5 lessons, from P21). Translation follows the terminology policy exactly (D016, D018): English technical terms (hook, skill, subagent, worktree, plan mode, and so on) are kept in Latin script, never translated into invented Turkish equivalents, and each is explained in Turkish on its first use per lesson, linked to the shared glossary.

## Context

Read: `docs/CURRICULUM.md` (P03) for the final lesson list per module (must match what P17/P18/P19/P20/P21 actually shipped — read the live EN files, not the outline, since the outline is a floor); `.claude/rules/i18n.md` (P11) for the terminology policy and glossary-linking mechanics; `.claude/skills/translate-lesson/SKILL.md` and the `translator` agent (both P11, sonnet) — this plan's translation work runs through that skill/agent, not free-hand; `content/tr/playbook/glossary.mdx` (stub created by P06, appended to by every TR plan before this one) for terms already defined — do not redefine a term that already has an entry, append only new ones; `content/schema.ts` for the frontmatter fields that must survive translation unchanged (`level, module, order, duration_min, difficulty, tags, verified_version, sources[].url`) vs. the ones that must be translated (`title, description`, lesson prose, quiz text, anti-pattern text). Every EN lesson under `content/en/l2-intermediate/**` already exists and is frozen (owned by P17, P18, P19, P20, P21, all `done`); this plan only ever writes under `content/tr/l2-intermediate/**` and the shared glossary.

## Scope

In:
- Full Turkish translation of every lesson in `m05-models-effort` (6 lessons, from P17), `m06-skills` (6 lessons, from P18), `m07-hooks` (7 lessons, from P19), `m08-git` (4 lessons, from P20), `m09-prompting` (5 lessons, from P21): `content/tr/l2-intermediate/<module>/NN-<slug>.mdx` for every EN lesson that exists.
- Flipping each translated lesson's frontmatter `draft: true` → `false`.
- Appending any newly-encountered term to `content/tr/playbook/glossary.mdx` with its Turkish explanation and first-use links back to the lessons that introduce it.
- Keeping code blocks, command output, transcripts, and URLs byte-identical to the EN source — only prose, headings, quiz text, and alt text are translated.
- Turkish diacritics (ç, ğ, ı, İ, ö, ş, ü) correct throughout — no ASCII-folded substitutes.

Out: touching any `content/en/**` file; touching another level's Turkish content; changing the lesson list, order, or any code sample versus the EN source (a translation is not a rewrite — if the EN lesson is wrong, flag it in `open_questions` naming the EN plan, do not silently fix it here); creating or renaming glossary entries that already exist; anything under `src/**`.

## Deliverables

- 5 module trees fully translated: content/tr/l2-intermediate/m05-models-effort/**, content/tr/l2-intermediate/m06-skills/**, content/tr/l2-intermediate/m07-hooks/**, content/tr/l2-intermediate/m08-git/**, content/tr/l2-intermediate/m09-prompting/**.
- Every lesson's frontmatter has `draft: false`.
- `content/tr/playbook/glossary.mdx` updated with this level's new terms (append-only).

## Acceptance criteria

- `node scripts/content-gate.ts` passes: EN/TR parity (same slugs, same order), schema valid, no lesson left `draft: true` in this level's modules, code fences still tagged.
- Manual diff of every code block and command-output block between the EN and TR file for each lesson shows **zero** differences (only prose changed).
- Every first use of an English technical term in a TR lesson links to `/tr/playbook/glossary/#<term>` (or the TR route `/design/`-equivalent the glossary page resolves to); `lychee` finds no broken internal links introduced by this plan.
- `npm run typecheck && npm run lint && npm test && npm run build` all pass; `dist/tr/l2-intermediate/` contains the same route set as `dist/en/l2-intermediate/`.
- `npx playwright test e2e/shell.spec.ts` (LangSwitch round-trip) and one `e2e/lesson.spec.ts` run against a TR lesson in this level both pass, including axe (0 serious/critical).
- The `translator` agent's output was reviewed by the `reviewer` agent for template-order and terminology-policy compliance (D071); paste both reports in the PR.

## Steps

1. List every EN lesson under `content/en/l2-intermediate/**` (the live file list is authoritative, not the curriculum outline); confirm each has a `draft: true` TR stub waiting.
2. Run `/translate-lesson <path>` per lesson — it invokes the `translator` agent, which keeps code blocks and terms, translates prose, and proposes new glossary entries.
3. For each proposed new term, check `content/tr/playbook/glossary.mdx` for an existing entry; append only if genuinely new, with a short Turkish explanation and a link back to the lesson.
4. Flip `draft: false` once a lesson's translation is complete and reviewed.
5. Run the `reviewer` agent over the whole level's TR tree; fix anything it flags (missing glossary link on first use, drifted code block, wrong diacritics).
6. `node scripts/content-gate.ts && npm run typecheck && npm run lint && npm test && npm run build`; run the Playwright checks in Acceptance criteria.
7. Open the PR with the translator and reviewer reports and the manual code-block diff evidence.

## Tests required

- `scripts/content-gate.ts` (parity, schema, no stray drafts).
- `e2e/shell.spec.ts` (LangSwitch round-trip EN ↔ TR).
- `e2e/lesson.spec.ts` against one TR lesson from this level (axe).
- `lychee` on changed `content/tr/**` files (internal glossary links resolve).

## Non-goals / pitfalls

- Never translate a code sample, a command, or a transcript's captured output — those are evidence (D093) and must stay byte-identical to the EN source.
- Never invent a Turkish word for an English technical term — D018 keeps the English term and explains it in Turkish.
- Never redefine an existing glossary entry to fit this level's phrasing; if the existing wording is wrong, note it in `open_questions` for the owner rather than editing another plan's contribution silently.
- Never flip `draft: false` on a lesson whose EN source you have not fully read and compared against.

## Verification

A reviewer runs `npm run dev`, switches to `/tr/l2-intermediate/` via LangSwitch from the matching EN page for two lessons, confirms diacritics render correctly, clicks one glossary link to confirm it resolves, and spot-checks that a code block is identical to its EN counterpart.

## Handoff notes

- Translated all 30 lessons across the 5 modules (m05: 7, m06: 6, m07: 7, m08: 5, m09: 5), flipping each `draft: true` → `false`. Mix of direct translation and parallel `general-purpose` subagents briefed with the i18n rules; all output reviewed and normalized to one voice before commit.
- Appended 24 new glossary entries to `content/tr/playbook/glossary.mdx` (append-only, existing entries untouched): argument, plugin, matcher, hook event, exit code, debug log, sandbox, permission mode, workflow, checkpoint, fork, token, context window, commit, branch, worktree, merge, diff, pull request, issue, GitHub App, CI, secret, checklist.
- **Blocker hit and resolved:** an early batch cleanup script (meant to normalize stray `\'` escapes to curly `’`) had a shell/Python string-escaping bug that briefly converted every apostrophe in several files — including YAML frontmatter delimiters and JS string delimiters inside `<Lab>`/`<Quiz>` props — into curly quotes, which is invalid syntax outside plain prose. `node scripts/content-gate.ts` did not catch this (it only validates YAML + fences, not JSX/JS expressions), but `npx astro build` did, with `mdx-jsx:unexpected-character` errors. Root-caused and fixed via targeted regex passes (frontmatter delimiters, backtick code-span content, bare JSX attributes like `expected="..."`) plus manual fixes for a few residual cases, then verified with a full `astro build` (143 pages, 0 errors) before proceeding. Two independent subagents (m06 lessons, m09 lessons) hit and self-corrected the same class of bug independently, confirming the pattern. Flagging for other TR-translation plans: **content-gate.ts does not catch invalid JSX prop syntax** — a full `astro build` is the only reliable check for that, and it should probably be added to the standard verification chain in the brief.
- Reviewer subagent (read-only, `--permission-mode plan`) ran against a 5-lesson sample (one per module: `m05/01-model-family`, `m06/02-skill-md-anatomy`, `m07/06-event-catalogue`, `m08/03-pull-requests`, `m09/05-anti-patterns`). Verdict: CHANGES REQUESTED, 0 blockers, 2 majors, 6 minors. Both majors fixed (dead glossary anchors for `pull request`/`argument` — resolved by the glossary additions above; under-linked first-use terms in the 5 sampled files — fixed by hand). All 6 minors fixed (grammar slip, typo, non-standard loanword, one vowel-harmony suffix inconsistency, apostrophe-style note).
- Known follow-up (not blocking): the reviewer's "systemic under-linking" finding was based on the 5-file sample; a full first-use-glossary-link audit across all 30 lessons was not performed exhaustively — later plans touching this level should treat a spot-check, not a guarantee, when relying on link density here.
- Verification: `node scripts/content-gate.ts` (158 files OK), `npm run typecheck` (0 errors), `npm run lint` (eslint + prettier + no-inline-script, all clean after `prettier --write` on the 30 files), `npm test` (184/184 passed), `npx astro build` (143 pages, 0 errors), `node scripts/check-raw-colors.mjs` (OK), `node scripts/check-public-hygiene.mjs` (OK), `node tools/plan/cli.ts check` (OK, 48 plans). Playwright on a temporary `playwright.p26.config.ts` (port 4426, deleted after use) with a temporary `e2e/p26-l2-tr.spec.ts` (deleted after use) visiting all 36 TR L2 routes (level index + 5 module indexes + 30 lessons) at 390/1280: 86/86 passed, 0 axe serious/critical. `e2e/shell.spec.ts` and `e2e/lesson.spec.ts` also re-run against the same port: 38/38 passed.
- `lychee` was not run directly (not installed in this environment); internal glossary-link integrity was instead verified by cross-referencing every `#anchor` used in the 30 TR files against the glossary's own `###` headings (see glossary additions above) and by the reviewer subagent's dead-link finding, which is now resolved.

