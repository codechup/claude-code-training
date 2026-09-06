#!/usr/bin/env sh
# Point git at the repo-managed hooks (idempotent). Run from the repo root or any worktree.
set -e
git config core.hooksPath scripts/git-hooks
echo "hooks installed: $(git config core.hooksPath)"
