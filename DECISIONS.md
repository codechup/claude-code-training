# Decisions

This document is the single source of truth for the product, technical, and process decisions behind CodeChup Claude Code Academy. Decisions are numbered D001–D100, one per question in the 100-question intake that produced them; every plan file cites the decisions it relies on as `(Dnnn)`. Executing sessions never re-litigate a decision recorded here — a decision changes only through an owner-approved pull request against this file. A few numbers were folded into another decision during intake; each still gets its own entry below, pointing at the decision that absorbed it, so every number from D001 to D100 exists. Owner overrides of the recommended option are marked ★.

### D001 — Audience

Audience is developers new to AI-assisted coding tooling and experienced Claude Code users who want depth; the course is not aimed at absolute beginners to programming or at managers-only content.

### D002 — OS coverage

macOS, Linux, and Windows (PowerShell and WSL) are covered with equal weight; every command block in a lesson carries an OS tab selector so a reader on any platform sees working commands.

### D003 — Outcome

A learner who finishes the course can run their own project fully autonomously with Claude Code: hooks, skills, subagents, and CI wired up and trusted.

### D004 — Baseline

Content teaches today's Claude Code (September 2026): the Claude 5 model family including Fable 5.1, workflows, ultracode, and artifacts — not the 2025-era tool.

### D005 — Structure

The curriculum is levelled — Beginner, Intermediate, Advanced, Master; levels contain modules, and modules contain lessons.

### D006 — Lesson template sections

Every lesson follows a fixed template: Objectives + prerequisites, When NOT to use (folds in D090), Concept, Hands-on lab, Anti-patterns, Quiz, Sources.

### D007 — Lab stack and verification

Labs run against one sandbox repository on GitHub, `codechup/claude-code-lab`, a small TypeScript/Node CLI and API app with intentional bugs; each lesson has its own git tag (folds in D053) and its lab is verified by an expected result plus a checklist plus a real sample transcript (folds in D054).

### D008 — Folded into D007

Folded into D007: the lab stack is TypeScript/Node, not a per-lesson language choice.

### D009 — Lesson count

There is no cap on lesson count; scope decides how many lessons a module needs.

### D010 — No basics module

There is no terminal or git basics module; the reader is assumed to already be a working developer.

### D011 — In scope beyond the CLI

Beyond the terminal, the course covers the Agent SDK, Claude in Chrome, the Desktop app and IDE extensions (VS Code, JetBrains), and the web app (claude.ai/code) including cloud sessions.

### D012 — Source priority

Sources are prioritized official docs first, then the Anthropic blog and YouTube channel, then community sources (awesome lists, blogs), then independent YouTube instructors.

### D013 — Static site framework

The site is built with Astro in static output mode.

### D014 — Lesson format

Lessons are authored in MDX.

### D015 — Parallel content trees

Content lives in parallel `content/en/**` and `content/tr/**` trees that share the same slugs.

### D016 — English as source language

English is the source language; Turkish is a translation that keeps English technical terms and explains them on first use (see D018).

### D017 — Root redirect

The root path `/` redirects by `Accept-Language` to `/en` or `/tr`, defaulting to English.

### D018 — Terminology policy

Turkish lessons keep English technical terms (hook, skill, subagent, and so on) rather than inventing Turkish equivalents, explain each on first use, and link first uses to the Playbook glossary.

### D019 — Code block features

Code blocks carry a copy button, OS tabs whose choice is remembered, real Claude Code transcript "recordings" rendered by a static component with no fabricated output (folds in D070; see also D093), and line highlighting with annotations.

### D020 — Progress storage

Lesson progress is tracked in `localStorage`; there are no user accounts.

### D021 — L1 Beginner modules

L1 Beginner covers: install/auth/first session; prompting, files, and permissions including plan mode; CLAUDE.md and memory; and built-in slash commands and keybindings.

### D022 — L2 Intermediate modules

L2 Intermediate covers: models and effort; custom commands and skills; hooks (all events); and git flows, worktrees, and PRs.

### D023 — L3 Advanced modules

L3 Advanced covers: subagents and custom agents; MCP (use, write, secure); plugins and marketplaces; and headless/CI, GitHub Actions, and the Agent SDK.

### D024 — L4 Master modules

L4 Master covers: workflows/ultracode/multi-agent orchestration; autonomous loops (`/loop`, routines, cron); multi-session work with STATE.md and plan files; and artifacts, the design canvas, and Chrome automation.

### D025 — Best practices placement

Best practices are embedded in lessons and also collected in a separate Playbook section.

### D026 — ★ Case studies are anonymous or fictional

Owner override: case studies used to illustrate practices are anonymous or fictional; the course never names or cites the owner's other, private projects.

### D027 — Prompt engineering

Prompt engineering gets its own module and, in addition, an example prompt in every lesson.

### D028 — Cost and context

A dedicated topic covers `/compact`, `/clear`, and the context window; `/cost` and `/usage`; plan vs. API billing; token-saving techniques; and prompt caching.

### D029 — Design language

The visual design language is a dark-leaning "terminal" aesthetic.

### D030 — Theme modes

The site ships dark and light themes, follows the system preference by default, and offers a manual toggle.

### D031 — Typography

Body/UI type is Inter; code and terminal text is JetBrains Mono.

### D032 — Brand name

The brand is "CodeChup Claude Code Academy," presented as a CodeChup sub-brand.

### D033 — Design page contents

`/design` is a living component library: it shows the design tokens, canvas exports, design principles, and accessibility rules alongside working components.

### D034 — Design page routing

`/design` is English-only and sits outside the locale-prefixed routes.

### D035 — Mobile-first

Layout is mobile-first and must look and work correctly at 390 px.

### D036 — Accessibility target

The site targets WCAG 2.2 AA, checked with axe in CI.

### D037 — Second vhost

`cc.codechup.com` is served as a second vhost on the static host's existing reverse-proxy container, with its own static root isolated from the other sites the host serves.

### D038 — DNS record

The owner adds a Cloudflare DNS `A` record for `cc` pointing at the static host, proxied; the deploy documentation lists the exact steps.

### D039 — Deploy pattern

GitHub Actions builds on push to `main` and deploys with a two-phase rsync, following the deploy pattern already proven on a sibling static-host project.

### D040 — Repository

The site lives in a new public repository, `codechup/claude-code-training`.

### D041 — Sources block

Every lesson ends with a Sources block: a mandatory official-docs link, YouTube entries as title + duration + channel, article/repo links, and a "last verified" date.

### D042 — YouTube presentation

YouTube sources are shown as link cards, never embedded players.

### D043 — Source verification

Sources are verified twice: with WebFetch during authoring, and with `lychee` link-checking in CI.

### D044 — Deprecated features

A deprecated or superseded feature is documented only as a short "Changed" note plus an entry on a changelog page, never as full lesson content.

### D045 — Plan-file execution model

Work is coordinated through `plans/PNN-*.md` files and a generated `STATE.md`, a plan-file pattern already proven on a sibling project.

### D046 — Model/effort by work type

Model and effort are chosen by work type: architecture/design work uses Fable at high effort; infra/scaffold/deploy uses Sonnet at medium effort; content authoring uses Opus at high effort; translation uses Sonnet at medium effort; mechanical work uses Haiku at low effort.

### D047 — Plan body sections

Every plan file body has the same ten sections in the same order: Goal, Context, Scope, Deliverables, Acceptance criteria, Steps, Tests required, Non-goals/pitfalls, Verification, Handoff notes.

### D048 — Parallelism via owned_paths

Sessions run in parallel safely because each plan declares disjoint `owned_paths`; two plans that could run at the same time never claim the same files.

### D049 — Plan tool language

The plan CLI is (re)written in Node (`tools/plan/*.ts`), not ported as-is from any other language.

### D050 — Dogfooding

The repository dogfoods Claude Code on itself: a `CLAUDE.md` and rules, hooks (formatting, link checking, MDX lint), and skills/agents (`/new-lesson`, `/translate-lesson`, `/verify-sources`, translator, fact-checker, reviewer).

### D051 — Repo shown in the course

The repository's own `.claude/` setup is shown in the course itself, in a "How this site was built" lesson.

### D052 — ★ Public MIT repository

Owner override: the repository is public and everything in it, including all course content, is MIT-licensed.

### D053 — Folded into D007

Folded into D007: each lesson has its own git tag in the lab repository.

### D054 — Folded into D007

Folded into D007: lab verification consists of an expected result, a checklist, and a real sample transcript.

### D055 — Hook examples

The hooks module teaches, hands-on: a PostToolUse formatter, a PreToolUse dangerous-command block, Notification/Stop desktop and Slack notifications, and a SessionStart context-load plus Stop test-runner pair.

### D056 — Skill examples

The skills module teaches, hands-on: a `/commit-msg` or `/pr` command, a `/new-component` command using `$ARGUMENTS`, a prompt-only `/review-security` skill, and a tool-running skill using `allowed-tools` and `context: fork`.

### D057 — MCP examples

The MCP module teaches, hands-on: GitHub, Playwright/Chrome, and a database (Postgres/SQLite) server, plus writing a minimal hand-written MCP server with the TypeScript SDK.

### D058 — Agent examples

The subagents module teaches, hands-on: a code-reviewer (read-only, Sonnet), a test-writer, a docs-writer/translator, and a researcher agent.

### D059 — Headless examples

The headless/CI module teaches, hands-on: `claude-code-action` PR review, `claude -p` with JSON output, an issue-to-PR agent, and a custom Agent SDK agent.

### D060 — Security topics

The security module covers the permission model and sandbox, prompt-injection defence, secrets handling (`.env`, a hook-based leak block, gitleaks), and MCP/supply-chain risk.

### D061 — Site navigation

Navigation is a left level/module/lesson tree, a right table of contents, a bottom prev/next bar with a progress indicator, and Pagefind search bound to Ctrl+K.

### D062 — Landing page

The landing page has a hero with a call to action, level cards, a curriculum map, a "what changed" feed, and a terminal animation.

### D063 — Lesson metadata

Each lesson header shows duration and difficulty, the verified and last-updated Claude Code version, tags, and an "Edit this page" GitHub link.

### D064 — Quiz mechanics

Quizzes are multiple choice with instant feedback; results are stored in `localStorage`.

### D065 — SEO

SEO includes hreflang, canonical URLs, a sitemap, build-time OG images, and a per-language RSS feed.

### D066 — Analytics

Cloudflare Web Analytics is used for traffic analytics.

### D067 — Lesson feedback

Each lesson has a 👍/👎 feedback control (delivered by a Cloudflare Worker plus KV, folds in D069), a templated GitHub Issues link, and giscus (GitHub Discussions) comments.

### D068 — Build gates

CI enforces EN/TR route parity, a zod frontmatter schema, required code-fence language tags, and a Lighthouse CI budget.

### D069 — Folded into D067

Folded into D067: the feedback control is delivered by a Cloudflare Worker plus KV, not a first-party backend.

### D070 — Folded into D019

Folded into D019: transcripts shown in lessons are real recorded Claude Code output, never fabricated (see also D093).

### D071 — Review flow

A Claude reviewer agent and a fact-checker agent both review a lesson before the owner merges its pull request.

### D072 — MVP scope

The MVP is infrastructure, design, and L1–L2 content complete, with L3–L4 present as a skeleton; the course then iterates from there.

### D073 — Models lesson

The models lesson includes a Fable 5.1 / Opus 5 / Sonnet 5 / Haiku 4.5 comparison table, a same-task-on-three-models lab, a Fable-vs-Mythos comparison, and per-subagent model strategy.

### D074 — Effort lesson

The effort lesson covers `/effort` levels and `/fast`, with an effort-by-model matrix lab and coverage of `effort_hint` in plan files.

### D075 — CLI reference lesson

The CLI lesson covers `claude`, `-p`, `-c`/`-r`, `--model`, `--effort`; `claude mcp`, `claude plugin`, `claude config`; `claude update`/`doctor`/env vars; and a full slash-command reference table.

### D076 — Plan mode lesson

The plan mode lesson covers Shift+Tab, plan files, the Explore/Plan agents and the four-phase flow, `AskUserQuestion` intake (illustrated by this project's own planning session), `ExitPlanMode`, and worktree isolation.

### D077 — Memory lesson

The memory lesson covers the CLAUDE.md hierarchy and `@import`, auto-memory (`MEMORY.md` and its types), `.claude/rules/`, and `/memory`/`#` quick notes.

### D078 — IDE lesson

The IDE lesson covers VS Code, JetBrains, Desktop vs. the web app, and multi-session workflows with tmux/zellij.

### D079 — Team lesson

The team lesson covers shared and managed `settings.json`, allowlists, a team skill/plugin marketplace, review-process integration, and cost budgeting.

### D080 — Anti-pattern sources

Anti-patterns are sourced from official guidance, community observation, and the authors' own experience; sourced items are marked as such.

### D081 — Node toolchain

The toolchain is Node 24 and npm 11, pinned by `.nvmrc`.

### D082 — Docker usage

Docker is used only to run `nginx -t` configuration tests locally, never as an application runtime for this repo.

### D083 — Test suite

Tests are Vitest for units, Playwright for end-to-end (including a route sweep, axe accessibility checks, and language switching), plus build-time content tests and visual-regression screenshots.

### D084 — Folded into P00's canvas-first workflow

Folded into P00's canvas-first workflow: the visual design is authored as a canvas and approved by the owner before any implementation begins.

### D085 — Origin certificate

`cc.codechup.com` gets its own Cloudflare Origin CA certificate, delivered to the deploy pipeline as its own pair of secrets, separate from any other site's certificate.

### D086 — Reverse-proxy ownership

The static host's reverse-proxy configuration is owned and changed only by the host-side vhost change (owner-managed, private repo); this repository's own deploy workflow only rsyncs built static files into its assigned directory on that host.

### D087 — No firewall change

No firewall change is needed for this project; the deploy workflow only adds a verification step.

### D088 — Deploy-time SSH access

Claude may use SSH as the low-privilege deploy account (no sudo) to run verification commands against the host.

### D089 — Repo and secrets creation

Claude creates the GitHub repository and its secrets using `gh`, with confirm-before-run on every command; the owner supplies the certificate and key material.

### D090 — Folded into D006

Folded into D006: the "When NOT to use" section is part of the standard lesson template, not a separate feature.

### D091 — Playbook decision trees

The Playbook contains visual decision trees (CLAUDE.md vs. rule vs. skill vs. hook vs. agent vs. MCP), linked from the lessons they apply to.

### D092 — Diagram format

All diagrams, including decision trees, are inline SVG and are theme-aware (readable in both light and dark).

### D093 — Evidence rule

Every claim in a lesson is proven with real command output; every command shown was actually run; fabricated output is forbidden.

### D094 — No deadline

There is no fixed deadline; quality is prioritized over speed.

### D095 — Waves

Work proceeds in waves: W0 infrastructure and design; W1 English L1–L2; W2 Turkish L1–L2 in parallel with English L3–L4; W3 Turkish L3–L4 plus the Playbook and "How this site was built."

### D096 — Verified version tracking

Every lesson's frontmatter carries `verified_version`, and the site footer shows the same value.

### D097 — No certificates

There is no completion certificate; learners get a level badge only.

### D098 — Pre-lesson research

Before a lesson is written, a researcher agent summarizes the official documentation plus two or three web/YouTube sources for the writer to work from.

### D099 — Lab transcripts

The writer session clones the lab repository, actually runs every lab in the lesson, saves the raw transcript under `content/_shared/transcripts/`, and renders a simplified version in the lesson's `<Transcript>` component.

### D100 — First step after approval

The first step after plan approval is wave W0: the repository skeleton, `plans/`, `STATE.md`, and the design canvas.
