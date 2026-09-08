---
id: P47
title: Launch hardening
milestone: M4
status: review
owner: lead-opus
branch: plan/47-launch-hardening
model_hint: sonnet
effort_hint: medium
depends_on: [P45]
owned_paths:
  - docs/launch/hardening.md
  - src/lib/seo.ts
  - .github/workflows/links-weekly.yml
shared_paths: []
estimate: M
updated_at: 2026-09-08T04:24:48Z
open_questions:
  - "Skip-link focus defect: <main id=\"main\"> in src/layouts/Lesson.astro, Section.astro and Landing.astro has no tabindex=\"-1\", so keyboard activation of \"Skip to content\" does not move focus past the header nav (confirmed live: document.activeElement lands on <body>). Real, cross-cutting a11y defect axe cannot detect; out of P47's owned_paths (touches three layout files, not src/lib/seo.ts). See docs/launch/hardening.md §3/§7."
  - "Cloudflare cache-rule recommendations (immutable /_astro/**, short-TTL /pagefind/**, never-cache / locale redirect) belong in docs/deploy/README.md's owner checklist, but that file is owned by P10 (status: done) and outside P47's owned_paths/shared_paths ([]). Recommendation and reasoning recorded in docs/launch/hardening.md §5/§7 instead; needs a follow-up plan or an owned_paths amendment to land in docs/deploy/README.md itself."
---

## Goal

Do the last round of post-launch checks on the live site: a real hreflang audit against Search Console (or, absent that access, a manual crawl-simulation check), a review of live Cloudflare Web Analytics data, a fresh accessibility re-audit against the finished (not just sampled) site, a look at Cloudflare cache-rule behavior for the site's static assets, and turning the weekly link-check routine from a fresh-repo no-op into a genuinely useful recurring job now that the site has real content volume. This plan tunes and verifies; it does not add features.

## Context

Read `docs/release/M3-release.md` (P45) for the launch-day evidence baseline. `src/lib/seo.ts` (P09, `done`) is this plan's one code file to revisit — only to fix a real hreflang defect this audit finds, never to add new SEO features. `.github/workflows/links-weekly.yml` (P04, `done`) already runs a full-repo `lychee` sweep on a schedule; this plan tunes its cadence/scope now that the corpus is large (e.g., confirm it is not timing out, confirm its issue-opening behavior actually works by triggering one manually against a deliberately-broken fixture branch, then reverting).

## Scope

In:
- Hreflang audit: crawl the live sitemap, confirm every EN page's TR alternate (or lack thereof, for a still-unpublished item — there should be none post-M3) is correctly declared and reciprocal; fix any real defect found in `src/lib/seo.ts` (a minimal, targeted fix, not a rewrite).
- Analytics review: confirm the Cloudflare Web Analytics beacon (P09, gated on O7) is receiving real traffic if O7 is done; if not, note the deferral.
- Accessibility re-audit: run `axe` against every route class on the live site (not the CI sample — the actual full route list), at both viewports; file any new finding as a small follow-up (fixed here if trivial and within this plan's `owned_paths`, otherwise `open_questions` naming the owning content/component plan).
- Cache rules: verify (via response headers on the live site) that `/_astro/**` and `/pagefind/**` serve long-lived immutable caching and that `/en/`, `/tr/`, and lesson pages serve short/no-cache appropriately, matching the intent already implemented in the host-side vhost change (owner-managed, private repo) — this plan verifies the externally-visible behavior only, it does not touch that repository.
- `links-weekly.yml`: confirm its schedule and timeout are appropriate for the full, launched corpus; trigger it manually once (`gh workflow run`) and confirm both a clean pass and, against a deliberately-broken temporary fixture, that it actually opens an issue — revert the fixture immediately after.
- `docs/launch/hardening.md`: record every finding and fix from the above.

Out: adding a new SEO feature, a new analytics integration, or a new cache rule beyond what already exists; any change to the host-side vhost repository; new content.

## Deliverables

`docs/launch/hardening.md`, any minimal targeted fix to `src/lib/seo.ts`, any tuning of `.github/workflows/links-weekly.yml`.

## Acceptance criteria

- The hreflang audit's findings (clean, or fixed) are recorded with real crawl/tool output pasted into `docs/launch/hardening.md`.
- The accessibility re-audit against the live site's full route list is recorded, with 0 remaining serious/critical violations or each one filed as a named follow-up.
- Cache-header verification against the live site is recorded (real `curl -I` output for at least one `/_astro/*`, one `/pagefind/*`, and one lesson page).
- `links-weekly.yml` is confirmed, with real evidence, to both pass cleanly on the real corpus and to open an issue when a link is genuinely broken (via the temporary fixture test, reverted afterward).
- The analytics review's outcome (real data confirmed, or O7 deferral noted) is recorded.

## Steps

1. Crawl the live sitemap; audit hreflang pairs; fix any real defect in `src/lib/seo.ts`.
2. Check Cloudflare Web Analytics for real traffic (or confirm O7 is not yet done and note the deferral).
3. Run `axe` against the live site's full route list at both viewports; triage findings.
4. `curl -I` a sample of asset, search, and lesson URLs on the live site; confirm cache headers match intent.
5. Manually trigger `links-weekly.yml`; confirm a clean pass; temporarily break one link on a throwaway branch, re-trigger, confirm an issue opens, then delete the throwaway branch and close the test issue.
6. Write `docs/launch/hardening.md` with every finding.

## Tests required

Live `axe` run (full route list, both viewports); live `curl -I` cache-header checks; a real `links-weekly.yml` manual trigger (clean) plus one deliberate-failure trigger (issue-opening proof).

## Non-goals / pitfalls

- Do not touch the host-side vhost repository or describe its internals — this plan only observes externally-visible behavior (response headers) against the live public URL.
- Do not leave the deliberately-broken link-check fixture or its opened test issue in place — revert/close both before this plan is done.
- Do not expand `src/lib/seo.ts`'s scope beyond fixing a real, found defect — this is a hardening pass, not a feature plan.

## Verification

A reviewer reads `docs/launch/hardening.md`, spot-checks two hreflang pairs live, confirms the cache-header evidence with their own `curl -I`, and confirms the test issue from the deliberate-failure trigger was closed.

## Handoff notes

- Full evidence trail in `docs/launch/hardening.md`. Summary: hreflang/canonical audit clean (312
  routes, dist + live cross-check, 21-URL live sample all reciprocal); full-route-list live axe
  audit (312 routes × 2 viewports = 624 checks against `https://cc.codechup.com`) came back 0
  serious/critical violations; analytics (O7) confirmed to degrade cleanly with no beacon markup
  emitted when the token is absent; Cloudflare cache headers already match the intended
  immutable/no-cache/no-store pattern for assets/HTML/redirect (one soft gap: `/pagefind/*`'s
  edge `cf-cache-status` is `DYNAMIC` despite a 3600s origin TTL — recommendation logged, not a
  regression); `links-weekly.yml` fixed a real bug (STATE.md's own prose about 3 documented,
  known non-defect URLs was being flagged as broken links every run, which would have opened a
  spurious issue weekly forever) and both a clean pass and a deliberate-failure issue-opening
  trigger were verified with real GitHub Actions runs (test issues #86/#87 closed, throwaway
  branch `p47-throwaway-broken-link` deleted locally and on `origin`).
- `src/lib/seo.ts` was read and audited but not changed — the hreflang/canonical/OG-image logic
  is already correct; no real defect was found there.
- One real accessibility defect was found manually (axe cannot detect it): the skip link's target
  (`<main id="main">` in three layout files) has no `tabindex="-1"`, so keyboard activation does
  not move focus into the page content. Out of this plan's `owned_paths` — filed in
  `open_questions` above rather than fixed here.
- The Cloudflare cache-rule write-up the plan asked for landed in `docs/launch/hardening.md`
  instead of `docs/deploy/README.md`, because that file is owned by P10 (`status: done`) and
  P47's `shared_paths` is empty — editing it would have violated D048. Filed in `open_questions`
  above as a follow-up.
- No blockers. All local gates (`typecheck`, `lint`, `gate`, `test`, `build`,
  `tools/plan/cli.ts check`, `playwright test`) pass on this branch with numbers identical to the
  M3 baseline (no regression).
