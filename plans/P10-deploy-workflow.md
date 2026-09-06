---
id: P10
title: Deploy workflow and static host runbook
milestone: M0
status: review
owner: sonnet-p10-2026-09-06
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
updated_at: 2026-09-06T20:06:43Z
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

- **What changed:** `.github/workflows/deploy.yml` (push-to-main + `workflow_dispatch`, `DEPLOY_ENABLED` kill-switch `gate` job, reuses `ci.yml` via `workflow_call`, downloads `site-dist`, two-phase rsync, edge smoke); `scripts/smoke/edge.sh` (parameterized smoke script, `SMOKE_SKIP_EDGE=1` for local runs); `docs/deploy/README.md` (flow, secrets table, edge-smoke explanation, O1–O8 checklist verbatim from this plan).
- **Job wiring:** `gate` (`if: vars.DEPLOY_ENABLED == 'true'`) → `ci` (`needs: gate`, `uses: ./.github/workflows/ci.yml`, passes only `HYGIENE_EXTRA_PATTERNS`) → `deploy` (`needs: [gate, ci]`). Because `ci` depends on `gate`, an unset/false `DEPLOY_ENABLED` skips every job — the whole run is a genuine no-op, not just an unbuilt one.
- **`edge.sh` bug found and fixed during local testing:** the header-lookup helper piped through `grep` under `set -e -o pipefail`; when a header was absent, `grep`'s exit 1 propagated through the pipeline and silently killed the whole script (no FAIL line, no summary) before any redirect/header assertion could run. Fixed by wrapping that `grep` in `{ ... || true; }` and by dropping `-e` entirely (kept `-u -o pipefail`) — `FAIL_COUNT` already drives the exit code, and a smoke test's job is to report a broken/unreachable origin as FAIL lines, not to die on the first non-2xx. Verified against an unreachable host (`http://localhost:9`): 14 clean FAIL lines and exit 1, not a silent abort.
- **Local verification performed** (`npm run build && npm run preview`, actual port 4399 — `4321` was already held by another process, pid 10828, left untouched since it belongs to a different concurrent worktree/session):
  - `SMOKE_SKIP_EDGE=1 bash scripts/smoke/edge.sh http://localhost:4399` → 7 passed, 0 failed, 7 skipped, exit 0.
  - `bash scripts/smoke/edge.sh http://localhost:4399` (no skip flag) → 7 passed, 7 failed (the production-only checks, as expected — this failure is the intended signal that the flag was omitted), exit 1.
  - `bash scripts/smoke/edge.sh http://localhost:9` (unreachable) → 0 passed, 14 failed, exit 1 — confirms graceful reporting instead of a silent crash.
  - The 7 assertions that only nginx/Cloudflare can satisfy and are therefore skipped locally: the default `/` → `/en/` redirect, the `Accept-Language: tr` → `/tr/` redirect, the `cc_lang=en` cookie overriding `Accept-Language: tr`, the CSP header (giscus.app + wasm-unsafe-eval), the HSTS header, `X-Content-Type-Options: nosniff`, and the `immutable` Cache-Control on the first `/_astro/*.css` asset. `src/pages/index.astro` documents that nginx owns `/` in production; `astro preview` has none of these.
  - `npm run lint` → clean (eslint + prettier + no-inline-script guard). Note: per `STATE.md`'s existing open question (from P04), `npm run lint` does **not** itself run `check-public-hygiene.mjs` or `check-raw-colors.mjs` — those were run directly and separately: `node scripts/check-public-hygiene.mjs --staged` → `public-hygiene: OK (staged)`; `node scripts/check-raw-colors.mjs` → `check-raw-colors: OK (22 files scanned)`.
  - `npm run typecheck` → 0 errors, 0 warnings (pre-existing hints in unrelated files).
  - `node tools/plan/cli.ts check` → `ok: 48 plans, frontmatter valid, DAG acyclic, no owned_paths overlap, STATE.md fresh`.
  - Forbidden-word grep (IPv4 pattern and `/opt/...` absolute-path pattern) over all three deliverables → both empty (`grep` exit 1 = no match).
  - `npx --yes @action-validator/cli .github/workflows/deploy.yml` → passes with one benign `WARNING: Glob validation is not yet supported` on `paths-ignore` (no errors); same tool against `ci.yml` produces zero output, used as a baseline. `actionlint` itself was not available in this environment (no network access to its release binary from this sandbox) — `@action-validator/cli` was used instead, per the plan's "or an equivalent" allowance.
- **Unverified end-to-end:** the `deploy` job's SSH/rsync/live-smoke steps cannot be exercised for real until the owner completes O1 and O5 (DNS + the deploy secrets) and sets `DEPLOY_ENABLED=true` — they were reviewed structurally (`action-validator`, manual read-through) but never run against a real host. The `gate`/kill-switch behavior was verified by reading the `if:`/`needs:` chain, not by triggering a workflow run.
- **Divergence from the plan text (intentional, matches the work order given to this session):** the plan body's Scope section says a `cc_lang=tr` cookie also forces `/tr/`; the assertion actually implemented (and specified by this session's more detailed work order) is the stronger case — `Cookie: cc_lang=en` together with `Accept-Language: tr` still resolves to `/en/`, proving the cookie overrides Accept-Language rather than merely matching it. Both are consistent with "the cookie wins"; this session implemented the version that actually distinguishes cookie-precedence from coincidence.
- **Follow-up for whoever next owns `package.json`** (already flagged by P04/P05 as an open question, reaffirmed here): add `check-public-hygiene.mjs` and `check-raw-colors.mjs` to the `lint` script for local/pre-commit parity with CI.
- **Follow-up for `ci.yml`'s owner (P04):** with `DEPLOY_ENABLED=true`, every push to `main` now runs the `quality`/`e2e`/`lighthouse` jobs twice — once from `ci.yml`'s own `push: branches: [main]` trigger, once via `deploy.yml`'s `workflow_call`. Consider dropping the direct `push` trigger from `ci.yml` for `main` (PRs already cover `pull_request`), or accept the duplication as a deliberate belt-and-suspenders check — flagging it rather than changing `ci.yml`, which is outside this plan's `owned_paths`.
- **No `SSH_PORT` secret** — the workflow assumes the deploy host's SSH port is the default (22), consistent with the plan's exact secret list (`SSH_HOST`, `SSH_USER`, `SSH_KEY`, `DEPLOY_PATH`). If the real host uses a non-default port, a follow-up should add `SSH_PORT` to both `deploy.yml` and the secrets table in `docs/deploy/README.md`.
