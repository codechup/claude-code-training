#!/usr/bin/env node
// Command `plan` is the plan-system CLI of Claude Code Training (plans/README.md §7).
//
//   node tools/plan/cli.ts state                          rewrite STATE.md
//   node tools/plan/cli.ts next                            list claimable plans
//   node tools/plan/cli.ts claim P07 --owner NAME [--force]
//   node tools/plan/cli.ts status P07 review [--reason T]
//   node tools/plan/cli.ts check                            validate plans/ and STATE.md freshness
//   node tools/plan/cli.ts show P07                         print frontmatter + section headings
//
// It reads plans/PNN-slug.md frontmatter and never touches the plan bodies except for
// the `- Blocked (date): reason` line that `status ... blocked --reason` appends.

import * as path from "node:path";
import { pathToFileURL } from "node:url";
import {
  type PlanSet,
  type PlanFile,
  STATUSES,
  STATUS_TODO,
  STATUS_IN_PROGRESS,
  STATUS_BLOCKED,
  loadSet,
  getPlan,
  claimableSet,
  resumable,
  newest,
  setStatus,
  clearOwner,
  appendBlocked,
  saveFile,
  ownerName,
  formatStamp,
  headings,
  rel,
  repoRoot,
} from "./plan.ts";
import { check } from "./check.ts";
import { renderState } from "./state.ts";
import { readFileSync, writeFileSync } from "node:fs";

export type Clock = () => Date;

export interface IO {
  stdout: (s: string) => void;
  stderr: (s: string) => void;
}

const USAGE = `plan — Claude Code Training plan system (plans/README.md §7)

usage:
  node tools/plan/cli.ts state                                     rewrite STATE.md from plans/
  node tools/plan/cli.ts next                                      list claimable plans
  node tools/plan/cli.ts claim PNN --owner NAME [--force]          take a plan (todo, or stale with --force)
  node tools/plan/cli.ts status PNN STATUS [--reason TEXT]         set status (blocked requires --reason)
  node tools/plan/cli.ts check                                     validate plans/ + STATE.md freshness (exit 1 on problems)
  node tools/plan/cli.ts show PNN                                  print frontmatter and section headings

  (alias: npm run plan -- <same arguments>)

global flags:
  --dir PATH     plans directory (default: <repo root>/plans)
  --state PATH   STATE.md path   (default: <repo root>/STATE.md)

statuses: todo | in_progress | blocked | review | done
`;

interface Flags {
  dir?: string;
  state?: string;
  owner?: string;
  reason?: string;
  force: boolean;
}

function parseArgs(rest: string[]): { pos: string[]; flags: Flags } {
  const flags: Flags = { force: false };
  const pos: string[] = [];
  let i = 0;
  while (i < rest.length) {
    const a = rest[i];
    if (a === "--force") {
      flags.force = true;
      i++;
      continue;
    }
    if (a.startsWith("--")) {
      const eq = a.indexOf("=");
      let name: string;
      let value: string | undefined;
      if (eq >= 0) {
        name = a.slice(2, eq);
        value = a.slice(eq + 1);
        i++;
      } else {
        name = a.slice(2);
        value = rest[i + 1];
        i += 2;
      }
      switch (name) {
        case "dir":
          flags.dir = value;
          break;
        case "state":
          flags.state = value;
          break;
        case "owner":
          flags.owner = value;
          break;
        case "reason":
          flags.reason = value;
          break;
        default:
          throw new Error(`flag provided but not defined: -${name}`);
      }
      continue;
    }
    pos.push(a);
    i++;
  }
  return { pos, flags };
}

function padRight(s: string, n: number): string {
  return s.length >= n ? s : s + " ".repeat(n - s.length);
}

function cmdState(s: PlanSet, statePath: string, io: IO): void {
  const content = renderState(s);
  let prev: string | null = null;
  try {
    prev = readFileSync(statePath, "utf8");
  } catch {
    prev = null;
  }
  if (prev !== null && prev.replace(/\r\n/g, "\n") === content) {
    io.stdout(`${rel(statePath)} is up to date (${s.files.length} plans)\n`);
    return;
  }
  writeFileSync(statePath, content, "utf8");
  io.stdout(`wrote ${rel(statePath)} (${s.files.length} plans)\n`);
}

function cmdNext(s: PlanSet, io: IO): void {
  // Claimability is clock-free (plans/README.md §3): staleness is measured against the
  // newest `updated_at` in the set, never the wall clock, so `next` agrees with `check`
  // and `state` regardless of machine clock skew.
  const ref = newest(s);
  const claimable = claimableSet(s, ref);
  if (claimable.length === 0) {
    io.stdout("no claimable plans: every todo plan is blocked by dependencies or by an active claim\n");
    return;
  }
  io.stdout(`claimable now (${claimable.length}):\n`);
  for (const f of claimable) {
    let note = "";
    if (f.meta.status === STATUS_IN_PROGRESS) {
      note = `  [stale claim by ${ownerName(f.meta)} — use --force]`;
    }
    io.stdout(
      `  ${f.meta.id}  ${padRight(f.meta.model_hint, 6)} ${padRight(f.meta.effort_hint, 6)} ${f.meta.estimate}  ${f.meta.title}${note}\n`,
    );
  }
}

function cmdClaim(
  s: PlanSet,
  pos: string[],
  owner: string | undefined,
  force: boolean,
  statePath: string,
  clock: Clock,
  io: IO,
): void {
  if (pos.length !== 1) {
    throw new Error("usage: plan claim PNN --owner NAME [--force]");
  }
  if (!owner || owner.trim() === "") {
    throw new Error("claim requires --owner NAME (a free-form session name, e.g. sonnet-b-2026-08-25)");
  }
  const f = getPlan(s, pos[0]);
  if (!f) {
    throw new Error(`unknown plan "${pos[0]}"`);
  }
  // Staleness is decided clock-free, against the newest `updated_at` in the set
  // (plans/README.md §3) — the same reference point `check` and `state` use — so a
  // machine's wall clock (ahead or behind) can never make a fresh claim look stale or
  // a stale claim look fresh. The wall clock (or `PLAN_NOW`) is used only below, to
  // stamp the claim's own `updated_at`.
  const ref = newest(s);
  const { ok, reason } = resumable(s, f, ref);
  if (!ok) {
    throw new Error(`${f.meta.id} is not claimable: ${reason}`);
  }
  // A stale claim is claimable, but taking it over is deliberate: read the branch
  // and the Handoff notes first, then pass --force (plans/README.md §3).
  if (f.meta.status === STATUS_IN_PROGRESS && !force) {
    throw new Error(
      `${f.meta.id} holds a stale claim by ${ownerName(f.meta)} (since ${formatStamp(f.meta.updated_at)}); read its branch ${f.meta.branch} and Handoff notes, then re-run with --force`,
    );
  }
  const now = clock();
  const name = owner.trim();
  setStatus(f, STATUS_IN_PROGRESS, name, now);
  saveFile(f);
  io.stdout(`claimed ${f.meta.id} for ${name} (branch ${f.meta.branch})\n`);
  io.stdout(
    `next: git checkout -b ${f.meta.branch} && git add ${rel(f.path)} && git commit -m "chore(plans): claim ${f.meta.id}" && git push -u origin ${f.meta.branch}\n`,
  );
  cmdState(s, statePath, io);
}

function cmdStatus(
  s: PlanSet,
  pos: string[],
  reason: string | undefined,
  statePath: string,
  clock: Clock,
  io: IO,
): void {
  if (pos.length !== 2) {
    throw new Error("usage: plan status PNN todo|in_progress|blocked|review|done [--reason TEXT]");
  }
  const f = getPlan(s, pos[0]);
  if (!f) {
    throw new Error(`unknown plan "${pos[0]}"`);
  }
  const status = pos[1];
  if (!STATUSES.includes(status)) {
    throw new Error(`unknown status "${status}" (want ${STATUSES.join("|")})`);
  }
  if (status === STATUS_BLOCKED && (!reason || reason.trim() === "")) {
    throw new Error('status blocked requires --reason "what blocks you, what you tried, what you need"');
  }
  const now = clock();
  setStatus(f, status, null, now);
  if (status === STATUS_TODO) {
    // Releasing a plan also releases its owner (plans/README.md §3).
    clearOwner(f);
  }
  if (status === STATUS_BLOCKED) {
    appendBlocked(f, reason as string, now);
  }
  saveFile(f);
  io.stdout(`${f.meta.id} → ${status}\n`);
  cmdState(s, statePath, io);
}

function cmdCheck(s: PlanSet, statePath: string, io: IO): number {
  const problems = check(s, statePath);
  if (problems.length === 0) {
    io.stdout(`ok: ${s.files.length} plans, frontmatter valid, DAG acyclic, no owned_paths overlap, ${rel(statePath)} fresh\n`);
    return 0;
  }
  io.stderr(`plan check failed (${problems.length} problem(s)):\n`);
  for (const p of problems) io.stderr(`  - ${p}\n`);
  return 1;
}

function cmdShow(s: PlanSet, pos: string[], io: IO): void {
  if (pos.length !== 1) {
    throw new Error("usage: plan show PNN");
  }
  const f: PlanFile | undefined = getPlan(s, pos[0]);
  if (!f) {
    throw new Error(`unknown plan "${pos[0]}"`);
  }
  io.stdout(`${rel(f.path)}\n`);
  io.stdout("---\n");
  for (const l of f.front) io.stdout(l + "\n");
  io.stdout("---\n");
  io.stdout("sections:\n");
  for (const h of headings(f)) io.stdout(`  ## ${h}\n`);
}

/** runCli is the testable core of the CLI: pure function of (args, io, clock) -> exit code. */
export function runCli(args: string[], io: IO, clock: Clock): number {
  if (args.length === 0) {
    io.stderr(USAGE);
    return 1;
  }
  const cmd = args[0];
  const rest = args.slice(1);
  try {
    const { pos, flags } = parseArgs(rest);
    const root = repoRoot();
    const dir = flags.dir ?? path.join(root, "plans");
    const statePath = flags.state ?? path.join(root, "STATE.md");
    const set = loadSet(dir);

    switch (cmd) {
      case "state":
        cmdState(set, statePath, io);
        return 0;
      case "next":
        cmdNext(set, io);
        return 0;
      case "claim":
        cmdClaim(set, pos, flags.owner, flags.force, statePath, clock, io);
        return 0;
      case "status":
        cmdStatus(set, pos, flags.reason, statePath, clock, io);
        return 0;
      case "check":
        return cmdCheck(set, statePath, io);
      case "show":
        cmdShow(set, pos, io);
        return 0;
      case "help":
      case "-h":
      case "--help":
        io.stdout(USAGE);
        return 0;
      default:
        io.stderr(`plan: unknown command "${cmd}"\n\n${USAGE}`);
        return 1;
    }
  } catch (e) {
    io.stderr(`plan: ${(e as Error).message}\n`);
    return 1;
  }
}

function envClock(): Clock {
  const envNow = process.env.PLAN_NOW;
  if (!envNow) return () => new Date();
  if (!envNow.endsWith("Z")) {
    throw new Error(`PLAN_NOW must be an RFC3339 UTC timestamp ending in "Z": ${JSON.stringify(envNow)}`);
  }
  const d = new Date(envNow);
  if (Number.isNaN(d.getTime())) {
    throw new Error(`PLAN_NOW is not a valid RFC3339 timestamp: ${JSON.stringify(envNow)}`);
  }
  return () => d;
}

function main(): void {
  const io: IO = {
    stdout: (s) => process.stdout.write(s),
    stderr: (s) => process.stderr.write(s),
  };
  const code = runCli(process.argv.slice(2), io, envClock());
  process.exit(code);
}

const isMain = process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) main();
