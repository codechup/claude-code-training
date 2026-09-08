# Deploy

How `cc.codechup.com` gets from a merge on `main` to a served page, and what the
owner needs to set up before that can happen at all.

## How it works

1. **CI builds the site.** `.github/workflows/ci.yml` (P04) runs the full
   quality gate — typecheck, lint, hygiene guard, raw-colour guard, the plan
   tool self-check, the content gate, `gitleaks`, unit tests, and
   `astro build` (with the `pagefind` postbuild step) — then uploads the
   result as the `site-dist` build artifact. `deploy.yml` never rebuilds the
   site itself; it calls `ci.yml` as a reusable workflow (`uses:
   ./.github/workflows/ci.yml`) so the exact same gate runs before every
   deploy, and downloads the artifact `ci.yml` produced.
2. **A kill switch decides whether to go further.** The `gate` job only runs
   `if: vars.DEPLOY_ENABLED == 'true'`. Every other job in `deploy.yml`
   depends on it, so with the repository variable unset (the default for a
   freshly created repository) the whole workflow finishes green having done
   nothing — no build, no rsync, no smoke test.
3. **A two-phase `rsync` copies the build to the static host.**
   - **Phase 1** copies `dist/_astro/` (hashed, content-addressed JS/CSS/font
     assets) and `dist/pagefind/` (the search index) without `--delete`.
     These are safe to add before the switch: nothing references them yet, so
     partially-uploaded or additional files cause no harm.
   - **Phase 2** copies the rest of `dist/` — the HTML, `sitemap-index.xml`,
     `rss.xml`, `robots.txt`, etc. — with `--delete`, so pages removed from
     this build disappear from the host too. Running this second means no
     page ever references an asset that phase 1 hasn't uploaded yet.
   - Both phases connect over SSH with a host key that was just fetched via
     `ssh-keyscan` and pinned into `known_hosts` for that run
     (`StrictHostKeyChecking=yes` — never `no`), using a private key installed
     from the `SSH_KEY` secret.
4. **An edge smoke test confirms the deploy actually worked.**
   `scripts/smoke/edge.sh https://cc.codechup.com` runs as the last step —
   see [Edge smoke test](#edge-smoke-test) below.

This repository's own responsibility ends at "rsync the built site into a
directory on a host reachable over SSH." Making that directory answer to
`https://cc.codechup.com` — the reverse-proxy / vhost configuration — is a
host-side change owned and applied elsewhere (a private repository this
project does not control and never names); this repository only rsyncs
static files into the path that change expects.

## Secrets and variables

| Name | Kind | Used for |
|---|---|---|
| `SSH_HOST` | secret | Hostname the deploy job connects to (`ssh-keyscan` target, rsync destination host). Never hard-coded. |
| `SSH_USER` | secret | The low-privilege deploy account's username. |
| `SSH_KEY` | secret | The deploy account's private key (installed into the runner for that job only, never written to a tracked file). |
| `DEPLOY_PATH` | secret | The absolute path on the host that `rsync` writes into. Never hard-coded — this is exactly the value the public-hygiene guard blocks if it appears literally anywhere in this repository. |
| `HYGIENE_EXTRA_PATTERNS` | secret (optional) | `"|||"`-joined extra regex patterns (private project names/hosts) that `check-public-hygiene.mjs` also scans for; passed through to `ci.yml`. See `.claude/rules/public-hygiene.md`. |
| `DEPLOY_ENABLED` | **repository variable**, not a secret | The kill switch. Must be the string `true` for `deploy.yml`'s `gate` job (and everything that depends on it) to run at all. |

If `SSH_HOST`/`SSH_KEY` or `SSH_USER`/`DEPLOY_PATH` are missing when the
`deploy` job runs, the relevant step fails immediately with a clear
`::error::` message rather than hanging or silently doing nothing.

## Edge smoke test

`scripts/smoke/edge.sh <base-url>` asserts, through whatever sits in front of
`<base-url>` (Cloudflare + nginx in production):

- `/en/`, `/tr/`, `/design/`, `/sitemap-index.xml`, `/en/rss.xml`, and
  `/pagefind/pagefind-entry.json` all return `200`.
- `/nope/` (an unknown path) returns `404`.
- `/` returns a `302` to `/en/` by default, to `/tr/` when
  `Accept-Language: tr-TR,tr` is sent, and back to `/en/` when a
  `cc_lang=en` cookie is present alongside `Accept-Language: tr` (the cookie
  wins).
- `/en/`'s response carries a `Content-Security-Policy` header that includes
  both `giscus.app` and `wasm-unsafe-eval`, a `Strict-Transport-Security`
  header, and `X-Content-Type-Options: nosniff`.
- The first `/_astro/*.css` asset referenced from `/en/` has a
  `Cache-Control` header containing `immutable`.

Run it locally against a preview build:

```bash
npm run build && npm run preview
SMOKE_SKIP_EDGE=1 bash scripts/smoke/edge.sh http://localhost:4321
```

`SMOKE_SKIP_EDGE=1` skips exactly the checks that only nginx/Cloudflare can
satisfy — the `/` language redirects, the CSP/HSTS/`nosniff` headers, and the
`immutable` cache-control assertion — because `astro preview` doesn't
implement any of them (see `src/pages/index.astro`, which documents that
nginx owns `/` in production). Everything else (the `200`s, the `404`, and
the search/feed/sitemap routes) runs and must pass locally the same way it
does in production. Without the flag, the script fails those
production-only checks locally, on purpose — that failure is expected, not a
bug, and is how you can tell you forgot the flag.

`deploy.yml`'s last step runs the same script with no skip flag, against the
real `https://cc.codechup.com`, exercising every assertion.

## Owner action checklist

These are one-time, owner-only actions (secrets, DNS, Cloudflare
configuration, a host-side change) that Claude cannot perform from inside
this repository. Nothing below names the static host, an IP address, or any
other repository.

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
| O9 | Add the three Cloudflare Cache Rules below. | Edge caching for `/pagefind/*` (currently `DYNAMIC` despite a correct origin TTL); explicit, future-proof rules for `/_astro/*` and `/`. |

### Cloudflare Cache Rules

P47's launch-hardening pass (`docs/launch/hardening.md` §5) measured real
`curl -I` response headers against the live site on 2026-09-08 and found the
origin/CDN split already correct for three of four route classes, with one
edge-caching gap. These are the measured values and the rules they justify —
transcribed from that record, not restated from memory:

- **`/_astro/*` (a built, content-hashed asset)** — origin already sends
  `Cache-Control: public, max-age=31536000, immutable`, and Cloudflare's edge
  already honours it: `cf-cache-status: HIT`, `Age: 12914`. **Recommended
  rule: Cache Everything + an edge TTL pinned to match the origin's
  `max-age=31536000`.** Nothing is broken today — the default cache level
  already serves these as `HIT` — but a rule makes that explicit instead of
  relying on Cloudflare's own heuristic, which is a small operational risk
  since the whole point of the immutable, content-hashed filename is that the
  edge never has to revalidate it.
- **`/pagefind/*` (the search index, e.g. `pagefind-entry.json`)** — origin
  sends `Cache-Control: public, max-age=3600`, but Cloudflare's edge reports
  `cf-cache-status: DYNAMIC` — it is not being cached at the edge at all.
  This is because Cloudflare's default cache level only auto-caches by file
  extension for a fixed list of "static" extensions, and `.json` is not on
  that list. **Recommended rule: Cache Everything + a short edge TTL (e.g.
  1h) for `/pagefind/*`**, so the edge — not just the origin — serves the
  search index from cache. Not a regression or a correctness bug today (the
  index files are small, ~230 bytes for the entry file, and origin-uncached
  is safe, just slower on a cache miss); this is the one gap worth closing.
- **A lesson/HTML page** — origin sends `Cache-Control: no-cache`, and
  `cf-cache-status: DYNAMIC`, i.e. HTML is correctly never edge-cached today.
  No rule is needed to fix anything here; leave HTML uncached (short/no
  cache) so content updates go live immediately on the next request.
- **`/` (the locale-redirect route)** — origin sends
  `HTTP/1.1 302 Found`, `Cache-Control: private, no-store`,
  `vary: Accept-Language, Cookie`, and `cf-cache-status: DYNAMIC`. This
  already prevents Cloudflare from ever serving one visitor's locale redirect
  to another. **Recommended rule: an explicit "Bypass cache" rule for `/`**
  — belt-and-suspenders, not a fix for an observed problem, so that a future
  Cloudflare dashboard change can't accidentally start caching a
  per-visitor redirect.

Ordering matters: O2 and O4 must both be done before the host-side vhost
change is merged, or its own `nginx -t` preflight (on that side) aborts
before anything changes; this repository's own `deploy.yml` only starts
succeeding once O1 and O5 are done, regardless of the host-side change's
state. And regardless of all of the above, `deploy.yml` does nothing at all
until the repository variable `DEPLOY_ENABLED` is set to `true` — that is a
deliberate, separate switch from the secrets themselves.
