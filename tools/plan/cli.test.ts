import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { runCli, type IO, type Clock } from "./cli.ts";

const FIXTURE_DIR = path.join(import.meta.dirname, "testdata", "plans");

function copyFixtures(): string {
  const dst = fs.mkdtempSync(path.join(os.tmpdir(), "plan-cli-"));
  for (const name of fs.readdirSync(FIXTURE_DIR)) {
    fs.copyFileSync(path.join(FIXTURE_DIR, name), path.join(dst, name));
  }
  return dst;
}

function runCLI(dir: string, now: Date, ...args: string[]): { out: string; err: string; code: number } {
  let out = "";
  let err = "";
  const io: IO = {
    stdout: (s) => (out += s),
    stderr: (s) => (err += s),
  };
  const clock: Clock = () => now;
  const full = [...args, "--dir", dir, "--state", path.join(dir, "STATE.md")];
  const code = runCli(full, io, clock);
  return { out, err, code };
}

describe("cli state", () => {
  it("writes and is idempotent", () => {
    const dir = copyFixtures();
    const now = new Date("2026-08-21T00:00:00Z");

    let r = runCLI(dir, now, "state");
    expect(r.code).toBe(0);
    expect(r.out).toContain("wrote");
    const first = fs.readFileSync(path.join(dir, "STATE.md"), "utf8");

    r = runCLI(dir, now, "state");
    expect(r.code).toBe(0);
    expect(r.out).toContain("up to date");
    const second = fs.readFileSync(path.join(dir, "STATE.md"), "utf8");
    expect(second).toBe(first);

    expect(runCLI(dir, now, "check").code).toBe(0);
  });
});

describe("cli next", () => {
  it("lists the current wave", () => {
    const dir = copyFixtures();
    const now = new Date("2026-08-20T00:00:00Z");
    const r = runCLI(dir, now, "next");
    expect(r.code).toBe(0);
    expect(r.out).toContain("claimable now (2)");
    for (const want of ["P03", "P07", "stale claim by ghost-2026-08-01"]) {
      expect(r.out).toContain(want);
    }
    for (const absent of ["P05 ", "P06 "]) {
      expect(r.out).not.toContain(absent);
    }
  });
});

describe("cli claim", () => {
  it("enforces every claim rule", () => {
    const dir = copyFixtures();
    const now = new Date("2026-08-20T10:00:00Z");

    // Refuses a plan whose dependency is not done.
    expect(runCLI(dir, now, "claim", "P05", "--owner", "me").code).not.toBe(0);
    // Refuses a plan that overlaps an active claim.
    expect(runCLI(dir, now, "claim", "P06", "--owner", "me").code).not.toBe(0);
    // Refuses a live claim without --force, and --force does not help a fresh claim.
    expect(runCLI(dir, now, "claim", "P02", "--owner", "me").code).not.toBe(0);
    expect(runCLI(dir, now, "claim", "P02", "--owner", "me", "--force").code).not.toBe(0);
    // Requires --owner.
    expect(runCLI(dir, now, "claim", "P07").code).not.toBe(0);
    // Unknown plan.
    expect(runCLI(dir, now, "claim", "P99", "--owner", "me").code).not.toBe(0);

    // Happy path.
    const r = runCLI(dir, now, "claim", "P07", "--owner", "opus-x");
    expect(r.code).toBe(0);
    expect(r.out).toContain("claimed P07 for opus-x");
    expect(r.out).toContain("plan/07-ready");
    const body = fs.readFileSync(path.join(dir, "P07-ready.md"), "utf8");
    expect(body).toContain("status: in_progress");
    expect(body).toContain("owner: opus-x");
    expect(body).toContain("updated_at: 2026-08-20T10:00:00Z");

    // STATE.md was refreshed as part of the claim.
    expect(runCLI(dir, now, "check").code).toBe(0);

    // Reclaiming a stale plan is refused without --force and accepted with it.
    const refused = runCLI(dir, now, "claim", "P03", "--owner", "opus-y");
    expect(refused.code).not.toBe(0);
    expect(refused.err).toContain("--force");
    expect(runCLI(dir, now, "claim", "P03", "--owner", "opus-y", "--force").code).toBe(0);
    const raw = fs.readFileSync(path.join(dir, "P03-stale-claim.md"), "utf8");
    expect(raw).toContain("owner: opus-y");
  });
});

describe("cli status", () => {
  it("sets status, appends Blocked entries, and clears owner on todo", () => {
    const dir = copyFixtures();
    const now = new Date("2026-08-21T07:00:00Z");

    expect(runCLI(dir, now, "status", "P02", "blocked").code).not.toBe(0);
    expect(runCLI(dir, now, "status", "P02", "sideways").code).not.toBe(0);
    expect(runCLI(dir, now, "status", "P99", "done").code).not.toBe(0);

    const r = runCLI(dir, now, "status", "P02", "blocked", "--reason", "waiting for P01 to merge");
    expect(r.code).toBe(0);
    expect(r.out).toContain("P02 → blocked");
    let body = fs.readFileSync(path.join(dir, "P02-fresh-claim.md"), "utf8");
    expect(body).toContain("status: blocked");
    expect(body).toContain("- Blocked (2026-08-21): waiting for P01 to merge");
    const notesIdx = body.indexOf("## Handoff notes");
    expect(body.slice(notesIdx)).toContain("- Blocked (2026-08-21)");

    expect(runCLI(dir, now, "status", "P02", "todo").code).toBe(0);
    body = fs.readFileSync(path.join(dir, "P02-fresh-claim.md"), "utf8");
    expect(body).toContain("owner: null");

    expect(runCLI(dir, now, "check").code).toBe(0);
  });
});

describe("cli show and usage", () => {
  it("prints frontmatter and section headings, and handles usage paths", () => {
    const dir = copyFixtures();
    const now = new Date("2026-08-21T07:00:00Z");

    const r = runCLI(dir, now, "show", "P04");
    expect(r.code).toBe(0);
    for (const want of ["id: P04", "status: blocked", "## Handoff notes", "## Goal"]) {
      expect(r.out).toContain(want);
    }
    expect(runCLI(dir, now, "show").code).not.toBe(0);
    expect(runCLI(dir, now, "wat").code).not.toBe(0);

    let out = "";
    let err = "";
    const io: IO = { stdout: (s) => (out += s), stderr: (s) => (err += s) };
    expect(runCli([], io, () => now)).toBe(1);
    expect(err).toContain("usage:");

    out = "";
    expect(runCli(["help", "--dir", dir, "--state", path.join(dir, "STATE.md")], io, () => now)).toBe(0);
    expect(out).toContain("usage:");
  });
});

describe("cli check", () => {
  it("fails loudly when STATE.md is missing", () => {
    const dir = copyFixtures();
    const now = new Date("2026-08-21T07:00:00Z");
    const r = runCLI(dir, now, "check");
    expect(r.code).not.toBe(0);
    expect(r.err).toContain("plan check failed");
    expect(r.err).toContain("STATE.md is missing");
  });
});
