# m01-start — raw transcripts

Real, captured Claude Code output for the `m01-start` lesson
`01-what-claude-code-is` (D019/D070/D093/D099). Nothing in this folder is
invented, reconstructed or "cleaned up". The only edits made after capture
were the two mechanical ones listed under **Post-processing** below.

- **Claude Code version:** `2.1.263` (native install)
- **Platform:** Windows 11, `win32-x64`
- **Capture dates:** `claude --version` / `claude doctor` on **2026-09-06**;
  the headless first-session runs on **2026-09-07**
- **Account:** a personal account (`claude doctor` reports "Organization policy:
  not applicable to Pro and Max accounts"). The model and any other session
  settings were not recorded at capture time.

## What was run

| File                        | Command                                                                                                                      | Notes                                                                                                                                                                                                                                                                                                                  |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `01-version.txt`            | `claude --version`                                                                                                           | Install check.                                                                                                                                                                                                                                                                                                         |
| `02-doctor.txt`             | `claude doctor`                                                                                                              | Read-only install/settings diagnostics.                                                                                                                                                                                                                                                                                |
| `03-first-session.txt`      | `claude -p "Read math.js and tell me in two sentences whether add() is correct. Do not edit anything." --output-format text` | Headless first session against a scratch folder containing a tiny `math.js` whose `add()` returns `a - b` on line 2, with a comment noting the bug. The answer comes back in **Turkish** because the capture machine's own global Claude Code preferences ask for Turkish — that is genuine output, not a translation. |
| `03-first-session-en.txt`   | same as above, with `, in English,` added to the prompt                                                                      | The model still answers in Turkish and says so in its first line. Kept because it is the honest result, and because it is a good illustration of how much global preferences shape a session.                                                                                                                          |
| `04-first-session-json.txt` | `claude -p … --output-format json`                                                                                           | Verbatim stdout of the JSON result envelope, English `result`. **The prompt line was not captured for this run**, so the file starts at the JSON — no prompt line has been reconstructed for it.                                                                                                                       |

## Post-processing

Two mechanical changes, applied by script, nothing else:

1. **Role markers.** The captured shell prompt `$ ` at the start of a command
   line was replaced with `› `, the prompt glyph
   `src/components/mdx/transcript.ts` parses (`›` prompt, `⏺` tool,
   `✓`/`✗` result, anything else plain text). The command text itself is
   byte-identical to what was typed.
2. **Redaction.** In `02-doctor.txt`, the local install path
   `C:\Users\<username>\.local\bin\claude.exe` had the username replaced with
   `<you>`, as `.claude/rules/content.md` §5 requires. No other line was
   touched.

Each file also carries a one-line `#` provenance header as its **first** line.
That header is _not_ part of the recording, so the lesson renders these files
with `<Transcript range="…">` starting at line 2.

## The scratch file

The `math.js` used for the headless runs was a throwaway file in a scratch
directory outside this repository and was not committed. What the captured
output states about it — line 2 returns `a - b` instead of `a + b`, and a
comment in the file already notes the bug — is all that is known about it. The
lesson therefore asks the reader to create their _own_ equivalent file rather
than presenting a byte-exact copy of one nobody kept.

## Re-capturing

```bash
claude --version
claude doctor
claude -p "Read math.js and tell me in two sentences whether add() is correct. Do not edit anything." --output-format text
claude -p "Read math.js and tell me in two sentences, in English, whether add() is correct. Do not edit anything." --output-format text
claude -p "Read math.js and tell me in two sentences whether add() is correct. Do not edit anything." --output-format json
```

Save each command's output to the matching file, prepend the command you typed
as its own `› ` line, add the `#` provenance header, and update the dates here.
Never hand-edit the output itself (D093).

## Per-language captures (review decision, 2026-09-07)

The EN lesson embeds `03-first-session-en.txt` / `04-first-session-json.txt`; the TR lesson embeds `03-first-session.txt`. Both are real runs of the same lab step; the TR capture's answer is in Turkish because the machine's global preferences ask for Turkish, which is exactly what a Turkish reader running the step would see. Each lesson's step text quotes the prompt that produced its own transcript.
