---
id: P07
title: "'MDX components A: prose and code presentation'"
milestone: M0
status: in_progress
owner: session-p07-2026-09-06
branch: plan/07-mdx-components-a
model_hint: sonnet
effort_hint: medium
depends_on: [P06]
owned_paths:
  - src/components/mdx/Callout.astro
  - src/components/mdx/CodeBlock.astro
  - src/components/mdx/OSTabs.astro
  - src/components/mdx/Transcript.astro
  - src/components/mdx/Sources.astro
  - src/components/mdx/WhenNotToUse.astro
  - src/components/mdx/Lab.astro
shared_paths: []
estimate: M
updated_at: 2026-09-06T20:22:07Z
open_questions: []
---

## Goal

Implement the seven MDX components every lesson's prose and code sections are built from: `Callout`, `CodeBlock` (copy button, OS tabs integration, line highlighting + annotations), `OSTabs` (persisted choice), `Transcript` (renders a real, previously-captured Claude Code session — never fabricated output, D019/D070/D093), `Sources` (the per-lesson sources block, D041/D042), `WhenNotToUse` (the D006/D090 lesson-template section), and `Lab` (the hands-on-lab wrapper). Each gets a working entry in `/design/`'s component gallery.

## Context

Read `docs/design/CANVAS.md`'s `lesson-1280`/`lesson-390`/`components` artboards (P00) for exact visual spec; `DECISIONS.md` D006 (lesson template — `WhenNotToUse` and `Lab` are literal sections of it), D019 (code block features), D041–D042 (sources block fields, YouTube as link cards not embeds), D070/D093 (transcripts are real recordings, never fabricated — this component must make it structurally awkward to fake one, e.g. by requiring a transcript **file reference**, not inline freeform text, so every transcript traces back to a real file under `content/_shared/transcripts/`). `src/content/schema.ts` (P06) defines the `sources[]` shape `Sources.astro` renders and the `lab?: {repo_tag}` field `Lab.astro` reads. `src/styles/tokens.css` and `shiki.css` (P05) are the only source of color/type values these components may use — no raw color literals.

## Scope

In:
- `Callout.astro`: variants (info/warning/danger/tip at minimum), icon + accessible role, theme-aware via tokens only.
- `CodeBlock.astro`: syntax highlighting via Shiki's dual-theme output (P05's `shiki.css`), a copy-to-clipboard button (keyboard-accessible, with a visible "copied" confirmation), line highlighting (`{3,7-9}`-style meta string) and inline annotation markers, and an `OSTabs` integration point when a code sample has per-OS variants.
- `OSTabs.astro`: tab list for macOS/Linux/Windows (PowerShell)/Windows (WSL) per D002, persists the reader's last choice in `localStorage['cc:os']` (via `src/lib/os-pref.ts` from P06) so switching lessons keeps the same OS selected, wrapped in try/catch.
- `Transcript.astro`: takes a reference to a transcript file under `content/_shared/transcripts/<module>/` (not inline freeform prop text) plus an optional line range/highlight, and renders it as a read-only terminal-styled block with a "raw transcript" link; if the referenced file is missing at build time, `content-gate.ts` (P04) is the enforcement point — this component itself should fail loudly in dev (an Astro build error, not a silent blank block) if given a path that does not resolve.
- `Sources.astro`: renders the `sources[]` frontmatter array — official doc link (required, visually marked as such), YouTube entries as link cards (title + duration + channel, no embed, per D042), article/repo links, and the "last verified" date per entry.
- `WhenNotToUse.astro`: a distinct, consistently-styled callout-like section for the D006 "When NOT to use" lesson section (folds D090).
- `Lab.astro`: wraps a lesson's hands-on lab section, reading `lab.repo_tag` from frontmatter to render a "try it yourself" pointer to the exact lab-repo tag (`codechup/claude-code-lab@lesson/<module>-<nn>-start`, per P22's tagging convention) alongside the lesson's own walkthrough.
- A working entry for all seven components in `/design/`'s gallery section (P05 left this section as a marked placeholder — this plan fills it in for its own seven components only).

Out: `Quiz`, `DecisionTree`, `Helpful`, `Giscus`, `YouTubeCard` (P08); any lesson content, layouts, or routes (P06); the lab repo itself (P22).

## Deliverables

`src/components/mdx/{Callout,CodeBlock,OSTabs,Transcript,Sources,WhenNotToUse,Lab}.astro`, each with a populated example in `/design/`'s gallery.

## Acceptance criteria

- Each component renders correctly in both themes and at 390 px and 1280 px with no raw color literal (verified by `scripts/check-raw-colors.mjs` once P04 exists, or manually against the same rule).
- `CodeBlock`'s copy button actually copies the code (not the annotation markers or line-number gutter) to the clipboard — verify with a Playwright test that reads `navigator.clipboard` in a test harness, or document a manual verification if the harness is not yet available.
- `OSTabs`'s persisted choice survives a full page navigation (test manually: select "Windows (WSL)" on one code block, navigate to another page with `OSTabs`, confirm it opens on WSL).
- `Transcript` given a valid file path renders it; given a non-existent path, the build fails with a clear error naming the missing file (not a silent empty block) — write this as a Vitest/Astro-container test, not only a manual check.
- `Sources` renders a YouTube entry as a link card with title/duration/channel visible and no `<iframe>`/embedded player anywhere in the output HTML.
- All seven components appear, populated, in `/design/`'s gallery.
- `npx playwright test e2e/a11y.spec.ts` against `/design/` (once P04 exists) shows 0 serious/critical axe violations introduced by these seven components.

## Steps

1. Read the `components` and `lesson-*` canvas artboards; confirm the token values needed already exist in `tokens.css` (P05) — if something is missing, use the closest existing token and note the gap in Handoff notes rather than inventing a new raw value.
2. Build `Callout` and `WhenNotToUse` first (simplest, establishes the pattern for reading tokens only).
3. Build `CodeBlock` + `OSTabs` together (they're coupled); test copy-button and persistence behavior manually and with an automated check where feasible.
4. Build `Transcript` against a temporary fixture transcript file (delete the fixture, or move it under a real module's transcripts if one already exists, before merging); build the missing-file-fails-loudly behavior and test it.
5. Build `Sources` and `Lab` against `content/schema.ts`'s real field shapes.
6. Wire all seven into `/design/`'s gallery with realistic example content; run the full local gate.

## Tests required

- Component-level tests (Astro container API or Vitest + JSDOM) for `Transcript`'s missing-file failure and `OSTabs`'s persistence read/write.
- `e2e/a11y.spec.ts` against `/design/`'s gallery (once P04's harness exists).
- Manual verification (documented in the PR) of the copy button and cross-page OS-tab persistence.

## Non-goals / pitfalls

- Never let `Transcript` accept inline freeform "recorded output" text as a prop — that is exactly the fabrication path D093 forbids; it must always resolve to a real file under `content/_shared/transcripts/`.
- Never embed a YouTube player — `Sources`/`YouTubeCard` (P08) are link-cards-only per D042.
- Do not hard-code an OS list that omits one of macOS/Linux/Windows-PowerShell/Windows-WSL — D002 requires all four with equal weight.
- Do not introduce a new color value outside `tokens.css` "just for this component" — extend the token set via a Handoff note to P05 instead.

## Verification

A reviewer opens `/design/`, exercises each of the seven components (copies a code sample, switches OS tabs across two pages, opens a Sources block, views a Transcript block and its "raw transcript" link, reads a Callout/WhenNotToUse/Lab block), and confirms no console error or embedded video player appears anywhere.

## Handoff notes

- _Filled by the executing session: what changed, decisions, follow-ups, blockers._
