# Roadmap

The big picture for CodeChup Claude Code Academy: five milestones, forty-eight plans, executed by multiple Claude Code sessions in parallel per `plans/README.md`. Decisions are cited as `(Dnnn)` from [`../DECISIONS.md`](../DECISIONS.md) and are never re-litigated inside a plan.

## Milestones and waves

| Milestone | Wave | Meaning |
|---|---|---|
| **M0** | W0 | Infrastructure and design: repo scaffold, plan tool, CI/CD, design canvas, tokens, content pipeline, dogfooded `.claude/`, one sample lesson live in both languages. |
| **M1** | W1 | English L1 Beginner and L2 Intermediate content complete, the lab repo live, sources registry seeded, M1 released (TR shown as "coming"). |
| **M2** | W2 | Turkish L1–L2 translated in parallel with English L3 Advanced and L4 Master content, M2 released. |
| **M3** | W3 | Turkish L3–L4 translated in parallel with the Playbook and Meta sections (English, then Turkish), M3 released with drafts disallowed. |
| **M4** | — | Launch hardening: source verification sweep, hreflang/analytics/a11y re-audit, cache rules, weekly link-check routine. |

D072 sets the MVP bar (infra + design + L1–L2 complete, L3–L4 skeleton); D094 there is no fixed deadline — quality first; D095 names the four waves.

## Parallelism rule

Two plans with the same milestone can be claimed and worked at the same time only if their `owned_paths` are disjoint (D048). Content-authoring plans keep this simple by construction: **a content plan owns only `content/<lang>/<level>/<module>/**` plus `content/_shared/transcripts/<module>/**`** — nothing else. This is why every L1–L4 module, in either language, is its own plan: a Beginner module and an Advanced module never touch the same files, so they can run on different sessions (different models, different effort) at the same time once their shared dependencies (the M0 release, the lab repo, the sources registry) are done.

Two deliberate exceptions to "only that module's content," both scaffold-then-handoff (the same pattern P01 uses for `src/**`):

- **P06** (M0) creates the initial `index.mdx` for every level and module, in both languages, plus one placeholder lesson pair, so routes and the content-gate have something to build against before any lesson plan exists. Every later content plan takes ownership of its own module subtree from there.
- **P12** (M0 release) turns P06's placeholder into the real first lesson (`m01-start`, lesson 01) in both languages plus its transcript, so the M0 release has one genuine EN+TR lesson live. **P13** (which owns the rest of `m01-start`) must not recreate that file — it extends the module with lessons 02–05.
- Each EN content plan (P13–P21, P27–P38) also creates the matching **Turkish draft stub** (`draft: true`, produced by the `/new-lesson` skill in the same commit as the EN lesson) under `content/tr/<level>/<module>/**`, and appends its lesson's sources to `content/_shared/sources.json`. Ownership of that TR subtree passes to the matching TR translation plan (P25, P26, P40, P41); ownership of `content/_shared/sources.json` (seeded by P23) and `content/tr/playbook/glossary.mdx` (stubbed by P06) is append-only shared ground until P46 and P44 respectively finalize them.

One deviation from a strict "depends only on the milestone gate" shape: **P13–P21 also depend on P22 and P23**, not only on P12/P03. D099 makes cloning the lab repo and running every lab a hard prerequisite for writing a lesson, and D041/D043 make the sources registry the place lessons record their citations — so the lesson plans cannot start until both exist. P22 and P23 only depend on P03 and are cheap (sonnet/medium and haiku/low), so this does not lengthen the critical path.

## Plan table

`model_hint` is `haiku | sonnet | opus | fable`; `effort_hint` is `low | medium | high | xhigh | max`. `depends_on` lists explicit plan ids only — never ranges — matching each plan file's frontmatter exactly.

| Plan | Title | Milestone | model_hint / effort_hint | depends_on |
|---|---|---|---|---|
| P00 | Design canvas: brand, tokens, and screen layouts | M0 | fable / high | — |
| P01 | Repo scaffold: Astro, MDX, Tailwind, i18n, tooling | M0 | sonnet / medium | — |
| P02 | Plan tool port and first STATE.md | M0 | sonnet / medium | P01 |
| P03 | Curriculum map and currency research | M0 | fable / high | P01 |
| P04 | Continuous integration pipeline | M0 | sonnet / medium | P01, P02 |
| P05 | Tokens and theme from the approved canvas | M0 | sonnet / medium | P00, P01 |
| P06 | Content pipeline: collections, routes, and landing | M0 | fable / high | P04, P05 |
| P07 | MDX components A: prose and code presentation | M0 | sonnet / medium | P06 |
| P08 | MDX components B: quiz, decision trees, feedback | M0 | sonnet / medium | P06 |
| P09 | Search and SEO | M0 | sonnet / medium | P06 |
| P10 | Deploy workflow and static host runbook | M0 | sonnet / medium | P04 |
| P11 | Dogfooded `.claude/` setup | M0 | opus / high | P02, P06 |
| P12 | Milestone M0 release | M0 | sonnet / medium | P07, P08, P09, P10, P11 |
| P13 | L1 Beginner module: Start (m01-start) | M1 | opus / high | P12, P03, P22, P23 |
| P14 | L1 Beginner module: Interact (m02-interact) | M1 | opus / high | P12, P03, P22, P23 |
| P15 | L1 Beginner module: Memory (m03-memory) | M1 | opus / high | P12, P03, P22, P23 |
| P16 | L1 Beginner module: Commands (m04-commands) | M1 | opus / high | P12, P03, P22, P23 |
| P17 | L2 Intermediate module: Models and effort (m05-models-effort) | M1 | opus / high | P12, P03, P22, P23 |
| P18 | L2 Intermediate module: Skills (m06-skills) | M1 | opus / high | P12, P03, P22, P23 |
| P19 | L2 Intermediate module: Hooks (m07-hooks) | M1 | opus / high | P12, P03, P22, P23 |
| P20 | L2 Intermediate module: Git flows (m08-git) | M1 | opus / high | P12, P03, P22, P23 |
| P21 | L2 Intermediate module: Prompting (m09-prompting) | M1 | opus / high | P12, P03, P22, P23 |
| P22 | Lab repository scaffold (`codechup/claude-code-lab`) | M1 | sonnet / medium | P03 |
| P23 | Sources registry | M1 | haiku / low | P03 |
| P24 | Milestone M1 release | M1 | sonnet / medium | P13, P14, P15, P16, P17, P18, P19, P20, P21, P22, P23 |
| P25 | TR translation: L1 Beginner | M2 | sonnet / medium | P24 |
| P26 | TR translation: L2 Intermediate | M2 | sonnet / medium | P24 |
| P27 | L3 Advanced module: Subagents (m10-subagents) | M2 | opus / high | P24 |
| P28 | L3 Advanced module: MCP (m11-mcp) | M2 | opus / high | P24 |
| P29 | L3 Advanced module: Plugins (m12-plugins) | M2 | opus / high | P24 |
| P30 | L3 Advanced module: Headless and CI (m13-headless-ci) | M2 | opus / high | P24 |
| P31 | L3 Advanced module: Security (m14-security) | M2 | opus / high | P24 |
| P32 | L3 Advanced module: Platforms (m15-platforms) | M2 | opus / high | P24 |
| P33 | L4 Master module: Orchestration (m16-orchestration) | M2 | opus / high | P24 |
| P34 | L4 Master module: Autonomy (m17-autonomy) | M2 | opus / high | P24 |
| P35 | L4 Master module: Multi-session (m18-multi-session) | M2 | opus / high | P24 |
| P36 | L4 Master module: Visual (m19-visual) | M2 | opus / high | P24 |
| P37 | L4 Master module: Team (m20-team) | M2 | opus / high | P24 |
| P38 | L4 Master module: Scale (m21-scale) | M2 | opus / high | P24 |
| P39 | Milestone M2 release | M2 | sonnet / medium | P25, P26, P27, P28, P29, P30, P31, P32, P33, P34, P35, P36, P37, P38 |
| P40 | TR translation: L3 Advanced | M3 | sonnet / medium | P39 |
| P41 | TR translation: L4 Master | M3 | sonnet / medium | P39 |
| P42 | Playbook (EN) | M3 | opus / high | P39 |
| P43 | Meta section (EN) | M3 | opus / high | P39 |
| P44 | TR translation: Playbook and Meta | M3 | sonnet / medium | P40, P41, P42, P43 |
| P45 | Milestone M3 release | M3 | sonnet / medium | P40, P41, P42, P43, P44 |
| P46 | Sources verification sweep | M4 | haiku / low | P45 |
| P47 | Launch hardening | M4 | sonnet / medium | P45 |

Note on P44: it depends on P40 and P41 in addition to P42 and P43 because P25/P26/P40/P41 each append their module's terms to the shared Turkish glossary stub (`content/tr/playbook/glossary.mdx`, created by P06) as they translate; P44 is the plan that gives that file its final, edited form, so it needs every appender finished first.

## Cross-repo boundary

The host-side vhost change that puts `cc.codechup.com` on the static host is executed as a separate plan in the owner-managed, private infrastructure repository (D037, D086) — it is never one of P00–P47 and never a `depends_on` entry here. The release plans (P12, P24, P39, P45) list the on-box and edge smoke evidence they need from that side as a plain-language gate in their Context section, not as a plan id.
