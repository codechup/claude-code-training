# Public-repository hygiene (applies to every file in this repo)

This repository is **public**. Nothing that identifies or grants access to private infrastructure may be committed — not in code, docs, plans, workflows, comments, tests or fixtures.

**Never write into this repo:**

- Hosting IP addresses, hostnames of other projects, absolute host paths (e.g. anything under `/opt/...`), SSH usernames tied to a host, firewall or DNS details.
- Names of sibling private projects or their infrastructure (D026: case studies are anonymous; the sibling project that shares the host is referred to only as "the static host" / "host-side vhost change (owner-managed, private repo)").
- Secrets or their values: API keys, tokens, private keys, certificates, `.env*` files, `authorized_keys` blobs.

**Do instead:**

- Deploy targets come from GitHub secrets: `SSH_HOST`, `SSH_USER`, `SSH_KEY`, `DEPLOY_PATH`. Workflows reference `${{ secrets.X }}` only.
- Describe hosting generically in `docs/deploy/README.md`; owner-only details live in the owner's private repo/plan.
- Local-only values go in `.env.local` (git-ignored) or `.claude/settings.local.json`.

**Enforcement (all three must stay green):**

1. `node scripts/check-public-hygiene.mjs` — runs in `npm run lint`, the `pre-commit` git hook (`sh scripts/install-hooks.sh`) and CI.
2. `.claude/hooks/guard-hygiene.mjs` — PreToolUse hook that blocks a Write/Edit/Bash carrying such content before it touches the tree.
3. `gitleaks` in CI with the custom rules in `.gitleaks.toml`.

If a plan seems to need a private value, it does not: write the owner action into the plan's Handoff notes / `open_questions` and use a secret or placeholder.
