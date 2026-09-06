---
name: verify-sources
description: Fetches every URL in a lesson's sources[] frontmatter, refreshes each verified_at to today when the page still exists and still supports the claim, and reports dead or moved links loudly. Run before a release and whenever a lesson's sources are older than a few weeks.
when_to_use: A lesson's sources need re-verification — before a release, before merging a content PR, or when link-checking flags a page.
argument-hint: <path to a lesson .mdx, or a directory>
arguments: [target]
allowed-tools: Read, Glob, Edit, WebFetch
model: sonnet
effort: medium
---

# /verify-sources

Re-verify the sources of `$target`.

## 1. Collect

If `$target` is a file, read it. If it is a directory, glob `**/*.mdx` under it and process each in
turn. From each file, collect every `sources[]` entry: `type`, `title`, `url`, `verified_at`, and
`channel`/`duration` for videos.

Turkish twins copy their `sources[]` from the English source (`.claude/rules/i18n.md`), so verify
the **English** file and mirror the resulting `verified_at` values into the TR twin. Do not verify
the same URL twice.

## 2. Fetch every URL

WebFetch each one. For each, decide which of these it is:

- **OK** — the page loads and still supports the claim the lesson cites it for. Do not just check
  for a 200: a doc page that has been rewritten to say something else is a **CHANGED**, not an OK.
- **MOVED** — it redirects or the content has clearly relocated. Record the new URL; do not follow
  it silently into the frontmatter without saying so.
- **CHANGED** — the page loads but no longer supports the claim.
- **DEAD** — 404, gone, or the fetch fails.

For `type: video`, also confirm the recorded `channel` and `duration` still match. A video whose
duration you cannot confirm is not OK.

## 3. Update

Only for entries you marked **OK**, set `verified_at` to today's date, editing the frontmatter in
place. Nothing else in the file changes.

**Never advance a `verified_at` for an entry you could not fetch.** That date is a claim that a
human or this skill actually loaded the page on that day (D043, D093); copying it forward is
exactly the kind of quiet fabrication the evidence rule exists to prevent. Leave the old date and
report the failure.

For MOVED, CHANGED and DEAD entries: do **not** edit them. Report them and let the session decide —
a replacement source is an authoring decision, not a mechanical one.

## 4. Report

Print a table and a verdict:

| File | Type | URL | Status | Old verified_at | New verified_at |
| ---- | ---- | --- | ------ | --------------- | --------------- |

Then:

- **Dead or changed links** — listed loudly, one per line, with the file and the claim they were
  cited for. These block the release.
- **Missing official source** — flag any lesson with no `type: official` entry pointing at
  `code.claude.com/docs`. That is mandatory (D041).
- **Verdict** — `PASS` when every entry is OK, otherwise `FAIL (n dead, m changed)`.

## Rules

- Fetch every URL. A source you did not fetch is not verified, however plausible it looks.
- Never invent a URL, a title, a channel, a duration or a date.
- Do not rewrite lesson prose here — this skill touches `verified_at` and nothing else.
- CI additionally link-checks with `lychee` (D043); this skill is the semantic check that lychee
  cannot do, so read the pages rather than only counting status codes.
