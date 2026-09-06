---
id: P04
title: Blocked plan waiting on the owner
milestone: M1
status: blocked
owner: bravo-2026-08-20
branch: plan/04-blocked
model_hint: sonnet
effort_hint: medium
depends_on: [P00]
owned_paths:
  - src/lib/email/**
shared_paths: []
estimate: M
updated_at: 2026-08-20T00:00:00Z
open_questions:
  - Which mail provider key should the fixture use?
  - Does the outbox belong to this plan?
---

## Goal

A plan that cannot continue.

## Context

Read nothing; this is a fixture.

## Scope

In:
- fixture

Out:
- everything else

## Deliverables

`nothing`

## Acceptance criteria

- the renderer golden test passes

## Steps

1. nothing

## Tests required

- none

## Non-goals / pitfalls

- do not ship fixtures

## Verification

Read the golden file.

## Handoff notes

- Blocked (2026-08-20): waiting for the RESEND_API_KEY secret from the owner.
