# m05-models-effort — raw transcripts

Real, captured Claude Code output for the `m05-models-effort` lessons
(D019/D070/D093/D099). Nothing here is invented, reconstructed or "cleaned
up".

- **Claude Code version:** `2.1.263` (native install)
- **Platform:** Windows 11, `win32-x64`
- **Capture date:** all files, **2026-09-07**
- **Account:** a personal Claude subscription. The machine's global Claude Code
  preferences ask for Turkish answers, which is why several `result` strings
  come back in Turkish. That is genuine output, not a translation — the same
  thing happened in `m01-start` and is documented there too.
- **Lab repository:** `codechup/claude-code-lab`, cloned into a scratch
  directory outside both repos, at the tags named in each folder's notes.

## Folders

| Folder                 | Lesson                | Lab tag                  |
| ---------------------- | --------------------- | ------------------------ |
| `01-model-family/`     | `01-model-family`     | none (scratch directory) |
| `02-choosing-a-model/` | `02-choosing-a-model` | `lesson/m05-02-start`    |
| `04-effort-lab/`       | `04-effort-lab`       | `lesson/m05-04-start`    |

Three lessons without a lab tag of their own embed captures from the folders
above rather than re-running the same commands:

| Lesson              | Embeds from                                                            |
| ------------------- | ---------------------------------------------------------------------- |
| `03-effort-levels`  | `04-effort-lab/02-effort-low.txt`                                      |
| `05-fast-mode`      | `02-choosing-a-model/04-opus.txt` (the `fast_mode_state` fields)       |
| `06-cost-and-usage` | `02-choosing-a-model/03-sonnet.txt`, `04-effort-lab/02-effort-low.txt` |

## Post-processing

Three mechanical changes, nothing else:

1. **Provenance header.** Line 1 of every file is a `#` comment naming the
   capture date, version and platform. It is not part of the recording, so the
   lessons embed these files with `<Transcript range="…">` starting at line 2.
2. **Command line.** Line 2 is the command that was typed, written with the
   `›` prompt glyph `src/components/mdx/transcript.ts` parses. The command text
   itself is byte-identical to what was run.
3. **JSON pretty-printing and redaction.** `claude --output-format json` prints
   the result envelope as a single line. Each `.txt` file holding an envelope
   was produced by `JSON.parse` followed by `JSON.stringify(obj, null, 2)` — a
   whitespace reflow only; every key and every value is the one Claude Code
   printed. In `02-choosing-a-model/04-opus.txt` the absolute scratch path
   inside the recorded `permission_denials[0].tool_input.command` was replaced
   with `<lab>`, as `.claude/rules/content.md` §5 requires. No other change.

## What was run

### `01-model-family/`

Run from an empty scratch directory, one turn each, no tools:

```bash
claude -p "Reply with exactly: OK" --model haiku  --output-format json --max-turns 1
claude -p "Reply with exactly: OK" --model sonnet --output-format json --max-turns 1
```

The point is the `modelUsage` key: it names the model ID the alias actually
resolved to, and that model's `contextWindow`.

### `02-choosing-a-model/`

`git checkout lesson/m05-02-start && npm ci` (bug **B3**, an unhandled promise
rejection in `runAdd`), then the same prompt on three models, in the order
haiku → sonnet → opus, with `git checkout -- . && git clean -fd` between runs
so each model met the same failing repository:

```bash
claude -p "npm test fails one test in test/persist.test.ts. Find the root cause in src/ and fix it. Do not change any test file." \
  --model <haiku|sonnet|opus> --output-format json --max-turns 6 \
  --permission-mode acceptEdits --allowedTools "Read Edit Grep Glob Bash(npm test*)"
```

All three produced a working fix — `npm test` went from `1 failed | 14 passed`
to `15 passed` in every case, and each diff touched only `src/cli.ts`. Only the
sonnet run finished inside the six-turn budget; haiku and opus were cut off by
`--max-turns` **after** editing the file, which is why their envelopes say
`"subtype": "error_max_turns"`.

The per-run `git diff --stat` figures quoted in lesson `02` — `src/cli.ts`, 1 insertion and 3
deletions for haiku and sonnet, 2 insertions and 3 deletions for opus, because opus also rewrote the
now-inaccurate comment above the fix — were read at the terminal while capturing, not redirected to
files. They are the writer's own observation of a real run, and a reader repeating the lab produces
their own; no diff output has been reconstructed for the lessons.

`05-npm-test-after-opus.txt` and `06-npm-test-after-sonnet.txt` are the green
`npm test` tails from those two runs' working trees. The haiku run was verified
the same way at the time, but its tail was not redirected to a file, and no
`npm test` output has been reconstructed for it.

### `04-effort-lab/`

`git checkout lesson/m05-04-start && npm ci` (bug **B2**, `isOverdue` comparing
milliseconds against seconds), then the same prompt on Sonnet 5 at three effort
levels, in the order low → medium → high, with the same reset between runs:

```bash
claude -p "npm test fails two tests in test/overdue.test.ts. Find the root cause in src/ and fix it. Do not change any test file." \
  --model sonnet --effort <low|medium|high> --output-format json --max-turns 6 \
  --permission-mode acceptEdits --allowedTools "Read Edit Grep Glob Bash(npm test*)"
```

All three ended green (`15 passed`) with the same one-line fix in
`src/store.ts`. This tag's commits predate the lab repo's `.claude/` scaffold,
so no project `CLAUDE.md` was loaded for these runs.

## Re-capturing

Repeat the commands above and replace the files, then update the dates here.
Costs and durations will differ: prompt-cache state is shared between
consecutive runs in the same directory, so the first run of a batch pays for
cache writes the later ones read. Never hand-edit the output itself (D093).
