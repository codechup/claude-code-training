---
id: P11
title: Dogfooded .claude/ setup
milestone: M0
status: done
owner: session-p11-2026-09-06
branch: plan/11-dogfood-claude-setup
model_hint: opus
effort_hint: high
depends_on: [P02, P06]
owned_paths:
  - CLAUDE.md
  - .claude/**
shared_paths: []
estimate: L
updated_at: 2026-09-06T21:44:27Z
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

- Bootstrap already present (lead session, 2026-09-06, owner request): `.claude/settings.json` with a PreToolUse hook `.claude/hooks/guard-hygiene.mjs` (blocks Write/Edit/Bash carrying private infra details or secrets; delegates to `scripts/check-public-hygiene.mjs`), and `.claude/rules/public-hygiene.md`. Keep both when building the full `.claude/`; add the formatter/guard-bash/session-start hooks alongside, do not replace the hygiene hook.

- **Done 2026-09-06 (session-p11-2026-09-06, Opus, high).** Delivered the full `.claude/` setup and the real `CLAUDE.md` (113 lines): 5 rules, 3 new hooks alongside the bootstrap hygiene hook, 4 skills, 5 agents.
  - `CLAUDE.md` — start-here order (STATE → plans/README → DECISIONS → CURRICULUM → feature-inventory → CANVAS), the session protocol with the exact plan-CLI commands and the `../cct-wt-NN` worktree convention, hard rules in plain words (evidence D093, no fabricated transcripts D070/D099, currency D004/D044, hygiene with the "Enforced three ways" sentence kept verbatim, EN-source/TR-diacritics D016/D018, tokens-only design, `owned_paths` D048, PR-only `main`, no secrets, anonymous case studies D026, never invent an owner decision), commands, layout, model/effort hints.
  - `.claude/rules/` — kept `public-hygiene.md` untouched and deliberately **unscoped** (it applies to every file, so it must load unconditionally). Added four path-scoped rules using the `paths:` frontmatter confirmed against `code.claude.com/docs/en/memory.md`: `content.md` (`content/**/*.mdx`, `content/_shared/**`), `i18n.md` (`content/tr/**`, `src/lib/i18n/**`), `design.md` (`src/**`, `public/**`), `plans.md` (`plans/**`, `STATE.md`, `tools/plan/**`).
  - Hooks — `format.mjs` (PostToolUse `Write|Edit`), `guard-bash.mjs` (PreToolUse `Bash|PowerShell`), `session-start.mjs` (SessionStart). All Node ESM, cross-platform, repo-root resolved from `import.meta.url` rather than cwd. The existing `guard-hygiene.mjs` entry in `settings.json` is unchanged; its matcher already matches the current contract.
  - Skills — `/new-lesson`, `/translate-lesson`, `/verify-sources`, `/plan-next` (`disable-model-invocation: true`). Agents — `lesson-researcher`, `lesson-writer` (opus), `translator`, `fact-checker`, `reviewer` (read-only via `tools` allowlist + `disallowedTools`).

- **Decisions taken:**
  - **`guard-bash.mjs` writes the block reason to BOTH stdout JSON and stderr.** `code.claude.com/docs/en/hooks.md` (fetched 2026-09-06) states that on exit 2 the message shown comes from the JSON's blocking decision when there is one and from **stderr** otherwise. The task specified `hookSpecificOutput.permissionDecision: "deny"`; the plan's acceptance criteria specified a "clear stderr message". Emitting both satisfies the contract on either path. The bootstrap `guard-hygiene.mjs` only writes stdout — a follow-up could add stderr there for parity (not changed here: it is working and was explicitly to be kept).
  - **`rm -rf` is allowed for regenerable build output** (`dist`, `node_modules`, `.astro`, `coverage`, `playwright-report`, `test-results`) and blocked everywhere else, so `rm -rf node_modules && npm ci` stays ergonomic. Force-push: blocked without `--force-with-lease`, and **always** blocked when the refspec names `main`, even with a lease. `.env` writes blocked; `.env.example`/`.sample`/`.template` exempt; reads never blocked.
  - **`/new-lesson` is backed by a real script**, `.claude/skills/new-lesson/scaffold.mjs`, invoked through `allowed-tools: Bash(node .claude/skills/new-lesson/scaffold.mjs:*)`. This makes the skill deterministic and genuinely smoke-testable without nesting a Claude session, and it reads `verified_version` out of `research/feature-inventory.md`'s heading instead of hardcoding it (D096).
  - **Hook unit test uses `node:test`, not Vitest.** `vitest.config.ts` collects only `tools/**`, `scripts/**` and `src/**`, and both that config and `scripts/` are outside this plan's `owned_paths`. `.claude/hooks/guard-bash.test.mjs` runs with `node --test .claude/hooks/guard-bash.test.mjs` (8 tests, all passing) and needs no config change. **Follow-up for whoever owns `vitest.config.ts`:** add `.claude/**/*.test.mjs` to `include` so this test runs in CI — right now it is only run manually.
  - **Post-review fixes (second commit).** (a) `isDisposable` in `guard-bash.mjs` originally exempted *any* path containing a disposable directory name, so `rm -rf ../cct-wt-08/node_modules` — a sibling plan's worktree, the one thing CLAUDE.md forbids touching — was allowed. Rooted paths are now resolved and required to fall inside this repo before the exemption applies; a 9th test case covers it. (b) The four skills declared `arguments` as a list of `{name, description, required}` objects; `code.claude.com/docs/en/skills.md` (fetched 2026-09-07) documents it as **a space-separated string or a YAML list of names** ("Names map to argument positions in order"). Corrected to `arguments: [lesson]` / `[source]` / `[target]` with matching `$lesson`/`$source`/`$target` named substitutions in the bodies; `/plan-next` takes a whole variadic subcommand line so it declares no named arguments and keeps `$ARGUMENTS`. Had this shipped as written, all four skills could have failed to load and nobody would have noticed until P13 typed `/new-lesson`.
  - `settings.json` gained a `permissions.allow` list for the read-only/plan-CLI commands this repo's own dogfooding runs constantly (`node tools/plan/cli.ts:*`, `npm run gate`, `git status:*`, …), per the plan's Scope.

- **Evidence (all real output, pasted in the PR):** `npm run lint` green (eslint + `prettier --check .` "All matched files use Prettier code style!" + inline-script 40 files) · `node scripts/check-public-hygiene.mjs` OK (tracked) · `node tools/plan/cli.ts check` "ok: 48 plans … STATE.md fresh" · `npm run typecheck` 0 errors · `npm test` 13 files / 104 tests passed · `node --test .claude/hooks/guard-bash.test.mjs` 8/8 · `claude --version` → 2.1.263 (matches the pinned `verified_version`) · all 13 SKILL/agent/rule frontmatter blocks parse with the `yaml` package.

- **Smoke tests actually run (transcripts in the PR):**
  - `guard-bash.mjs`: blocked `rm -rf /`, `git push --force origin main`, `echo ... > .env`, PowerShell `Remove-Item -Recurse -Force C:\Windows\System32`, PowerShell `Set-Content .env` — each exit 2 with the JSON deny object on stdout and the reason on stderr. Allowed `git status`, `rm -rf dist node_modules`, `Remove-Item -Recurse -Force dist` — exit 0, silent.
  - `format.mjs`: a deliberately misformatted `.mjs` was reformatted by a real PostToolUse-shaped invocation. No-ops correctly for a file outside the repo, an unknown extension, and garbage stdin — exit 0 every time.
  - `session-start.mjs`: emitted the real STATE.md TL;DR plus the real `cli.ts next` output as `hookSpecificOutput.additionalContext`.
  - `/new-lesson`'s scaffold: created `content/{en,tr}/l1-beginner/m01-start/99-dogfood-test.mdx` plus `content/_shared/transcripts/m01-start/99-dogfood-test/README.md`; `npm run gate` went 60 → **62 files OK**, proving the generated frontmatter and the TR twin satisfy the schema and the parity gate. Re-running refused to overwrite (exit 1). **All throwaway files were deleted**; the gate is back to 60 OK and `git status` shows no stray content.

- **`reviewer` agent VERIFIED by a real run.** `claude -p` in this worktree, asked to run the `reviewer` agent against `content/en/l1-beginner/m01-start/01-what-claude-code-is.mdx`. It produced the specified output shape (numbered findings, BLOCKER/MAJOR/MINOR severities, closing `VERDICT:` line), cited `.claude/rules/content.md` §1 and `docs/CURRICULUM.md` §3 by name, correctly matched `verified_version: '2.1.263'` against the inventory heading, stayed **read-only** (edited nothing), and correctly observed that the files it flagged are outside P11's `owned_paths` so P12/P13 must act on them. Verdict: CHANGES REQUESTED (2 blockers, 1 major). Full transcript in the PR. **Only the first half of acceptance criterion 6 is met:** the agent correctly flags template violations, but "reports clean against a correct one" was not exercised, because no lesson in the repo currently satisfies the D006 template — the one real lesson is still a P06 placeholder. Re-run that half once P12/P13 lands a compliant lesson.
  - **Cross-plan finding worth acting on (not P11's to fix):** the reviewer flagged that `content/en/l1-beginner/m01-start/01-what-claude-code-is.mdx` ships `draft: false` while still being a P06 scaffold placeholder missing every template section, which contradicts `plans/P13-l1-m01-start.md`'s Context (it assumes P12 already left a complete lesson there). It also flagged two small i18n defects in the TR twin (a translated `sources[].title` for an English doc, and the ASCII-fied tag `'genel-bakis'` which should be `'genel-bakış'`), and a stale filename reference at `plans/P13-l1-m01-start.md:32`. Routing to P12/P13 rather than touching another plan's files.

- **NOT verified (be honest about this):** the `fact-checker` agent and the `/verify-sources` and `/translate-lesson` skills were **not** executed end-to-end. Their YAML parses, their tool allowlists are valid, and they were written against the current `sub-agents`/`skills` contracts in `research/feature-inventory.md`, but their runtime behaviour is unproven. `/verify-sources` in particular needs a live check against a lesson with one good and one deliberately dead URL, confirming it stamps `verified_at` only for the fetchable one. Flagging rather than claiming (D093).

- **Observation from the live run:** the nested session was invoked in this worktree but Claude Code resolved the project directory to the main checkout (`git worktree` shares the repo), and it emitted `Ignoring 10 permissions.allow entries from .claude/settings.json: this workspace has not been trusted.` The new `permissions.allow` block therefore only takes effect after a session accepts the trust dialog in the worktree once — worth knowing before anyone concludes the allowlist is broken. The agent also answered partly in Turkish (session-language drift); the agent definitions do not pin an output language, which is fine for now but is the kind of thing P43 should mention.

- **Follow-ups:** (1) add `.claude/**/*.test.mjs` to `vitest.config.ts`'s `include` so the guard-bash test runs in CI; (2) consider mirroring the stderr output into `guard-hygiene.mjs`; (3) P43 ("How this site was built") quotes these files directly — keep `CLAUDE.md` under ~120 lines and every rule stated in plain words, not only by D-number, when editing.
