import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import {
  parseFile,
  loadSet,
  setFront,
  setStatus,
  clearOwner,
  appendBlocked,
  staticPrefix,
  pathsOverlap,
  isStale,
  claimable,
  resumable,
  claimableSet,
  ownerName,
  newest,
  headings,
  STALE_AFTER_MS,
  STATUS_IN_PROGRESS,
} from "./plan.ts";
import { REQUIRED_SECTIONS } from "./check.ts";

const FIXTURE_DIR = path.join(import.meta.dirname, "testdata", "plans");

function loadFixtures() {
  return loadSet(FIXTURE_DIR);
}

describe("parseFile", () => {
  it("keeps frontmatter and body verbatim", () => {
    const p = path.join(FIXTURE_DIR, "P04-blocked.md");
    const f = parseFile(p);
    const raw = fs.readFileSync(p, "utf8").replace(/\r\n/g, "\n");
    expect("---\n" + f.front.join("\n") + "\n---\n" + f.body).toBe(raw);
    expect(f.meta.id).toBe("P04");
    expect(f.meta.status).toBe("blocked");
    expect(f.meta.milestone).toBe("M1");
    expect(ownerName(f.meta)).toBe("bravo-2026-08-20");
    expect(f.meta.open_questions).toHaveLength(2);
    expect(f.meta.updated_at.toISOString().replace(/\.\d{3}Z$/, "Z")).toBe("2026-08-20T00:00:00Z");
  });

  it("keeps a null owner as null", () => {
    const f = parseFile(path.join(FIXTURE_DIR, "P07-ready.md"));
    expect(f.meta.owner).toBeNull();
    expect(ownerName(f.meta)).toBe("—");
    expect(f.meta.title).toBe("Ready to claim | with a pipe in the title");
  });

  it("rejects malformed frontmatter", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "plan-test-"));
    const cases: Record<string, string> = {
      no_fence: "id: P09\n---\nbody\n",
      unclosed_fence: "---\nid: P09\nbody\n",
      bad_timestamp: "---\nid: P09\nupdated_at: yesterday\n---\nbody\n",
      non_utc: "---\nid: P09\nupdated_at: 2026-08-20T00:00:00+03:00\n---\nbody\n",
    };
    for (const [name, content] of Object.entries(cases)) {
      const p = path.join(dir, `${name}.md`);
      fs.writeFileSync(p, content, "utf8");
      expect(() => parseFile(p), name).toThrow();
    }
  });
});

describe("loadSet", () => {
  it("ignores non-plan files and fails when empty", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "plan-test-"));
    for (const name of ["README.md", "ROADMAP.md", "P1-short.md", "notes.txt"]) {
      fs.writeFileSync(path.join(dir, name), "---\nid: X\n---\n", "utf8");
    }
    expect(() => loadSet(dir)).toThrow(/no plan files found/);
  });
});

describe("setFront / setStatus / clearOwner", () => {
  it("edits exactly the touched frontmatter lines", () => {
    const f = parseFile(path.join(FIXTURE_DIR, "P07-ready.md"));
    const before = "---\n" + f.front.join("\n") + "\n---\n" + f.body;
    const now = new Date("2026-08-21T09:30:00Z");
    setStatus(f, STATUS_IN_PROGRESS, "tester", now);
    const after = "---\n" + f.front.join("\n") + "\n---\n" + f.body;

    const b = before.split("\n");
    const a = after.split("\n");
    expect(a.length).toBe(b.length);
    const changed = a.filter((line, i) => line !== b[i]);
    expect(changed).toEqual(["status: in_progress", "owner: tester", "updated_at: 2026-08-21T09:30:00Z"]);

    expect(() => setFront(f, "nope", "x")).toThrow();
    clearOwner(f);
    expect(f.meta.owner).toBeNull();
    expect(f.front.join("\n")).toContain("owner: null");
  });
});

describe("appendBlocked", () => {
  it("writes under Handoff notes, newest last", () => {
    const f = parseFile(path.join(FIXTURE_DIR, "P07-ready.md"));
    const now = new Date("2026-08-21T09:30:00Z");
    appendBlocked(f, "  ADMIN_TOKEN is missing  ", now);
    expect(f.body).toContain("- Blocked (2026-08-21): ADMIN_TOKEN is missing");
    const idx = f.body.indexOf("## Handoff notes");
    const notes = f.body.slice(idx);
    expect(notes).toContain("- Blocked (2026-08-21): ADMIN_TOKEN is missing");

    appendBlocked(f, "still missing", new Date(now.getTime() + 24 * 60 * 60 * 1000));
    const lines = f.body.split("\n").filter((l) => l.trim().startsWith("- Blocked ("));
    expect(lines[lines.length - 1]).toBe("- Blocked (2026-08-22): still missing");

    f.body = "## Goal\n\nnothing\n";
    expect(() => appendBlocked(f, "x", now)).toThrow();
  });
});

describe("staticPrefix / pathsOverlap", () => {
  const cases: Array<[string, string, boolean]> = [
    // The two cases named in plans/README.md §3.
    ["src/lib/match/**", "src/lib/matchmaking/**", false],
    ["src/lib/store/**", "src/lib/store/sqlite/**", true],
    ["src/lib/match/**", "src/lib/match/runtime_test.ts", true],
    // Identical and self-overlap.
    ["package.json", "package.json", true],
    ["src/app/**", "src/app/**", true],
    // Sibling files and directories never overlap.
    ["package.json", "package-lock.json", false],
    ["src/ui/Button/**", "src/ui/Card/**", false],
    ["docs/design/CANVAS.md", "docs/design/DESIGN.md", false],
    // Prefix of a *name*, not of a *path segment*, is not an overlap.
    ["src/lib/store/**", "src/lib/storefront/**", false],
    ["src/styles/app.css", "src/styles/apple.css", false],
    // A file inside a claimed tree overlaps it.
    ["tools/plan/**", "tools/plan/cli.ts", true],
    ["content/en/l1/**", "content/en/**", true],
    // Trailing slashes and bare directories normalise.
    ["src/lib/ws/", "src/lib/ws/protocol/**", true],
    // A bare wildcard claims everything.
    ["**", "package.json", true],
    ["*", "src/main.ts", true],
  ];

  it("matches the documented overlap rule, symmetrically", () => {
    for (const [a, b, want] of cases) {
      expect(pathsOverlap(a, b), `${a} vs ${b}`).toBe(want);
      expect(pathsOverlap(b, a), `${b} vs ${a} (symmetry)`).toBe(want);
    }
  });

  it("computes the static prefix", () => {
    const cases: Record<string, string> = {
      "src/lib/match/**": "src/lib/match",
      "package.json": "package.json",
      "src/ui/Button/**": "src/ui/Button",
      "scripts/ci/**": "scripts/ci",
      "content/*/l1/**": "content",
      "src/lib/ws/": "src/lib/ws",
      "**": "",
    };
    for (const [glob, want] of Object.entries(cases)) {
      expect(staticPrefix(glob)).toBe(want);
    }
  });
});

describe("isStale", () => {
  it("uses the newest updated_at as the clock-free reference", () => {
    const s = loadFixtures();
    const ref = newest(s);
    expect(ref.toISOString()).toBe(new Date("2026-08-20T00:00:00Z").toISOString());

    const cases: Record<string, boolean> = {
      P00: false, // done
      P01: false, // review — never stale
      P02: false, // claimed 12 h before ref
      P03: true, // claimed 19 days before ref
      P04: false, // blocked — never stale
      P07: false, // todo — never stale
    };
    for (const [id, want] of Object.entries(cases)) {
      const f = s.byId.get(id)!;
      expect(isStale(f, ref), id).toBe(want);
    }

    const f = s.byId.get("P02")!;
    const edge = new Date(f.meta.updated_at.getTime() + STALE_AFTER_MS);
    expect(isStale(f, edge)).toBe(false);
    expect(isStale(f, new Date(edge.getTime() + 1000))).toBe(true);
  });
});

describe("claimability", () => {
  it("computes the claimable set", () => {
    const s = loadFixtures();
    const ref = newest(s);
    const got = claimableSet(s, ref).map((f) => f.meta.id);
    expect(got).toEqual(["P03", "P07"]);
  });

  it("gives a reason for every non-claimable plan", () => {
    const s = loadFixtures();
    const ref = newest(s);
    const cases: Record<string, string> = {
      P00: "status is done",
      P01: "status is review",
      P02: "claimed by fresh-2026-08-19",
      P04: "status is blocked",
      P05: "depends on P01 (review)",
      P06: "overlaps",
    };
    for (const [id, want] of Object.entries(cases)) {
      const f = s.byId.get(id)!;
      const { ok, reason } = claimable(s, f, ref);
      expect(ok, id).toBe(false);
      expect(reason, id).toContain(want);
    }
    // Blocked plans are resumable even though they are not part of the wave.
    const p04 = s.byId.get("P04")!;
    expect(resumable(s, p04, ref).ok).toBe(true);
  });

  it("rejects an unknown dependency", () => {
    const s = loadFixtures();
    const f = s.byId.get("P07")!;
    f.meta.depends_on = ["P99"];
    const { ok, reason } = claimable(s, f, newest(s));
    expect(ok).toBe(false);
    expect(reason).toContain("P99");
  });
});

describe("body sections", () => {
  it("match the required section order in the P04 fixture", () => {
    const f = parseFile(path.join(FIXTURE_DIR, "P04-blocked.md"));
    expect(headings(f)).toEqual(REQUIRED_SECTIONS);
  });
});
