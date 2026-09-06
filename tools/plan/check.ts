// Plan-set and STATE.md validation rules for the plan CLI (plans/README.md §2.3, §3, §7).

import * as fs from "node:fs";
import {
  type PlanSet,
  type PlanFile,
  FILE_NAME_RE,
  ID_RE,
  MILESTONES,
  STATUSES,
  MODEL_HINTS,
  EFFORT_HINTS,
  ESTIMATES,
  STATUS_TODO,
  isActive,
  isStale,
  isZeroStamp,
  newest,
  getPlan,
  headings,
  overlappingPaths,
  rel,
} from "./plan.ts";
import { renderState } from "./state.ts";

// REQUIRED_SECTIONS are the body headings every plan must carry, in order (plans/README.md §2.3).
export const REQUIRED_SECTIONS: string[] = [
  "Goal",
  "Context",
  "Scope",
  "Deliverables",
  "Acceptance criteria",
  "Steps",
  "Tests required",
  "Non-goals / pitfalls",
  "Verification",
  "Handoff notes",
];

/**
 * check validates the plan set and the freshness of STATE.md. It returns the list of
 * problems found; an empty list means the repository is consistent.
 *
 * Like the renderer, check is clock-free: staleness is measured against the newest
 * `updated_at` in the set so CI produces the same verdict on any day.
 */
export function check(s: PlanSet, statePath: string): string[] {
  const problems: string[] = [];
  const add = (msg: string) => problems.push(msg);

  const ref = newest(s);
  const seen = new Map<string, string>();

  for (const f of s.files) {
    const m = f.meta;
    const name = f.name;

    // id <-> filename <-> branch
    const match = FILE_NAME_RE.exec(name);
    if (!match) continue; // loadSet already filters to matching names
    const wantId = "P" + match[1];
    const slug = match[2];
    if (!ID_RE.test(m.id)) {
      add(`${name}: id "${m.id}" must look like P07`);
    } else if (m.id !== wantId) {
      add(`${name}: id "${m.id}" does not match the file name (want "${wantId}")`);
    }
    const prev = seen.get(m.id);
    if (prev !== undefined) {
      add(`${name}: id "${m.id}" is already used by ${prev}`);
    } else {
      seen.set(m.id, name);
    }
    const wantBranch = `plan/${match[1]}-${slug}`;
    if (m.branch !== wantBranch) {
      add(`${name}: branch "${m.branch}" does not match the file name (want "${wantBranch}")`);
    }

    // scalars
    if (m.title.trim() === "") add(`${name}: title is empty`);
    if (!MILESTONES.includes(m.milestone)) {
      add(`${name}: milestone "${m.milestone}" is not one of ${MILESTONES.join("|")}`);
    }
    if (!STATUSES.includes(m.status)) {
      add(`${name}: status "${m.status}" is not one of ${STATUSES.join("|")}`);
    }
    if (!MODEL_HINTS.includes(m.model_hint)) {
      add(`${name}: model_hint "${m.model_hint}" is not one of ${MODEL_HINTS.join("|")}`);
    }
    if (!EFFORT_HINTS.includes(m.effort_hint)) {
      add(`${name}: effort_hint "${m.effort_hint}" is not one of ${EFFORT_HINTS.join("|")}`);
    }
    if (!ESTIMATES.includes(m.estimate)) {
      add(`${name}: estimate "${m.estimate}" is not one of ${ESTIMATES.join("|")}`);
    }
    if (isZeroStamp(m.updated_at)) {
      add(`${name}: updated_at is missing or not RFC3339 UTC`);
    }
    if (m.owned_paths.length === 0) {
      add(`${name}: owned_paths must not be empty`);
    }
    for (const p of m.owned_paths) {
      if (p.trim() === "") add(`${name}: owned_paths contains an empty entry`);
      if (p.startsWith("/")) add(`${name}: owned_paths entry "${p}" must be repo-relative`);
    }
    if (m.status === STATUS_TODO && m.owner !== null) {
      add(`${name}: status is todo but owner is "${m.owner}"`);
    }
    if (isActive(m) && m.owner === null) {
      add(`${name}: status is ${m.status} but owner is null`);
    }

    // dependencies
    const depSeen = new Set<string>();
    for (const dep of m.depends_on) {
      if (dep === m.id) {
        add(`${name}: depends_on lists itself`);
        continue;
      }
      if (depSeen.has(dep)) {
        add(`${name}: depends_on lists ${dep} twice`);
      }
      depSeen.add(dep);
      const d = getPlan(s, dep);
      if (!d) {
        add(`${name}: depends_on references unknown plan "${dep}"`);
        continue;
      }
      if (isActive(m) && d.meta.status !== "done") {
        add(`${name}: is ${m.status} but dependency ${dep} is ${d.meta.status} (must be done)`);
      }
    }

    // body sections
    const got = headings(f);
    if (got.length !== REQUIRED_SECTIONS.length) {
      add(
        `${name}: body has ${got.length} \`## \` sections, want ${REQUIRED_SECTIONS.length} (${REQUIRED_SECTIONS.join(" → ")})`,
      );
    } else {
      for (let i = 0; i < REQUIRED_SECTIONS.length; i++) {
        if (got[i] !== REQUIRED_SECTIONS[i]) {
          add(`${name}: body section ${i + 1} is "${got[i]}", want "${REQUIRED_SECTIONS[i]}"`);
        }
      }
    }
  }

  // cycles
  for (const cycle of findCycles(s)) {
    add(`dependency cycle: ${cycle.join(" → ")}`);
  }

  // overlap between active plans
  const active: PlanFile[] = s.files.filter((f) => isActive(f.meta) && !isStale(f, ref));
  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const hit = overlappingPaths(active[i], active[j]);
      if (hit) {
        add(`owned_paths overlap: ${active[i].meta.id} "${hit[0]}" and ${active[j].meta.id} "${hit[1]}" are both active`);
      }
    }
  }

  // STATE.md freshness
  const want = renderState(s);
  let raw: string | null = null;
  try {
    raw = fs.readFileSync(statePath, "utf8");
  } catch {
    raw = null;
  }
  if (raw === null) {
    add(`${rel(statePath)} is missing or unreadable; run \`node tools/plan/cli.ts state\``);
  } else if (raw.replace(/\r\n/g, "\n") !== want) {
    add(`${rel(statePath)} is stale; run \`node tools/plan/cli.ts state\` and commit the result`);
  }

  return problems;
}

/**
 * findCycles returns every dependency cycle in the set, each as an id path that starts
 * and ends on the same plan. Results are deterministic (ids visited in sorted order).
 */
export function findCycles(s: PlanSet): string[][] {
  const ids = s.files.map((f) => f.meta.id).sort();

  const WHITE = 0;
  const GREY = 1;
  const BLACK = 2;
  const colour = new Map<string, number>();
  const stack: string[] = [];
  const out: string[][] = [];
  const reported = new Set<string>();

  function visit(id: string): void {
    const f = getPlan(s, id);
    if (!f) return; // unknown dependency is reported separately
    colour.set(id, GREY);
    stack.push(id);
    const deps = [...f.meta.depends_on].sort();
    for (const dep of deps) {
      const c = colour.get(dep) ?? WHITE;
      if (c === WHITE) {
        visit(dep);
      } else if (c === GREY) {
        // Cycle: from the first occurrence of dep on the stack to the end.
        let at = 0;
        for (let i = 0; i < stack.length; i++) {
          if (stack[i] === dep) {
            at = i;
            break;
          }
        }
        const cycle = [...stack.slice(at), dep];
        const key = normaliseCycle(cycle.slice(0, -1)).join(">");
        if (!reported.has(key)) {
          reported.add(key);
          out.push(cycle);
        }
      }
    }
    stack.pop();
    colour.set(id, BLACK);
  }

  for (const id of ids) {
    if ((colour.get(id) ?? WHITE) === WHITE) visit(id);
  }
  return out;
}

/**
 * normaliseCycle rotates a cycle so it starts at its smallest id, making the
 * duplicate-detection key independent of the traversal entry point.
 */
function normaliseCycle(c: string[]): string[] {
  if (c.length === 0) return c;
  let at = 0;
  for (let i = 0; i < c.length; i++) {
    if (c[i] < c[at]) at = i;
  }
  return [...c.slice(at), ...c.slice(0, at)];
}
