---
id: P10
title: Deploy workflow and static host runbook
milestone: M0
status: todo
owner: null
branch: plan/10-deploy-workflow
model_hint: sonnet
effort_hint: medium
depends_on: [P04]
owned_paths:
  - .github/workflows/deploy.yml
  - scripts/smoke/**
  - docs/deploy/**
shared_paths: []
estimate: M
updated_at: 2026-09-06T00:00:00Z
open_questions: []
---

## Goal

Write the deploy side of CI: `deploy.yml` (build via `ci.yml`, then a two-phase rsync to the static host, then an edge smoke test), `scripts/smoke/edge.sh` (the actual smoke assertions), and `docs/deploy/README.md` (the owner's action checklist, generic wording, no infrastructure internals of any private project this repo does not own). This repository's deploy story ends at "rsync the built site to a directory on a host reachable over SSH" — the reverse-proxy/vhost configuration that makes that directory answer to `https://cc.codechup.com` is the host-side vhost change (owner-managed, private repo) referenced throughout `DECISIONS.md` (D086); this plan never touches, describes the internals of, or names that other repository.

## Context

Read `DECISIONS.md` D037–D040 (second vhost on the static host, DNS, deploy pattern, new public repo), D085 (a separate Origin CA cert pair, delivered as secrets — to the host-side repo, not this one), D086 (reverse-proxy config is owner-managed elsewhere; this repo only rsyncs static files), D087 (no firewall change, verification step only), D088 (Claude may SSH as the low-privilege deploy account, no sudo, for verification only), D089 (Claude creates the repo and secrets with `gh`, confirm-before-run). **Hard rule for this plan specifically**: never write the static host's IP address, any absolute server filesystem path, or the name of any other project or repository into any file this plan produces. Every reference to the deploy target is the placeholder `<DEPLOY_PATH>` (resolved at deploy time from the secret of the same name) or the phrase "the static host." `ci.yml` (P04) already builds and uploads a `site-dist` artifact — this plan's `deploy.yml` downloads it, it does not rebuild.

## Scope

In:
- `.github/workflows/deploy.yml`: triggers `push: main` (ignoring `plans/**`, `STATE.md`, `docs/**`), plus `workflow_dispatch`; gated on `vars.DEPLOY_ENABLED == 'true'`; `concurrency: deploy-prod`; calls `ci.yml` via `workflow_call` (or waits on it) and downloads its `site-dist` artifact; sets up the SSH key from secret `SSH_KEY`, runs `ssh-keyscan` against `SSH_HOST` (never hard-coded); phase-1 rsync of `dist/_astro/` and `dist/pagefind/` to `<DEPLOY_PATH>` (no `--delete` — these are content-addressed/rebuildable, safe to add before the switch), phase-2 rsync of the rest of `dist/` to `<DEPLOY_PATH>` with `--delete`; then runs `scripts/smoke/edge.sh` against `https://cc.codechup.com`.
- `scripts/smoke/edge.sh`: asserts (through Cloudflare, i.e. the public URL, not a direct host connection) `/en/`, `/tr/`, `/design/` all return 200; `/` returns a 302 to `/en/`; `/` with header `Accept-Language: tr` returns a 302 to `/tr/`; a `cc_lang=tr` cookie override also redirects to `/tr/`; `/sitemap-index.xml`, `/en/rss.xml`, `/pagefind/pagefind-entry.json` all return 200; a nonexistent path returns 404; the response carries a CSP header, HSTS, and `X-Content-Type-Options: nosniff`; the first `/_astro/*.css` response is `Cache-Control: immutable`. The script takes the base URL as an argument/env var so it can also be run by hand against a deployed environment.
- `docs/deploy/README.md`: the required secrets table (`SSH_HOST`, `SSH_USER`, `SSH_KEY`, `DEPLOY_PATH`; the `vars.DEPLOY_ENABLED` repository variable), how `deploy.yml` works end to end in plain language, and the **owner action checklist** below, copied with the exact unblocks column but with every infrastructure-internal detail generalized to "the static host" / "the host-side vhost change (owner-managed, private repo)" — no IP address, no absolute server filesystem path, no other project's name anywhere in this file:

  | # | Action | Unblocks |
  |---|---|---|
  | O1 | Point the DNS record for `cc.codechup.com` at the static host, proxied through Cloudflare. | The public site becoming reachable at all. |
  | O2 | Provision an Origin CA certificate for `cc.codechup.com` and deliver it to the host-side vhost change as its own pair of secrets, separate from any other site's certificate (handled entirely on the host side — no action in this repository). | The host-side vhost change going live. |
  | O3 | Confirm the Cloudflare SSL/TLS mode (Full — strict) actually applies to `cc.codechup.com`. | The edge smoke test's TLS assertions. |
  | O4 | Confirm the host-side deploy gate is enabled so the vhost change actually deploys once merged (handled entirely on the host side — no action in this repository). | The host-side vhost change going live. |
  | O5 | Provision a dedicated deploy key for this project, restricted so it can only write `<DEPLOY_PATH>` and nothing else on the host (a forced command scoped to that one directory, no port forwarding, no pty), then add this repository's secrets: `SSH_HOST`, `SSH_USER`, `SSH_KEY`, `DEPLOY_PATH`. | `deploy.yml` running at all. |
  | O6 | Enable GitHub Discussions on this repository; install the giscus app; provide its repo ID and category ID as `PUBLIC_GISCUS_REPO_ID` / `PUBLIC_GISCUS_CATEGORY_ID`. | `Giscus.astro` (P08) showing real comments instead of its placeholder. |
  | O7 | Provide a Cloudflare Web Analytics token for `cc.codechup.com` as `PUBLIC_CF_BEACON_TOKEN`. | The analytics beacon (P09) actually reporting. |
  | O8 | Set up the Cloudflare Worker + KV for 👍/👎 feedback (`wrangler login` or a `CLOUDFLARE_API_TOKEN` secret) — may be deferred. | `Helpful.astro` (P08) posting real votes instead of falling back to the GitHub Issues link. |

  Note directly under the table: ordering matters — O2 and O4 must both be done before the host-side vhost change is merged, or its own `nginx -t` preflight (on that side) aborts before anything changes; this repository's own `deploy.yml` only starts succeeding once O1 and O5 are done, regardless of the host-side change's state.

Out: the host-side vhost change itself (a separate plan in a separate, owner-managed private repository — never created, edited, or described in detail by this plan); Cloudflare account configuration beyond what O1–O8 name; `ci.yml` (P04, this plan only consumes its artifact).

## Deliverables

`.github/workflows/deploy.yml`, `scripts/smoke/edge.sh`, `docs/deploy/README.md`.

## Acceptance criteria

- `deploy.yml` parses cleanly (`gh workflow view` or `actionlint`) and every secret/var it references (`SSH_HOST`, `SSH_USER`, `SSH_KEY`, `DEPLOY_PATH`, `vars.DEPLOY_ENABLED`) matches exactly what `docs/deploy/README.md` documents.
- `scripts/smoke/edge.sh` runs successfully against a local `npm run preview` server for every assertion that does not require Cloudflare-specific headers (200s, the redirect logic, the 404) — document which assertions can only be verified against the real deployed edge and which were verified locally, in the PR.
- `grep` over this plan's three deliverables for an IP-address pattern, an absolute server filesystem path, or any other private-project name returns nothing (paste the grep command and its empty output in the PR).
- The owner checklist table in `docs/deploy/README.md` has exactly O1–O8, matching the table above verbatim.
- `deploy.yml` never runs unless `vars.DEPLOY_ENABLED == 'true'` — verify by reading the job's `if:` condition, not by triggering a real deploy.

## Steps

1. Write `scripts/smoke/edge.sh` first, parameterized by a base URL; run it against `npm run preview` locally and confirm every non-Cloudflare-specific assertion passes.
2. Write `deploy.yml`'s structure (trigger, concurrency, artifact download, SSH setup, two-phase rsync) using only the placeholder secret names — no literal host, path, or IP anywhere.
3. Wire the smoke step to run `scripts/smoke/edge.sh` against `https://cc.codechup.com` as the final job step.
4. Write `docs/deploy/README.md`: secrets table, plain-language flow description, the O1–O8 checklist exactly as specified above.
5. Run the forbidden-word grep from Acceptance criteria against all three deliverables; fix anything it finds.
6. Paste the `actionlint`/`gh workflow view` output and the local `edge.sh` dry run into the PR.

## Tests required

- `scripts/smoke/edge.sh` run locally against `npm run preview`, output pasted into the PR.
- `actionlint .github/workflows/deploy.yml` (or `gh workflow view` parsing without error).
- The forbidden-word grep from Acceptance criteria, output pasted into the PR.

## Non-goals / pitfalls

- Never write a real IP address, an absolute server filesystem path, or the name of the private host-side repository into `deploy.yml`, `edge.sh`, or `docs/deploy/README.md` — every one of those is a secret, a variable, or the generic phrase "the static host" / "the host-side vhost change (owner-managed, private repo)."
- Do not create, describe in detail, or reference by name the separate plan that makes the host-side vhost change — this repository's plans never depend on it (`plans/ROADMAP.md`'s "Cross-repo boundary" note explains why).
- Do not use `--delete` on the phase-1 rsync (assets/pagefind) — only the phase-2 full-tree rsync deletes, and only after the new assets are already in place, to avoid a moment where old HTML references assets that were just deleted.
- Do not skip the `vars.DEPLOY_ENABLED` gate "just for testing" — a real accidental deploy against an unfinished host-side change is exactly what this gate prevents.
- Do not assume O1–O8 are all done — `deploy.yml` should fail cleanly and informatively (not hang) if `SSH_HOST` etc. are unset; test that the job's early steps produce a clear error in that case.

## Verification

A reviewer reads `deploy.yml` end to end and confirms no literal host/path/IP appears; runs the forbidden-word grep from Acceptance criteria themselves; runs `scripts/smoke/edge.sh` against a local preview server; and reads `docs/deploy/README.md`'s checklist against the table in this plan for an exact match.

## Handoff notes

- _Filled by the executing session: what changed, decisions, follow-ups, blockers._
