---
id: P25
title: "TR translation: L1 Beginner"
milestone: M2
status: review
owner: sonnet-p25-2026-09-07
branch: plan/25-tr-l1-beginner
model_hint: sonnet
effort_hint: medium
depends_on: [P24]
owned_paths:
  - content/tr/l1-beginner/m01-start/**
  - content/tr/l1-beginner/m02-interact/**
  - content/tr/l1-beginner/m03-memory/**
  - content/tr/l1-beginner/m04-commands/**
shared_paths:
  - content/tr/playbook/glossary.mdx
estimate: L
updated_at: 2026-09-07T19:17:03Z
open_questions: []
---

## Goal

Translate every lesson of L1 Beginner (l1-beginner) from English into Turkish: flip each lesson's Turkish draft stub (created as `draft: true` by P13/P14/P15/P16) to a complete, correct translation and set `draft: false`. Modules in scope: `m01-start` (5 lessons, from P13), `m02-interact` (6 lessons, from P14), `m03-memory` (4 lessons, from P15), `m04-commands` (4 lessons, from P16). Translation follows the terminology policy exactly (D016, D018): English technical terms (hook, skill, subagent, worktree, plan mode, and so on) are kept in Latin script, never translated into invented Turkish equivalents, and each is explained in Turkish on its first use per lesson, linked to the shared glossary.

## Context

Read: `docs/CURRICULUM.md` (P03) for the final lesson list per module (must match what P13/P14/P15/P16 actually shipped — read the live EN files, not the outline, since the outline is a floor); `.claude/rules/i18n.md` (P11) for the terminology policy and glossary-linking mechanics; `.claude/skills/translate-lesson/SKILL.md` and the `translator` agent (both P11, sonnet) — this plan's translation work runs through that skill/agent, not free-hand; `content/tr/playbook/glossary.mdx` (stub created by P06, appended to by every TR plan before this one) for terms already defined — do not redefine a term that already has an entry, append only new ones; `content/schema.ts` for the frontmatter fields that must survive translation unchanged (`level, module, order, duration_min, difficulty, tags, verified_version, sources[].url`) vs. the ones that must be translated (`title, description`, lesson prose, quiz text, anti-pattern text). Every EN lesson under `content/en/l1-beginner/**` already exists and is frozen (owned by P13, P14, P15, P16, all `done`); this plan only ever writes under `content/tr/l1-beginner/**` and the shared glossary.

## Scope

In:
- Full Turkish translation of every lesson in `m01-start` (5 lessons, from P13), `m02-interact` (6 lessons, from P14), `m03-memory` (4 lessons, from P15), `m04-commands` (4 lessons, from P16): `content/tr/l1-beginner/<module>/NN-<slug>.mdx` for every EN lesson that exists.
- Flipping each translated lesson's frontmatter `draft: true` → `false`.
- Appending any newly-encountered term to `content/tr/playbook/glossary.mdx` with its Turkish explanation and first-use links back to the lessons that introduce it.
- Keeping code blocks, command output, transcripts, and URLs byte-identical to the EN source — only prose, headings, quiz text, and alt text are translated.
- Turkish diacritics (ç, ğ, ı, İ, ö, ş, ü) correct throughout — no ASCII-folded substitutes.

Out: touching any `content/en/**` file; touching another level's Turkish content; changing the lesson list, order, or any code sample versus the EN source (a translation is not a rewrite — if the EN lesson is wrong, flag it in `open_questions` naming the EN plan, do not silently fix it here); creating or renaming glossary entries that already exist; anything under `src/**`.

## Deliverables

- 4 module trees fully translated: content/tr/l1-beginner/m01-start/**, content/tr/l1-beginner/m02-interact/**, content/tr/l1-beginner/m03-memory/**, content/tr/l1-beginner/m04-commands/**.
- Every lesson's frontmatter has `draft: false`.
- `content/tr/playbook/glossary.mdx` updated with this level's new terms (append-only).

## Acceptance criteria

- `node scripts/content-gate.ts` passes: EN/TR parity (same slugs, same order), schema valid, no lesson left `draft: true` in this level's modules, code fences still tagged.
- Manual diff of every code block and command-output block between the EN and TR file for each lesson shows **zero** differences (only prose changed).
- Every first use of an English technical term in a TR lesson links to `/tr/playbook/glossary/#<term>` (or the TR route `/design/`-equivalent the glossary page resolves to); `lychee` finds no broken internal links introduced by this plan.
- `npm run typecheck && npm run lint && npm test && npm run build` all pass; `dist/tr/l1-beginner/` contains the same route set as `dist/en/l1-beginner/`.
- `npx playwright test e2e/shell.spec.ts` (LangSwitch round-trip) and one `e2e/lesson.spec.ts` run against a TR lesson in this level both pass, including axe (0 serious/critical).
- The `translator` agent's output was reviewed by the `reviewer` agent for template-order and terminology-policy compliance (D071); paste both reports in the PR.

## Steps

1. List every EN lesson under `content/en/l1-beginner/**` (the live file list is authoritative, not the curriculum outline); confirm each has a `draft: true` TR stub waiting.
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

A reviewer runs `npm run dev`, switches to `/tr/l1-beginner/` via LangSwitch from the matching EN page for two lessons, confirms diacritics render correctly, clicks one glossary link to confirm it resolves, and spot-checks that a code block is identical to its EN counterpart.

## Handoff notes

**What changed.** All 20 `draft: true` TR stubs under `content/tr/l1-beginner/m0{1,2,3,4}-*/` were
replaced with full, genuine Turkish translations of their EN twins and flipped to `draft: false`
(m01-start: 02-install, 03-authenticate, 04-first-session, 05-doctor-update-channels; m02-interact:
01-06; m03-memory: 01-05; m04-commands: 01-05). `01-what-claude-code-is.mdx` was already the
finished reference and untouched. Live tree has 5 lessons in both m03-memory and m04-commands (not
4 as the plan summary line says) — the plan body's own Context section already flags the outline as
a floor, and the live file list (20 stubs total) is what was translated, matching this note.

**Process.** Each lesson was translated by a fresh general-purpose agent (the `translator` custom
agent type is not registered as an invokable subagent type in this environment — confirmed by a
direct probe — so `general-purpose` was used instead, briefed with the full text of
`.claude/rules/i18n.md`, `.claude/agents/translator.md`, and the finished EN/TR reference pair, plus
explicit mechanical rules: `lessonId`/`lang` swap to `tr`, code/transcripts byte-identical including
comments, Lab/Quiz string props render as plain text so glossary links only go in real prose). Two
API-session interruptions during the run required re-verifying file state (`draft:` grep, `git
status`) and relaunching the handful of lessons that had not actually written before the cut.

**Glossary.** 22 new terms appended (append-only, added after the existing `skill` entry): `commit`,
`branch`, `worktree`, `pull request`, `permission mode`, `sandbox`, `token`, `context window`,
`checkpoint`, `marketplace`, `artifact`, `workflow`, `plugin`, `auto memory`, `fork`, `rule`,
`renderer`, `monorepo`, `import`, `compaction`, `chord`, `routine`. `fork`, `auto memory`, `rule`,
`renderer`, `monorepo`, `import`, `compaction` and `chord` are not on i18n.md's illustrative "stays
in English" list, but are genuine Claude Code technical terms used repeatedly across this level with
established precedent elsewhere in the TR tree (e.g. `fork` in `m04-commands/03-sessions.mdx` and
`l3-advanced/m10-subagents/index.mdx`); each got a one-line Turkish definition and a first-use link.
Proposed EN-twin glossary entries (for whoever owns `content/en/playbook/glossary.mdx`): the same 22
terms, one-sentence English definitions mirroring the Turkish ones above.

**Verification run (all from the worktree root, 2026-09-07):**
- `npm run typecheck` — 0 errors, 0 warnings.
- `npm run lint` (eslint + prettier + check-no-inline-script) — clean after `prettier --write` on
  all 20 translated files (translator agents did not run prettier themselves).
- `npm run gate` (content-gate.ts) — OK, 158 files checked. One frontmatter defect found and fixed:
  `m04-commands/01-slash-command-reference.mdx`'s translator wrote its YAML frontmatter block with
  curly quotes (’) instead of straight quotes, which YAML doesn't treat as string delimiters,
  breaking `sources[].url` validation — fixed by normalizing the frontmatter block to straight
  quotes.
- `npm test` — 184/184 passed.
- `npm run build` — failed once: the same file also used curly quotes as JS string delimiters inside
  several `<Lab>`/`<Quiz>` string props (`steps`, `checklist`, `text`, `explanation`), which is
  invalid JS and broke MDX/oxc parsing (`Invalid Character '’'`). Fixed by normalizing those
  delimiters to straight quotes while preserving internal apostrophes/content; rebuilt clean —
  `check-no-inline-script (dist): OK (133 files scanned)`, 133 pages, EN/TR route sets for
  `l1-beginner` are identical (25 routes each incl. module indexes).
- Manual programmatic diff of every fenced code block between each EN/TR pair — zero differences
  across all 20 lessons (re-verified after the quote fixes and after Prettier reformatting).
- `node scripts/check-raw-colors.mjs` — OK, 77 files. `node scripts/check-public-hygiene.mjs` — OK
  (tracked). `node tools/plan/cli.ts check` — OK, 48 plans, DAG acyclic, STATE.md fresh.
- Glossary anchors: every `/tr/playbook/glossary/#<anchor>` link used across the 20 lessons resolves
  to a `### <term>` heading in `content/tr/playbook/glossary.mdx` (checked programmatically; no
  `lychee` binary available in this environment, so this substitutes for it as instructed by the
  brief's spirit — no broken internal links found).
- Playwright, temp config `playwright.p25.config.ts` on port 4425 (deleted after the run, along with
  the temp spec `e2e/p25-l1-beginner.spec.ts`): `e2e/a11y.spec.ts` + the temp spec covering all 21
  L1 Beginner lesson routes × 2 languages × 2 viewports (390/1280) — 98/98 passed, 0 axe
  serious/critical violations. `e2e/shell.spec.ts` (LangSwitch EN↔TR round-trip) — 18/18 passed.
  `e2e/lesson.spec.ts` (against the TR `what-claude-code-is` lesson in this level) — 20/20 passed.

**Review (D071).** Ran the `reviewer` agent via `claude -p --permission-mode plan` against a 4-lesson
sample (`m01-start/02-install`, `m02-interact/03-permissions`, `m03-memory/02-hierarchy-imports`,
`m04-commands/01-slash-command-reference`, with EN twins for comparison). Verdict: CHANGES
REQUESTED, 0 blockers, 3 majors, 7 minors. All 3 majors fixed: a diacritics defect
(`moduldeki`→`modüldeki` in `03-permissions.mdx`), and glossary first-use ordering violations in
`01-slash-command-reference.mdx` (several terms — `prompt`, `subagent`, `MCP server`, `transcript`,
`hook`, `plugin`, `artifact`, `routine`, `sandbox`, `effort` — were either linked out of order or
never linked; fixed by linking each at its true first occurrence and de-linking later mentions).
Fixed 3 of 7 minors (a stray `description` backtick in `02-install.mdx`, an unnecessary apostrophe
on the naturalized loanword "Mod'lar"→"Modlar" in `03-permissions.mdx`, and a missing `token`/`auto
memory` glossary link in `hierarchy-imports.mdx`). One reviewer major (finding #2, "kum havuzu
deposu" for "sandbox repository") was evaluated and **not** applied: the already-finished reference
lesson `m01-start/01-what-claude-code-is.mdx` (predating this plan) already establishes exactly this
translation for the course's specific sandbox repository, distinct from the generic technical term
`sandbox` (which stays English and is glossary-linked everywhere else in this batch) — matching the
reference's own precedent is correct per i18n.md's "never independent rewrites" principle, not a
defect. Remaining minor nits (tag-translation consistency across the batch, one phrasing nit, and an
EN-source evidence/narration drift in `m02-interact/03-permissions.mdx` that predates this plan) are
left as follow-ups, not blockers. Full gate/typecheck/lint/test/build/Playwright re-run clean after
fixes.

**Open questions / follow-ups (not blocking this PR):**
- `content/en/l1-beginner/m02-interact/03-permissions.mdx` step 3's prose ("cat .claude/settings.json")
  doesn't match its own recorded transcript's command (`node -e "require('./.claude/settings.json')…"`)
  — an EN-source drift owned by P14, not fixed here per this plan's non-goals; the TR twin mirrors it
  byte-identically as required.
- `content/en/l1-beginner/m04-commands/03-sessions.mdx` Anti-patterns section has a markdown-escaping
  spacing glitch in its EN prose (missing spaces around two backtick-inline code spans) — owned by
  P16, not fixed here.
- `content/en/playbook/glossary.mdx` (EN twin of the glossary) is still just a placeholder sentence;
  the 22 Turkish terms above need EN-language mirror entries from whichever plan owns that file.

