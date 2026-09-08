# Changelog

<!-- Trimmed fixture: the first three version sections of the real
     https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md
     as fetched 2026-09-09, with each section cut to its first six bullets.
     Lines were deleted; nothing was rewritten. -->

## 2.1.265

- Added `user.email` and `user.groups` to the telemetry Claude Desktop and Cowork send through a Claude apps gateway, matching terminal sessions
- Added support for pointing `--plugin-dir` at a folder of plugins: each child folder with a manifest loads, and children added or removed while running are picked up
- Added a 1 GB cap on tool results saved to disk; the in-conversation preview says when a saved file was truncated
- Fixed resuming a foreground-spawned subagent changing its tool list and system prompt prefix, which broke prompt-cache reuse for that agent
- Fixed agent teammates and resumed subagents moving SubagentStart hook context and preloaded skills out of the prompt prefix on later turns, which broke prompt-cache reuse
- Fixed resume after the previous process died while a tool was running: the last prompt is no longer rewritten, and the interrupted tool call is kept and marked interrupted

## 2.1.263

- Bug fixes and reliability improvements

## 2.1.261

- Added an "Organization policy" line to `/status` and `claude doctor` that says why your organization's policy could not be loaded, such as a proxy not passing the endpoint through
- Added `bashOutputMaxChars` and `taskOutputMaxChars` settings to raise how much command and background-task output Claude receives inline before it is saved to a file, up to 128K characters
- Added `--append-subagent-system-prompt-file` to read the subagent system prompt from a file, for prompts too large to pass on the command line
- Added `/skill-doctor` to show which loaded skills go unused and what they cost in context, so you can prune them
- Fixed typed or pasted characters occasionally landing out of order or being dropped during fast input or key repeat
- Fixed `/add-dir <subdirectory>` printing a false "couldn't be resolved" error when the working directory is on a `/net` automount
