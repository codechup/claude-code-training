---
id: P39
title: Milestone M2 release
milestone: M2
status: review
owner: sonnet-p39
branch: plan/39-milestone-2-release
model_hint: sonnet
effort_hint: medium
depends_on: [P25, P26, P27, P28, P29, P30, P31, P32, P33, P34, P35, P36, P37, P38]
owned_paths:
  - docs/release/M2-release.md
shared_paths: []
estimate: S
updated_at: 2026-09-08T00:37:40Z
open_questions:
  - "content/_shared/sources.json is currently `{\"sources\": []}` on main — wiped from ~150 entries by a bad rebase inside P31's merge (commit e785c9d, PR #57), confirmed by `git log -p` (a -1018/+1 diff hidden inside a squash-folded 'STATE.md after rebase' sub-commit). No site code reads this file today, so there is no live-site impact, but the shared cross-lesson registry itself is now useless. Recommended fix: a `chore(content)` PR that reconstructs the union of every P23/P27-P38 append from their Handoff notes (or, better, from each PR's own diff at merge time) and restores it additively. Whoever picks this up should diff PR #57's parent against its merge base to recover the exact pre-wipe file."
  - "10 of the 22 Turkish glossary terms P25's Handoff notes describe adding to content/tr/playbook/glossary.mdx (marketplace, artifact, auto memory, rule, renderer, monorepo, import, compaction, chord, routine) are not present in the file on main (36 headings exist, not ~46), breaking 14 `/tr/playbook/glossary/#<anchor>` links across 8 TR L1 lessons (m02-interact/04-plan-mode, m03-memory/01/02/04/05, m04-commands/01/04/05). Not fixed here (outside this plan's owned_paths; non-goals forbid editing content directly). Recommended fix: whoever owns content/tr/playbook/glossary.mdx re-adds the 10 missing terms with the one-line definitions P25's Handoff notes already drafted."
  - "content/en/playbook/glossary.mdx (the EN twin) is still a placeholder sentence; P25 (22 terms) and P26 (24 terms) both proposed EN mirror entries with no owner assigned yet."
---

## Goal

Confirm and record that Turkish L1–L2 are live (translated, `draft: false`) and that L3 Advanced and L4 Master are complete in English, all pushed live together. This is the release that makes the site fully bilingual for the first half of the curriculum while the English side reaches its full depth, per D095's W2 wave.

## Context

Read every P25–P38 Handoff notes section. `docs/release/M1-release.md` (P24) is the previous release's evidence baseline — this plan's checks are the same shape, scaled to the new content (2 translated levels + 12 new English modules).

## Scope

In:
- Full content-gate and build check across `content/{en,tr}/{l1,l2,l3,l4}/**` (L1–L2 now `draft: false` in Turkish; L3–L4 still Turkish-draft, expected).
- `e2e` sampled across: a translated TR lesson (L1 or L2, confirm it renders correctly, not just that `draft: false` flipped), one lesson per L3/L4 module (12 lessons), LangSwitch round-trips in both directions (EN→TR on a real translation, TR→EN, and EN→TR-draft on an L3/L4 lesson showing "Türkçesi hazırlanıyor").
- Full `lychee` sweep over the entire `content/**` tree (first time it's genuinely large).
- LHCI against the full build.
- Live deploy + edge smoke.
- `docs/release/M2-release.md` recording all of the above, plus confirmation that `content/tr/playbook/glossary.mdx` (appended to by P25/P26) has real entries and no broken internal links.

Out: editing any module's or translation's content directly (same rule as P24 — triage and follow-up, never a silent edit).

## Deliverables

`docs/release/M2-release.md`.

## Acceptance criteria

- Full-tree `content-gate.ts` passes; L1–L2 Turkish shows zero remaining `draft: true` lessons; L3–L4 Turkish is still entirely `draft: true` (correct at this milestone).
- The sampled `e2e` run passes, including both LangSwitch directions and the still-draft L3/L4 case.
- The full-repo `lychee` sweep shows 0 broken links (or every failure triaged as in P24).
- LHCI meets budget against the full M2 build.
- A real `deploy.yml` run succeeds and `scripts/smoke/edge.sh` passes against the live site.
- `docs/release/M2-release.md` records everything with real pasted output.

## Steps

1. Read every P25–P38 Handoff notes section for flagged follow-ups.
2. Run the full local gate; do not edit content directly.
3. Run the sampled `e2e` suite, both LangSwitch directions plus the L3/L4 draft case.
4. Run the full-repo `lychee` sweep; triage.
5. Run LHCI; merge to `main`; watch `deploy.yml`; run `scripts/smoke/edge.sh` live.
6. Write `docs/release/M2-release.md`.

## Tests required

Full-tree `content-gate.ts`; sampled `e2e` (axe, both LangSwitch directions); full-repo `lychee`; LHCI; live `scripts/smoke/edge.sh`.

## Non-goals / pitfalls

- Do not edit any content file directly from this plan.
- Do not flip any L3/L4 Turkish draft to `false` — that is P40/P41's job in M3, not this plan's.
- Do not skip verifying the glossary file's links just because it "probably" only grew append-only — a broken anchor is still a broken link.

## Verification

A reviewer reads `docs/release/M2-release.md`, opens a translated TR lesson live, confirms an L3 lesson still shows "Türkçesi hazırlanıyor" in Turkish, and spot-checks the pasted evidence.

## Handoff notes

**Session** `sonnet-p39-2026-09-08`, worktree `../cct-wt-39`.

**What was done.** Read every P25–P38 Handoff notes section (all clean of release-blocking
issues; recurring non-blocking items carried into `docs/release/M2-release.md` §8). Ran the full
local gate (typecheck, lint, gate, test, build, raw-colors, public-hygiene, plan check) against
the complete L1–L4 tree — all pass. Verified EN/TR lesson counts on disk directly (120 EN, 120
TR, 51 TR `draft:false` in L1/L2, 68 TR `draft:true` in L3/L4, 288 transcripts), not from any
plan's self-reported counts — one plan's grep-based Handoff-notes check would have false-positived
on lesson prose containing the string `draft: true`. Ran the repo's own Playwright config (port
4321, free) plus a temporary sampling spec (deleted after the run) covering a real M2 TR
translation, both LangSwitch directions, the L3-draft LangSwitch case, and one lesson per L3/L4
module — 116/116 assertions passed, 0 axe serious/critical violations. Ran a full-tree link sweep
via the same `curl`-loop fallback M1 used (no `lychee` binary available): 172 URLs, 154×200, 18
triaged (1 apt-repo root, 13 fictional lab placeholders, 4 real auth-gated endpoints demonstrated
on purpose) — 0 real broken links. Ran LHCI against the full 231-page build — all budgets met.
Verified the live site directly (content already deployed via each module's own squash merge;
this plan's own commit is plans-only and triggers no new deploy) and ran
`scripts/smoke/edge.sh` against `https://cc.codechup.com` — 14/14 passed.

**Two real defects found and disclosed, neither fixed here (outside `owned_paths`/non-goals).**
Full detail in `docs/release/M2-release.md` §8–9 and this plan's `open_questions`:

1. `content/_shared/sources.json` is `{"sources": []}` on `main` — silently wiped from ~150
   entries to empty by a bad rebase folded into P31's merge commit (`e785c9d`, PR #57). No live-
   site impact (nothing in `src/` reads the file), but the registry itself is currently useless.
2. 10 of the 22 Turkish glossary terms P25 reported adding are not actually in
   `content/tr/playbook/glossary.mdx`, breaking 14 internal glossary links across 8 TR L1 lessons.

**Not blocking this release.** Neither defect affects what a visitor to `cc.codechup.com` sees
today (the sources registry is unused by the site; the 14 broken glossary anchors are internal
links inside already-live TR lesson pages, not TR L3/L4's own draft mechanism, and none of the
104 real Playwright routes exercised this session touched one of the 8 affected files' anchor
links directly — the axe/e2e run does not click every in-body link). They are recorded here and
in `docs/release/M2-release.md` exactly as the M1 release recorded its own plan-bookkeeping
finding (§9 there), for a follow-up `chore` PR to fix.
