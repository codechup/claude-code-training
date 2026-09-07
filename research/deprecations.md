# Deprecated / changed since 2025 — verified 2026-09-06 (Claude Code 2.1.263)

Lesson rule (D044): a removed or changed behaviour appears only as a short **Changed** callout in the relevant lesson and as an entry on the Playbook changelog page. Never teach the old behaviour.

| Old (2025-era tutorials) | Now | Note for lessons |
|---|---|---|
| `MultiEdit` tool | Not in the current tools reference; `Edit` (with `replace_all: true`) covers multi-occurrence edits — verified against `tools-reference.md` 2026-09-06 | Tools lesson (L1 m02) |
| `keybindingFlavor` setting | Ignored; word keys are always Bash-style (Ctrl+W, Alt+F/D) | Keybindings lesson |
| `defaultMode: bypassPermissions` / `auto` in project `.claude/settings.json` | Silently ignored; only user or managed scope | Permissions lesson, security lesson |
| `/btw` side-question history navigation | The live `commands.md` (2026-09-07, P16) documents `Left`/`Right` for `/btw` history — the earlier note claiming `Shift+←/→` was wrong; teach what the live page says | Commands reference |
| Bash permission rules with text after `)` | Invalid (used to be silently ignored) | Permissions lesson |
| GitHub Action `anthropics/claude-code-action@beta`, inputs `mode`, `direct_prompt`, `max_turns` | `@v1`; use `prompt` + `claude_args` | Headless/CI lesson |
| MCP SSE transport | Deprecated; use HTTP, stdio or WebSocket | MCP lesson |
| `disableArtifact` | Inverted to `enableArtifact` | Artifacts lesson |
| One-hour limit on background subagent commands | Removed | Subagents lesson |
| Syntax highlighting for 1c, gml, isbl, mathematica, maxima, sqf | Removed | none (footnote only) |
| Hook JSON `{"decision": "block"}` for PreToolUse | Current shape is `hookSpecificOutput.permissionDecision: allow|deny|block` (+ `permissionDecisionReason`); exit 2 still blocks regardless of JSON | Hooks lesson (m07-01/02) |
| `anthropic.skilljar.com/claude-code-in-action` | Course lives at `academy.claude.com/courses/claude-code-in-action` | Sources |
| `#` quick-note shortcut (append a line to CLAUDE.md/memory from the prompt) | Removed in 2.0.70 (2025-12-15, per the changelog); use `/memory` or edit the memory files directly — found by P15 against the live `memory.md` | Memory lesson (m03-05) |
| `/fullscreen` command | Not a command in the live `commands.md`; the fullscreen TUI is `/tui fullscreen` (P16, 2026-09-07) | Commands reference (m04-04) |
| `claude config` subcommand | Does not exist in `claude --help` (2.1.263); configuration is edited with `/config key=value` or the settings files (P16, 2026-09-07) | Subcommands lesson (m04-05) |
| `TodoWrite` tool as the session checklist | Disabled by default; superseded by the `Task*` tools (`TaskCreate`, `TaskUpdate`, `TaskList`, …) — verified against `tools-reference.md` 2026-09-07 | Tools lesson (L1 m02), m01 lesson 1 |

Recent additions worth a "New" badge (last ~6 months): Fable 5.1 (1M context), `/diff` panel, per-session cache analytics in `/cost`, `/design` canvas, `/skill-doctor`, spend limits in `/usage`, artifact MCP connectors, cross-session messaging on Bedrock/Vertex/Foundry, keyless sign-in, `modelPicker`, `--permission-prompts none`, `claude plugin eval`.

**Open:** the complete v2.1.240–2.1.263 changelog was not fetched in full on 2026-09-06 (`https://code.claude.com/docs/en/changelog.md`); the Playbook changelog page (P42) re-reads it.
