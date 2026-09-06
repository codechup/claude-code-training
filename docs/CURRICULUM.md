# CURRICULUM.md — the authoritative lesson map

> **TL;DR:** 4 levels · 21 modules · 105 lessons (floor, D009) + Playbook (7 pages) + Meta (3 pages). Slugs here are final: content plans (P13–P44) create exactly these files under `content/<lang>/<level>/<module>/NN-<slug>.mdx` and may add lessons, never drop or rename one without an `open_questions` entry. Every lesson follows the template in §3 (D006), pins `verified_version: 2.1.263` (D096) and ends with a Sources block (D041). Facts come from `research/feature-inventory.md`, never from memory (D093).

Owner decisions per module are listed in §4 so a content plan's Context can cite this table instead of re-deriving it.

---

## 1. Levels

| Level | Slug | Audience outcome | Modules |
|---|---|---|---|
| 1 Beginner | `l1-beginner` | Installed, authenticated, working daily with confidence; understands permissions, memory and the built-in commands | m01–m04 |
| 2 Intermediate | `l2-intermediate` | Chooses model and effort deliberately; writes skills and hooks; ships PRs with Claude | m05–m09 |
| 3 Advanced | `l3-advanced` | Delegates to subagents, connects MCP servers, packages plugins, automates in CI, works securely on every platform | m10–m15 |
| 4 Master | `l4-master` | Runs multi-agent and autonomous workflows, coordinates parallel sessions with plan files, ships visual artefacts, scales a team | m16–m21 |

Difficulty scale: `intro` (no prior module needed beyond the level's prerequisites) · `core` (the module's main lessons) · `advanced` (optional depth). Durations are reading + lab time.

## 2. Modules and lessons

Format: `NN-slug` — objective (duration, difficulty). "Lab" names the lab-repo tag used (`lesson/<module>-<NN>-start`).

### Level 1 — Beginner

**m01-start — Getting Claude Code running** (D021)
1. `01-what-claude-code-is` — Explain what Claude Code is, how the agent loop reads/edits/runs, and where it runs (CLI, IDE, desktop, web) (10 min, intro)
2. `02-install` — Install with the native installer, Homebrew, WinGet or npm on macOS/Linux/Windows; verify with `claude --version` (15 min, intro) Lab
3. `03-authenticate` — Sign in with a subscription, an API key or `claude setup-token`; understand keyless Console sign-in and profiles (10 min, intro)
4. `04-first-session` — Run a first session in the lab repo: ask, read, edit, run tests; read the TUI (10 min, core) Lab
5. `05-doctor-update-channels` — Keep the install healthy: `claude doctor`, `claude update`, release channels, `--version` (10 min, core)

**m02-interact — Talking to Claude Code** (D021, D027)
1. `01-prompting-basics` — Write a task Claude can act on: goal, constraints, evidence; bad vs good prompt pairs (15 min, core)
2. `02-tools-read-edit-run` — Understand the built-in tools (Read, Edit with `replace_all`, Write, Glob, Grep, Bash/PowerShell, WebFetch) and how Claude picks them (15 min, core) Lab
3. `03-permissions` — Permission modes (`default`, `plan`, `acceptEdits`, `auto`, `dontAsk`, `bypassPermissions`), allow/deny rules, scope precedence (20 min, core) Lab
4. `04-plan-mode` — Use plan mode (Shift+Tab), read a plan file, approve or revise, exit to execution (15 min, core) Lab
5. `05-checkpoints-rewind` — Undo safely with checkpoints and `/rewind` (10 min, core) Lab
6. `06-context-basics` — See the context window with `/context`, compact with `/compact`, reset with `/clear`; when auto-compact kicks in (15 min, core)

**m03-memory — Giving Claude memory** (D021, D077)
1. `01-claude-md` — Write a project `CLAUDE.md` with `/init`; what belongs there and what does not (15 min, core) Lab
2. `02-hierarchy-imports` — Managed → user → project → local precedence; `@path` imports; `claudeMdExcludes` (15 min, core)
3. `03-rules` — Path-scoped `.claude/rules/*.md` for per-area conventions (15 min, core) Lab
4. `04-auto-memory` — Auto-memory: `MEMORY.md` index, memory types (user/feedback/project/reference), when Claude writes it (15 min, core)
5. `05-memory-commands` — `/memory`, `#` quick notes, editing and pruning memories (10 min, core)

**m04-commands — Built-in commands and the terminal** (D021, D075)
1. `01-slash-command-reference` — The full built-in slash command table with one-line meanings (20 min, core)
2. `02-cli-flags` — `claude`, `-p`, `-c`/`-r`, `--model`, `--effort`, `--permission-mode`, `--settings`, `--add-dir` (15 min, core) Lab
3. `03-sessions` — `/resume`, `/branch`, `/fork`, `--teleport`; naming and finding past sessions (15 min, core) Lab
4. `04-keybindings-statusline-theme` — Keyboard shortcuts, `/keybindings`, `/statusline`, `/theme`, `/fullscreen`, output styles (15 min, core)
5. `05-subcommands` — `claude mcp`, `claude plugin`, `claude config`, environment variables that matter (15 min, core)

### Level 2 — Intermediate

**m05-models-effort — Choosing model and effort** (D022, D028, D073, D074)
1. `01-model-family` — Fable 5.1 / Opus 5 / Sonnet 5 / Haiku 4.5: capabilities, context windows, aliases (`best`, `fable`, `opus`, `sonnet`, `haiku`, `sonnet[1m]`, `opus[1m]`, `opusplan`) (15 min, core)
2. `02-choosing-a-model` — Lab: the same task on three models; compare output, time, cost (25 min, core) Lab
3. `03-effort-levels` — `/effort low…max`, `ultracode`, `/effort auto`, `ultrathink`, per-model `modelSettings` (15 min, core)
4. `04-effort-lab` — Lab: effort × model matrix on one refactor; when `max` overthinks (25 min, core) Lab
5. `05-fast-mode` — `/fast`: what it trades and when it refuses to toggle (10 min, core)
6. `06-cost-and-usage` — `/cost`, `/usage`, cache-hit ratio, spend limits, plan vs API billing, token-saving habits (20 min, core)
7. `07-fable-vs-mythos` — What "Mythos-class" means, who gets Mythos, and why lessons target Fable (10 min, advanced)

**m06-skills — Skills and custom commands** (D022, D056)
1. `01-skills-vs-commands` — Skills as the single mechanism; where they live (user, project, plugin, nested) (15 min, core)
2. `02-skill-md-anatomy` — Frontmatter fields (`name`, `description`, `when_to_use`, `argument-hint`, `arguments`, `allowed-tools`, `disallowed-tools`, `model`, `effort`, `context`, `agent`, `background`, `hooks`, `paths`, `shell`) (20 min, core)
3. `03-arguments` — `$ARGUMENTS`, `$0`/`$1`, named arguments, `${CLAUDE_SKILL_DIR}` and friends; Lab: `/commit-msg` (20 min, core) Lab
4. `04-prompt-only-skills` — Lab: `/review-security` checklist skill (15 min, core) Lab
5. `05-tool-running-skills` — Lab: `/new-component` with a script, `allowed-tools`, `context: fork` (25 min, core) Lab
6. `06-skill-doctor` — `/skill-doctor`: measuring whether skills are used, fixing descriptions (10 min, advanced)

**m07-hooks — Hooks** (D022, D055)
1. `01-hook-anatomy` — Events, matchers, stdin/stdout JSON, exit codes 0/2/other, `hookSpecificOutput` (20 min, core)
2. `02-block-dangerous-commands` — Lab: PreToolUse guard for `rm -rf` / force-push with `permissionDecision: deny` (20 min, core) Lab
3. `03-format-on-save` — Lab: PostToolUse formatter (Prettier/gofmt) (15 min, core) Lab
4. `04-notify-when-done` — Lab: Notification/Stop → desktop and Slack notification (15 min, core) Lab
5. `05-session-start-context` — Lab: SessionStart loads STATE.md; Stop runs the test suite (20 min, core) Lab
6. `06-event-catalogue` — All 32 events grouped (lifecycle, prompt, tools, agents/tasks, elicitation) with a use for each (20 min, advanced)
7. `07-debugging-hooks` — `/hooks`, logs, common failures, hook precedence across scopes (15 min, advanced)

**m08-git — Git workflows with Claude** (D022)
1. `01-commits-and-conventions` — Conventional commits, co-author trailers, when Claude commits (15 min, core) Lab
2. `02-worktrees-branches` — `/branch`, `EnterWorktree`, `isolation: worktree`, parallel branches (20 min, core) Lab
3. `03-pull-requests` — `gh` PRs with evidence, PR templates, review comments (20 min, core) Lab
4. `04-code-review-commands` — `/code-review` levels, `/simplify`, `/security-review`, `/diff` (20 min, core) Lab
5. `05-github-app` — `/install-github-app` and what it enables (10 min, advanced)

**m09-prompting — Prompting for agents** (D027)
1. `01-task-decomposition` — Split work into verifiable steps; ask for plans first (15 min, core)
2. `02-constraints-and-evidence` — Give constraints, acceptance criteria and proof requirements (15 min, core)
3. `03-iterative-refinement` — Review → refine loops, "why" questions, avoiding sunk-cost drift (15 min, core)
4. `04-prompt-library` — Reusable prompt patterns from the official prompt library, adapted (15 min, core)
5. `05-anti-patterns` — The ten prompting anti-patterns and their fixes (15 min, core)

### Level 3 — Advanced

**m10-subagents — Subagents and custom agents** (D023, D058)
1. `01-agent-tool-and-builtins` — The Agent tool; Explore, Plan, general-purpose, claude, statusline-setup, claude-code-guide (15 min, core)
2. `02-custom-agents` — `.claude/agents/*.md` frontmatter (`tools`, `disallowedTools`, `model`, `permissionMode`, `maxTurns`, `skills`, `mcpServers`, `hooks`, `memory`, `effort`, `isolation`, `color`) (20 min, core)
3. `03-agent-lab` — Lab: code-reviewer (read-only, Sonnet), test-writer, docs-writer, researcher (30 min, core) Lab
4. `04-model-per-agent` — Model resolution order, `CLAUDE_CODE_SUBAGENT_MODEL`, cost strategy (15 min, core)
5. `05-fork-background-worktree` — Fork agents, background agents, worktree isolation, Monitor (20 min, advanced) Lab
6. `06-advisor` — The advisor pattern: when a second, stronger reviewer pays off (10 min, advanced)

**m11-mcp — Model Context Protocol** (D023, D057)
1. `01-mcp-concepts` — Servers, tools, resources; transports (HTTP, stdio, WebSocket; SSE deprecated) (15 min, core)
2. `02-add-list-remove-scopes` — `claude mcp add/list/remove`, `--scope`, `.mcp.json`, `${VAR:-default}`, OAuth sign-in (20 min, core) Lab
3. `03-github-mcp` — Lab: issues and PRs through the GitHub MCP server (20 min, core) Lab
4. `04-browser-mcp` — Lab: Playwright/Chrome for UI checks (20 min, core) Lab
5. `05-database-mcp` — Lab: SQLite/Postgres schema discovery and queries (20 min, core) Lab
6. `06-write-your-own-server` — Lab: a minimal MCP server with the TypeScript SDK (30 min, advanced) Lab
7. `07-mcp-security` — Trust, supply chain, managed MCP, least privilege (15 min, advanced)

**m12-plugins — Plugins and marketplaces** (D023)
1. `01-plugin-anatomy` — `plugin.json`, `skills/ agents/ hooks/ .mcp.json .lsp.json monitors/ bin/ settings.json` (15 min, core)
2. `02-marketplaces` — `/plugin`, discovering and installing, dependencies, hints and relevance (15 min, core) Lab
3. `03-build-a-plugin` — Lab: package the m06/m07 skills and hooks as a plugin (30 min, core) Lab
4. `04-validate-and-eval` — `claude plugin validate`, `claude plugin eval` (early access), graders and mocks (20 min, advanced)
5. `05-team-marketplace` — Publishing an internal marketplace (15 min, advanced)

**m13-headless-ci — Headless, CI and the Agent SDK** (D023, D059)
1. `01-claude-p` — `claude -p` with `--output-format json|stream-json`, `--json-schema`, `--allowedTools`, `--permission-mode`, `--permission-prompts none`, exit codes (20 min, core) Lab
2. `02-github-actions-review` — Lab: `anthropics/claude-code-action@v1` PR review (25 min, core) Lab
3. `03-issue-to-pr` — Lab: an issue → PR automation with `@claude` (25 min, core) Lab
4. `04-gitlab-and-others` — GitLab CI/CD, enterprise server notes (10 min, advanced)
5. `05-agent-sdk-typescript` — Lab: a custom agent with `@anthropic-ai/claude-agent-sdk` (30 min, advanced) Lab
6. `06-agent-sdk-python` — Lab: the same agent in Python (25 min, advanced) Lab

**m14-security — Working securely** (D060)
1. `01-permission-model-and-sandbox` — Sandboxing (filesystem, network allowlist), auto-mode containment, what `bypassPermissions` really does (20 min, core)
2. `02-prompt-injection` — Injection through files, web pages and tool results; defences (20 min, core) Lab
3. `03-secrets` — `.env` handling, gitleaks, a hook that blocks secret leaks, public-repo hygiene (20 min, core) Lab
4. `04-managed-settings` — Managed and server-managed settings, `auto-mode-config`, allowlists (15 min, advanced)
5. `05-data-and-retention` — Data usage, zero-data-retention, telemetry, monitoring usage (10 min, advanced)

**m15-platforms — Every place Claude Code runs** (D011, D078)
1. `01-vs-code` — The VS Code extension: inline chat, diff view, selection context (15 min, core) Lab
2. `02-jetbrains` — JetBrains plugin (10 min, core)
3. `03-desktop-app` — Desktop app: scheduled tasks, iOS simulator pane, browser launching (15 min, core)
4. `04-web-and-cloud-sessions` — claude.ai/code, cloud environments, `--teleport`, ultrareview (15 min, core)
5. `05-remote-control-mobile` — Remote Control and the mobile app (10 min, core)
6. `06-chrome` — Claude in Chrome: navigation, forms, screenshots, console (15 min, core) Lab
7. `07-slack-claude-tag` — Claude Tag in Slack: setup, connections, scheduled jobs (10 min, advanced)
8. `08-tmux-multi-session` — Terminal multiplexers and several sessions side by side (10 min, advanced)

### Level 4 — Master

**m16-orchestration — Multi-agent orchestration** (D024)
1. `01-workflows` — The Workflow tool: `agent`, `parallel`, `pipeline`, phases, schemas (20 min, core)
2. `02-ultracode` — `ultracode` effort and dynamic workflows; cost expectations (15 min, core)
3. `03-agent-teams-messaging` — Agent teams, cross-session messaging (`SendMessage`, `ListAgents`) (15 min, core)
4. `04-pipeline-lab` — Lab: review → verify → fix pipeline on the lab repo (30 min, core) Lab
5. `05-designing-multi-agent` — Designing roles, contracts and hand-offs; failure modes (20 min, advanced)

**m17-autonomy — Autonomous loops** (D024)
1. `01-loop` — `/loop` with fixed and self-paced intervals (15 min, core) Lab
2. `02-routines` — Routines: cron, one-off, API endpoint and GitHub triggers (20 min, core) Lab
3. `03-goal` — `/goal`: stop-hook driven goals, when to use, how to bound them (15 min, core)
4. `04-desktop-scheduled-tasks` — Scheduled tasks in the desktop app (10 min, core)
5. `05-monitors-and-channels` — Monitors, channels, wake-ups; observability of autonomous work (15 min, advanced)

**m18-multi-session — Coordinating parallel sessions** (D024, D045–D049)
1. `01-plan-files` — Plan files with frontmatter, ten sections, milestones (20 min, core)
2. `02-state-md-and-claims` — A generated STATE.md, the claim protocol, stale claims (20 min, core) Lab
3. `03-owned-paths-worktrees` — Disjoint `owned_paths`, worktrees per plan, shared-file rules (20 min, core) Lab
4. `04-model-effort-hints` — Assigning `model_hint`/`effort_hint` by work type (10 min, core)
5. `05-handoff-notes` — Writing hand-offs another session can resume from; blocked and open questions (15 min, core) Lab
6. `06-this-repo-as-example` — Walk through this site's own `plans/` and STATE.md (15 min, advanced)

**m19-visual — Artifacts, design and browsers** (D024)
1. `01-artifacts` — Publishing an artifact, updating it, comments, capabilities (20 min, core) Lab
2. `02-design-canvas` — `/design`: a canvas from a brief, approval, tokens (20 min, core)
3. `03-chrome-automation` — Driving a site with Claude in Chrome; GIF recordings (15 min, core) Lab
4. `04-dataviz` — `/dataviz` and chart discipline (10 min, advanced)

**m20-team — Team adoption** (D079)
1. `01-shared-settings` — Project `settings.json`, allowlists, `/fewer-permission-prompts` (15 min, core)
2. `02-managed-settings` — Managed and server-managed settings for organisations (15 min, core)
3. `03-team-marketplace` — Sharing skills/plugins across a team (15 min, core)
4. `04-review-process` — Integrating Claude into code review and CI gates (15 min, core)
5. `05-cost-budgeting` — Budgets, analytics, usage reports (15 min, core)
6. `06-communications-and-champions` — Rolling out to a team: kits, champions, onboarding (10 min, advanced)

**m21-scale — Large codebases and infrastructure** (D028)
1. `01-large-codebases` — Strategies for big repos: directories, `--add-dir`, rules per area (20 min, core)
2. `02-context-engineering` — Keeping context lean: subagents, compaction, file selection (20 min, core)
3. `03-prompt-caching` — How caching works and how to benefit (15 min, advanced)
4. `04-gateways-and-clouds` — Bedrock, Vertex, Foundry, LLM gateways, network config (15 min, advanced)
5. `05-devcontainers` — Devcontainer and corporate launcher setups (10 min, advanced)

### Playbook (`playbook`, D025, D091)
1. `01-decision-trees` — CLAUDE.md vs rule vs skill vs hook vs agent vs MCP; model/effort decision tree (inline SVG)
2. `02-best-practices-l1-l2` — Digest of best practices from Levels 1–2
3. `03-best-practices-l3-l4` — Digest from Levels 3–4
4. `04-anti-pattern-catalogue` — Every anti-pattern with its fix, sourced where possible (D080)
5. `05-glossary` — Terms (EN with TR explanations on the TR page, D018)
6. `06-changed-since-2025` — The "Changed" changelog page (from `research/deprecations.md`)
7. `07-checklists` — Session start, PR, security, release checklists

### Meta (`meta`, D051)
1. `01-how-this-site-was-built` — This repo's `.claude/`, plans, CI and deploy as a worked example
2. `02-contributing` — How to propose or fix a lesson; the review pipeline
3. `03-sources-index` — Every source cited, with verification dates

## 3. Lesson template (D006, D090)

Order inside every lesson: **Objectives & prerequisites** → **When not to use this** → **Concept** → **Hands-on lab** (steps, expected result, checklist, transcript) → **Anti-patterns** → **Changed** callouts where relevant (D044) → **Quiz** (3–5 questions, D064) → **Sources** (official doc link mandatory, then video/article/repo cards, each with `verified_at`, D041–D043).

Frontmatter: `title, description, level, module, order, duration_min, difficulty, tags, verified_version, updated, draft, sources[], lab?` (schema in `src/content/schema.ts`).

## 4. Source policy (D012, D041–D044, D093, D096, D098, D099)

1. Priority: official docs (`code.claude.com/docs`) → Anthropic blog/engineering + official YouTube → community lists/blogs → independent instructors.
2. Every factual claim traces to `research/feature-inventory.md` or a URL fetched during authoring; unverifiable claims are marked and kept out of lesson text.
3. Every lab was run in the lab repo by the writer; the transcript under `content/_shared/transcripts/` is the source of the `<Transcript>` component.
4. Deprecated behaviour appears only as a "Changed" callout with the version where known.
5. `verified_version` is pinned per lesson and shown in the footer; `/verify-sources` refreshes `verified_at` before each release.

## 5. Module → decisions table

| Module | Decisions |
|---|---|
| m01-start | D001–D004, D010, D021 |
| m02-interact | D021, D027, D076 |
| m03-memory | D021, D077 |
| m04-commands | D021, D075 |
| m05-models-effort | D022, D028, D073, D074 |
| m06-skills | D022, D056 |
| m07-hooks | D022, D055 |
| m08-git | D022 |
| m09-prompting | D027 |
| m10-subagents | D023, D058 |
| m11-mcp | D023, D057 |
| m12-plugins | D023 |
| m13-headless-ci | D023, D059 |
| m14-security | D060 |
| m15-platforms | D011, D078 |
| m16-orchestration | D024 |
| m17-autonomy | D024 |
| m18-multi-session | D024, D045–D049, D026 (taught on this repo, anonymously) |
| m19-visual | D024, D084 |
| m20-team | D079 |
| m21-scale | D028 |
| playbook | D025, D080, D091, D044, D018 |
| meta | D051, D052 |

## 6. Verified learning resources (resolved 2026-09-06)

| Resource | Status | Use |
|---|---|---|
| Anthropic Academy — *Claude Code in Action* (https://academy.claude.com/courses/claude-code-in-action) | **Verified**: free, 9 lessons + quiz, ~1 h, aimed at developers scaling to long sessions | Cite from m01, m17, m20 |
| Official Anthropic YouTube channel (https://www.youtube.com/@anthropic-ai) | **Channel verified; playlists not programmatically verifiable** (YouTube renders client-side). Cite individual videos only after a writer opens them and records title, channel, duration | Video cards |
| Community list — `hesreallyhim/awesome-claude-code` (https://github.com/hesreallyhim/awesome-claude-code) | **Verified** active (53k+ stars) | m06, m12, playbook |
| Community blogs | **Not curated** — writers may cite a blog only when its claim is also confirmed by an official doc; the sources index (meta/03) tracks them | per lesson |
