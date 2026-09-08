# Repository hardening

Both of this project's repositories are public: `codechup/claude-code-training`
(this one) and `codechup/claude-code-lab` (the sandbox every lab clones).
Public means every setting is part of the product — a wiki nobody watches, a
workflow token that can write, a deletable `lesson/**` tag are all defects a
reader can trip over.

The settings are therefore **a script, not a click-path**:

```bash
node scripts/repo-hardening.mjs --repo codechup/claude-code-training --dry-run
node scripts/repo-hardening.mjs --repo codechup/claude-code-training   # applies
```

It takes `--repo owner/name` (repeatable, or comma-separated), reads every
setting **before**, writes only what differs, reads it **again** afterwards,
and prints `setting → before → after → result`. A second run prints
`unchanged` on every row and issues no writes. If a repository is ever deleted
and recreated — which is why nothing has been applied yet — one command puts it
back.

> **Status: not yet applied.** As of this writing the script has only been run
> with `--dry-run` against both repositories. The `WOULD CHANGE` rows in that
> output are the current gap.

## What the script sets, and why

### Repository features and merge policy

| Setting                       | Value   | Why                                                                                                                                        |
| ----------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `has_wiki`                    | `false` | A wiki is an unversioned second source of truth that no CI check can gate. The docs are in the repo, where the content gate can see them.   |
| `has_projects`                | `false` | Unused. An empty tab is a surface with no owner.                                                                                            |
| `has_discussions`             | `false` | Same: an unmoderated forum nobody is watching is worse than no forum. Readers file the issue form instead.                                  |
| `allow_squash_merge`          | `true`  | CLAUDE.md: `main` is PR-only, one squashed commit per plan.                                                                                 |
| `allow_merge_commit`          | `false` | A merge commit breaks the linear history the ruleset requires; disabling it in the UI means the button is never there to press by accident. |
| `allow_rebase_merge`          | `false` | Rebase-merge scatters a plan across several commits and loses the `(Pnn)` grouping.                                                          |
| `delete_branch_on_merge`      | `true`  | `plan/NN-*` branches are disposable once squashed; leaving them makes `plan-cli next` output harder to read.                                |

### Dependency and secret security

| Setting                                | Why                                                                                                                                                                                            |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dependabot **alerts**                  | Currently **off** on both repos (`gh api repos/<r>/vulnerability-alerts` returns 404). Without alerts, `dependabot.yml` only does routine version bumps — nobody is told when a bump is urgent. |
| Dependabot **security updates**        | Also off. Turns an alert into a PR automatically. Requires alerts, so the script orders them.                                                                                                    |
| Secret scanning **non-provider patterns** | Base secret scanning only catches formats a provider registered (`ghp_…`, `sk-…`). Non-provider patterns catch generic private keys, connection strings and HTTP basic-auth URLs — which is what a leaked lab transcript actually looks like. |
| Secret scanning **validity checks**    | Tells you whether a found token is still live, so triage is "revoke now" vs "already dead" instead of a guess.                                                                                  |
| **Private vulnerability reporting**    | Gives a finder a private channel. Without it the only route is a public issue, which discloses the bug to everyone at the moment it is reported. Both repos' `SECURITY.md` point at this button. |

Base secret scanning and push protection are already on (GitHub enables them for
public repositories); the script reports them and changes nothing.

### Actions

| Setting                                | Value                                             | Why                                                                                                                                                       |
| -------------------------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `allowed_actions`                      | `selected`: GitHub-owned + verified + an allowlist | Anything else cannot run, so a compromised or typosquatted third-party action never gets a chance. The allowlist is **derived from the repo's own workflows**, not hard-coded — see below. |
| `default_workflow_permissions`         | `read`                                            | A workflow that needs to write asks for it explicitly with a `permissions:` block. Already correct on both repos.                                          |
| `can_approve_pull_request_reviews`     | `false`                                           | A workflow must not be able to satisfy the PR-review requirement on its own. Already correct on both repos.                                                |
| Fork PR approval policy                | `all_external_contributors`                       | Currently `first_time_contributors`, so a contributor who landed one PR can then run workflows on a fork PR unreviewed. Tighten to every outside contributor, every time. |

The allowlist is derived: the script fetches `.github/workflows/*.yml` from the
repository's default branch, collects every `uses:` reference, drops the
`actions/` and `github/` ones (already covered by "GitHub-owned"), and allows
the rest as `owner/name@*`. Today that resolves to

- **training** — `gitleaks/gitleaks-action@*`, `lycheeverse/lychee-action@*`,
  `treosh/lighthouse-ci-action@*`
- **lab** — `anthropics/claude-code-action@*`

Deriving rather than listing matters: when a workflow grows a new action, the
next dry run shows it as a diff instead of the workflow failing against a stale
allowlist. Note that `@*` allows any ref of that action — the workflows already
pin actions to a commit SHA, and Dependabot keeps those SHAs current, so the
allowlist is the coarse gate and the SHA pin is the fine one.

`repos/<r>/actions/permissions/access` is **not** set: GitHub returns HTTP 422
("Access policy only applies to internal and private repositories") for a public
repo. The script does not touch it.

### Branch ruleset on the default branch

One ruleset named `default-branch`, `enforcement: active`, condition
`~DEFAULT_BRANCH`, **`bypass_actors: []`**:

- **Block deletion** and **block non-fast-forward** — `main` cannot be deleted
  or force-pushed. Every published lesson URL is built from `main`.
- **Require linear history** — matches squash-only merging; keeps `git log` a
  readable list of plans.
- **Require a pull request**, `allowed_merge_methods: ["squash"]`, with
  `required_approving_review_count: 0`. Zero approvals is deliberate: this is a
  solo-maintainer repository, and requiring a review the maintainer would then
  self-approve teaches nothing except how to bypass rules. The rule that
  matters is that `main` is only ever written through a PR, so CI runs.
- **Require status checks**, `strict_required_status_checks_policy: true` (the
  branch must be up to date with `main` before merge). Contexts are derived
  from the workflows that trigger on `pull_request`, using each job's `name:`:
  - **training** — `quality`, `e2e`, `links`, `lighthouse`
  - **lab** — `quality`, `claude-review`

  Jobs whose `if:` condition references `vars.` or `secrets.` are skipped
  during derivation: a job that may legitimately not run would leave a required
  check pending forever. (`deploy.yml`'s `gate` job is excluded this way; it
  also never runs on a PR.) Use `--skip-check <context>` to drop one by hand —
  `claude-review` is the plausible candidate, since it depends on an
  `ANTHROPIC_API_KEY` secret being present.

**No bypass actors, on purpose.** A standing admin exemption is one nobody
remembers granting. If a force-push is genuinely needed, disable the ruleset for
the minute it takes — that leaves an audit-log entry, a standing exemption does
not. See "Force-pushing on purpose" below.

### Tag ruleset — lab repository only

`refs/tags/lesson/**` gets its own ruleset (`lesson-tags`) blocking deletion and
non-fast-forward. This is the single most load-bearing item on the page: the lab
repo carries 98 `lesson/mNN-KK-*` tags and lessons cite them **by name** in
frontmatter (`lab.repo_tag`). A deleted or moved tag silently breaks the lab of
every lesson pointing at it, and nothing in CI would notice — the lesson still
builds, the reader just gets the wrong repository state. The script creates this
ruleset only for a repository that actually has `lesson/` tags, so it is a no-op
on the training repo.

## Which items are ceremony

Honest accounting — not everything here buys the same amount:

- **Real protection.** The `lesson/**` tag ruleset; block-deletion and
  non-fast-forward on `main`; the Actions allowlist; fork-PR approval;
  Dependabot alerts and security updates; private vulnerability reporting.
- **Real, but already true.** Read-only default workflow token and
  "workflows cannot approve PRs" — GitHub's current default, and both repos
  already have them. The script pins them so a future default change, or a
  recreated repository, cannot quietly regress them.
- **Mostly ceremony.** Turning off the wiki, projects and discussions: nobody
  is attacking an empty wiki. It is tidiness and surface reduction, not
  security. Likewise "require a pull request" with zero required approvals on a
  solo repository — it enforces "CI ran" and nothing more; the branch ruleset's
  real teeth are deletion and non-fast-forward. Squash-only merging is a
  history-hygiene preference, not a control.

Saying so matters more than the settings do: a checklist whose items all claim
to be critical trains the reader to skip the whole thing.

## What the owner must do by hand (account level)

None of these are repository settings, so no script can reach them. All three
are under **GitHub → Settings** for the *account*, not the repo.

1. **Keep email addresses private** — Settings → Emails. Turns on a
   `…@users.noreply.github.com` address for web-based operations. This project
   already commits as
   `codechup <<id>+codechup@users.noreply.github.com>`; the setting is what
   makes that the default everywhere else too, including web edits and
   automatic merges.
2. **Block command line pushes that expose an email** — Settings → Emails, the
   checkbox directly under the previous one. This is the one that actually
   catches mistakes: a worktree with a stale `user.email` will be *rejected by
   the server* instead of publishing a personal address into a public repo's
   history forever. Turn it on. This project runs several worktrees with
   independently configured git identities, which is exactly the setup where
   one of them ends up misconfigured.
3. **Two-factor authentication** — Settings → Password and authentication.
   Prefer a hardware key or an authenticator app over SMS, and save the
   recovery codes somewhere that is not the machine holding the key. An account
   compromise here is not "someone edits a page": it is arbitrary content served
   from `cc.codechup.com` and arbitrary code in a repository readers are
   instructed to clone and let an agent run commands in.

Optional, and worth a minute: Settings → Emails → *Do not show my email address*
combined with a verified `security@codechup.com` alias, so both `SECURITY.md`
files stay routable without exposing a personal address.

## Force-pushing on purpose

With no bypass actors, a deliberate force-push (rewriting a bad commit that
landed on `main`, or scrubbing something that should never have been pushed)
takes three steps. Do them in one sitting.

```bash
# 1. Find the ruleset and note its id.
gh api repos/codechup/claude-code-training/rulesets --jq '.[] | {id, name, enforcement}'

# 2. Disable it (do NOT delete it — deleting loses the configuration).
gh api --method PUT repos/codechup/claude-code-training/rulesets/<id> \
  -f enforcement=evaluate

# 3. ... do the force-push ...

# 4. Re-enable, and prove it took.
gh api --method PUT repos/codechup/claude-code-training/rulesets/<id> \
  -f enforcement=active
gh api repos/codechup/claude-code-training/rulesets --jq '.[] | {name, enforcement}'
```

`enforcement=evaluate` keeps the ruleset intact and keeps recording what *would*
have been blocked, which is why it is preferred over `disabled` — and why
deleting the ruleset is the wrong move even though it looks equivalent. Evaluate
mode is not offered on every plan and repository type; if step 2 comes back with
a 422, use `-f enforcement=disabled` instead and re-enable exactly the same way.
(Unverified here: no ruleset exists yet to try it against.)

Step 4 is not optional, and it is the step people skip. The safety net is
`node scripts/repo-hardening.mjs --repo <r> --dry-run`: if the ruleset row says
`WOULD CHANGE` when you expected `unchanged`, something was left off. Running
the dry run costs seconds and is the cheapest way to answer "did I put it back?"

If a scrub involved a leaked credential, rotating the credential is the fix;
rewriting history only removes the copy that is easy to find.

## Reader-reported drift

`.github/ISSUE_TEMPLATE/lesson-outdated.yml` is part of the same story. Readers
run the labs against whatever Claude Code shipped this week — the version no
lesson was written against — which makes them the best drift detector this
course has. The form asks for the four things a fix needs: lesson URL, the
reader's `claude --version`, what the lesson claims, and what the tool actually
did. It requires a confirmation that the pasted terminal output carries no
tokens or private hostnames, because a bug report is a place people paste whole
sessions.

This is why `has_discussions` stays off: a structured issue form that produces
actionable reports beats an unmoderated forum that produces threads.
