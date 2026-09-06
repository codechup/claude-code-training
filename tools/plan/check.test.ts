import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { loadSet } from "./plan.ts";
import { check, findCycles } from "./check.ts";

const FIXTURE_DIR = path.join(import.meta.dirname, "testdata", "plans");

/** copyFixtures copies the fixture plans into a temp dir so mutations never touch the checked-in files. */
function copyFixtures(): string {
  const dst = fs.mkdtempSync(path.join(os.tmpdir(), "plan-check-"));
  for (const name of fs.readdirSync(FIXTURE_DIR)) {
    fs.copyFileSync(path.join(FIXTURE_DIR, name), path.join(dst, name));
  }
  return dst;
}

describe("check", () => {
  it("passes on the fixture set against its golden STATE.md", () => {
    const s = loadSet(FIXTURE_DIR);
    const golden = path.join(import.meta.dirname, "testdata", "STATE.golden.md");
    const problems = check(s, golden);
    expect(problems).toEqual([]);
  });

  it("reports frontmatter problems", () => {
    const dir = copyFixtures();
    const p = path.join(dir, "P07-ready.md");
    let raw = fs.readFileSync(p, "utf8");
    raw = raw.replace("id: P07", "id: P42");
    raw = raw.replace("milestone: M0", "milestone: M9");
    raw = raw.replace("model_hint: opus", "model_hint: gpt");
    raw = raw.replace("effort_hint: high", "effort_hint: extreme");
    raw = raw.replace("estimate: L", "estimate: XL");
    raw = raw.replace("branch: plan/07-ready", "branch: plan/seven");
    raw = raw.replace("owned_paths:\n  - src/lib/matchmaking/**", "owned_paths: []");
    raw = raw.replace("depends_on: [P00]", "depends_on: [P00, P00, P77]");
    fs.writeFileSync(p, raw, "utf8");

    const s = loadSet(dir);
    const got = check(s, path.join(dir, "STATE.md")).join("\n");
    for (const want of [
      'id "P42" does not match the file name',
      'milestone "M9"',
      'model_hint "gpt"',
      'effort_hint "extreme"',
      'estimate "XL"',
      'branch "plan/seven"',
      "owned_paths must not be empty",
      "depends_on lists P00 twice",
      'depends_on references unknown plan "P77"',
      "STATE.md is missing",
    ]) {
      expect(got, want).toContain(want);
    }
  });

  it("reports overlap between active plans", () => {
    const dir = copyFixtures();
    const p = path.join(dir, "P01-in-review.md");
    const raw = fs.readFileSync(p, "utf8").replace("src/lib/store/**", "src/lib/match/timers/**");
    fs.writeFileSync(p, raw, "utf8");

    const s = loadSet(dir);
    const got = check(s, path.join(dir, "STATE.md")).join("\n");
    expect(got).toContain("owned_paths overlap: P01");
    expect(got).toContain("P02");
  });

  it("reports an active plan with an unfinished dependency", () => {
    const dir = copyFixtures();
    const p = path.join(dir, "P05-needs-review-dep.md");
    let raw = fs.readFileSync(p, "utf8");
    raw = raw.replace("status: todo", "status: in_progress");
    raw = raw.replace("owner: null", "owner: someone");
    fs.writeFileSync(p, raw, "utf8");

    const s = loadSet(dir);
    const got = check(s, path.join(dir, "STATE.md")).join("\n");
    expect(got).toContain("dependency P01 is review (must be done)");
  });

  it("reports an owner/status mismatch", () => {
    const dir = copyFixtures();
    let raw = fs.readFileSync(path.join(dir, "P07-ready.md"), "utf8");
    fs.writeFileSync(path.join(dir, "P07-ready.md"), raw.replace("owner: null", "owner: squatter"), "utf8");
    raw = fs.readFileSync(path.join(dir, "P02-fresh-claim.md"), "utf8");
    fs.writeFileSync(
      path.join(dir, "P02-fresh-claim.md"),
      raw.replace("owner: fresh-2026-08-19", "owner: null"),
      "utf8",
    );

    const s = loadSet(dir);
    const got = check(s, path.join(dir, "STATE.md")).join("\n");
    expect(got).toContain('status is todo but owner is "squatter"');
    expect(got).toContain("status is in_progress but owner is null");
  });

  it("reports missing/renamed body sections", () => {
    const dir = copyFixtures();
    const p = path.join(dir, "P07-ready.md");
    const raw = fs.readFileSync(p, "utf8").replace("## Verification", "## Review notes");
    fs.writeFileSync(p, raw, "utf8");

    const s = loadSet(dir);
    const got = check(s, path.join(dir, "STATE.md")).join("\n");
    expect(got).toContain('body section 9 is "Review notes", want "Verification"');
  });
});

describe("findCycles", () => {
  it("detects a dependency loop", () => {
    const dir = copyFixtures();
    const p = path.join(dir, "P00-base.md");
    const raw = fs.readFileSync(p, "utf8").replace("depends_on: []", "depends_on: [P07]");
    fs.writeFileSync(p, raw, "utf8");

    const s = loadSet(dir);
    const cycles = findCycles(s);
    expect(cycles).toHaveLength(1);
    const joined = cycles[0].join("→");
    expect(joined).toContain("P00");
    expect(joined).toContain("P07");
    expect(cycles[0][0]).toBe(cycles[0][cycles[0].length - 1]);

    const got = check(s, path.join(dir, "STATE.md")).join("\n");
    expect(got).toContain("dependency cycle:");
  });

  it("is clean on the fixtures and detects a self-loop", () => {
    expect(findCycles(loadSet(FIXTURE_DIR))).toHaveLength(0);

    const dir = copyFixtures();
    const p = path.join(dir, "P07-ready.md");
    const raw = fs.readFileSync(p, "utf8").replace("depends_on: [P00]", "depends_on: [P07]");
    fs.writeFileSync(p, raw, "utf8");

    const s = loadSet(dir);
    const got = check(s, path.join(dir, "STATE.md")).join("\n");
    expect(got).toContain("depends_on lists itself");
  });
});
