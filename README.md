<div align="center">

# Claude Code Academy

**Learn Claude Code the way you will actually use it.**

A levelled, hands-on curriculum for developers — 119 lessons in English and Turkish, every
feature exercised in a real terminal, every claim traced to a source.

[![Site](https://img.shields.io/badge/read%20it-cc.codechup.com-B75434?style=for-the-badge&labelColor=17130F)](https://cc.codechup.com)
[![Languages](https://img.shields.io/badge/EN%20%2F%20T%C3%9CRK%C3%87E-both%20complete-2F6585?style=for-the-badge&labelColor=17130F)](https://cc.codechup.com/tr/)
[![Licence](https://img.shields.io/badge/licence-MIT-2F6B4A?style=for-the-badge&labelColor=17130F)](LICENSE)

[![CI](https://github.com/codechup/claude-code-training/actions/workflows/ci.yml/badge.svg)](https://github.com/codechup/claude-code-training/actions/workflows/ci.yml)
[![Deploy](https://github.com/codechup/claude-code-training/actions/workflows/deploy.yml/badge.svg)](https://github.com/codechup/claude-code-training/actions/workflows/deploy.yml)
[![Changelog drift](https://github.com/codechup/claude-code-training/actions/workflows/changelog-weekly.yml/badge.svg)](https://github.com/codechup/claude-code-training/actions/workflows/changelog-weekly.yml)
[![Links](https://github.com/codechup/claude-code-training/actions/workflows/links-weekly.yml/badge.svg)](https://github.com/codechup/claude-code-training/actions/workflows/links-weekly.yml)

**English** · [Türkçe](README.tr.md)

</div>

---

## What this is

Most material about AI coding tools is a feature tour. This is a course. You start by
installing Claude Code and end by running multi-agent workflows across parallel sessions,
and at every step there is something to run, something that can go wrong, and a reason the
lesson gives for doing it one way rather than another.

It is written for developers who are new to agentic tooling **and** for people who already
use Claude Code daily and want the parts nobody explains — hook exit codes, permission rule
syntax, subagent tool scoping, plan files, prompt caching.

|                         |                                                       |
| ----------------------- | ----------------------------------------------------- |
| **Lessons**             | 119 in English, 119 in Turkish                        |
| **Levels**              | 4, across 21 modules                                  |
| **Time**                | about 33 hours end to end                             |
| **Terminal recordings** | 261, captured from real sessions                      |
| **Cited sources**       | 142, each with the date it was last verified          |
| **Verified against**    | Claude Code `2.1.265`                                 |
| **Price**               | free, MIT, no account, no tracking beyond page counts |

## Three rules the content follows

**Nothing is written from memory.** Every behavioural claim traces to the official
documentation, and each lesson lists its sources with a verification date. A weekly job
compares the upstream changelog against what the course claims and opens an issue when they
diverge.

**No fabricated output.** The 261 terminal recordings are captured from sessions actually
run against the companion lab repository. When a feature could not be demonstrated — a
desktop UI, an early-access command — the lesson says so instead of inventing a transcript.

**Every lesson says when _not_ to use the thing it teaches.** Knowing that four subagents
are overkill for a small repository is worth as much as knowing how to write one.

## The curriculum

<table>
<tr><td valign="top" width="50%">

**Level 1 · Beginner** — 21 lessons, 4.9 h

> Install, authenticate, and have a first genuinely productive session.

`m01` Getting Claude Code running
`m02` Talking to Claude Code
`m03` Giving Claude memory
`m04` Built-in commands and the terminal

**Level 2 · Intermediate** — 30 lessons, 8.5 h

> Shape the tool: models, skills, hooks, and git flows that hold up.

`m05` Choosing model and effort
`m06` Skills and custom commands
`m07` Hooks
`m08` Git workflows with Claude
`m09` Prompting for agents

</td><td valign="top" width="50%">

**Level 3 · Advanced** — 37 lessons, 11.1 h

> Delegate, connect and automate — securely.

`m10` Subagents and custom agents
`m11` Model Context Protocol
`m12` Plugins and marketplaces
`m13` Headless, CI and the Agent SDK
`m14` Working securely
`m15` Every place Claude Code runs

**Level 4 · Master** — 31 lessons, 8.4 h

> Run it at scale, on its own, across sessions and teams.

`m16` Multi-agent orchestration
`m17` Autonomous loops
`m18` Coordinating parallel sessions
`m19` Artifacts, design and browsers
`m20` Team adoption
`m21` Large codebases and infrastructure

</td></tr></table>

Plus a **Playbook** (decision trees, 93 best practices, a 141-entry anti-pattern catalogue,
a glossary, and a changelog of what moved since 2025) and a **Meta** section that documents
how this site was built, using itself as the worked example.

## The lab

Every hands-on lesson names a tag in [`codechup/claude-code-lab`](https://github.com/codechup/claude-code-lab) —
a small TypeScript CLI and HTTP service seeded with real bugs:

```bash
git clone https://github.com/codechup/claude-code-lab
cd claude-code-lab && npm ci
git checkout lesson/m10-03-start    # the state the lesson expects
```

98 tags, one pair per exercise: `-start` for the state before, `-solution` for after.

## How it is built

An Astro static site with MDX lessons, Tailwind v4 and Pagefind search, deployed by GitHub
Actions to a static host behind Cloudflare. No server runtime, no database, no accounts.

What makes the repository itself worth reading is that it uses everything the course teaches:

- **`.claude/`** — the rules, hooks, skills and subagents this project runs on. The Meta
  section walks through them line by line.
- **`plans/` + `STATE.md`** — 51 plan files and a generated status board. The whole course
  was written by parallel Claude Code sessions claiming plans and working in disjoint
  worktrees; Level 4 teaches the pattern using this repository as the case study.
- **Five gates** — content schema and EN/TR parity, type-check, lint with a public-hygiene
  and raw-colour scan, unit tests, a build that forbids inline scripts, plus Playwright with
  axe at 390 px and 1280 px and Lighthouse budgets.

```bash
npm ci
npm run dev          # http://localhost:4321
npm run gate         # EN/TR parity, frontmatter schema, fenced-code rules
npm test             # vitest
npm run build        # Astro + Pagefind + inline-script check
npx playwright test  # e2e with axe
```

## Staying current

Claude Code ships most weeks. A course that pins a version quietly rots, so currency is
mechanical here:

1. A **Monday job** parses the upstream changelog, keeps only releases newer than the pin
   this course claims, and routes each entry to the lessons it affects — by matching the
   backticked identifiers in the entry against an index built from all 119 lessons. No model
   is involved, so the weekly cost is zero.
2. It maintains **one issue** with the triage table, and turns red if an entry sits
   unreviewed for three weeks.
3. A human then runs `/changelog-triage`, which sees only the pending entries and the exact
   lesson lines they touch — so the cost of an update is proportional to what changed, never
   to the size of the course.
4. The content gate refuses to merge a lesson claiming a version above the reviewed pin, so
   drift cannot pass silently.

## Contributing

Found a lesson that no longer matches the tool? That is the single most useful thing you can
report — open an issue with the
[outdated-lesson form](https://github.com/codechup/claude-code-training/issues/new?template=lesson-outdated.yml).

Pull requests are welcome. `main` requires a pull request, a linear history and green
checks; commits must carry no personal identity and no session URLs, which a pre-push hook
and CI both enforce. `CONTRIBUTING` lives in the
[Meta section](https://cc.codechup.com/en/meta/contributing/).

## Licence

[MIT](LICENSE) — the code, the lessons and the translations. Claude and Claude Code are
trademarks of Anthropic; this is an independent, unaffiliated course.
