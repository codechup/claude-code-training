---
id: P11
title: Dogfooded .claude/ setup
milestone: M0
status: todo
owner: null
branch: plan/11-dogfood-claude-setup
model_hint: opus
effort_hint: high
depends_on: [P02, P06]
owned_paths:
  - CLAUDE.md
  - .claude/**
shared_paths: []
estimate: L
updated_at: 2026-09-06T00:00:00Z
open_questions: []
---

## Goal

Build the repository's own `.claude/` setup — the thing every content plan from P13 onward actually runs on, and which the "How this site was built" lesson (P43) later documents as course material (D051): `CLAUDE.md` (session protocol and hard rules), path-scoped rules under `.claude/rules/`, three hooks (format, dangerous-command guard, session-start briefing), four skills (`/new-lesson`, `/translate-lesson`, `/verify-sources`, `/plan-next`), and five agents (`lesson-researcher`, `lesson-writer`, `translator`, `fact-checker`, `reviewer`). Every content plan from here on names these skills/agents by exact name in its own Steps section — this plan is what makes those names real.

## Context

Read `plans/README.md` (P02) for the claim protocol and Definition of Done this `CLAUDE.md` must restate for a session that has not read the plan doc yet; `docs/CURRICULUM.md` (P03) and `content/schema.ts` (P06) for the exact frontmatter shape `/new-lesson` must scaffold; `DECISIONS.md` D093 (the evidence rule — this is the single most important rule `CLAUDE.md` states, in its own words, up front), D016/D018 (EN-source, terminology policy — feeds `rules/i18n.md` and the `translator` agent), D041–D044 (sources block rules — feeds `rules/content.md` and `verify-sources`), D048/D050 (owned_paths discipline, dogfooding itself), D026 (never name the owner's other private projects — this is a hard rule `CLAUDE.md` states explicitly, since every future session, including content sessions writing the multi-session lesson, reads this file). `content/en/l1-beginner/m01-start/00-placeholder.mdx` (P06's placeholder) is the only lesson that exists when this plan runs — test `/new-lesson` and the agents against a throwaway lesson, not against real content plans' future work.

## Scope

In:
- `CLAUDE.md`: start-here reading order (`STATE.md` → `plans/README.md` → `DECISIONS.md` → `docs/CURRICULUM.md`), the session protocol (claim → worktree → work within `owned_paths` → PR → status updates), the hard rules restated in this repo's own voice: the evidence rule (D093, no fabricated command output, ever), EN is the source language and Turkish diacritics must be correct (D016/D018), stay inside `owned_paths` (D048), PRs only — never push to `main` directly, no fabricated transcripts, never name or describe the owner's other private projects (D026), never commit a secret. A short command reference (`npm run …`, `node tools/plan/cli.ts …`).
- `.claude/rules/content.md`: the D006 lesson template restated as a checklist, the sources-block rules (D041–D044), the "Changed" note style (D044).
- `.claude/rules/i18n.md`: the terminology policy (D016/D018) restated as a checklist a translator session can follow mechanically, plus the glossary-linking mechanic (link the first use of a kept English term to `content/tr/playbook/glossary.mdx#<term>`).
- `.claude/rules/design.md`: tokens-only colors (no raw literals), 390 px minimum, WCAG 2.2 AA, reduced-motion consideration for the terminal animation and any transition.
- `.claude/rules/plans.md`: a short pointer to `plans/README.md` as the actual contract, plus this repo's specific note about the two scaffold-then-handoff exceptions (P01 → `src/**`, P06 → `content/**`).
- `.claude/hooks/format.mjs` (PostToolUse; runs Prettier on the file just written/edited, matching `.prettierrc` from P01), `.claude/hooks/guard-bash.mjs` (PreToolUse on the Bash tool; blocks `rm -rf`, `git push --force` (without `--force-with-lease`), and any write to `.env*`; exits 2 with a clear message on a match, per D055's PreToolUse example), `.claude/hooks/session-start.mjs` (SessionStart; prints a short `STATE.md` TL;DR plus the list of currently-claimable plans by shelling out to `node tools/plan/cli.ts next`).
- `.claude/skills/new-lesson/SKILL.md` (`/new-lesson <level>/<module>/<slug>`: creates the EN `.mdx` file with the full D006 template skeleton and correct frontmatter, and the matching TR `draft: true` stub, in one commit-worth of changes; this is the skill every content plan's Steps section names), `.claude/skills/translate-lesson/SKILL.md` (`/translate-lesson <path>`: invokes the `translator` agent, keeps code/commands/URLs untouched, translates prose, proposes glossary entries), `.claude/skills/verify-sources/SKILL.md` (`/verify-sources <path>`: WebFetches every URL in the lesson's `sources[]`, updates each entry's `verified_at`, fails loudly on a dead link), `.claude/skills/plan-next/SKILL.md` (a thin wrapper around `node tools/plan/cli.ts next`/`claim`, so a session can type `/plan-next` instead of the raw command).
- `.claude/agents/lesson-researcher.md` (tools: WebSearch/WebFetch/Read/Grep; produces the D098 pre-lesson research summary against `research/feature-inventory.md`), `.claude/agents/lesson-writer.md` (opus; the primary author role content plans invoke, though in practice the claiming session usually acts as the writer directly — this agent definition exists so a session can delegate a single lesson's drafting when useful), `.claude/agents/translator.md` (sonnet; used by `/translate-lesson`), `.claude/agents/fact-checker.md` (checks a lesson's claims against `research/feature-inventory.md` and the live docs, read-only tools), `.claude/agents/reviewer.md` (read-only; checks D006 template order, the evidence rule, and sources-block completeness — this is the agent named in every content plan's Acceptance criteria).
- `.claude/settings.json`: the `hooks` wiring for the three hooks above, and any allowlist entries this repo's own dogfooding needs (e.g., allow `node tools/plan/cli.ts *` without a prompt).

Out: `plans/README.md`/`tools/plan/**` (P02, already exists by the time this plan is claimed); any lesson content; the plan tool's own logic (this plan only calls it via hooks/skills, never modifies it).

## Deliverables

`CLAUDE.md`; `.claude/settings.json`; `.claude/rules/{content,i18n,design,plans}.md`; `.claude/hooks/{format,guard-bash,session-start}.mjs`; `.claude/skills/{new-lesson,translate-lesson,verify-sources,plan-next}/SKILL.md`; `.claude/agents/{lesson-researcher,lesson-writer,translator,fact-checker,reviewer}.md`.

## Acceptance criteria

- Running `/new-lesson l1-beginner/m01-start/dogfood-test` (a throwaway slug, deleted before the PR merges) produces a syntactically valid EN `.mdx` with the full D006 skeleton and a matching TR `draft: true` stub in one step; delete the throwaway files before opening the PR and note in Handoff notes that the skill was smoke-tested this way.
- `.claude/hooks/guard-bash.mjs` blocks a test `rm -rf /tmp/x` and a test `git push --force` (exit code 2, clear stderr message) and allows an ordinary `git status` — demonstrate both with real hook invocations, output pasted in the PR.
- `.claude/hooks/format.mjs` actually reformats a deliberately-misformatted test file after a tool-write, verified by a real PostToolUse run, not by reading the script and assuming.
- `.claude/hooks/session-start.mjs` prints real `STATE.md`/`next` output when a new session starts in this repo (paste a real session-start transcript excerpt).
- `/verify-sources` run against `content/en/l1-beginner/m01-start/00-placeholder.mdx` (temporarily given a real, fetchable source for the test, then reverted) correctly stamps `verified_at` and correctly fails on a deliberately-broken URL.
- The `reviewer` agent, run against the placeholder lesson, correctly flags at least one deliberately-introduced template violation (e.g., a missing "When NOT to use" section added to a scratch copy) and reports clean against a correct one.
- `CLAUDE.md` explicitly states the evidence rule (D093) and the never-name-other-private-projects rule (D026) in its own words, not only by D-number citation.

## Steps

1. Write `CLAUDE.md` first — it is the file every later session reads before anything else, so get its structure right before building the pieces it references.
2. Write the four `.claude/rules/*.md` files.
3. Write and smoke-test the three hooks individually (each against a deliberately-triggering and a deliberately-safe input), then wire them into `.claude/settings.json`.
4. Write the five agent definitions; smoke-test `reviewer` and `fact-checker` against the placeholder lesson (one deliberately broken copy, one clean).
5. Write the four skills; smoke-test `/new-lesson` and `/verify-sources` end to end as described in Acceptance criteria, cleaning up throwaway artifacts afterward.
6. Paste every smoke-test transcript excerpt into the PR as evidence (D093 applies to this plan's own claims about its tooling, not only to lesson content).

## Tests required

No traditional unit-test suite (hooks/skills/agents are prompts and small scripts) — the smoke tests in Acceptance criteria, each with real, pasted transcript evidence, are this plan's test suite. `guard-bash.mjs` may additionally get a small Vitest unit test for its pattern-matching logic in isolation.

## Non-goals / pitfalls

- Do not leave a throwaway `/new-lesson` test's files in the repo — clean them up before the PR.
- Do not write a hook that silently swallows an error — `guard-bash.mjs` must exit 2 with a message a human can read, per the documented hook contract.
- Do not let `CLAUDE.md` merely link to `DECISIONS.md`/`plans/README.md` for the hard rules without restating the two most load-bearing ones (evidence rule, no-naming-other-private-projects) in its own text — a session that skims will still see them.
- Do not build a sixth agent or skill beyond the list here "while you're at it" — if a future content plan needs one, it goes into that plan's `open_questions`, not into this plan speculatively.
- Do not reference the owner's other private projects anywhere in these files, including as a "for example" — D026 applies to this plan's own text, not only to lesson content.

## Verification

A reviewer runs the `/new-lesson` smoke test live, triggers `guard-bash.mjs` with a blocked and an allowed command, starts a fresh session to see `session-start.mjs`'s output, and reads `CLAUDE.md` end to end for the two load-bearing rules stated in plain language.

## Handoff notes

- _Filled by the executing session: what changed, decisions, follow-ups, blockers._
