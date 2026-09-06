// Plan-file model: parsing, rendering, claim/status mutation, and the claimability
// and overlap rules (plans/README.md §3). See plans/README.md for the full contract
// this module implements.

import * as fs from "node:fs";
import * as path from "node:path";
import { parse as parseYaml } from "yaml";

// StaleAfter is how long an unrefreshed `in_progress` claim stays valid (plans/README.md §3).
export const STALE_AFTER_MS = 24 * 60 * 60 * 1000;

// Statuses in lifecycle order (plans/README.md §3).
export const STATUS_TODO = "todo";
export const STATUS_IN_PROGRESS = "in_progress";
export const STATUS_BLOCKED = "blocked";
export const STATUS_REVIEW = "review";
export const STATUS_DONE = "done";

// STATUSES lists every legal status value.
export const STATUSES: string[] = [
  STATUS_TODO,
  STATUS_IN_PROGRESS,
  STATUS_BLOCKED,
  STATUS_REVIEW,
  STATUS_DONE,
];

// MILESTONES lists every legal milestone value, in canonical order.
export const MILESTONES: string[] = ["M0", "M1", "M2", "M3", "M4"];

// MODEL_HINTS, EFFORT_HINTS and ESTIMATES list the legal hint values (plans/README.md §9).
export const MODEL_HINTS: string[] = ["haiku", "sonnet", "opus", "fable"];
export const EFFORT_HINTS: string[] = ["low", "medium", "high", "xhigh", "max"];
export const ESTIMATES: string[] = ["S", "M", "L"];

export const FILE_NAME_RE = /^P(\d{2})-([a-z0-9]+(?:-[a-z0-9]+)*)\.md$/;
export const ID_RE = /^P\d{2}$/;

const STAMP_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;

/** formatStamp renders a Date back to RFC3339 UTC without fractional seconds. */
export function formatStamp(d: Date): string {
  return d.toISOString().replace(/\.\d{3}Z$/, "Z");
}

/** isZeroStamp reports whether a stamp is the "missing" sentinel (Go zero-value analogue). */
export function isZeroStamp(d: Date): boolean {
  return d.getTime() === 0;
}

/**
 * parseStamp parses the raw YAML scalar for `updated_at`: it must be RFC3339 and must
 * end in `Z` (UTC). `raw === undefined` (the key is absent) yields the zero-stamp
 * sentinel rather than an error — `check()` flags that case as "missing or not RFC3339
 * UTC".
 */
export function parseStamp(raw: unknown, name: string): Date {
  if (raw === undefined) return new Date(0);
  let str: string;
  if (raw instanceof Date) {
    str = raw.toISOString().replace(/\.\d{3}Z$/, "Z");
  } else if (typeof raw === "string") {
    str = raw;
  } else {
    throw new Error(`${name}: frontmatter: updated_at: not RFC3339: ${JSON.stringify(raw)}`);
  }
  const trimmed = str.trim().replace(/^['"]+/, "").replace(/['"]+$/, "");
  if (!trimmed.endsWith("Z")) {
    throw new Error(`${name}: frontmatter: updated_at: not UTC (must end in Z): ${JSON.stringify(trimmed)}`);
  }
  if (!STAMP_RE.test(trimmed) || Number.isNaN(Date.parse(trimmed))) {
    throw new Error(`${name}: frontmatter: updated_at: not RFC3339: ${JSON.stringify(trimmed)}`);
  }
  return new Date(trimmed);
}

// Meta is the YAML frontmatter of a plan file (plans/README.md §2.2).
export interface Meta {
  id: string;
  title: string;
  milestone: string;
  status: string;
  owner: string | null;
  branch: string;
  model_hint: string;
  effort_hint: string;
  depends_on: string[];
  owned_paths: string[];
  shared_paths: string[];
  estimate: string;
  updated_at: Date;
  open_questions: string[];
}

/** ownerName returns the owner or "—" when unclaimed. */
export function ownerName(m: Meta): string {
  if (m.owner === null || m.owner.trim() === "") return "—";
  return m.owner;
}

/** isActive reports whether the plan holds a claim on its owned paths. */
export function isActive(m: Meta): boolean {
  return m.status === STATUS_IN_PROGRESS || m.status === STATUS_REVIEW;
}

// PlanFile is one parsed plan file: frontmatter lines kept verbatim so edits stay
// surgical, body kept verbatim except for the `AppendBlocked` mutation.
export interface PlanFile {
  path: string; // path as given (used for reads and writes)
  name: string; // base name
  front: string[]; // frontmatter lines, without the `---` fences
  body: string; // everything after the closing fence, verbatim
  meta: Meta;
}

function str(v: unknown): string {
  return v === null || v === undefined ? "" : String(v);
}

function strArr(v: unknown): string[] {
  return Array.isArray(v) ? v.map((x) => String(x)) : [];
}

function toMeta(obj: Record<string, unknown>, name: string): Meta {
  const owner = obj.owner === null || obj.owner === undefined ? null : str(obj.owner);
  return {
    id: str(obj.id),
    title: str(obj.title),
    milestone: str(obj.milestone),
    status: str(obj.status),
    owner,
    branch: str(obj.branch),
    model_hint: str(obj.model_hint),
    effort_hint: str(obj.effort_hint),
    depends_on: strArr(obj.depends_on),
    owned_paths: strArr(obj.owned_paths),
    shared_paths: strArr(obj.shared_paths),
    estimate: str(obj.estimate),
    updated_at: parseStamp(obj.updated_at, name),
    open_questions: strArr(obj.open_questions),
  };
}

/** parseFile reads and parses one plan file. */
export function parseFile(filePath: string): PlanFile {
  const raw = fs.readFileSync(filePath, "utf8");
  const s = raw.replace(/\r\n/g, "\n");
  const name = path.basename(filePath);
  const fenceOpen = "---\n";
  const fenceClose = "\n---\n";
  if (!s.startsWith(fenceOpen)) {
    throw new Error(`${name}: file must start with a \`---\` frontmatter fence`);
  }
  const rest = s.slice(fenceOpen.length);
  const i = rest.indexOf(fenceClose);
  if (i < 0) {
    throw new Error(`${name}: frontmatter is not closed by a \`---\` line`);
  }
  const front = rest.slice(0, i);
  const body = rest.slice(i + fenceClose.length);

  let obj: unknown;
  try {
    obj = parseYaml(front);
  } catch (e) {
    throw new Error(`${name}: frontmatter: ${(e as Error).message}`);
  }
  const meta = toMeta((obj ?? {}) as Record<string, unknown>, name);

  return { path: filePath, name, front: front.split("\n"), body, meta };
}

/** renderFile reconstructs the file content byte-for-byte from front and body. */
export function renderFile(f: PlanFile): string {
  return "---\n" + f.front.join("\n") + "\n---\n" + f.body;
}

/** saveFile writes the file back to disk with LF line endings. */
export function saveFile(f: PlanFile): void {
  fs.writeFileSync(f.path, renderFile(f), "utf8");
}

/**
 * setFront replaces the value of a top-level frontmatter scalar key, leaving every
 * other line (order, comments, list formatting) untouched.
 */
export function setFront(f: PlanFile, key: string, value: string): void {
  const prefix = key + ":";
  for (let i = 0; i < f.front.length; i++) {
    if (f.front[i].startsWith(prefix)) {
      f.front[i] = `${key}: ${value}`;
      return;
    }
  }
  throw new Error(`${f.name}: frontmatter has no "${key}" key`);
}

/** setStatus performs the status/owner/updated_at edit of a claim or status change. */
export function setStatus(f: PlanFile, status: string, owner: string | null, now: Date): void {
  setFront(f, "status", status);
  if (owner !== null) {
    setFront(f, "owner", owner);
    f.meta.owner = owner;
  }
  setFront(f, "updated_at", formatStamp(now));
  f.meta.status = status;
  f.meta.updated_at = now;
}

/** clearOwner sets the owner back to null. */
export function clearOwner(f: PlanFile): void {
  setFront(f, "owner", "null");
  f.meta.owner = null;
}

/** appendBlocked appends `- Blocked (YYYY-MM-DD): reason` at the end of the Handoff notes section. */
export function appendBlocked(f: PlanFile, reason: string, now: Date): void {
  const heading = "## Handoff notes";
  const lines = f.body.split("\n");
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === heading) {
      start = i;
      break;
    }
  }
  if (start < 0) {
    throw new Error(`${f.name}: body has no "${heading}" section`);
  }
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (lines[i].startsWith("## ")) {
      end = i;
      break;
    }
  }
  // Trim trailing blank lines of the section, then append the entry.
  let insert = end;
  while (insert > start + 1 && lines[insert - 1].trim() === "") insert--;
  const dateStr = now.toISOString().slice(0, 10);
  const entry = `- Blocked (${dateStr}): ${reason.trim()}`;
  const out = [...lines.slice(0, insert), entry, ...lines.slice(insert)];
  f.body = out.join("\n");
}

/** headings returns the `## ` section headings of the body, in order. */
export function headings(f: PlanFile): string[] {
  const out: string[] = [];
  for (const l of f.body.split("\n")) {
    if (l.startsWith("## ")) out.push(l.slice(3).trim());
  }
  return out;
}

/** blockedReason returns the newest `- Blocked (...)` line from the Handoff notes, or "". */
export function blockedReason(f: PlanFile): string {
  let last = "";
  for (const l of f.body.split("\n")) {
    const t = l.trim();
    if (t.startsWith("- Blocked (")) last = t.slice(2);
  }
  return last;
}

// PlanSet is every plan file in a plans directory, sorted by id.
export interface PlanSet {
  files: PlanFile[];
  byId: Map<string, PlanFile>;
}

/** loadSet parses every plans/PNN-*.md file in dir. */
export function loadSet(dir: string): PlanSet {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: PlanFile[] = [];
  for (const e of entries) {
    if (e.isDirectory() || !FILE_NAME_RE.test(e.name)) continue;
    files.push(parseFile(path.join(dir, e.name)));
  }
  if (files.length === 0) {
    throw new Error(`no plan files found in ${dir}`);
  }
  files.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  const byId = new Map<string, PlanFile>();
  for (const f of files) {
    if (!byId.has(f.meta.id)) byId.set(f.meta.id, f);
  }
  return { files, byId };
}

/** getPlan returns the plan with the given id. */
export function getPlan(s: PlanSet, id: string): PlanFile | undefined {
  return s.byId.get(id);
}

/**
 * newest returns the largest updated_at in the set. It is the clock-free reference
 * point used by the deterministic renderer and by `check` for the staleness rule.
 */
export function newest(s: PlanSet): Date {
  let out = new Date(0);
  for (const f of s.files) {
    if (f.meta.updated_at.getTime() > out.getTime()) out = f.meta.updated_at;
  }
  return out;
}

/** isStale reports whether f holds a claim that expired relative to ref. */
export function isStale(f: PlanFile, ref: Date): boolean {
  if (f.meta.status !== STATUS_IN_PROGRESS) return false;
  return ref.getTime() - f.meta.updated_at.getTime() > STALE_AFTER_MS;
}

/**
 * staticPrefix returns the part of a glob before its first wildcard — the unit the
 * overlap rule compares (plans/README.md §3).
 */
export function staticPrefix(glob: string): string {
  const g = glob.trim();
  const m = g.search(/[*?[]/);
  const prefix = m >= 0 ? g.slice(0, m) : g;
  return prefix.endsWith("/") ? prefix.slice(0, -1) : prefix;
}

/**
 * pathsOverlap reports whether two path globs claim overlapping territory: true when
 * the static prefix of one is a path-prefix of the other.
 *
 *   src/lib/match/**   vs src/lib/matchmaking/**        -> false
 *   src/lib/store/**   vs src/lib/store/sqlite/**        -> true
 *   src/lib/match/**   vs src/lib/match/runtime_test.ts -> true
 */
export function pathsOverlap(a: string, b: string): boolean {
  const pa = staticPrefix(a);
  const pb = staticPrefix(b);
  if (pa === "" || pb === "") return true; // a bare wildcard claims everything
  return pa === pb || pa.startsWith(pb + "/") || pb.startsWith(pa + "/");
}

/** overlappingPaths returns the first pair of overlapping globs between two plans, if any. */
export function overlappingPaths(a: PlanFile, b: PlanFile): [string, string] | null {
  for (const x of a.meta.owned_paths) {
    for (const y of b.meta.owned_paths) {
      if (pathsOverlap(x, y)) return [x, y];
    }
  }
  return null;
}

export interface ClaimResult {
  ok: boolean;
  reason: string;
}

function claimableInternal(s: PlanSet, f: PlanFile, ref: Date, allowBlocked: boolean): ClaimResult {
  switch (f.meta.status) {
    case STATUS_TODO:
      break;
    case STATUS_BLOCKED:
      if (!allowBlocked) {
        return { ok: false, reason: "status is blocked — read the Handoff notes, then claim it explicitly" };
      }
      break;
    case STATUS_IN_PROGRESS:
      if (!isStale(f, ref)) {
        return { ok: false, reason: `claimed by ${ownerName(f.meta)} since ${formatStamp(f.meta.updated_at)}` };
      }
      break;
    default:
      return { ok: false, reason: "status is " + f.meta.status };
  }
  for (const dep of f.meta.depends_on) {
    const d = getPlan(s, dep);
    if (!d) return { ok: false, reason: "depends on unknown plan " + dep };
    if (d.meta.status !== STATUS_DONE) {
      return { ok: false, reason: `depends on ${dep} (${d.meta.status})` };
    }
  }
  for (const other of s.files) {
    if (other === f || !isActive(other.meta) || isStale(other, ref)) continue;
    const hit = overlappingPaths(f, other);
    if (hit) {
      return {
        ok: false,
        reason: `owned path ${hit[0]} overlaps ${hit[1]} of ${other.meta.id} (${other.meta.status})`,
      };
    }
  }
  return { ok: true, reason: "" };
}

/**
 * claimable reports why a plan cannot be claimed relative to ref, or ok when it can.
 * A plan is claimable when it is `todo` (or a stale `in_progress`), every dependency is
 * `done`, and none of its owned paths overlaps an active, non-stale plan
 * (plans/README.md §3).
 */
export function claimable(s: PlanSet, f: PlanFile, ref: Date): ClaimResult {
  return claimableInternal(s, f, ref, false);
}

/**
 * resumable is claimable widened to `blocked` plans: the lifecycle allows
 * blocked -> in_progress for the same or a new owner, but blocked plans are not
 * advertised as part of the current wave.
 */
export function resumable(s: PlanSet, f: PlanFile, ref: Date): ClaimResult {
  return claimableInternal(s, f, ref, true);
}

/** claimableSet returns every claimable plan, sorted by id (set order is already id order). */
export function claimableSet(s: PlanSet, ref: Date): PlanFile[] {
  return s.files.filter((f) => claimable(s, f, ref).ok);
}

/** byStatus returns the plans with the given status, in id order. */
export function byStatus(s: PlanSet, status: string): PlanFile[] {
  return s.files.filter((f) => f.meta.status === status);
}

/**
 * milestoneOrder returns the milestones present in the set, in canonical order,
 * with any unknown milestone appended alphabetically.
 */
export function milestoneOrder(s: PlanSet): string[] {
  const seen = new Set<string>();
  for (const f of s.files) seen.add(f.meta.milestone);
  const out: string[] = [];
  for (const m of MILESTONES) {
    if (seen.has(m)) {
      out.push(m);
      seen.delete(m);
    }
  }
  const extra = [...seen].sort();
  return [...out, ...extra];
}

/** rel renders a path relative to the working directory with forward slashes. */
export function rel(p: string): string {
  try {
    const r = path.relative(process.cwd(), p);
    return r.split(path.sep).join("/");
  } catch {
    return p.split(path.sep).join("/");
  }
}

/** repoRoot walks up from the working directory until it finds package.json. */
export function repoRoot(): string {
  let dir = process.cwd();
  for (;;) {
    if (fs.existsSync(path.join(dir, "package.json"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) {
      throw new Error("not inside the repository (no package.json found above the working directory)");
    }
    dir = parent;
  }
}
