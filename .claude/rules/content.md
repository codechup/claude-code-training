---
paths:
  - 'content/**/*.mdx'
  - 'content/_shared/**'
---

# Lesson content rules

These rules apply whenever you create or edit a lesson under `content/`. They restate
`docs/CURRICULUM.md` §3–§4 as a checklist — the curriculum doc is the authority; P03 owns it.

## 1. Template order (D006, D090)

Every lesson body uses these sections, in this order, with no section silently dropped:

1. **Objectives & prerequisites** — what the reader can do afterwards, what they need first.
2. **When NOT to use this** — the honest boundary. Not optional: it is part of the template.
3. **Concept** — the explanation, with the one example prompt every lesson carries (D027).
4. **Hands-on lab** — numbered steps, an explicit expected result, a checklist, and a real
   transcript. Labs run against the lab repo tag named in the frontmatter `lab.repo_tag`.
5. **Anti-patterns** — what goes wrong, and the fix for each.
6. **Changed** callouts — only where a behaviour was superseded (see §4).
7. **Quiz** — 3–5 multiple-choice questions with instant feedback (D064).
8. **Sources** — see §3. The official-docs link is mandatory.

If a lesson genuinely has nothing for a section, say so in one line rather than deleting the
heading — a reviewer checks order and presence mechanically (the `reviewer` agent does this).

Callouts and code/transcript rendering use the MDX components owned by P07/P08. Use the component
names those plans ship; do not invent props for them here.

## 2. Frontmatter

The schema is `src/content/schema.ts` (`lessonSchema`) — it is the authority, and it is validated by
`npm run gate` before every build. Required: `title`, `description`, `level` (1–6 numeric),
`module`, `order`, `duration_min`, `difficulty` (`intro|core|advanced`), `tags`, `verified_version`,
`updated`, `draft`, `sources[]`; `lab` is optional.

- **`verified_version` is pinned per lesson (D096).** It records the Claude Code version the lesson
  was verified against — currently `2.1.263` (see the heading of `research/feature-inventory.md`).
  Bump it only when you have re-verified the lesson's claims against that newer version, and update
  `updated` in the same edit. The site footer shows the same value.
- `level` and `module` must match the path the file lives at; the content gate asserts this.
- `draft: true` hides a lesson from navigation. TR twins start as `draft: true` stubs and flip to
  `false` when translated.

## 3. Sources block (D041–D043)

Every lesson ends with a Sources block, and every entry is a `sources[]` frontmatter entry:

```yaml
sources:
  - type: official # official | video | article | repo
    title: 'Hooks reference'
    url: 'https://code.claude.com/docs/en/hooks.md'
    verified_at: 2026-09-06
  - type: video
    title: 'Claude Code in practice'
    url: 'https://www.youtube.com/watch?v=...'
    channel: 'Anthropic' # required for videos
    duration: '12:41' # required for videos
    verified_at: 2026-09-06
```

- At least one `type: official` entry pointing at `code.claude.com/docs` is **mandatory**.
- YouTube sources are link cards — title + channel + duration. Never an embedded player (D042).
- `verified_at` is the date a human or `/verify-sources` actually fetched the URL. Do not copy a
  date forward without refetching. CI additionally link-checks with `lychee` (D043).
- Source priority (D012): official docs → Anthropic blog/engineering and the official YouTube
  channel → curated community lists → independent instructors. A community blog may be cited only
  when an official doc confirms the same claim.

## 4. "Changed" callouts (D044)

A deprecated or superseded behaviour never gets full lesson content. It gets a short "Changed"
callout — one or two sentences, in the present tense about what is true now, with the version where
the change is known — plus an entry on the changelog page (`playbook/06-changed-since-2025`).
Source the version from `research/deprecations.md` or the official changelog, never from memory.

## 5. Transcripts (D070, D093, D099)

- Every lab in a lesson was **actually run** by the writing session against the lab repo.
- The raw recording is saved under `content/_shared/transcripts/<module>/<NN-slug>/` and committed.
  That folder is outside the content collections and outside the EN/TR parity gate.
- The lesson renders a trimmed version of that recording. Trimming means deleting lines and
  redacting local paths and usernames — never rewriting output into something "cleaner" that the
  tool did not print.
- A transcript you did not record is not a transcript. If a lab could not be run, mark the lesson
  incomplete in the plan's Handoff notes; do not ship an invented session.
- Redact absolute local paths, usernames and anything the public-hygiene rule forbids before
  committing a recording — the hygiene checker scans transcripts like every other tracked file.

## 6. Facts

Every factual claim traces to `research/feature-inventory.md` or to a URL you fetched while writing
(D093). Claims the inventory marks UNVERIFIED stay out of lesson text and go into the plan's
`open_questions`. Run the `fact-checker` agent before opening the PR (D071).
