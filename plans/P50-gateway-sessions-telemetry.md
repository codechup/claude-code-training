---
id: P50
title: 'Claude apps gateway sessions: login, policy and telemetry path'
milestone: M4
status: todo
owner: null
branch: plan/50-gateway-sessions-telemetry
model_hint: opus
effort_hint: high
depends_on: [P49]
owned_paths:
  - content/en/l4-master/m20-team/07-gateway-sessions.mdx
  - content/tr/l4-master/m20-team/07-gateway-sessions.mdx
shared_paths:
  - docs/CURRICULUM.md
  - research/feature-inventory.md
estimate: M
updated_at: 2026-09-09T00:00:00Z
open_questions:
  - 'Owner decision (curriculum): does M4 add a lesson to m20-team, or does the gateway material go into 02-managed-settings and 05-cost-budgeting as sections? A new lesson changes the module count and the TR parity surface, which is why P49 refused to write it.'
  - 'Which routed lessons absorb the material if the answer is "sections, not a lesson": content/en/l4-master/m20-team/02-managed-settings.mdx (policy delivery from a gateway) and content/en/l4-master/m20-team/05-cost-budgeting.mdx (the OTLP export path).'
  - 'No transcript is possible without an organisation that runs a gateway (D070, D099). If the lesson ships, its lab must be a read-only inspection lab like the managed-settings one, or the plan must be marked incomplete.'
---

## Goal

Decide, and then teach, what a **Claude apps gateway session** is: how a machine becomes one,
which policy source it reads, and where its OpenTelemetry goes. Today the course names the
gateway five times — as a server-managed settings source, as a `/login` option, as a
`forceLoginMethod` value — but never as a session kind with its own behaviour, and the changelog
has now moved that behaviour twice in one release.

## Context

Read before working:

- `.claude/rules/content.md` §4 and §7 — "Changed" callouts and the changelog-triage contract.
- `research/changelog/reviewed.json` — entry `2b655e1edca3`, recorded `escalated` against this plan.
- `content/en/l4-master/m20-team/02-managed-settings.mdx` — the four delivery mechanisms and the
  login-enforcement paragraph, which P49 extended with `forceLoginGatewayUrl` (2.1.265).
- `content/en/l4-master/m20-team/05-cost-budgeting.mdx` and
  `content/en/l3-advanced/m14-security/05-data-and-retention.mdx` — the two places the course
  documents OpenTelemetry attributes and exporters. Neither mentions a gateway relay.
- `docs/CURRICULUM.md` §3 (lesson template) and §4 (source policy).

The bullet that produced this plan, quoted verbatim from the official Claude Code changelog for
**2.1.265** (8 September 2026):

> Changed Claude apps gateway sessions to export OpenTelemetry directly to a collector the
> gateway's managed settings name in `OTEL_EXPORTER_OTLP_ENDPOINT`, instead of through the
> gateway's relay; sessions without a named collector still use the relay

The drift router could not place it: it fell through to a tag match on `#sessions` /
`#observability` and offered `m04-commands/03-sessions`, `m17-autonomy/05-monitors-and-channels`
and `m08-git/02-worktrees-branches` — none of which teaches gateway telemetry. A bullet the router
cannot place is the signal that the course has a gap, not that the bullet is unimportant.

## Scope

In:

- One decision from the owner (see `open_questions`) about lesson-vs-sections.
- The gateway session lifecycle: `forceLoginGatewayUrl` and `forceLoginMethod: "gateway"`, what
  `/login` does on such a machine, and which credentials are ignored.
- The telemetry path: direct export to the collector named in the gateway's managed
  `OTEL_EXPORTER_OTLP_ENDPOINT`, and the relay fallback when no collector is named.
- The Turkish twin, per `.claude/rules/i18n.md`.

Out:

- Any change to `02-managed-settings.mdx` or `05-cost-budgeting.mdx` unless the owner picks the
  "sections" answer — those files belong to P37 and are not owned here.
- Anything about Claude Desktop or Cowork. The course teaches the terminal client (D002).

## Deliverables

- `content/en/l4-master/m20-team/07-gateway-sessions.mdx` (or, on the "sections" answer, a
  rewritten plan naming the two existing files as `owned_paths`).
- `content/tr/l4-master/m20-team/07-gateway-sessions.mdx`.
- A row in `research/deprecations.md` for the relay→direct-export change, and an entry on the
  Playbook changelog page — both appended by the plan that ships the lesson.

## Acceptance criteria

- `npm run gate` passes: EN/TR parity, frontmatter schema, `verified_version` ≤ the ledger pin.
- Every factual claim traces to a fetched `code.claude.com/docs` page or to the quoted changelog
  bullet above; `research/feature-inventory.md` gains the gateway rows it is missing.
- `node scripts/changelog-drift.mjs report` still exits 0 — this plan does not re-open entry
  `2b655e1edca3`, which stays `escalated` in the ledger.
- `npx playwright test` passes, including axe on the new page.

## Steps

1. Get the owner's answer to the two `open_questions`. Do not start writing before that.
2. Fetch the live `admin-setup.md`, `server-managed-settings.md`, `monitoring-usage.md` and
   `settings-reference.md` pages; record what they say about the gateway in
   `research/feature-inventory.md`.
3. Write the EN lesson to the template in `docs/CURRICULUM.md` §3.
4. Decide the lab honestly: an inspection lab (`claude doctor`, `/status`) or none at all with the
   reason in Handoff notes. Never invent a transcript (D070, D099).
5. Translate to Turkish, keeping the English technical terms.
6. Append the deprecations row and the Playbook changelog entry.

## Tests required

- `npm run gate`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`.
- `npx playwright test` including the axe pass on the new route in both languages.

## Non-goals / pitfalls

- **Do not invent the owner decision.** If the answer has not arrived, the plan stays `todo`.
- **Do not write a gateway lab you cannot run.** Nobody working on this repo has a gateway; a
  fabricated transcript is the exact failure D093 and D099 exist to prevent.
- Do not edit files outside `owned_paths`; `docs/CURRICULUM.md` and
  `research/feature-inventory.md` are append-only here (D048).

## Verification

A reviewer reads the new lesson against the four fetched docs pages, checks the quoted changelog
bullet is character-for-character the one above, confirms the TR twin mirrors it, and runs
`npm run gate && node scripts/changelog-drift.mjs report`.

## Handoff notes

Created by P49's changelog-triage run on 2026-09-09 as the `escalated` outcome for changelog entry
`2b655e1edca3` (2.1.265). No lesson content was written in that run, by design: the entry needs
curriculum coverage that does not exist, and inventing it inside a triage PR is exactly the
smuggling the triage rules forbid.
