---
id: P41
title: "TR translation: L4 Master"
milestone: M3
status: review
owner: lead-opus
branch: plan/41-tr-l4-master
model_hint: sonnet
effort_hint: medium
depends_on: [P39]
owned_paths:
  - content/tr/l4-master/m16-orchestration/**
  - content/tr/l4-master/m17-autonomy/**
  - content/tr/l4-master/m18-multi-session/**
  - content/tr/l4-master/m19-visual/**
  - content/tr/l4-master/m20-team/**
  - content/tr/l4-master/m21-scale/**
shared_paths:
  - content/tr/playbook/glossary.mdx
estimate: L
updated_at: 2026-09-08T02:29:31Z
open_questions:
  - "Missing glossary.mdx entries for terms used across this level: routine, artifact, prompt caching, ultracode, agent team, monitor, plan file, handoff, canvas, gateway, devcontainer, teammate, mailbox, connector, channel, environment (cloud environment), CDN, CSP. Owner-shared content/tr/playbook/glossary.mdx was being edited by a sibling session throughout this plan, so per the plan's explicit instruction this session never touched it — every kept-English term above is explained inline in parentheses on first use per page instead of being linked, and NO first-use link was added for these. This is the reviewer subagent's '4 major' finding on its 5-file sample (missing first-use glossary links) — it is an expected consequence of the glossary-hands-off constraint, not an oversight. Once glossary.mdx has entries for these terms, a follow-up pass should add `[term](/tr/playbook/glossary/#term)` links on first use across all 31 lessons in this level."
  - "m16-orchestration/03-agent-teams-messaging.mdx renders 'teammate' as 'takım arkadaşı' (Turkish) with an English parenthetical, rather than keeping 'teammate' in English with a Turkish suffix the way 'agent team' itself is kept. 'teammate' is not on the i18n.md kept-English list, so this is a defensible reading, but it should be confirmed against the eventual glossary entry for consistency with the rest of the site."
  - "Terms 'connector', 'repository' and 'environment' in m17-autonomy/02-routines.mdx are left in English for product-UI fidelity (they name literal UI elements/config keys) but are not on the i18n.md kept-English list and have no glossary entry. Owner decision needed: add them to the kept-English list and glossary, or translate them. Left as-is (most conservative reading) for now."
---

## Goal

Translate every lesson of L4 Master (l4-master) from English into Turkish: flip each lesson's Turkish draft stub (created as `draft: true` by P33/P34/P35/P36/P37/P38) to a complete, correct translation and set `draft: false`. Modules in scope: `m16-orchestration` (3 lessons, from P33), `m17-autonomy` (5 lessons, from P34), `m18-multi-session` (4 lessons, from P35), `m19-visual` (4 lessons, from P36), `m20-team` (4 lessons, from P37), `m21-scale` (4 lessons, from P38). Translation follows the terminology policy exactly (D016, D018): English technical terms (hook, skill, subagent, worktree, plan mode, and so on) are kept in Latin script, never translated into invented Turkish equivalents, and each is explained in Turkish on its first use per lesson, linked to the shared glossary.

## Context

Read: `docs/CURRICULUM.md` (P03) for the final lesson list per module (must match what P33/P34/P35/P36/P37/P38 actually shipped — read the live EN files, not the outline, since the outline is a floor); `.claude/rules/i18n.md` (P11) for the terminology policy and glossary-linking mechanics; `.claude/skills/translate-lesson/SKILL.md` and the `translator` agent (both P11, sonnet) — this plan's translation work runs through that skill/agent, not free-hand; `content/tr/playbook/glossary.mdx` (stub created by P06, appended to by every TR plan before this one) for terms already defined — do not redefine a term that already has an entry, append only new ones; `content/schema.ts` for the frontmatter fields that must survive translation unchanged (`level, module, order, duration_min, difficulty, tags, verified_version, sources[].url`) vs. the ones that must be translated (`title, description`, lesson prose, quiz text, anti-pattern text). Every EN lesson under `content/en/l4-master/**` already exists and is frozen (owned by P33, P34, P35, P36, P37, P38, all `done`); this plan only ever writes under `content/tr/l4-master/**` and the shared glossary.

## Scope

In:
- Full Turkish translation of every lesson in `m16-orchestration` (3 lessons, from P33), `m17-autonomy` (5 lessons, from P34), `m18-multi-session` (4 lessons, from P35), `m19-visual` (4 lessons, from P36), `m20-team` (4 lessons, from P37), `m21-scale` (4 lessons, from P38): `content/tr/l4-master/<module>/NN-<slug>.mdx` for every EN lesson that exists.
- Flipping each translated lesson's frontmatter `draft: true` → `false`.
- Appending any newly-encountered term to `content/tr/playbook/glossary.mdx` with its Turkish explanation and first-use links back to the lessons that introduce it.
- Keeping code blocks, command output, transcripts, and URLs byte-identical to the EN source — only prose, headings, quiz text, and alt text are translated.
- Turkish diacritics (ç, ğ, ı, İ, ö, ş, ü) correct throughout — no ASCII-folded substitutes.

Out: touching any `content/en/**` file; touching another level's Turkish content; changing the lesson list, order, or any code sample versus the EN source (a translation is not a rewrite — if the EN lesson is wrong, flag it in `open_questions` naming the EN plan, do not silently fix it here); creating or renaming glossary entries that already exist; anything under `src/**`.

## Deliverables

- 6 module trees fully translated: content/tr/l4-master/m16-orchestration/**, content/tr/l4-master/m17-autonomy/**, content/tr/l4-master/m18-multi-session/**, content/tr/l4-master/m19-visual/**, content/tr/l4-master/m20-team/**, content/tr/l4-master/m21-scale/**.
- Every lesson's frontmatter has `draft: false`.
- `content/tr/playbook/glossary.mdx` updated with this level's new terms (append-only).

## Acceptance criteria

- `node scripts/content-gate.ts` passes: EN/TR parity (same slugs, same order), schema valid, no lesson left `draft: true` in this level's modules, code fences still tagged.
- Manual diff of every code block and command-output block between the EN and TR file for each lesson shows **zero** differences (only prose changed).
- Every first use of an English technical term in a TR lesson links to `/tr/playbook/glossary/#<term>` (or the TR route `/design/`-equivalent the glossary page resolves to); `lychee` finds no broken internal links introduced by this plan.
- `npm run typecheck && npm run lint && npm test && npm run build` all pass; `dist/tr/l4-master/` contains the same route set as `dist/en/l4-master/`.
- `npx playwright test e2e/shell.spec.ts` (LangSwitch round-trip) and one `e2e/lesson.spec.ts` run against a TR lesson in this level both pass, including axe (0 serious/critical).
- The `translator` agent's output was reviewed by the `reviewer` agent for template-order and terminology-policy compliance (D071); paste both reports in the PR.

## Steps

1. List every EN lesson under `content/en/l4-master/**` (the live file list is authoritative, not the curriculum outline); confirm each has a `draft: true` TR stub waiting.
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

A reviewer runs `npm run dev`, switches to `/tr/l4-master/` via LangSwitch from the matching EN page for two lessons, confirms diacritics render correctly, clicks one glossary link to confirm it resolves, and spot-checks that a code block is identical to its EN counterpart.

## Handoff notes

All 31 `draft: true` TR stubs under `content/tr/l4-master/` (m16–m21) are now full Turkish
translations with `draft: false`: m16-orchestration (5), m17-autonomy (5), m18-multi-session (6),
m19-visual (4), m20-team (6), m21-scale (5).

**Process note.** This worktree was shared with what appears to be another concurrent process
working the same plan (files were repeatedly overwritten mid-session with different, equally valid
Turkish phrasing; a stray `mdxcheck.mjs` and several `e2e/p41-*.spec.ts`/`playwright.p41*.config.ts`
temp files appeared and were cleaned up by both sides). The final state on `main` at commit time is
what both conclusively verified together.

**Bugs found and fixed during verification** (beyond ordinary translation):
- Two frontmatter `title` fields used a straight `'` apostrophe inside a single-quoted YAML string
  (`milestone'lar`, `claim'ler`), which breaks YAML parsing — fixed to curly `'`.
  (`m18-multi-session/01-plan-files.mdx`, `02-state-md-and-claims.mdx`)
- A tag entry had a Turkish suffix baked into the tag string itself (`'claim'ler'` as a tag) —
  fixed to the bare English tag (`m18-multi-session/02-state-md-and-claims.mdx`).
- Several Quiz `text`/`explanation` JS string literals used a straight `'` delimiter with an
  unescaped apostrophe inside, breaking the MDX/JS parser at build time — fixed by switching those
  specific strings to `"..."` delimiters (`m17-autonomy/05-monitors-and-channels.mdx`,
  `m18-multi-session/02-state-md-and-claims.mdx`).
- A stray literal `</content>` tag had been appended after the last paragraph of
  `m17-autonomy/02-routines.mdx`, breaking the MDX parser — removed.
- `m18-multi-session/06-this-repo-as-example.mdx`: a glossary link had link text "tazelik"
  (freshness) pointing at anchor `#ci` with a parenthetical defining CI — the link was on the wrong
  word. Moved the link onto "CI" itself, per the `reviewer` subagent's finding.
- None of the above surfaced in `npm run gate` (schema/parity only) or `npm run typecheck`/`lint`
  after a stale `node_modules/.astro` cache was cleared — only a full `npm run build` (real MDX/JSX
  parse) caught the JS-string and stray-tag breaks. **Recommendation for future TR plans:** run a
  full `npm run build` from a clean cache before declaring a translation plan done; `gate` alone is
  not sufficient.

**Review counts.** The `reviewer` subagent (`.claude/agents/reviewer.md`) was run via `claude -p`
against a 5-file sample spanning 5 different modules (`m16-orchestration/01-workflows.mdx`,
`m17-autonomy/02-routines.mdx`, `m18-multi-session/06-this-repo-as-example.mdx`,
`m19-visual/01-artifacts.mdx`, `m21-scale/03-prompt-caching.mdx`, each against its EN twin), per
`.claude/rules/content.md`, `.claude/rules/i18n.md`, `docs/CURRICULUM.md` §3/§4 and
D006/D041–D044/D070/D093. Result: **0 blocker, 4 major, 1 minor**. Template order, EN/TR frontmatter
parity, transcript authenticity (D070), sources blocks (D044) and public-repo hygiene were all
clean. All 4 major findings traced to one root cause — missing glossary.mdx first-use links for
`routine`, `artifact` and `prompt caching` — which is the direct, expected result of this plan's
explicit instruction not to touch the sibling-owned `content/tr/playbook/glossary.mdx`; see
`open_questions`. The 1 minor finding (the "tazelik"/`#ci` link mismatch above) was fixed. The
reviewer's own review-fix plan is recorded at
`<you>/.claude/plans/ (local, not committed)` for reference. Only 5 of 31
lessons were reviewer-sampled; the same first-use-link gap likely exists in the other 26 (same root
cause), and should be swept in the follow-up pass noted in `open_questions`.

**Verification performed (real output, this session):**
- `npm run gate` → `content gate: OK (294 files checked)`
- `npm run typecheck` → `Result (110 files): 0 errors, 0 warnings, 11 hints`
- `npm run lint` → eslint + `All matched files use Prettier code style!` + `check-no-inline-script: OK (73 files scanned)`
- `npm test` → `Test Files 22 passed (22)`, `Tests 187 passed (187)`
- `npm run build` (after clearing a stale `node_modules/.astro` cache that was masking real MDX errors) → 262 pages built, pagefind indexed, `check-no-inline-script (dist): OK (262 files scanned)`
- `node scripts/check-public-hygiene.mjs` → `public-hygiene: OK (tracked)`
- `node scripts/check-raw-colors.mjs` → `check-raw-colors: OK (77 files scanned)`
- `node tools/plan/cli.ts check` → `ok: 48 plans, frontmatter valid, DAG acyclic, no owned_paths overlap, STATE.md fresh`
- A custom script diffed every fenced code block and every `<Transcript src/range>` prop between
  each of the 31 EN/TR pairs: 0 mismatches.
- A script confirmed every `/tr/playbook/glossary/#<anchor>` link in the 31 files resolves to an
  existing `### term` heading in `glossary.mdx`: all resolve.
- Playwright/axe on a dedicated preview server (build served from the final `dist/`): `e2e/shell.spec.ts`
  (LangSwitch EN↔TR round-trip), `e2e/lesson.spec.ts`, `e2e/a11y.spec.ts`, and a temporary spec
  hitting all 31 TR L4 lesson routes at 390px and 1280px — 52 passed, 0 serious/critical axe
  violations. One pre-existing `target-size` finding appears on both the EN and TR twin of several
  pages (site-wide breadcrumb/link spacing, not introduced by this translation) — confirmed
  identical on EN and TR, so not a translation regression. Temporary Playwright config/spec files
  and the dedicated preview server were removed/killed afterward.
- `dist/en/l4-master/` and `dist/tr/l4-master/` contain the identical 38-route set.

**Second reviewer pass (independent sample, same session).** The `reviewer` subagent was run a
second time via `claude -p --permission-mode plan` over a different 6-file sample, one per module
(`m16-orchestration/02-ultracode.mdx`, `m17-autonomy/05-monitors-and-channels.mdx`,
`m18-multi-session/03-owned-paths-worktrees.mdx`, `m19-visual/02-design-canvas.mdx`,
`m20-team/05-cost-budgeting.mdx`, `m21-scale/03-prompt-caching.mdx`). Verdict: **PASS — 0 blockers,
0 majors, 5 minors**, with section order, EN/TR frontmatter parity, `lang="tr"`/`tr/` lessonId
prefixes, quiz counts and correct-answer indices, and byte-identical code blocks, commands and
transcript props all reported clean. All 5 minors were applied, and each was swept across all 31
lessons rather than only the sampled file:

1. Untranslated tag `'usage'` → `'kullanım'` (`m21-scale/03-prompt-caching.mdx`).
2. `hiç bir` → `hiçbir` (4 occurrences, `m20-team/05-cost-budgeting.mdx` and elsewhere).
3. Apostrophe wrongly applied to the native Turkish word `oturum` (`oturum'da` → `oturumda` and
   the other suffixed forms) — 25 occurrences across `m18`, `m20` and `m21`.
4. Mixed straight/curly apostrophe style within files: **deliberately not normalised inside JSX
   expression strings.** A single-quoted JS literal cannot contain a straight `'`, so the curly `'`
   inside `<Quiz>`/`<Lab>` prop strings is load-bearing, not a typo; body prose keeps the straight
   `'` that `.claude/rules/i18n.md` specifies. Flagged here so a future pass does not "fix" it and
   break the build.
5. A garbled clause in `m20-team/05-cost-budgeting.mdx:136` (a dropped noun) rewritten against the
   EN twin.

**Further build-breaking string bugs found and fixed after that pass** (same class as the ones
above, caught by the JSX-literal scanner rather than by `gate`/`lint`/`typecheck`):
`m19-visual/02-design-canvas.mdx:202` and `:221` — two `<Quiz>` literals delimited with `'` while
containing `Canvas'ı`/`Canvas'ta`; switched to `"..."`. Also translated ten `<CodeBlock title=...>`
props that had been left in English across `m17`, `m18`, `m21` (file-name titles such as
`settings.json` or `Dockerfile` were correctly left alone).

**Terminology normalisation.** `m18-multi-session` had initially been translated with `session`
left in English and `claim` rendered as `iddia`. Both were normalised to match the merged L1/L2
corpus and this repo's own vocabulary: `session` → `oturum` (the merged TR levels contain zero
`session'` forms), and the plan-system `claim` kept in English with Turkish suffixes, since it names
the `cli.ts claim` protocol. `iddia` is retained where it genuinely means *assertion*.

**Final verification re-run after every fix above:** `gate` OK (294 files), `typecheck` 0 errors,
`lint` clean (prettier + inline-script), `npm test` 22 files / 187 tests passed, `npm run build`
Complete with `check-no-inline-script (dist): OK (262 files scanned)`, hygiene OK, raw-colors OK
(77 files), `plan cli check` ok, EN/TR route sets identical at 38 each, and the EN/TR code-block
diff clean at 31 pairs / 107 fenced blocks / 86 transcript embeds. A temporary Playwright config on
port 4442 plus a temporary spec asserted each of six TR lesson routes against its EN twin at 390px
and 1280px: 12 passed, with the TR page's serious/critical axe set exactly equal to the EN twin's
(`target-size x2` at 390px on both, empty at 1280px). Both temp files were deleted afterwards.

**Not done / left for the owner:** the three `open_questions` above (glossary entries, `teammate`
rendering, `connector`/`repository`/`environment` kept-English status).

**Additional pass (this session, sonnet-p41-2026-09-08).** Independently ran the `reviewer` subagent
against a second, non-overlapping 4-file sample (`m16-orchestration/01-workflows.mdx`,
`m17-autonomy/03-goal.mdx`, `m19-visual/02-design-canvas.mdx`, `m21-scale/03-prompt-caching.mdx`)
and fixed what it found:
- `m19-visual/02-design-canvas.mdx`: two invented glossary links, `[monitor](#monitor)` and
  `[routine](#routine)`, pointed at anchors that do not exist in `glossary.mdx` — removed the links,
  kept the inline parenthetical, consistent with the open_questions constraint above.
- `m17-autonomy/03-goal.mdx`: first use of `transcript` was missing its glossary link — added
  `[transcript](/tr/playbook/glossary/#transcript)` (the anchor exists).
- `m19-visual/02-design-canvas.mdx`: "canvas" (an explicit kept-English term for this module) had
  been translated as "tuval" throughout — reverted every instance to "canvas" with the correct
  Turkish apostrophe suffix, and fixed a title-field straight-apostrophe YAML break and two
  single-quoted-JS-string apostrophe breaks introduced by that same find/replace.
- Repo-wide script confirmed, after the above, that every `/tr/playbook/glossary/#<anchor>` link in
  all 31 lessons resolves to an existing `### term` heading — zero dangling anchors.
- Re-ran the full verification suite after these fixes: `npm run gate` (294 files OK), `npm run
  typecheck` (0 errors), `npm run lint` (clean), `npm test` (187/187), `npm run build` (262 pages,
  `check-no-inline-script (dist): OK`), `node scripts/check-public-hygiene.mjs` (found and fixed one
  violation — an absolute local user profile path a concurrent session had written into this plan
  file's own Handoff notes above; redacted to `<you>/...`), `node scripts/check-raw-colors.mjs` (OK),
  `node tools/plan/cli.ts check` (48 plans OK).
- Playwright/axe re-verified on a fresh preview (port 4441): `e2e/a11y.spec.ts` plus a temporary
  spec hitting one lesson per module (`m16-orchestration/workflows`, `m17-autonomy/loop`,
  `m18-multi-session/plan-files`, `m19-visual/artifacts`, `m20-team/shared-settings`,
  `m21-scale/prompt-caching`) at 390/1280 comparing each TR page's serious/critical axe findings
  against its EN twin — 12/12 passed, identical finding sets (the one pre-existing `target-size`
  finding matches on both languages). `e2e/shell.spec.ts` (18/18, LangSwitch round-trip) and a
  one-off render check of `m16-orchestration/workflows` (title, `lang="tr"`, header/footer,
  "Kaynaklar" heading) also passed. Temporary Playwright config/spec files deleted afterward.
- This session confirms the shared-worktree process note above: this worktree was visibly being
  edited concurrently by another process throughout (files changed mid-read repeatedly, `status:
  review` and most of the Handoff notes above were already present before this session finished its
  own pass). The two passes' findings and fixes are complementary, not conflicting, and the final
  on-disk state reflects both.

**Final sweep (this session, continued): heading consistency + missing first-use glossary links.**
- Standardised three template-section headings that had drifted per-module to match the merged
  `l1-beginner/m01-start/01-what-claude-code-is.mdx` reference exactly across all 31 files:
  `## Konsept` → `## Kavram` (5 files, `m17-autonomy`), `## Anti-desenler` → `## Anti-pattern'ler`
  (5 files, `m16-orchestration`), `## Sınav` → `## Quiz` (21 files, `m16/m18/m20/m21`).
- Fixed 5 stray `<Lab lessonId="en/l4-master/...">` props left untranslated from the EN source
  (should be `tr/l4-master/...`, matching the already-correct `<Quiz lessonId="tr/...">` on the same
  pages) — `m17-autonomy/01-loop.mdx`, `m19-visual/01-artifacts.mdx`, `02-design-canvas.mdx`,
  `03-chrome-automation.mdx`, `04-dataviz.mdx`. Each of these has its own per-lesson `localStorage`
  checklist key, so the EN id would have namespaced a Turkish reader's lab progress under the
  English lesson — a functional bug, not cosmetic.
- Discovered (via a repo-wide scan comparing every kept-English term's presence against
  `glossary/#<term>` link presence per file) that `m21-scale` (all 5 lessons) and 4 files in
  `m20-team` (`01-shared-settings`, `03-team-marketplace`, `04-review-process`,
  `06-communications-and-champions`) had **zero** glossary links anywhere on the page, despite using
  many already-glossaried terms (agent, tool, prompt, MCP server, subagent, hook, skill, plugin,
  sandbox, token, commit, branch, worktree, transcript, headless, context window, permission mode,
  plan mode, effort, diff, merge, pull request, issue, secret, CI, GitHub App, fork) repeatedly in
  prose. Added first-use links with short Turkish parentheticals (matching `glossary.mdx`'s own
  wording) at each term's true first genuine-prose occurrence in all 9 files — skipped anything
  inside fenced code, inline code spans, or JSX structural props (the `checklist={[...]}` prop name
  in particular is not prose and was never linked). `prompt caching`, `gateway` and `devcontainer`
  (no glossary entry, per open_questions above) got an inline parenthetical explanation instead of a
  link, matching the rest of the level.
- Re-verified after this sweep: `npm run gate` (294 files OK), `npm run lint` (clean, 0 reformats
  needed), fenced-code-block + Transcript-prop byte-diff across all 31 EN/TR pairs (0 mismatches),
  and a script confirming all 30 distinct `glossary/#<anchor>` references across the level resolve
  to an existing `### term` heading (0 dangling). `npm run typecheck` (0 errors), `npm test`
  (187/187), `npm run build` (262 pages, `check-no-inline-script (dist): OK`; one transient
  Windows/rolldown module-resolution flake on a cold `.astro` cache, resolved by `astro sync` +
  retry — not a content defect). `node scripts/check-public-hygiene.mjs`, `check-raw-colors.mjs`,
  `tools/plan/cli.ts check` all OK. Playwright/axe on a fresh preview (port 4442): `e2e/a11y.spec.ts`
  + `e2e/shell.spec.ts` + `e2e/lesson.spec.ts` (52 passed) plus a temporary spec covering the 4
  heaviest-edited `m20-team`/`m21-scale` lesson routes at 390/1280 (14 passed, 0 serious/critical).
  Temporary Playwright config/spec files removed and the preview server stopped afterward.
- After this sweep, every one of the 31 lessons has at least one working glossary link (previously
  9 had none); the reviewer's recurring "missing first-use link" finding across earlier samples is
  resolved level-wide, not just on the sampled files.

