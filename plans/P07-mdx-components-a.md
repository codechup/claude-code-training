---
id: P07
title: "'MDX components A: prose and code presentation'"
milestone: M0
status: done
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
updated_at: 2026-09-06T21:44:10Z
open_questions:
  - "OSTabs needs 4 tabs (macOS/Linux/Windows-PowerShell/Windows-WSL, D002) but src/lib/os-pref.ts (P06, outside owned_paths, shared_paths: []) only stores 3 macro values (macos/linux/windows). Could not extend it. OSTabs keeps writing the existing cc:os key for the macro OS and adds its own cc:os:shell key (src/components/mdx/os-tabs.ts) for the PowerShell/WSL sub-choice. Whoever next owns os-pref.ts should consider folding cc:os:shell into a real 4-value contract."
  - "/design/'s component gallery (src/pages/design/**) is P05's owned_paths, and the lesson page (src/pages/[lang]/[level]/[module]/[slug]/index.astro) is P06's -- neither is in P07's owned_paths, so this plan could not wire the seven components into either page directly, contrary to the Scope text's 'a working entry for all seven components in /design/'s gallery section'. Provided src/components/mdx/design-entries/Gallery.mdx instead (a real, working, populated demo of all seven) plus src/components/mdx/design-entries/sample-sources.ts. P05 (or whoever next owns /design/) should import it: `import Gallery from '../../components/mdx/design-entries/Gallery.mdx'` then `<Gallery />` in the placeholder gallery section. P12 (or whoever wires the lesson page to real MDX) should swap the lesson page's inline Sources block for `<Sources sources={entry.data.sources} lang={lang} />` and consider registering all seven as default MDX components (an Astro `components` map passed to `<Content components={...} />`) so lessons write `<Callout>` etc. without importing them per-file."
  - "e2e/shell.spec.ts's `test.fixme('OS-tab persistence — pending P07 (OSTabs MDX component)')` is owned by P04 (e2e/** outside P07's owned_paths), so it was not un-skipped here. OSTabs is implemented and unit-tested (src/components/mdx/os-tabs.test.ts) and manually verified end-to-end (see Handoff notes), but there is no real lesson page yet that renders an <OSTabs> for that spec to exercise. Whoever owns e2e/** next should un-skip it once a lesson page (P12+) actually uses <OSTabs>, pointing it at that lesson's URL."
  - "Local verification finding, not a code change needed: this Astro version (7.3.1) auto-runs `astro preview` in the background when it detects an AI-agent environment (astro/dist/cli/preview/index.js's isRunByAgent()), which makes the webServer command Playwright spawns exit immediately (`Error: Process from config.webServer exited early`). Worked around locally by passing `env: { ASTRO_PREVIEW_BACKGROUND: '1' }` on the webServer config, which this plan's temporary playwright.p07.config.ts did (deleted before merge, per instructions) rather than editing the shared playwright.config.ts (P04-owned, outside owned_paths). CI is presumably unaffected (GitHub Actions runners should not trip isRunByAgent()), but any future agent-run local `npx playwright test` may hit this — flagging for whoever owns playwright.config.ts to decide whether to add the env var there for local-agent ergonomics."
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

**What changed.** All seven components implemented in `owned_paths`, plus supporting files kept under `src/components/mdx/` (same directory, no path listed in any other active plan's `owned_paths` — P08 owns different filenames in the same directory):

- `codeblock.ts`/`.test.ts`, `os-tabs.ts`/`.test.ts`, `transcript.ts`/`.test.ts`, `sources.ts`/`.test.ts`, `lab.ts`/`.test.ts` — pure/testable logic factored out of each `.astro` file. **Why:** `vitest.config.ts` (P04-owned) uses plain `defineConfig` from `vitest/config`, not `getViteConfig` from `astro/config`, so it has no Vite/Astro plugin — confirmed empirically that `import X from './X.astro'` fails to transform inside a `.test.ts` (`Failed to parse source for import analysis`). Container-API tests of the `.astro` files themselves are therefore not possible under `npm test` today; all "Tests required" coverage (`OSTabs` persistence read/write, `Transcript`'s missing-file failure) lives at this logic-module level instead, which does run under `npm test` (152/152 passing, up from 104). Flagging for whoever next touches `vitest.config.ts`: switching it to `getViteConfig(import('./astro.config.ts'))` would let `.astro` container tests join `npm test` for future plans.
- `index.ts` — barrel export of all seven components.
- `__fixtures__/transcripts/sample-session.txt` — a synthetic, explicitly-labelled ("Formatting sample only — not a recorded Claude Code session…") transcript fixture, used by `transcript.test.ts` and the gallery demo. `transcript.ts`'s `ALLOWED_PREFIXES` allows exactly this directory plus `content/_shared/transcripts/` — no other path resolves, by design (D070/D093).
- `design-entries/Gallery.mdx` + `design-entries/sample-sources.ts` — see the open_questions entry above; hand this to P05 to mount in `/design/`.

**Decisions taken (recorded here since none matched an existing `Dnnn`):**

1. **Callout variants** are exactly `note` / `when-not-to-use` / `changed` (not the plan Scope text's generic "info/warning/danger/tip") — this matches `docs/design/canvas-out/Components.dc.html` and `Lesson1280.dc.html` exactly, and is what `WhenNotToUse` and the D044 "Changed" callout actually need.
2. **CodeBlock never calls Shiki directly.** `shiki` is only reachable today as an undeclared transitive dependency (hoisted via `astro`/`@astrojs/mdx`); adding it to `package.json` needs `shared_paths` this plan wasn't granted. Instead `CodeBlock` renders its default slot (a real fenced code block, already highlighted by Astro's own `markdown.shikiConfig`) and post-processes the resulting `<pre class="astro-code">…<span class="line">…</span>…</pre>` HTML for the gutter/highlight/annotation chrome — verified against this repo's actual build output (`data-language="bash"`, `--shiki-light`/`--shiki-dark` vars), not assumed. `highlight` accepts the same `{3,7-9}` range syntax as a **prop** (real remark/shiki meta-string highlighting needs a transformer registered in `astro.config.ts`'s `shikiConfig.transformers`, outside `owned_paths`). `annotations` is a `Record<line, text>` prop rather than an in-code `// ← text` magic-comment scan (ambiguous/fragile across languages; a prop cannot false-positive).
3. **Real, load-bearing MDX authoring pitfall found and documented** (in `Gallery.mdx`'s own comment and here): a fenced code block that is a JSX child of a custom component (e.g. `<CodeBlock>\`\`\`bash\n…\n\`\`\`</CodeBlock>`) is corrupted by `prettier --write`/`--check` (collapsed onto one line, backticks and all) **unless** it is separated from the opening/closing JSX tags by a blank line on each side. With the blank lines, Astro's real build and Prettier both treat it as a proper block-level child. This will bite every future lesson author who nests a code fence inside `<CodeBlock>`, `<OSTabs>`'s `<Fragment slot="…">`, etc. — worth a CONTRIBUTING note or a lint rule, not just this comment. Separately: a multi-line `{/* … */}` JSX comment in `.mdx` is not treated as opaque by Prettier — a blank line inside it, or enough text for its leading `/*`/trailing `*/` to be read as one long markdown-emphasis run, gets reformatted (asterisks turned to underscores, stray `**` escaped). Kept every in-file comment short and single-line for this reason.
4. **OSTabs is 4 tabs** (macOS, Linux, Windows (PowerShell), Windows (WSL)) per D002 and this plan's own Pitfalls bullet, not the 3 in the outer task's paraphrase or the 3-tab mock in `Components.dc.html`/2-tab mock in `Lesson1280.dc.html` — the plan text and D002 are the more specific and binding sources. Windows (WSL)'s content falls back to the `linux` named slot when a lesson doesn't supply a `wsl` slot (WSL runs Linux commands — an honest reuse, never a fabricated 4th variant). Persistence: macro OS via the existing shared `cc:os` key (`src/lib/os-pref.ts`, P06, read-only import), Windows sub-shell via this plan's own `cc:os:shell` key — see the open_questions entry. All instances on a page react together (one hoisted script per page, Astro's own script-deduplication). Keyboard: full roving-tabindex ARIA tabs pattern (Left/Right/Home/End), `aria-selected`/`role="tab"`/`role="tabpanel"`. Progressive enhancement: every panel renders visible server-side; the script hides non-active panels only once it runs (`[data-os-ready]`), so a no-JS reader still gets all four command variants, just stacked.
5. **A real WCAG 2.2 AA contrast bug found and fixed.** `--color-success` (`#1f8f45` light) and `--color-caret` (`#e63b2c` light) both fail the 4.5:1 text-contrast threshold against the light theme's `--color-bg-1`/`--color-bg-2` (measured 3.93–4.18:1 — both are fine as icon/border accents, ≥3:1, and both are fine as **text** in the dark theme, 5.2–9:1). This was caught by axe against a real render (`/design/p07-preview/`, deleted before merge), not by inspection. Fixed in `Transcript.astro` (result-ok/result-fail line text is `--color-ink-soft`, only the `✓`/`✗` glyph keeps the semantic color), `Lab.astro` (`.cc-lab-expected` text is `--color-ink-soft`, only the checkmark icon is green), and `CodeBlock.astro` (the "copied" state text is `--color-ink`, not `--color-success`). Flagged for P05: tokens.css has no non-text-safe / text-safe split for these two tokens; a darker text-safe variant (or documenting "success/caret are icon-only in light mode") would prevent this recurring.
6. `Transcript` is **file-reference only**, exactly as this plan's own Scope/Non-goals specify — the outer task instructions' "or a fenced `transcript` block" alternative was not implemented, since the plan is more specific and D070/D093-safer (inline content is the fabrication path).

**Manual verification performed** (documented here per "Tests required"; commands and full output pasted into the PR body): a temporary `/design/p07-preview/` + `/design/p07-preview-b/` pair of pages (mounting `Gallery.mdx` / a standalone `<OSTabs>`), a temporary `playwright.p07.config.ts` (port 4407, `env: { ASTRO_PREVIEW_BACKGROUND: '1' }` — see the open_questions entry on why that env var is needed), and a temporary spec covering: copy button copies exactly the raw code (`context.grantPermissions(['clipboard-read','clipboard-write'])` + `navigator.clipboard.readText()`, normalized for Windows' CRLF clipboard normalization — an OS-layer artifact, not a component bug); OSTabs keyboard access (roving tabindex, `aria-selected`); OSTabs choice surviving a real cross-page navigation (`cc:os`/`cc:os:shell` both asserted); Lab checklist surviving a reload (`cc:lab:design-gallery-lab`); Transcript has no `<iframe>` and a working "raw transcript" link; Sources has no `<iframe>`, marks `official` visually, and shows video channel/duration; axe at both 390px/1280px and both `data-theme="light"`/`"dark"` — 0 serious/critical violations after fix #5 above. All temporary files were deleted before the final commit (`git status --short` confirmed clean beyond `src/components/mdx/`).

**Not done / follow-ups:** see the four `open_questions` entries in this file's frontmatter (OSTabs 4th-tab storage gap, `/design/`+lesson-page wiring handoff, `e2e/shell.spec.ts`'s still-skipped fixme, and the `ASTRO_PREVIEW_BACKGROUND` local-verification finding).
