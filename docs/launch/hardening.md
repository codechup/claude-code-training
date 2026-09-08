# Launch hardening record (P47)

> Evidence trail for the post-launch hardening pass on top of the M3 release
> (`docs/release/M3-release.md`). This plan tunes and verifies; it adds no
> content and no features. All checks below were run against the real,
> live site (https://cc.codechup.com) and/or a fresh local build on
> `plan/47-launch-hardening`, not reconstructed from memory.

| | |
|---|---|
| Plan | P47 — `plans/P47-launch-hardening.md` |
| Date | 2026-09-08 |
| Branch | `plan/47-launch-hardening` |
| Live site | https://cc.codechup.com |

## 1. Local quality gate (full repo tree, this branch)

```
npm run typecheck   → astro check: Result (107 files): 0 errors, 0 warnings, 7 hints
npm run lint        → eslint clean · prettier: "All matched files use Prettier code style!"
                       · check-no-inline-script: OK (73 files scanned)
                       · public-hygiene: OK (tracked) · check-raw-colors: OK (77 files scanned)
npm run gate        → content gate: OK (308 files checked)
npm test            → Test Files 22 passed (22) · Tests 187 passed (187)
npm run build       → 313 page(s) built in 14.46s
                       Pagefind: Indexed 2 languages, 310 pages, 33645 words
                       check-no-inline-script (dist): OK (313 files scanned)
node tools/plan/cli.ts check
                    → ok: 48 plans, frontmatter valid, DAG acyclic, no owned_paths overlap,
                       STATE.md fresh
npx playwright test → 104 passed, 4 skipped (pre-existing search-UI test.fixme, unrelated to
                       this plan — see docs/release/M3-release.md §5)
```

All numbers match the M3 baseline exactly (same 308/313/187 counts) — no regression since the
last release record.

## 2. Hreflang and canonical audit

**Method:** a small script (`p47-hreflang-audit.mjs`, not committed — a throwaway analysis tool)
walked every `index.html` in a fresh `dist/` build, extracted `<link rel="canonical">` and every
`<link rel="alternate" hreflang>`, and checked: every `/en/`/`/tr/` page has both a self alternate
and (when a sibling-language page exists) a reciprocal one pointing back, and `x-default` always
resolves to the English page.

```
Total routes with index.html: 312
Missing canonical: 0
No alternates (en/tr routes): 0
Non-reciprocal pairs: 0
Bad x-default: 0
Total issues: 0
```

**Live cross-check:** fetched the live `sitemap-0.xml` (311 URLs) and diffed it byte-for-byte
against the freshly-built `dist/sitemap-0.xml` — identical. Sampled 21 live URLs spanning every
level, Playbook, Meta, `/design/`, and both languages via real `curl` requests against
`https://cc.codechup.com`; every EN/TR pair reciprocates correctly and `x-default` points at the
English page in every case, matching the dist audit exactly. `/design/` (locale-agnostic) carries
a canonical and correctly emits no hreflang alternates.

**Verdict:** clean. No defect found; `src/lib/seo.ts` is unchanged (D065's `alternatesFor` and
`ogImagePath` logic already do the right thing).

## 3. Accessibility re-audit — full route list, both viewports, live site

**Standing CI suite** (`npx playwright test`, local build): 104 passed, 4 skipped (see §1) — 0
serious/critical axe violations across its sampled routes (unchanged from M3 §5).

**Full-route-list live audit (this plan's own step, beyond the CI sample):** every URL in the
live sitemap (311) plus `/404/` (312 routes) was crawled live at both viewports (390×844 phone,
1280×800 desktop) with `@axe-core/playwright`, using a temporary Playwright spec/config
(`e2e/p47-live-a11y.spec.ts` + `playwright.p47-live.config.ts`) pointed at
`https://cc.codechup.com` — deleted immediately after the run; `git status` on this branch shows
no `e2e/**` changes.

```
Running 624 tests using 6 workers
  624 passed (3.9m)
```

**0 serious/critical axe violations across every route in both languages, at both viewports,
against the live production site.**

### Manual pass (things axe cannot see)

Performed with a real Chrome session against
`https://cc.codechup.com/en/l1-beginner/m01-start/what-claude-code-is/`:

- **Keyboard focus order**: `Tab` from page load visits, in order: the skip link → site logo →
  Curriculum → Playbook → Changelog → Design → Search → language switch (`EN`/`TR`) → theme
  toggle (three buttons: System / Dark / Light) → the in-page TOC. Every stop shows a clear
  visible focus ring (an orange outline distinct from the page's dark theme). No focus trap, no
  skipped or unreachable header control.
- **Accessible names**: read via the page's accessibility tree — `button "Search lessons"`,
  `link "Language: TR"`, `button "System"` / `"Dark"` / `"Light"` (the theme toggle is three
  separate labelled buttons, not one ambiguous icon) — all correctly announced, none relying on
  an icon alone.
- **Theme toggle keyboard operability**: tabbing to the "Light" button and pressing `Return`
  actually flips the page theme (confirmed visually) — not just clickable with a mouse.
- **Skip link — a real defect (see §6)**: activating "Skip to content" via keyboard does **not**
  move focus into the main content. `document.activeElement` after activation is `<body>`, not
  `<main id="main">`, because none of the three layouts that render the skip link give their
  `<main id="main">` a `tabindex="-1"`. The link does jump the *visual* scroll position (a
  same-page anchor still works for sighted mouse users and for the URL fragment), but a
  keyboard-only user gets no functional benefit: their next `Tab` press resumes from the top of
  the document, not past the header nav. This is exactly the class of defect axe-core cannot
  detect (it has no way to assert "the skip link's target receives focus"), which is why the
  plan calls for a manual check here.

## 4. Analytics review (O7)

`PUBLIC_CF_BEACON_TOKEN` (owner action O7, `docs/deploy/README.md`) is **not set** — confirmed by
inspecting the live page source: `curl -s https://cc.codechup.com/en/ | grep -i beacon` returns
nothing. `src/layouts/Base.astro` only renders the Cloudflare beacon `<script>` tag when
`import.meta.env.PUBLIC_CF_BEACON_TOKEN` is truthy (see the guard around line 81), so with the
token absent the conditional block emits **no markup at all** — not a broken/empty `src`, not a
console error, nothing. The CSP's `script-src` still lists `static.cloudflareinsights.com`
(harmless — an allowed source that is simply never used) and `connect-src` still lists
`cloudflareinsights.com`. **Verdict: degrades cleanly. O7 deferral confirmed, no code change
needed.**

## 5. Cloudflare cache-rule verification (live headers)

Real `curl -I` output against `https://cc.codechup.com`, 2026-09-08:

**A built asset (`/_astro/repo.BQFljwkp.css`):**
```
Cache-Control: public, max-age=31536000, immutable
cf-cache-status: HIT
Age: 12914
```

**A Pagefind asset (`/pagefind/pagefind-entry.json`):**
```
Cache-Control: public, max-age=3600
cf-cache-status: DYNAMIC
```

**A lesson page (`/en/l1-beginner/m01-start/what-claude-code-is/`):**
```
Cache-Control: no-cache
cf-cache-status: DYNAMIC
```

**The locale root redirect (`/`):**
```
HTTP/1.1 302 Found
Cache-Control: private, no-store
vary: Accept-Language, Cookie
cf-cache-status: DYNAMIC
```

**Verdict — already correct, no owner action needed today:** `/_astro/**` is immutable and
genuinely cached at Cloudflare's edge (`HIT`, 12914s old); HTML (lesson and locale pages) is
`no-cache` and never edge-cached (`DYNAMIC`); the `/` locale-redirect is `private, no-store` with a
`Vary` on `Accept-Language`/`Cookie` so Cloudflare cannot serve one visitor's redirect to another
— exactly the three behaviors the plan asked to confirm. The one soft spot: `/pagefind/**` sets a
3600s TTL but Cloudflare's edge reports `DYNAMIC` rather than caching it — Cloudflare's default
cache level only auto-caches by file extension for a fixed list of "static" extensions, and `.json`
is not on that list by default. This is not a regression (Pagefind index files are small, ~230
bytes for the entry file, and origin-uncached correctness is safe), but a dedicated Cloudflare
Cache Rule would let the edge honor Pagefind's own `Cache-Control` instead of guessing. **This
recommendation, and the two Cache Rules it implies, belongs in `docs/deploy/README.md`'s owner
checklist — see the open question in §7: that file is owned by P10 (`status: done`), which is
outside this plan's `owned_paths` (`shared_paths: []`), so it is not edited here.** The
recommended rules, for whoever picks up that follow-up:

1. **Cache Everything + Edge TTL for `/_astro/*`** (or confirm the default "Standard" cache level
   already covers content-hashed, `immutable`-headed assets — today's `HIT`/`Age: 12914` suggests
   it already does; a rule would just make that explicit and pin the edge TTL to match the
   `max-age=31536000` origin header instead of Cloudflare's own heuristic).
2. **Cache Everything + a short edge TTL (e.g. 1h) for `/pagefind/*`** so the edge, not just the
   origin, serves the search index from cache — currently `DYNAMIC` despite the origin's own
   `max-age=3600`.
3. **Bypass cache explicitly for `/`** (the locale-redirect route) — today's origin headers
   (`private, no-store`, `Vary: Accept-Language, Cookie`) already prevent any caching, so this is
   a belt-and-suspenders rule, not a fix for an observed problem; worth codifying anyway so a
   future Cloudflare dashboard change can't accidentally start caching a redirect that must stay
   per-visitor.

No change to Cloudflare itself was made or could be made from this repository (Cloudflare
configuration is owner-only, per `docs/deploy/README.md`'s existing scope note).

## 6. `links-weekly.yml` — tuning and verified issue-opening behavior

**Finding:** a manual `workflow_dispatch` trigger against `main`
(run [34186294554](https://github.com/codechup/claude-code-training/actions/runs/34186294554))
came back with **3 errors** and opened issue
[#86](https://github.com/codechup/claude-code-training/issues/86) — but all three were already
documented, known non-defects in `STATE.md` itself (P20's `code.claude.com/docs/en/simplify.md`
404, P24's `downloads.claude.ai/claude-code/apt/stable` 404 — "a link-checker false positive... no
action needed unless a future lychee run wants it added to lychee.toml's exclude list", and P28's
`api.githubcopilot.com/mcp/` 401 auth-gated endpoint). `lychee` was flagging its own generated
status file's *prose descriptions* of known issues as if they were live links to click. This meant
the weekly workflow would have opened a spurious issue on every single run, forever, defeating the
"only flag real breakage" purpose of the routine.

**Fix (`.github/workflows/links-weekly.yml`, this plan's `owned_paths`):** added three targeted
`--exclude` regex flags for exactly those three URLs — narrower than a blanket `--accept 401,403`,
which would also have silenced other host's genuinely-broken 401/403s.

**Verification, real runs:**

- **Clean pass, with the fix** (run
  [34186459270](https://github.com/codechup/claude-code-training/actions/runs/34186459270),
  triggered on `plan/47-launch-hardening`): `🚫 Errors: 0` of 804 unique links checked (3934
  total occurrences, 2351 excluded, 6 redirects noted but not failing). "Open an issue on
  failure" step correctly **skipped**.
- **Deliberate-failure trigger** (throwaway branch `p47-throwaway-broken-link`, deleted after):
  committed a fixture file (`docs/launch/hardening-fixture.md`) linking to a real,
  guaranteed-404 URL (`https://github.com/codechup/claude-code-training/this-path-does-not-exist-p47-test`,
  confirmed 404 via `curl -I` first). Triggered the workflow
  (run [34186565806](https://github.com/codechup/claude-code-training/actions/runs/34186565806)):
  `🚫 Errors: 1`, "Open an issue on failure" ran and opened issue
  [#87](https://github.com/codechup/claude-code-training/issues/87). (Note: a first attempt used
  an `.invalid`-TLD placeholder URL, which lychee's own default exclude rules for
  reserved/example domains silently skipped — 0 errors, no issue — so that attempt was not proof
  of anything; the real-domain 404 above is the one that proves the mechanism works.)
- **Cleanup:** both test issues closed with an explanation comment (#86, #87); the throwaway
  branch and its fixture were deleted both locally and on `origin`
  (`git push origin --delete p47-throwaway-broken-link`) — `docs/launch/hardening-fixture.md`
  never touched `plan/47-launch-hardening` or `main`.

**Glob/scope check:** `./content/**/*.mdx './docs/**/*.md' './research/**/*.md' './*.md'`
already covers every Playbook and Meta `.mdx` file (verified: `content/en/playbook/*.mdx` and
`content/tr/meta/*.mdx` both match `content/**/*.mdx`) and, being an `.mdx`-only glob, already
excludes every transcript file under `content/_shared/transcripts/**` (`.txt` recordings and
`.md` manifests) without needing an explicit exclusion — no change needed there.

**Schedule/timeout:** `cron: '17 6 * * 1'` (weekly) with no explicit job timeout (GitHub's
default 6h ceiling applies) is more than sufficient — the real corpus (804 unique links, 3934
total occurrences across 308 content files + docs/research) completed in **13–21 seconds** in
every run triggered above. No tuning needed.

## 7. Open questions / follow-ups for the owner or a future plan

- **Skip-link focus defect (real, cross-cutting, out of `owned_paths`)** — `src/layouts/
  Lesson.astro:60/86`, `Section.astro:36/51`, and `Landing.astro:30/32` all render `<a class=
  "cc-skip" href="#main">` pointing at `<main id="main">` with no `tabindex="-1"` on the `<main>`.
  Keyboard activation of "Skip to content" does not move focus past the header nav (confirmed:
  `document.activeElement` lands on `<body>`, not `<main>`, per §3). Fix is a one-line addition
  (`tabindex="-1"` on each `<main id="main">`, ideally with `:focus { outline: none }` scoped to
  that element since a keyboard user won't want a visible ring around the entire page body) but
  touches three layout files outside this plan's `owned_paths` (`src/lib/seo.ts` is the only code
  file P47 owns). Recommend a small, dedicated follow-up plan or an amendment to whichever plan
  next touches those layouts.
- **Cloudflare Cache Rules for `/pagefind/*` (and, optionally, an explicit rule for `/_astro/*`
  and `/`)** — see §5's three recommended rules. This write-up belongs in `docs/deploy/README.md`'s
  owner checklist, but that file is owned by P10 (`status: done`) and is not in P47's
  `owned_paths` or `shared_paths` (`shared_paths: []`), so it was not edited here per D048 ("Never
  edit another plan's files"). Recommend either a tiny follow-up plan that owns
  `docs/deploy/**`, or amending P10/P47's `owned_paths` explicitly before a docs-only PR adds the
  one new checklist row.
- **Pagefind edge caching** is a nice-to-have, not a defect — origin headers are already correct
  (§5); only Cloudflare's edge behavior for `.json` is the gap, and it fails safe (no caching)
  rather than unsafe (stale search index).

## 8. Summary

| Area | Result |
|---|---|
| Hreflang / canonical | Clean — 0 issues across 312 routes (dist + live cross-check) |
| Accessibility (full route list, live, both viewports) | 0 serious/critical — 624/624 axe checks passed |
| Accessibility (manual: keyboard, focus rings, skip link, theme/lang switch) | 1 real defect found (skip-link focus target) — logged in §7, out of `owned_paths` |
| Analytics (O7) | Confirmed clean degradation; O7 still deferred (owner action, unchanged) |
| Cloudflare cache headers | Already correct for assets/HTML/redirect; one edge-caching gap for Pagefind JSON — recommendation logged in §5/§7 |
| `links-weekly.yml` | Fixed a real spurious-issue bug (3 known non-defects flagged every run); clean pass and deliberate-failure issue-opening both verified with real runs; test issues closed, throwaway branch deleted |

## Handoff notes

- `src/lib/seo.ts` was audited and found correct — no code change was needed there; only
  `.github/workflows/links-weekly.yml` changed.
- The skip-link focus defect (§3, §7) is real and worth fixing soon — it affects every page on
  the site for every keyboard-only visitor — but is outside this plan's `owned_paths`.
- The Cloudflare cache-rule write-up (§5, §7) needs a home in `docs/deploy/README.md`, owned by
  P10; this plan could not append to it under D048.
- Both temporary artifacts from the link-check verification (issues #86 and #87, branch
  `p47-throwaway-broken-link`) were closed/deleted before this record was written.
