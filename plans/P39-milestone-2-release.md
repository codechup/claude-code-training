---
id: P39
title: Milestone M2 release
milestone: M2
status: in_progress
owner: sonnet-p39
branch: plan/39-milestone-2-release
model_hint: sonnet
effort_hint: medium
depends_on: [P25, P26, P27, P28, P29, P30, P31, P32, P33, P34, P35, P36, P37, P38]
owned_paths:
  - docs/release/M2-release.md
shared_paths: []
estimate: S
updated_at: 2026-09-08T00:13:07Z
open_questions: []
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

- _Filled by the executing session: what changed, decisions, follow-ups, blockers._
