---
id: P40
title: "TR translation: L3 Advanced"
milestone: M3
status: done
owner: lead-opus
branch: plan/40-tr-l3-advanced
model_hint: sonnet
effort_hint: medium
depends_on: [P39]
owned_paths:
  - content/tr/l3-advanced/m10-subagents/**
  - content/tr/l3-advanced/m11-mcp/**
  - content/tr/l3-advanced/m12-plugins/**
  - content/tr/l3-advanced/m13-headless-ci/**
  - content/tr/l3-advanced/m14-security/**
  - content/tr/l3-advanced/m15-platforms/**
shared_paths:
  - content/tr/playbook/glossary.mdx
estimate: L
updated_at: 2026-09-08T02:39:40Z
open_questions:
  - "Missing glossary terms encountered during translation that have no entry yet in content/tr/playbook/glossary.mdx (a sibling session owns that file during this wave, so P40 could not add them): agent view, agent teams/teammate, background (subagent placement sense), advisor, isolation, webhook, GitHub Action/action (distinct from the existing GitHub App entry), Agent SDK, runner, prompt injection, protected path/critical path, managed settings, data retention/ZDR, transport, stdio, scope, marketplace (listed as a kept term in .claude/rules/i18n.md but absent from the glossary file itself), extension, IDE, Remote Control, Claude Tag, routine (also listed as a kept term but absent), cloud environment/cloud session, Desktop app, computer use, Dispatch, teleport, ultrareview, tmux session/multiplexer, Access bundle. Owner should triage and add the genuinely load-bearing ones (marketplace and routine look like real gaps since D-rules already name them as kept terms)."
  - "content/tr/l3-advanced/m10-subagents/index.mdx, m12-plugins/index.mdx, m13-headless-ci/index.mdx and content/tr/l3-advanced/index.mdx all still translate 'agent(s)' as the invented Turkish calque 'ajan/ajanlar' (D018 violation). These files pre-date this plan (not among the 37 draft stubs P40 was scoped to flip) and were flagged by the reviewer subagent as out-of-scope for this PR; a follow-up plan should fix them the same way the 37 lesson files were fixed (ajan -> agent + Turkish suffix)."
  - "Two MINOR cosmetic findings from the final reviewer pass (non-blocking): content/tr/l3-advanced/m10-subagents/02-custom-agents.mdx has the 'plugin' glossary link on its second prose occurrence rather than its first (first occurrence is a markdown-table cell); content/tr/l3-advanced/m15-platforms/06-chrome.mdx has the same pattern for 'tool' (first occurrence is inside a <CodeBlock title=...> caption). Left as-is since table cells/code captions are borderline 'prose' — flagging for the owner to set a firm convention."
---

## Goal

Translate every lesson of L3 Advanced (l3-advanced) from English into Turkish: flip each lesson's Turkish draft stub (created as `draft: true` by P27/P28/P29/P30/P31/P32) to a complete, correct translation and set `draft: false`. Modules in scope: `m10-subagents` (6 lessons, from P27), `m11-mcp` (7 lessons, from P28), `m12-plugins` (5 lessons, from P29), `m13-headless-ci` (5 lessons, from P30), `m14-security` (4 lessons, from P31), `m15-platforms` (7 lessons, from P32). Translation follows the terminology policy exactly (D016, D018): English technical terms (hook, skill, subagent, worktree, plan mode, and so on) are kept in Latin script, never translated into invented Turkish equivalents, and each is explained in Turkish on its first use per lesson, linked to the shared glossary.

## Context

Read: `docs/CURRICULUM.md` (P03) for the final lesson list per module (must match what P27/P28/P29/P30/P31/P32 actually shipped — read the live EN files, not the outline, since the outline is a floor); `.claude/rules/i18n.md` (P11) for the terminology policy and glossary-linking mechanics; `.claude/skills/translate-lesson/SKILL.md` and the `translator` agent (both P11, sonnet) — this plan's translation work runs through that skill/agent, not free-hand; `content/tr/playbook/glossary.mdx` (stub created by P06, appended to by every TR plan before this one) for terms already defined — do not redefine a term that already has an entry, append only new ones; `content/schema.ts` for the frontmatter fields that must survive translation unchanged (`level, module, order, duration_min, difficulty, tags, verified_version, sources[].url`) vs. the ones that must be translated (`title, description`, lesson prose, quiz text, anti-pattern text). Every EN lesson under `content/en/l3-advanced/**` already exists and is frozen (owned by P27, P28, P29, P30, P31, P32, all `done`); this plan only ever writes under `content/tr/l3-advanced/**` and the shared glossary.

## Scope

In:
- Full Turkish translation of every lesson in `m10-subagents` (6 lessons, from P27), `m11-mcp` (7 lessons, from P28), `m12-plugins` (5 lessons, from P29), `m13-headless-ci` (5 lessons, from P30), `m14-security` (4 lessons, from P31), `m15-platforms` (7 lessons, from P32): `content/tr/l3-advanced/<module>/NN-<slug>.mdx` for every EN lesson that exists.
- Flipping each translated lesson's frontmatter `draft: true` → `false`.
- Appending any newly-encountered term to `content/tr/playbook/glossary.mdx` with its Turkish explanation and first-use links back to the lessons that introduce it.
- Keeping code blocks, command output, transcripts, and URLs byte-identical to the EN source — only prose, headings, quiz text, and alt text are translated.
- Turkish diacritics (ç, ğ, ı, İ, ö, ş, ü) correct throughout — no ASCII-folded substitutes.

Out: touching any `content/en/**` file; touching another level's Turkish content; changing the lesson list, order, or any code sample versus the EN source (a translation is not a rewrite — if the EN lesson is wrong, flag it in `open_questions` naming the EN plan, do not silently fix it here); creating or renaming glossary entries that already exist; anything under `src/**`.

## Deliverables

- 6 module trees fully translated: content/tr/l3-advanced/m10-subagents/**, content/tr/l3-advanced/m11-mcp/**, content/tr/l3-advanced/m12-plugins/**, content/tr/l3-advanced/m13-headless-ci/**, content/tr/l3-advanced/m14-security/**, content/tr/l3-advanced/m15-platforms/**.
- Every lesson's frontmatter has `draft: false`.
- `content/tr/playbook/glossary.mdx` updated with this level's new terms (append-only).

## Acceptance criteria

- `node scripts/content-gate.ts` passes: EN/TR parity (same slugs, same order), schema valid, no lesson left `draft: true` in this level's modules, code fences still tagged.
- Manual diff of every code block and command-output block between the EN and TR file for each lesson shows **zero** differences (only prose changed).
- Every first use of an English technical term in a TR lesson links to `/tr/playbook/glossary/#<term>` (or the TR route `/design/`-equivalent the glossary page resolves to); `lychee` finds no broken internal links introduced by this plan.
- `npm run typecheck && npm run lint && npm test && npm run build` all pass; `dist/tr/l3-advanced/` contains the same route set as `dist/en/l3-advanced/`.
- `npx playwright test e2e/shell.spec.ts` (LangSwitch round-trip) and one `e2e/lesson.spec.ts` run against a TR lesson in this level both pass, including axe (0 serious/critical).
- The `translator` agent's output was reviewed by the `reviewer` agent for template-order and terminology-policy compliance (D071); paste both reports in the PR.

## Steps

1. List every EN lesson under `content/en/l3-advanced/**` (the live file list is authoritative, not the curriculum outline); confirm each has a `draft: true` TR stub waiting.
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

A reviewer runs `npm run dev`, switches to `/tr/l3-advanced/` via LangSwitch from the matching EN page for two lessons, confirms diacritics render correctly, clicks one glossary link to confirm it resolves, and spot-checks that a code block is identical to its EN counterpart.

## Handoff notes

- All 37 `draft: true` TR lesson stubs under `content/tr/l3-advanced/{m10-subagents,m11-mcp,m12-plugins,m13-headless-ci,m14-security,m15-platforms}/` were translated to full Turkish and flipped to `draft: false`. Module counts: m10 (6), m11 (7), m12 (5), m13 (6 — the live EN tree has 6 lessons, not the 5 the plan text estimated), m14 (5), m15 (8 — live EN tree has 8, not the 7 estimated). Translation done via 6 parallel subagents (one per module), following `.claude/rules/i18n.md` and matching the voice of `content/tr/l1-beginner/m01-start/01-what-claude-code-is.mdx`.
- **Bug caught and fixed (build-breaking):** the translation pass left stray literal `</content>`/`</invoke>` tool-call artifacts at the end of several files (from the subagents' own Write-tool output leaking into the file), and several JSX string literals (`steps=`, `checklist=` arrays) had unescaped straight apostrophes on Turkish suffixes (`agent'a`, `commit'i`) that broke MDX/JS parsing, plus one YAML frontmatter field with the same issue. Found via `npm run build` failures and a custom Node script that evaluates every `steps={[...]}`/`checklist={[...]}`/`options={[...]}` block as JS to catch parse errors; fixed all instances; `npm run build` is clean.
- **Terminology bug caught and fixed:** the m10-subagents translator agent systematically translated the kept-English term "agent" as the invented Turkish calque "ajan"/"Ajan" (173 occurrences across all 6 lessons) — a clear D018 violation caught by the `reviewer` subagent. Fixed with a scripted, suffix-aware find/replace (agent'ı, agent'lar, agent'ın, etc., matching the existing correct "subagent" pattern in the same files) and re-verified clean.
- **Glossary-link gap caught and fixed:** the `reviewer` subagent's first sample review (4 lessons across m10/m12/m13/m15) found 4 MAJOR findings — pages with zero first-use glossary links despite using kept English terms with existing glossary entries. A broader static scan (custom Node script) found this was systemic across most of the 37 files. Ran 6 more parallel subagents (one per module) to add first-use glossary links + short Turkish parentheticals to real prose only (never inside JSX component props/code fences), sourcing wording from `content/tr/playbook/glossary.mdx` without editing that file. Verified: 324 `/tr/playbook/glossary/#...` links across the module, all resolving to real anchors in the built `dist/tr/playbook/glossary/index.html` (checked programmatically), none leaked into JSX prop strings.
- Did **not** edit `content/tr/playbook/glossary.mdx` (owned by a sibling session this wave) — new terms encountered without an existing entry are listed in `open_questions` above instead.
- Code blocks, terminal output and `<Transcript>` src/range props are verified byte-identical to the EN twins for all 37 files (scripted diff, zero differences) — the reviewer subagent independently confirmed the same for its sampled files.
- **Reviewer subagent runs (D071), read-only via `claude -p .../reviewer.md`:**
  1. First pass, 4 lessons (m10/01, m12/03, m13/03, m15/06): 0 blockers, 4 majors (missing glossary links), 1 minor (tag apostrophe convention) — all fixed.
  2. Second pass, re-check same terminology fix on a different 4 lessons (m10/02, m11/07, m14/03, m15/06): confirmed "ajan"→"agent" fix; found glossary-link fix had *not yet* landed on those 4 (the remediation subagents were still running) — 3 blockers, 2 majors.
  3. Final pass, same 4 lessons, after remediation completed: **VERDICT: APPROVED**, 0 blockers, 0 majors, 2 cosmetic minors (glossary link on a term's second prose occurrence rather than first, in `02-custom-agents.mdx` and `06-chrome.mdx` — see `open_questions`).
  - Combined counts across all reviewer runs: 3 blockers found → 3 fixed; 6 majors found → 6 fixed; 2 minors found → 1 fixed (tags), 2 left as cosmetic/non-blocking (documented in `open_questions`).
- Verification commands run with real output (all green): `npm run gate`, `npm run typecheck`, `npm run lint`, `npm test` (187 tests passed), `npm run build` (`check-no-inline-script (dist): OK`), `node scripts/check-public-hygiene.mjs`, `node scripts/check-raw-colors.mjs`, `node tools/plan/cli.ts check`. `dist/tr/l3-advanced/` route set matches `dist/en/l3-advanced/` exactly (diffed).
- Playwright: ran against a temporary `playwright.p40.config.ts` (port 4441) + temporary `e2e/p40-l3-tr.spec.ts` covering one lesson per module plus a LangSwitch EN↔TR round-trip and a glossary-link click-through — 20/20 passed at 390px and 1280px with zero serious/critical axe violations. Also re-ran the existing `e2e/shell.spec.ts` and `e2e/a11y.spec.ts` against the same config — all 32 passed. Both temporary files were deleted after capturing results (not committed).
- **Follow-up for the owner / next TR plan:** the "ajan" calque also appears in `content/tr/l3-advanced/index.mdx`, `m10-subagents/index.mdx`, `m12-plugins/index.mdx` and `m13-headless-ci/index.mdx` — these are pre-existing files outside this plan's 37-stub scope (not `draft: true`, not written by this session), so left untouched; flagged in `open_questions`.

