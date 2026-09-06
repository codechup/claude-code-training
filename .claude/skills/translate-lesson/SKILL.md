---
name: translate-lesson
description: Translates a finished English lesson into Turkish by delegating to the translator agent — keeps code, commands, transcripts and English technical terms untouched, applies correct diacritics, and flips the TR twin out of draft. Use for any content/tr page.
when_to_use: An English lesson or page is final and its Turkish twin is still a draft:true stub, or the English changed and the Turkish needs to catch up.
argument-hint: <path to the English .mdx>
arguments: [source]
allowed-tools: Read, Glob, Grep, Agent, Bash(npm run gate), Bash(node tools/plan/cli.ts:*)
model: sonnet
effort: medium
---

# /translate-lesson

Translate `$source` into Turkish.

## 1. Check the English is ready

Read `$source`. Translating a moving target wastes the work, so confirm first:

- `draft: false`, and the lesson's sections are actually written (no `TODO` markers left).
- The lesson has passed `fact-checker` and `reviewer` — translating a lesson that will be
  restructured means translating it twice.

If the English is not ready, say so and stop.

Then locate the TR twin: the same path with `content/en/` → `content/tr/`. It should already exist
as a `draft: true` stub (created by `/new-lesson`). If it does not, create it before translating —
the content gate requires EN/TR parity.

## 2. Delegate to the translator agent

Invoke the **`translator`** agent (Sonnet, per D046) with:

- the EN source path and the TR target path,
- the instruction to follow `.claude/rules/i18n.md`, which is the binding checklist.

Do not translate inline yourself. The agent is configured with the terminology policy, the
suffix and diacritic rules, and the glossary-linking mechanic.

## 3. What must survive the translation

Spot-check the agent's output for these, because they are the failures that reach production:

- **Code, commands, terminal output and transcripts are byte-identical to the English.** A
  translated comment inside a transcript turns a real recording into a fabricated one (D070).
- **Slugs are not translated** — the TR file sits at the mirrored path with the same `NN-slug`, so
  the language switcher works.
- **Copied frontmatter fields are unchanged**: `level`, `module`, `order`, `duration_min`,
  `difficulty`, `verified_version`, `lab.repo_tag` and every `sources[]` entry. Only `title`,
  `description` and free-text `tags` are translated. The content gate compares the rest.
- **English technical terms stay English** (hook, skill, subagent, commit, worktree, prompt, …)
  with apostrophe suffixes by pronunciation: `hook'u`, `skill'i`, `subagent'ı`, `commit'i`.
- **First use of each kept term links to the glossary**: `/tr/playbook/glossary/#<term>`. If an
  entry is missing, the agent adds a one-line entry to `content/tr/playbook/glossary.mdx`.
- **Diacritics are correct** — ç ğ ı İ ö ş ü — and never ASCII-fied. Check the dotted/dotless `i`.
- **Section order matches the English exactly** (D006).

## 4. Flip the draft flag

Set `draft: false` on the TR page **only when the whole page is translated**. A partially
translated page stays `draft: true` — a half-Turkish lesson is worse than an honest stub.

## 5. Verify

```bash
npm run gate
```

EN/TR parity and schema must pass. Then report: the file written, glossary entries added or still
needed, and any English sentence that was ambiguous enough to be worth rewording in the source.
