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

## Commit identity

A commit's metadata is as public as its diff — it ships to every clone, shows on every PR page, and
survives a squash merge as a `Co-authored-by:` trailer that GitHub adds for you. So the rule above
applies to author name, author email, committer name, committer email, subject and body too.

**The only publishable identity is the project one**, expressed as a positive allowlist in
`scripts/check-public-hygiene.mjs` (`ALLOWED_NAME` / `ALLOWED_EMAIL`) so this repo never has to spell
out which name or address is forbidden:

- name `codechup` with the GitHub noreply address `<id>+codechup@users.noreply.github.com`;
- `GitHub <noreply@github.com>` — the committer of a squash merge made through the web UI;
- `dependabot[bot]` and `github-actions[bot]` with their `users.noreply.github.com` addresses;
- in a `Co-authored-by:` / `Signed-off-by:` trailer only, `noreply@anthropic.com` for the assistant.

A personal name or a work address in any of those fields fails the check. So does a
**`Claude-Session:` trailer**: those are private URLs into the owner's Claude account and have no
business in a public repo — strip them from commit messages (and from PR bodies) before pushing. Put
the plan id in the commit subject instead; that is the traceability this project actually uses.

### Setting the identity in a fresh clone or worktree

A new clone inherits your **global** git identity, which is usually a personal one. Set the project
identity locally, per clone — a `git worktree` shares the parent clone's config, so doing it once in
the clone covers its worktrees:

```sh
git config user.name  codechup
git config user.email <id>+codechup@users.noreply.github.com   # id from github.com/settings/emails
sh scripts/install-hooks.sh    # installs the hooks AND verifies the identity you just set
node scripts/check-public-hygiene.mjs --identity   # same check on its own
```

If commits already carry the wrong identity, rewrite them before pushing — they have not left the
machine yet:

```sh
git rebase --exec 'git commit --amend --no-edit --reset-author' origin/main
```

**Enforcement (all four must stay green):**

1. `node scripts/check-public-hygiene.mjs` — runs in `npm run lint`, the `pre-commit` git hook (`sh scripts/install-hooks.sh`) and CI.
2. `node scripts/check-public-hygiene.mjs --commits <range>` — scans commit metadata and messages. The `pre-push` hook runs it over `@{u}..HEAD` (or `origin/main..HEAD` when the branch has no upstream) so a bad commit cannot leave the machine; the CI `quality` job runs it over the pull request's `base..head` (the checkout uses `fetch-depth: 0`) so a bad commit cannot merge. Offending values are **masked** in the output — the check reports that a commit is unpublishable without republishing the value in a public CI log.
3. `.claude/hooks/guard-hygiene.mjs` — PreToolUse hook that blocks a Write/Edit carrying such content before it touches the tree; for Bash/PowerShell commands it blocks only credential material (a command that _reads_ a private system is legitimate — the value must simply never land in a tracked file, which the file-level scans enforce).
4. `gitleaks` in CI with the custom rules in `.gitleaks.toml`.

**Session and artifact identifiers — the accepted decision.**

- **Never**: a Claude _session URL/id_ (`claude.ai/code/session_…`, a `Claude-Session:` trailer) or
  an _artifact URL_ (`claude.ai/code/artifact/<uuid>`). These name resources in the owner's Claude
  account: a remote handle, not a local filename. `scripts/check-public-hygiene.mjs` blocks both in
  files, staged content, commit metadata and `Write`/`Edit` (rules `session-url`, `artifact-url`).
- **Accepted**: the **local** session UUIDs that appear inside `content/_shared/transcripts/**`.
  They are filenames on the author's own machine, grant no access to anything, and redacting them
  would mean editing a real recording — which D099 forbids. Lesson examples must instead use an
  obviously synthetic placeholder (`session_01EXAMPLEEXAMPLEEXAMPLE`, `<artifact-id>`); the
  `session-url` rule deliberately allows the ALL-CAPS placeholder style and blocks everything else.

**Prose review (the scanners cannot do this one).** `scripts/check-public-hygiene.mjs` matches
patterns; it provably cannot catch a private fact written as ordinary English — "the host runs
rsync 3.2.7", "a neighbouring site shares the box", "`DEPLOY_PATH` is `.`". Every file under
`docs/release/**`, `docs/deploy/**` and `docs/launch/**` therefore needs a human/agent PROSE read
before it merges, asking one question of each sentence: _does this tell a stranger something about
the host, the account, or another project that they could not already see?_ Record what the gate
**proved**, never how the host is built.

If a plan seems to need a private value, it does not: write the owner action into the plan's Handoff notes / `open_questions` and use a secret or placeholder.
