# m01-start/05-doctor-update-channels — raw transcripts

Real captured output for the lesson `05-doctor-update-channels` (D070, D093,
D099).

- **Claude Code version:** `2.1.263` (native install, `latest` channel)
- **Platform:** Windows 11, `win32-x64`
- **Capture date:** 2026-09-07

| File            | Command         | Notes                                                                                               |
| --------------- | --------------- | --------------------------------------------------------------------------------------------------- |
| `01-doctor.txt` | `claude doctor` | Full diagnostics on a healthy native install.                                                       |
| `02-update.txt` | `claude update` | `2.1.263` was the newest published version at capture time, so this is the already-up-to-date path. |

The "successfully updated" path could not be captured: the machine was already
on the newest release. The lesson quotes that message from
`https://code.claude.com/docs/en/setup.md` as documentation, clearly attributed,
rather than presenting it as a recording.

## Post-processing

Only stdout was captured, so each command line was prepended by hand as a `› `
line, byte-identical to what was typed. In `01-doctor.txt` the local install
path had the user's home directory replaced with `<home>`. Nothing else was
changed — the output is verbatim, non-ASCII glyphs included.
