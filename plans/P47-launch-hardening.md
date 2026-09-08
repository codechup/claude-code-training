---
id: P47
title: Launch hardening
milestone: M4
status: in_progress
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
updated_at: 2026-09-08T04:03:09Z
open_questions: []
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

- _Filled by the executing session: what changed, decisions, follow-ups, blockers._
