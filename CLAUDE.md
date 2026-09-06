# CLAUDE.md — CodeChup Claude Code Academy

This repository is **cc.codechup.com**: a bilingual (EN source, TR translation) static training site that teaches Claude Code from zero to autonomous use. Astro + MDX, Tailwind v4, no server runtime. Public, MIT.

> Bootstrap version written by the lead session (P01). **P11** replaces it with the full rules, hooks, skills and agents.

## Start here (every session, in this order)

1. `STATE.md` — where the project is (generated; never hand-edit).
2. `plans/README.md` — the plan/claim contract; `plans/ROADMAP.md` for the waves.
3. `DECISIONS.md` — the 100 owner decisions (D001–D100). Cite them as `(Dnnn)`; never re-litigate.
4. `docs/CURRICULUM.md` (once P03 lands) and `research/feature-inventory.md` — the only sources lesson writers may rely on for "what Claude Code does today".
5. `docs/design/CANVAS.md` — the approved design; `src/styles/tokens.css` is derived from it.

Work is plan-driven and parallel: `node tools/plan/cli.ts next` → `claim PNN --owner <session-name>` → branch `plan/NN-slug` → worktree `../cct-wt-NN` → stay inside `owned_paths` → PR → `status review` → after merge `status done` + `state`.

## Hard rules

- **Evidence rule (D093):** every command you claim to have run was run; paste real output in the PR. Lesson transcripts are captured from real sessions in the lab repo — never invented.
- **Stay current (D004, D044):** cite `research/feature-inventory.md`; anything marked UNVERIFIED goes to `open_questions`, not into a lesson. Old behaviour appears only as a short "Changed" callout.
- **Public-repo hygiene (enforced):** no hosting IPs, no private paths, no references to other CodeChup projects or their infrastructure, no secrets. Deploy targets come from secrets (`DEPLOY_PATH`, `SSH_*`). Case studies are anonymous (D026). Enforced three ways — `scripts/check-public-hygiene.mjs` (lint, pre-commit, CI), the PreToolUse hook `.claude/hooks/guard-hygiene.mjs`, and gitleaks; rule text in `.claude/rules/public-hygiene.md`.
- **Languages:** EN is the source; TR is a translation with correct diacritics and English technical terms kept (D016, D018). Every EN lesson has a TR twin (a `draft: true` stub is acceptable until the TR wave).
- **Design only through tokens** (`src/styles/tokens.css`); no raw colours elsewhere; mobile-first at 390 px; WCAG 2.2 AA; no inline `<script>` bodies (CSP).
- **Stay inside `owned_paths`;** shared files are append-only. PR-only `main`, squash merges, conventional commits (`feat(content): …`, `chore(plans): …`).
- Never commit secrets (`.env*`, keys, certs).

## Commands

```bash
sh scripts/install-hooks.sh          # once per clone/worktree: pre-commit hygiene + pre-push main guard
npm ci && npm run dev              # Astro dev server
npm run typecheck && npm run lint && npm run gate && npm test && npm run build
npx playwright test                # e2e + axe (CI installs browsers)
node tools/plan/cli.ts check && node tools/plan/cli.ts state
```

## Layout

```
content/{en,tr}/<level>/<module>/NN-<slug>.mdx   src/{layouts,pages,components,lib,styles}
scripts/ (content-gate, checks, smoke)          tools/plan/ (plan CLI)   plans/ + STATE.md
docs/{design,deploy,CURRICULUM.md}              research/ (feature inventory, deprecations)
```

## Model / effort hints

`model_hint` / `effort_hint` in plan frontmatter are advice for the claiming session: `haiku/low` mechanical, `sonnet/medium` normal implementation and translation, `opus/high` lesson authoring, `fable/high|xhigh` architecture, design and curriculum. When in doubt, escalate and write the question into the plan's Handoff notes.
