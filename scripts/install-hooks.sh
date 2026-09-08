#!/usr/bin/env sh
# Point git at the repo-managed hooks (idempotent). Run from the repo root or any worktree.
set -e
git config core.hooksPath scripts/git-hooks
echo "hooks installed: $(git config core.hooksPath)"

# A fresh clone or worktree often inherits a personal global git identity. This repo is public and
# every commit must be authored by the project identity — check now rather than at push time.
root=$(git rev-parse --show-toplevel)
if node "$root/scripts/check-public-hygiene.mjs" --identity; then
  echo "commit identity: OK"
else
  echo "" >&2
  echo "Set the project identity in this clone/worktree before committing:" >&2
  echo "  git config user.name codechup" >&2
  echo "  git config user.email <id>+codechup@users.noreply.github.com" >&2
  echo "(see .claude/rules/public-hygiene.md — 'Commit identity')" >&2
  exit 1
fi
