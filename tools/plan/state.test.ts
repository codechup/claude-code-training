import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { loadSet } from "./plan.ts";
import { renderState } from "./state.ts";

const FIXTURE_DIR = path.join(import.meta.dirname, "testdata", "plans");
const GOLDEN_PATH = path.join(import.meta.dirname, "testdata", "STATE.golden.md");
const UPDATE = process.env.UPDATE_GOLDEN === "1";

function loadFixtures() {
  return loadSet(FIXTURE_DIR);
}

describe("renderState", () => {
  it("matches the golden file (regenerate with UPDATE_GOLDEN=1)", () => {
    const got = renderState(loadFixtures());
    if (UPDATE) {
      fs.writeFileSync(GOLDEN_PATH, got, "utf8");
      return;
    }
    let want: string;
    try {
      want = fs.readFileSync(GOLDEN_PATH, "utf8").replace(/\r\n/g, "\n");
    } catch (e) {
      throw new Error(`read golden: ${(e as Error).message} (regenerate with UPDATE_GOLDEN=1 npx vitest run tools/plan)`);
    }
    expect(got).toBe(want);
  });

  it("is deterministic across reloads and leaks no wall-clock date", () => {
    const first = renderState(loadFixtures());
    for (let i = 0; i < 20; i++) {
      expect(renderState(loadFixtures())).toBe(first);
    }
    const today = new Date().toISOString().slice(0, 10);
    if (first.includes(today) && !first.includes("2026-08-")) {
      throw new Error("renderState leaked the current date into its output");
    }
  });

  it("contains the expected content", () => {
    const got = renderState(loadFixtures());
    for (const want of [
      "**M0** 1/6 done",
      "**M1** 0/2 done",
      "Current wave (2 claimable): `P03`, `P07`",
      "| `P03` | Stale claim that may be reclaimed | ghost-2026-08-01 | `plan/03-stale-claim` | 2026-08-01T00:00:00Z | **STALE** |",
      "Ready to claim \\| with a pipe in the title",
      "- **P04** — Which mail provider key should the fixture use?",
      "- **P04** — Does the outbox belong to this plan?",
      "- **M0** (1): `P00`",
      "# STATE.md — Claude Code Training",
      "node tools/plan/cli.ts state",
    ]) {
      expect(got, want).toContain(want);
    }
    expect(got).not.toContain("time.Now");
  });
});
