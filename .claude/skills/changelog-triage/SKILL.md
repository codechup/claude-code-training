---
name: changelog-triage
description: Works through the pending Claude Code changelog entries the weekly drift job found — deciding noop, applied or escalated for each, editing the affected lesson sentences, recording every decision in research/changelog/reviewed.json, and bumping the ledger pin only when the backlog is clear. Run it when the `drift` issue has entries, or after any Claude Code release.
when_to_use: The weekly `drift` issue lists pending changelog entries, or `node scripts/changelog-drift.mjs report` exits non-zero.
argument-hint: '[--max N] (default 25)'
arguments: [max]
allowed-tools: Bash, Read, Edit, Write, Glob, Grep, WebFetch
model: sonnet
effort: medium
---

# /changelog-triage

Turn the pending upstream changelog entries into lesson edits, or into a recorded reason not to
edit. Nothing about this course is "kept current" by re-reading it — it is kept current by acting
on the small set of bullets that actually changed.

## Why this is cheap, and must stay cheap

`scripts/changelog-drift.mjs` does every expensive thing before you are involved:

- it parses the upstream changelog and keeps only versions **newer than the ledger pin**;
- it drops entries already recorded in `research/changelog/reviewed.json`;
- it drops `Fixed` bullets that name no identifier any lesson teaches (`noise`);
- it routes what remains to **at most three lesson paths** and hands you **the exact matching
  lines** from those lessons.

So your context is proportional to _what changed upstream this week_ — typically a couple of dozen
one-line bullets and a handful of quoted lesson lines — and **never** to the 119-lesson course.
Hold that property:

- **Never** glob or read the whole course, or a whole module, "to see what else might be affected".
  If an entry needs a lesson the router did not name, that is an `escalated` entry, not a licence
  to sweep.
- **Never** open a lesson the router did not route to you, except the Turkish twin of one you
  edited.
- Read a routed lesson in full only when you are about to edit it. For a `noop` decision, the
  quoted context lines are enough.
- Docs pages are re-hashed quarterly by `/verify-sources` on **changed pages only** — do not
  re-verify sources here.

## 1. Get the work

```bash
node scripts/changelog-drift.mjs route --pending --with-context [--max N]
```

That prints, per entry: the id, version, verb, priority, the bullet verbatim, the routed lesson
paths, which tokens matched, and the matching lines. Work strictly from that output.

The **25-entry cap is enforced by the tool**, not by you — `--max` defaults to 25 and the run ends
with `(+N more entries omitted by --max 25)` when there are more. Work the entries in the order
printed; the router sorts by verb weight × lessons hit, so `Removed`/`Reverted`/`Changed` entries
touching several lessons come first. Say at the end how many were left; a second run picks them up
because the ledger records what you did.

Two lines in that output need acting on rather than reading past:

- `(+N more lessons also matched)` — the router capped the lesson slate for that entry. If your
  decision depends on lessons it did not name, re-run with `--json` and widen deliberately.
- an entry routed `via=tag` carries weaker evidence than `via=token`; its context lines are the
  lesson's matching lines and headings, which is usually enough to decide `noop` without opening
  the file.

## 2. Decide each entry

Exactly one of three, per entry.

### `noop`

The change does not affect anything the course teaches, or it confirms what a lesson already says.
Record a **one-line** reason. Do not open the lesson. Examples: an internal performance improvement,
a fix to a surface no lesson covers, a change to behaviour the lesson already describes correctly.

### `applied`

A lesson sentence is now wrong or incomplete. Then, in this order:

1. **Edit the affected sentence** in the routed EN lesson so it states what is true now. Present
   tense. Do not add a paragraph where a clause will do, and do not rewrite the section around it.
2. **Add a "Changed" callout** (per `.claude/rules/content.md` §4) that **quotes the changelog
   bullet verbatim** and names its version. Verbatim means character-for-character from
   `route`'s output — never paraphrased, never tidied. If the bullet is too long to quote whole,
   quote a contiguous span of it and mark the ellipsis; never splice.
3. **Bump that lesson's `verified_version`** to the entry's version, and set `updated` to today.
   Only for the lesson you actually edited or re-read end to end.
4. **Append a row to `research/deprecations.md`** — old behaviour, what is true now, the version,
   and the lesson that teaches the current behaviour.
5. **Append an entry to the Playbook changelog page** `content/en/playbook/changelog.mdx`, in the
   page's existing shape (Changed / Since / A stale tutorial says / Now). The release **date** for
   the "Since" line comes from `node scripts/changelog-drift.mjs fetch` (the docs mirror is the only
   source that publishes dates) — never from memory.
6. **Mirror to the Turkish twin** at the same relative path under `content/tr/`, following
   `.claude/rules/i18n.md`: translate the edited sentence and the callout, keep the English
   technical terms, keep the quoted bullet in English inside the callout (it is a quotation), and
   mirror `verified_version` and `updated`. A `draft: true` TR stub is edited only if the
   corresponding text exists in it; otherwise leave the stub alone and say so.

### `escalated`

The change is big enough to need a new lesson, a restructured section, or an owner decision (a
curriculum, product or design call — see CLAUDE.md, "Never invent an owner decision"). Do **not**
write lesson content. Write a plan file under `plans/` following `plans/README.md`, with the bullet
quoted verbatim in its description and the routed lessons in `open_questions`, then record the
entry as `escalated` with the plan id in `note`.

## 3. Record every decision

Write each decided entry into `research/changelog/reviewed.json` — this skill is the **only** writer
of that file; CI never touches it.

```json
{
  "pin": "2.1.263",
  "entries": {
    "b6e5017da222": {
      "version": "2.1.265",
      "status": "applied",
      "note": "m12-plugins/01-plugin-anatomy: --plugin-dir now also accepts a folder of plugins",
      "pr": "P49"
    }
  }
}
```

- The id is the router's id — a hash of the bullet's normalised text. Copy it exactly; never invent
  one, and never renumber. Reordering upstream cannot resurrect an entry whose id is recorded.
- `status` is `applied | noop | escalated`. `note` is one line. `pr` is the PR or plan id, or `null`.
- An entry you did not decide stays out of the ledger. Never record a decision you did not make —
  that is exactly the drift the ledger exists to prevent (D093).

## 4. Bump the pin — only when it is honest

Re-run `node scripts/changelog-drift.mjs route --pending`. Set `"pin"` to the highest version **V**
such that **nothing is pending at or below V**. If entries below the newest release are still
pending, the pin stops at the last fully-cleared version. Never set the pin to the newest release
just to make the report green.

The content gate asserts every lesson's `verified_version` ≤ pin, so a pin bump is a claim the whole
course can carry. That assertion is now total: `verified_version` must match a semver release
(`src/content/schema.ts`), pre-releases compare correctly, and a value the gate cannot compare is a
**gate failure**, never a silent pass.

Content-free bullets ("Bug fixes and reliability improvements") are classed `noise` automatically
and never occupy a pending slot, so one boilerplate line can no longer freeze the pin — and, through
this assertion, the whole course.

## 5. Verify and report

```bash
npm run gate
node scripts/changelog-drift.mjs report
npx vitest run scripts/changelog-drift.test.ts
```

Then report: a table of `id | version | verb | decision | lesson(s) touched`, the new pin (or why it
did not move), how many entries remain pending, and anything escalated with its plan id. Paste the
real command output — never a reconstruction (D093).
