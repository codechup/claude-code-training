# Claude Code feature inventory — verified 2026-09-06 (Claude Code 2.1.263)

> Source of truth for lesson writers. Every item was checked against `https://code.claude.com/docs/en/<slug>.md` on the date above. Items marked **UNVERIFIED** must not appear in lesson text until resolved (see `open_questions` of P03). Re-verify with `/verify-sources` before each release.

## Official docs map (`https://code.claude.com/docs/en/<slug>.md`)

- **Getting started:** overview · quickstart · changelog
- **Core concepts:** how-claude-code-works · features-overview · claude-directory · context-window · prompt-caching
- **Use Claude Code:** memory · sessions · common-workflows · prompt-library · best-practices
- **Platforms:** platforms · remote-control · mobile · chrome · computer-use · vs-code · jetbrains · slack · claude-tag
- **Web & Desktop:** web-quickstart · claude-code-on-the-web · routines · ultrareview · desktop-quickstart · desktop · desktop-linux · desktop-wsl · desktop-scheduled-tasks · desktop-ios-simulator
- **CI/CD:** security-guidance · claude-security · code-review · github-actions · github-actions-cloud-providers · github-enterprise-server · gitlab-ci-cd
- **Agents & parallel:** agents · sub-agents · agent-view · agent-teams · cross-session-messaging · workflows · worktrees
- **MCP & skills:** mcp-quickstart · mcp · skills · discover-plugins · plugins · artifacts
- **Automation:** hooks-guide · channels · scheduled-tasks · goal · headless · deep-links · large-codebases
- **Troubleshooting:** troubleshoot-install · troubleshooting · debug-your-config · errors
- **Setup & access:** admin-setup · setup · authentication · managed-settings · server-managed-settings · managed-mcp · auto-mode-config
- **Deployment:** third-party-integrations · feature-availability · amazon-bedrock · claude-platform-on-aws · google-vertex-ai · microsoft-foundry · network-config · corporate-launcher · devcontainer · gateways
- **Usage & data:** monitoring-usage · costs · analytics · plugin-marketplaces · plugin-dependencies · plugin-hints · plugin-relevance · security · data-usage · zero-data-retention
- **Configuration:** settings · settings-reference · settings-example · permissions · permission-modes · sandboxing · sandbox-environments · cloud-environments
- **Model & interface:** model-config · fast-mode · advisor · output-styles · terminal-config · fullscreen · accessibility · voice-dictation · statusline · keybindings
- **Reference:** cli-reference · commands · environment-variables · tools-reference · interactive-mode · checkpointing · hooks · plugins-reference · channels-reference · glossary
- **Agent SDK:** agent-sdk/overview · quickstart · migration · agent loop · examples · sessions · input/output · tools · subagents · hooks · custom tools · MCP · skills · permissions · checkpointing · cost tracking · observability · deployment · TypeScript/Python API refs

## Feature inventory

| Area | Current facts | Doc |
|---|---|---|
| Install & auth | Native installers (macOS/Linux/Windows), Homebrew, WinGet, apt/dnf/apk, npm `@anthropic-ai/claude-code`; API key, OAuth subscription token (`claude setup-token`), federation, profiles; keyless sign-in with a Console account | setup, authentication |
| Permission modes | `default`, `plan`, `acceptEdits`, `auto` (classifier), `dontAsk`, `bypassPermissions` (user/managed scope only; ignored in project settings) | permission-modes |
| Sandbox | filesystem + network isolation with allowlist; auto-mode containment rules | sandboxing |
| Memory | hierarchy managed > user > project > local; `.claude/rules/` path-scoped; auto-memory with MEMORY.md index (first 200 lines / 25 KB); `@path` imports; `claudeMdExcludes` | memory |
| Built-in slash commands | ~50+, incl. `/model /effort /advisor /memory /context /compact /clear /resume /branch /fork /cd /add-dir /teleport /remote-control /plan /background /batch /tasks /subtask /goal /loop /code-review /security-review /diff /simplify /copy /export /help /status /usage /cost /debug /doctor /permissions /mcp /config /init /hooks /keybindings /color /theme /focus /fullscreen /login /logout /exit /rewind /feedback /design /design-sync /deep-research /dataviz /insights /import /install-github-app /install-slack-app /ide /plugin /chrome /fast /btw /mobile /desktop /autocompact /auto-mode-setup /fewer-permission-prompts /claude-api /list-agents /skill-doctor /reload-plugins` | commands |
| Skills | `.claude/skills/<name>/SKILL.md`; frontmatter `name, description, when_to_use, disable-model-invocation, user-invocable, allowed-tools (Bash(pattern) syntax), disallowed-tools, argument-hint, arguments, context: fork, agent, background, model, effort, shell, paths, hooks` | skills |
| Hooks | events: SessionStart, Setup, UserPromptSubmit, UserPromptExpansion, PreToolUse, PermissionRequest, PermissionDenied, PostToolUse, PostToolUseFailure, PostToolBatch, Notification, MessageDisplay, SubagentStart, SubagentStop, TaskCreated, TaskCompleted, Stop, StopFailure, TeammateIdle, InstructionsLoaded, ConfigChange, CwdChanged, DirectoryAdded, FileChanged, WorktreeCreate, WorktreeRemove, PreCompact, PostCompact, PreModelSwitch, PostModelSwitch, Elicitation, ElicitationResult; stdin/stdout JSON; exit 0 = ok (parse JSON), 2 = block, other = non-blocking error | hooks, hooks-guide |
| Subagents | `.claude/agents/*.md` frontmatter `name, description, tools, disallowedTools, model, permissionMode, skills, memory (user/project/local), maxTurns, isolation: worktree, background, hooks`; built-ins Explore, Plan, general-purpose, statusline-setup; fork agents inherit context | sub-agents |
| MCP | `claude mcp add --transport http <name> <url>` / `--transport stdio -- cmd`; `--scope local|project|user`; list/remove; OAuth auto-discovery; `headersHelper`; `${VAR}` / `${VAR:-default}` in `.mcp.json`; SSE deprecated | mcp |
| Plugins | `plugin.json` (name, description, version, author); dirs `skills/ agents/ hooks/hooks.json .mcp.json .lsp.json monitors/ bin/ settings.json`; `/plugin install|list`; `claude plugin validate`; marketplaces | plugins, plugin-marketplaces |
| Plugin eval | `claude plugin eval` (early access per org) with `--case --tag --runs --model --judge-model --json --threshold --allow-tools --scaffold --ablation --mocks --report`; graders regex/tool_used/tool_order/file_exists/llm/baseline; `/skill-doctor` | plugins-reference |
| Models | Fable 5.1 (1M ctx), Fable 5, Opus 5/4.8/4.7/4.6, Sonnet 5/4.6, Haiku 4.5; aliases `best fable opus sonnet haiku sonnet[1m] opus[1m] opusplan`; ids `claude-fable-5-1`, `claude-opus-5`, `claude-sonnet-5`, `claude-haiku-4-5`; `modelPicker` curation | model-config |
| Effort / fast | `/effort low|medium|high(default)|xhigh|max|ultracode`; `effortLevel` setting; `modelSettings.<model>.effort`; `/fast on|off` (Opus fast output) | model-config, fast-mode |
| Headless | `claude -p` with `--bare --allowedTools --permission-mode --output-format json|stream-json|text --json-schema --continue --resume --max-turns --model --append-system-prompt --settings --mcp-config --agents --plugin-dir --plugin-url --permission-prompts none`; exit codes 0/1/2 (partial)/130/143 | headless |
| Agent SDK | `claude-agent-sdk` (Python), `@anthropic-ai/claude-agent-sdk` (TS): agent loop, hooks, permissions, sessions, skills, MCP, custom tools, subagents, plugins | agent-sdk/overview |
| GitHub Actions | `anthropics/claude-code-action@v1` (`prompt`, `claude_args`, `anthropic_api_key` or `claude_code_oauth_token`, `plugin_marketplaces`, `plugins`, `settings`); interactive (@claude) or automation mode; OIDC federation; `allowed_bots` | github-actions |
| Routines | claude.ai/code/routines or `/schedule`; triggers: cron, one-off, API endpoint (`POST /fire`), GitHub events; managed infra, no permission prompts | routines |
| Artifacts | published HTML/MD pages at claude.ai/code/artifact; private/org/public; MCP connectors for live data; comments; capabilities (db, users, assets) | artifacts |
| Chrome | browser extension: click, form-fill, screenshot, console/network, GIF | chrome |
| Claude Tag (Slack) | Team/Enterprise; @Claude in channels; admin pairing; connections; org-pool billing | claude-tag |
| Settings precedence | `--settings` > managed > local (`.claude/settings.local.json`) > project (`.claude/settings.json`) > user (`~/.claude/settings.json`); global state `~/.claude.json` | settings-reference |
| Sessions | `/resume <id>`, `/branch`, `/fork`, `--teleport`; `/rewind` checkpoints | sessions, checkpointing |
| Context & cost | `/context [all]`, `/compact [instructions]`, `autoCompactAt`; `/cost`, `/usage` incl. per-model + cache hit ratio; `total_cost_usd` in JSON output | context-window, costs |
| Desktop / web | Desktop (macOS/Windows/Linux): scheduled tasks, iOS simulator pane, Remote Control handoff; web: cloud sessions, routines | desktop-quickstart, claude-code-on-the-web |
| IDE | VS Code and JetBrains extensions: inline chat, diff view, selection context | vs-code, jetbrains |
| Keybindings / statusline | `~/.claude/keybindings.json`; Shift+Tab mode toggle; `/statusline` | keybindings, statusline |
| Orchestration | Workflow tool (pipeline/parallel), `ultracode`, agent teams, cross-session messaging (SendMessage/ListAgents), worktrees (`isolation: worktree`) | workflows, agent-teams, worktrees |

## UNVERIFIED (resolve in P03 before W1)

- Anthropic Academy / Skilljar course URLs ("Claude Code in Action").
- Anthropic YouTube Claude Code playlist URL.
- Community list URL (awesome-claude-code) and a curated blog shortlist.
