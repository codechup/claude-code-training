---
name: new-lesson
description: Scaffolds a new lesson — the English MDX from the fixed lesson template with correct frontmatter, the Turkish draft:true twin at the mirrored path, and the shared transcript folder for the lab recording. Use when starting any lesson in this repository.
when_to_use: The session is about to write a lesson that does not exist yet, and needs the EN file, its TR twin and the transcript folder created with correct frontmatter before drafting begins.
argument-hint: <level>/<module>/<NN-slug>
arguments: [lesson]
allowed-tools: Read, Write, Bash(node .claude/skills/new-lesson/scaffold.mjs:*), Bash(node tools/plan/cli.ts:*), Bash(npm run gate)
model: sonnet
effort: medium
---

# /new-lesson

Scaffold the lesson `$lesson`. This creates structure only — no prose, no facts, no invented output.

## 1. Check the lesson belongs

Read `docs/CURRICULUM.md` §2 and confirm `$lesson` is a lesson the curriculum actually lists, with the
slug spelled exactly as written there. The curriculum is authoritative (P03 owns it): if the slug
is missing or different, **stop** and tell the session to raise it in the plan's `open_questions`
rather than inventing a lesson.

Confirm the path is inside the current plan's `owned_paths` (`node tools/plan/cli.ts show PNN`).

## 2. Run the scaffold

```bash
node .claude/skills/new-lesson/scaffold.mjs $lesson
```

It creates three things and refuses to overwrite anything that already exists:

| File                                                       | What it is                                                                   |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `content/en/<level>/<module>/<NN-slug>.mdx`                | English lesson, every template section present in D006 order, `draft: false` |
| `content/tr/<level>/<module>/<NN-slug>.mdx`                | Turkish twin, `draft: true` stub, same slug (slugs are never translated)     |
| `content/_shared/transcripts/<module>/<NN-slug>/README.md` | Where the real lab recording goes (D099)                                     |

Frontmatter is filled from the path and from `research/feature-inventory.md`: `level` and `module`
are derived from the directory, `order` from the `NN` prefix, and `verified_version` is read from
the inventory heading rather than typed from memory (D096).

## 3. Fill in the parts the script cannot

The script leaves `TODO` markers. Set at least:

- `title` and `description` — real ones, from the curriculum's objective for this lesson.
- `duration_min` and `difficulty` — take them from `docs/CURRICULUM.md` §2; the defaults are
  placeholders.
- `tags` — meaningful topic tags.
- `sources[0]` — the actual official doc for this topic, not the `overview.md` placeholder.
- `lab.repo_tag` — add it if the lesson has a lab.

## 4. Verify

```bash
npm run gate
```

The content gate checks EN/TR parity and the frontmatter schema. It must pass before you commit.

## 5. Hand off

Tell the session what comes next, in order:

1. Run the `lesson-researcher` agent for this lesson (D098).
2. Run the lab against the lab repo tag and save the **real** recording under the transcript
   folder — never write the lab section from an imagined session (D070, D093, D099).
3. Run the `lesson-writer` agent to fill the template in.
4. Run `fact-checker` and `reviewer` before opening the PR (D071).

Then `/translate-lesson` when the English is final.

## Rules

- Never overwrite an existing lesson. If the file exists, report it and stop — the session decides.
- Never write lesson prose here, and never invent a source URL or a `verified_at` date.
- Create the TR twin as a `draft: true` stub in the same step; an EN lesson without a TR twin fails
  the content gate.
