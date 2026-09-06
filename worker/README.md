# `/api/feedback` — Cloudflare Worker

Backend for `src/components/mdx/Helpful.astro`'s 👍/👎 "Was this helpful?"
control (D067/D069). It is a **separate Node/TypeScript project** from the
Astro site — its own `package.json`, `tsconfig.json`, and test runner — and
is **deployed separately from the static site** (Cloudflare Workers, not the
static host that serves `dist/`). This plan (P08) ships the Worker's source
and its own local test suite; it does **not** deploy it.

## What it does

- `POST /api/feedback` with a JSON body `{ "lessonId": string, "vote": "up" | "down", "lang"?: string }`
  validates the payload, increments a per-`lessonId` counter in a KV
  namespace, and returns the running `{ "up": number, "down": number }`
  totals. A repeated vote from the same client (identified by Cloudflare's
  `CF-Connecting-IP` header) for the same lesson within a 12-hour window is
  a no-op — it returns the current counts without incrementing again
  (basic abuse limiting; see `src/index.ts`'s `RATE_LIMIT_TTL_SECONDS`).
  Anything that isn't exactly `{ lessonId: string, vote: 'up'|'down' }` is
  rejected with `400`.
- `GET /api/feedback/:lessonId` (URL-encode `lessonId` — it contains `/`,
  e.g. `en%2Fl1-beginner%2Fm01-start%2F01-x`) returns the same counts
  without voting.
- Anything else 404s; a right-shaped path with the wrong HTTP method 405s.

## Why the origin doesn't just proxy this itself

Per this repo's architecture, the static site has **no server runtime**
(`output: 'static'` in `astro.config.ts`) — there is nothing there that
could run this logic. The plan is: the Worker is routed at the same origin
(`cc.codechup.com/api/*`) so `Helpful.astro`'s `fetch('/api/feedback')` stays
same-origin (no CORS needed), while the origin's own web server answers
`404` for `/api/*` on its own until the Worker is deployed and routed. That
404 is the **expected** state right now — `Helpful.astro` is built to
recognize it and fall back to a templated GitHub Issues link rather than
show a broken control.

## Local development and testing — no Cloudflare account needed

```bash
cd worker
npm ci            # package-lock.json is committed here, same as the repo root
npm test          # Vitest against an in-memory KV stand-in (MemoryKV in
                  # src/index.test.ts) — covers payload validation, counter
                  # increments, the idempotent-repeat-vote path, and the
                  # GET/POST/404/405 routing, with no network or account.
npm run typecheck # tsc --noEmit
```

If you additionally want to exercise the real Workers runtime locally
(Miniflare, via `wrangler dev`), install `wrangler` yourself — it isn't a
committed dependency here (it's a large, frequently-updated binary-fetching
CLI, and the Vitest suite above already proves the request contract without
it):

```bash
npx wrangler@latest dev
# in another terminal:
curl -X POST http://localhost:8787/api/feedback \
  -H 'content-type: application/json' \
  -d '{"lessonId":"en/l1-beginner/m01-start/01-x","vote":"up"}'
curl http://localhost:8787/api/feedback/en%2Fl1-beginner%2Fm01-start%2F01-x
```

`wrangler dev` without a real KV id will use wrangler's local, on-disk KV
simulator — no Cloudflare account or `wrangler login` is needed for this.

## Deploying (owner action — O8, not part of this plan)

Deployment needs a real Cloudflare account and is out of scope for this
plan; it is listed here so whoever does it (the owner, or a later plan) has
the exact steps and nothing is invented on their behalf:

1. `wrangler login` (or set a `CLOUDFLARE_API_TOKEN` — see Cloudflare's own
   docs for scoping a Workers-deploy token) from a machine/CI job that has
   the owner's Cloudflare account access. This repo's CI never runs this
   step; no Cloudflare credential is a GitHub secret here unless a future
   deploy plan explicitly adds one.
2. `wrangler kv namespace create FEEDBACK_KV`, then paste the printed id
   into `wrangler.toml`'s `kv_namespaces[0].id` (replacing the
   `REPLACE_WITH_KV_NAMESPACE_ID` placeholder) — or pass the id at deploy
   time instead of committing it, if the owner prefers not to commit even a
   non-secret namespace id.
3. Uncomment the `routes` block in `wrangler.toml` (already filled in with
   this site's own public domain, which is not a secret) so the Worker
   answers `cc.codechup.com/api/*` instead of only its own
   `*.workers.dev` subdomain.
4. `wrangler deploy` from `worker/`.
5. Confirm: `curl -X POST https://cc.codechup.com/api/feedback -H 'content-type: application/json' -d '{"lessonId":"smoke-test","vote":"up"}'` returns `{"up":1,"down":0}`, then `Helpful.astro` on a live lesson page stops showing the GitHub-issue fallback and shows the thank-you state instead.

Until step 3 (or all of 1–4) happens, `Helpful.astro`'s fallback behavior
**is** the correct, intended production behavior — not a bug to work around.
