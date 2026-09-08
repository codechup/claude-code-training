#!/usr/bin/env node
// Changelog drift engine — keeps the course current after every weekly Claude Code
// release at near-zero token cost.
//
//   node scripts/changelog-drift.mjs fetch  [--snapshot <file>] [--json] [--no-npm-check]
//   node scripts/changelog-drift.mjs route  [--pending] [--with-context] [--max N] [--json]
//   node scripts/changelog-drift.mjs report [--markdown|--json]
//
// The whole point is that the DETERMINISTIC part does all of the routing. A model is
// only ever shown bullets that (a) are newer than the ledger pin, (b) are not already
// recorded in the ledger, and (c) actually touch a lesson — with the exact lesson lines
// attached. Token cost is therefore proportional to what changed upstream, never to the
// size of the course.
//
// Sources (both verified by hand before this parser was written):
//   - https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md
//     `## <semver>` headings, plain `- ` bullets.
//   - https://code.claude.com/docs/en/changelog.md
//     the same text wrapped in `<Update label="2.1.265" description="September 8, 2026">`
//     with `* ` bullets. Used only for release DATES (the Playbook changelog page and the
//     staleness check need them).
import { createHash } from 'node:crypto';
import { exec } from 'node:child_process';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import matter from 'gray-matter';

const execAsync = promisify(exec);

export const RAW_CHANGELOG_URL =
  'https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md';
export const DOCS_CHANGELOG_URL = 'https://code.claude.com/docs/en/changelog.md';
export const NPM_PACKAGE = '@anthropic-ai/claude-code';

const REPO_ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
export const LEDGER_PATH = join(REPO_ROOT, 'research', 'changelog', 'reviewed.json');
const DEFAULT_CONTENT_ROOT = join(REPO_ROOT, 'content', 'en');

/** Report thresholds — the schedule goes red past either of these. */
export const MAX_PENDING_AGE_DAYS = 21;
export const MAX_PENDING_ENTRIES = 20;

// ---------------------------------------------------------------------------
// semver
// ---------------------------------------------------------------------------

/**
 * Parse a version string into its numeric core and optional pre-release suffix.
 * THROWS on anything it cannot compare — `latest`, `2.1.x`, a typo. Silently returning
 * NaN here used to disarm three independent safety nets at once (the `newer` filter, the
 * npm cross-check and the content gate's pin assertion), all of which test `> 0`.
 */
export function parseVersion(v) {
  const s = String(v).trim().replace(/^v/, '');
  const m = /^(\d+(?:\.\d+)*)(?:-([0-9A-Za-z.-]+))?$/.exec(s);
  if (!m) throw new Error(`not a comparable version: ${JSON.stringify(String(v))}`);
  return { core: m[1].split('.').map(Number), pre: m[2] ?? null };
}

/** semver pre-release precedence: numeric identifiers < alphanumeric, fewer fields lower. */
function comparePre(a, b) {
  const ia = a.split('.');
  const ib = b.split('.');
  for (let i = 0; i < Math.max(ia.length, ib.length); i++) {
    const x = ia[i];
    const y = ib[i];
    if (x === undefined) return -1;
    if (y === undefined) return 1;
    const nx = /^\d+$/.test(x);
    const ny = /^\d+$/.test(y);
    if (nx && ny) {
      const d = Number(x) - Number(y);
      if (d !== 0) return d;
    } else if (nx !== ny) {
      return nx ? -1 : 1; // numeric identifiers always have lower precedence
    } else if (x !== y) {
      return x < y ? -1 : 1;
    }
  }
  return 0;
}

/** Compare two versions. Returns <0, 0 or >0. Total and loud — never NaN. */
export function compareVersions(a, b) {
  const pa = parseVersion(a);
  const pb = parseVersion(b);
  for (let i = 0; i < Math.max(pa.core.length, pb.core.length); i++) {
    const d = (pa.core[i] ?? 0) - (pb.core[i] ?? 0);
    if (d !== 0) return d;
  }
  if (pa.pre === null && pb.pre === null) return 0;
  if (pa.pre === null) return 1; // 1.0.0 > 1.0.0-rc.1
  if (pb.pre === null) return -1;
  return comparePre(pa.pre, pb.pre);
}

// ---------------------------------------------------------------------------
// parsing
// ---------------------------------------------------------------------------

/**
 * Parse the raw GitHub CHANGELOG.md.
 *
 * Shape: `## <semver>` headings, then plain `- ` bullets. A bullet may wrap onto
 * indented continuation lines, which are folded back into one line.
 *
 * A heading that is not a clean dotted version is returned as a MARKER
 * (`{version: null, raw: '<heading text>'}`) rather than skipped.
 *
 * @returns {{version: string|null, raw?: string, bullets: string[]}[]} newest-first, in file order
 */
export function parseRawChangelog(text) {
  const lines = String(text).split(/\r?\n/);
  const versions = [];
  let current = null;
  for (const line of lines) {
    // Every `## …` heading is captured. One that is not a clean dotted version becomes a
    // {version: null, raw} MARKER rather than being skipped: skipping it used to fold its
    // bullets into the previous section (or drop them) with nothing to notice. fetchDrift
    // refuses to report drift when any marker is present.
    const headingLine = /^##\s+(.*?)\s*$/.exec(line);
    if (headingLine) {
      const v = /^v?(\d+(?:\.\d+)+)$/.exec(headingLine[1]);
      current = v
        ? { version: v[1], bullets: [] }
        : { version: null, raw: headingLine[1], bullets: [] };
      versions.push(current);
      continue;
    }
    if (/^#\s/.test(line)) {
      current = null;
      continue;
    }
    if (!current) continue;
    const bullet = /^[-*]\s+(.*\S)\s*$/.exec(line);
    if (bullet) {
      current.bullets.push(bullet[1]);
      continue;
    }
    const continuation = /^\s+(\S.*)$/.exec(line);
    if (continuation && current.bullets.length > 0) {
      current.bullets[current.bullets.length - 1] += ` ${continuation[1].trim()}`;
    }
  }
  return versions;
}

/**
 * Parse the docs mirror. Same bullets, but wrapped in
 * `<Update label="2.1.265" description="September 8, 2026">` — the only place a
 * release DATE is published.
 *
 * @returns {{version: string, date: string|null, bullets: string[]}[]}
 */
export function parseDocsChangelog(text) {
  const out = [];
  const blockRe = /<Update\s+label="([^"]+)"(?:\s+description="([^"]*)")?\s*>([\s\S]*?)<\/Update>/g;
  let m;
  while ((m = blockRe.exec(String(text))) !== null) {
    const version = m[1].trim().replace(/^v/, '');
    const bullets = [];
    for (const line of m[3].split(/\r?\n/)) {
      const bullet = /^\s*[-*]\s+(.*\S)\s*$/.exec(line);
      if (bullet) bullets.push(bullet[1]);
      else {
        const continuation = /^\s+(\S.*)$/.exec(line);
        if (continuation && bullets.length > 0)
          bullets[bullets.length - 1] += ` ${continuation[1].trim()}`;
      }
    }
    out.push({ version, date: m[2] ? m[2].trim() : null, bullets });
  }
  return out;
}

/**
 * version -> release date string, from the docs mirror.
 * @param {{version: string, date: string|null}[]} docsVersions
 * @returns {Record<string, string>}
 */
export function datesFromDocs(docsVersions) {
  /** @type {Record<string, string>} */
  const map = {};
  for (const v of docsVersions) if (v.date) map[v.version] = v.date;
  return map;
}

// ---------------------------------------------------------------------------
// entry identity + classification
// ---------------------------------------------------------------------------

/**
 * Normalise a bullet for hashing: lowercase, collapse whitespace, drop backticks and
 * trailing punctuation. Stable across upstream reordering and cosmetic re-quoting.
 */
export function normaliseBulletText(text) {
  return String(text)
    .toLowerCase()
    .replace(/[`"'‘’“”]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/[.\s]+$/, '')
    .trim();
}

/** Stable id for a bullet = hash of its normalised text (NOT of its position or version). */
export function entryId(text) {
  return createHash('sha256').update(normaliseBulletText(text)).digest('hex').slice(0, 12);
}

const VERB_WEIGHTS = {
  Removed: 5,
  Reverted: 5, // arguably the highest-severity verb a changelog can carry
  Changed: 4,
  Renamed: 4,
  Deprecated: 4,
  Restored: 4,
  Added: 3,
  Improved: 2,
  Updated: 2,
  Fixed: 1,
  Bug: 1, // "Bug fixes and reliability improvements"
};

/**
 * Content-free release notes. These are classed noise regardless of verb, so one
 * boilerplate line can never occupy a pending slot forever and freeze the pin (and,
 * through the content gate's pin assertion, the whole course).
 */
export const BOILERPLATE = [
  /^bug fixes and reliability improvements\.?$/i,
  /^various (bug )?fixes( and improvements)?\.?$/i,
  /^minor (bug )?fixes( and improvements)?\.?$/i,
  /^(general )?stability (and performance )?improvements\.?$/i,
];

export function isBoilerplate(text) {
  const t = String(text).trim();
  return BOILERPLATE.some((re) => re.test(t));
}

/**
 * Split a bullet into an optional platform prefix and its verb. Upstream writes the
 * prefix two ways — `Windows: Fixed …` and `[VSCode] Fixed …` — and both appear in the
 * live changelog, so both are handled.
 */
export function classifyBullet(text) {
  let rest = String(text);
  let platform = null;

  const bracketed = /^\[([^\]]{1,24})\]\s+(.*)$/.exec(rest);
  if (bracketed) {
    platform = bracketed[1].trim();
    rest = bracketed[2];
  } else {
    const colon = /^([A-Za-z][A-Za-z .]{1,20}?):\s+([A-Za-z]+\b[\s\S]*)$/.exec(rest);
    const colonRaw = colon ? /^([A-Za-z]+)/.exec(colon[2]) : null;
    const colonVerb = colonRaw
      ? colonRaw[1][0].toUpperCase() + colonRaw[1].slice(1).toLowerCase()
      : null;
    if (colonVerb && VERB_WEIGHTS[colonVerb] !== undefined) {
      platform = colon[1].trim();
      rest = colon[2];
    }
  }

  // Case-insensitive: upstream writes `fixed a thing` as often as `Fixed a thing`, and a
  // lowercase verb used to fall through to 'Other' with weight 2.
  const plain = /^([A-Za-z]+)\b/.exec(rest);
  const word = plain ? plain[1] : '';
  const canonical = word ? word[0].toUpperCase() + word.slice(1).toLowerCase() : '';
  const verb = VERB_WEIGHTS[canonical] !== undefined ? canonical : word || 'Other';
  return { verb, platform, weight: VERB_WEIGHTS[verb] ?? 2 };
}

// ---------------------------------------------------------------------------
// lesson index
// ---------------------------------------------------------------------------

const TOKEN_STOPLIST = new Set([
  'true',
  'false',
  'null',
  'undefined',
  'main',
  'bash',
  'sh',
  'json',
  'yaml',
  'yml',
  'node',
  'npm',
  'npx',
  'git',
  'cd',
  'ls',
  'cat',
  'echo',
  'the',
  'and',
  'not',
  'you',
  'your',
  'this',
  'that',
  'with',
  'from',
  'into',
  'when',
  'text',
  'name',
  'type',
  'file',
  'files',
  'code',
  'claude',
  'claude code',
  'string',
  'number',
  'boolean',
  'array',
  'object',
]);

/** Normalise one candidate token. Returns null when it is not worth indexing. */
export function normaliseToken(raw) {
  let t = String(raw).toLowerCase().trim();
  t = t.replace(/^[([{'",]+/, '').replace(/[)\]}'",.;:!?]+$/, '');
  t = t.replace(/\s+/g, ' ');
  if (t.length < 3 || t.length > 60) return null;
  if (TOKEN_STOPLIST.has(t)) return null;
  if (!/[a-z0-9]/.test(t)) return null;
  return t;
}

/**
 * Tokens worth indexing from a body of prose: every inline-backticked span (kept whole,
 * plus its identifier-ish words), and from fenced code blocks the shapes that name a
 * feature — flags, slash commands, env vars, dotted/camel settings keys, tool names.
 */
export function extractTokens(body) {
  const tokens = new Set();
  const add = (raw) => {
    const t = normaliseToken(raw);
    if (t) tokens.add(t);
  };

  const fences = [];
  const withoutFences = String(body).replace(/```[\s\S]*?(?:```|$)/g, (block) => {
    fences.push(block);
    return '\n';
  });

  for (const m of withoutFences.matchAll(/`([^`\n]{2,80})`/g)) {
    const span = m[1];
    add(span);
    if (/\s/.test(span)) {
      for (const word of span.split(/\s+/)) {
        if (/^(--?[a-z]|\/[a-z]|[A-Z]|[a-z][a-z0-9_.-]*[_.\-/][a-z0-9_.-])/.test(word)) add(word);
      }
    }
  }

  for (const block of fences) {
    for (const m of block.matchAll(/--[a-z][a-z0-9-]{2,}/g)) add(m[0]);
    for (const m of block.matchAll(/(?:^|\s)(\/[a-z][a-z0-9-]{2,})/gm)) add(m[1]);
    for (const m of block.matchAll(/\bCLAUDE_[A-Z0-9_]{2,}\b/g)) add(m[0]);
    for (const m of block.matchAll(/"([a-z][a-zA-Z0-9]*[A-Z][a-zA-Z0-9]*)"\s*:/g)) add(m[1]);
    for (const m of block.matchAll(
      /\b(?:Pre|Post|Session|Subagent|User|Notification)[A-Z][a-zA-Z]+\b/g,
    ))
      add(m[0]);
  }

  return tokens;
}

function toPosix(p) {
  return p.split(sep).join('/');
}

async function walk(dir) {
  const out = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (err) {
    if (err && err.code === 'ENOENT') return out;
    throw err;
  }
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(full)));
    else if (e.isFile()) out.push(full);
  }
  return out;
}

/**
 * Load every EN lesson (lang/level/module/NN-slug.mdx). 119 files parse in milliseconds,
 * so the index is rebuilt from scratch on every run and can never be stale.
 */
export async function loadLessons(contentRoot = DEFAULT_CONTENT_ROOT) {
  const files = (await walk(contentRoot)).filter((f) => /[\\/]\d{2}-[^\\/]+\.mdx$/.test(f)).sort();
  const lessons = [];
  for (const abs of files) {
    const raw = await readFile(abs, 'utf8');
    const { data, content } = matter(raw);
    lessons.push({
      path: `content/en/${toPosix(relative(contentRoot, abs))}`,
      title: data.title ?? '',
      tags: Array.isArray(data.tags) ? data.tags.map((t) => String(t).toLowerCase()) : [],
      verified_version: data.verified_version ?? null,
      body: content,
      lines: content.split(/\r?\n/),
      tokens: extractTokens(content),
    });
  }
  return lessons;
}

/**
 * Keyword -> tag fallback, for bullets that carry no backticked identifier at all.
 * Deliberately small and hand-written: it is a router, not a classifier.
 */
export const KEYWORD_TAGS = [
  [/\bhooks?\b|pretooluse|posttooluse|sessionstart|sessionend|subagentstart/i, ['hooks']],
  [/\bskills?\b/i, ['skills']],
  [/\bmcp\b|connectors?\b/i, ['mcp']],
  [/\bplugins?\b|marketplace/i, ['plugins']],
  [/\bsubagents?\b|teammates?\b|agent teams?\b/i, ['subagents', 'agent-teams']],
  [/\bpermissions?\b|allowlist|sandbox|bypasspermissions/i, ['permissions', 'security']],
  [/\bmodels?\b|\bopus\b|\bsonnet\b|\bhaiku\b|\bfable\b|\beffort\b/i, ['models', 'effort']],
  [/\btelemetry\b|otlp|opentelemetry/i, ['telemetry', 'observability']],
  [/checkpoints?|rewind|\bundo\b/i, ['rewind', 'checkpoints']],
  [/worktrees?/i, ['worktrees']],
  [/slash[- ]commands?|\bcommands?\b/i, ['commands']],
  [/\bsettings?\b|managed settings|\bconfig\b/i, ['settings', 'configuration']],
  [/\bmemory\b|claude\.md/i, ['memory', 'claude-md']],
  [/\bcost\b|\busage\b|spend|prompt[- ]cach|\btokens?\b/i, ['cost', 'tokens', 'prompt-caching']],
  [/artifacts?\b/i, ['artifacts']],
  [/\bchrome\b|browsers?\b/i, ['chrome', 'browser']],
  [/remote control|\bmobile\b/i, ['remote-control', 'mobile']],
  [/\bcloud\b|background sessions?|\bbackground\b/i, ['cloud', 'background']],
  [/\bwindows\b|\bmacos\b|\blinux\b|\btmux\b|\bterminal\b/i, ['platforms', 'terminal']],
  [/vs ?code|jetbrains|\bide\b/i, ['ide', 'vs-code', 'jetbrains']],
  [/\bgit\b|commits?\b|pull requests?|\bprs?\b/i, ['git', 'pull-requests']],
  [/github actions?|\bci\b|workflows?\b/i, ['ci', 'github-actions', 'workflows']],
  [/\bsdk\b|headless|stream-json|non-interactive/i, ['agent-sdk', 'headless']],
  [/transcript|fullscreen|\btui\b|status ?line|themes?\b/i, ['tui', 'statusline', 'themes']],
  [/\blogin\b|\boauth\b|\bauth\b|sign[- ]in|tokens? refresh/i, ['oauth', 'auth']],
  [/resum(e|ing)|sessions?\b/i, ['sessions', 'resume']],
  [/plan mode|\bplans?\b/i, ['plans', 'plan-mode']],
  [/schedul|\bcron\b|routines?\b/i, ['scheduling', 'cron', 'routines']],
  [/keyboard shortcuts?|keybindings?/i, ['keybindings']],
];

/**
 * Build the in-memory index. Tokens that appear in more than 40% of the course are
 * dropped as too generic to route anything.
 */
export function buildIndex(lessons) {
  const tokenToLessons = new Map();
  for (const lesson of lessons) {
    for (const t of lesson.tokens) {
      if (!tokenToLessons.has(t)) tokenToLessons.set(t, new Set());
      tokenToLessons.get(t).add(lesson.path);
    }
  }
  const total = lessons.length || 1;
  const maxDf = Math.max(2, Math.floor(total * 0.4));
  for (const [t, set] of tokenToLessons) if (set.size > maxDf) tokenToLessons.delete(t);

  const tagToLessons = new Map();
  for (const lesson of lessons) {
    for (const tag of lesson.tags) {
      if (!tagToLessons.has(tag)) tagToLessons.set(tag, new Set());
      tagToLessons.get(tag).add(lesson.path);
    }
  }

  return {
    total,
    tokenToLessons,
    tagToLessons,
    byPath: new Map(lessons.map((l) => [l.path, l])),
  };
}

/**
 * Identifiers carried by a changelog bullet: every backticked span, PLUS the identifier
 * shapes upstream routinely writes without backticks — `--flags`, `/slash-commands`,
 * `CLAUDE_*` env vars and CamelCase hook names. Those bare shapes are unambiguous enough
 * to route on, and leaving them out was the single biggest silent-miss path in the router
 * (upstream writes hook names and flags bare all the time).
 */
export function bulletTokens(text) {
  const out = new Set();
  const src = String(text);
  for (const m of src.matchAll(/`([^`\n]{2,80})`/g)) {
    const whole = normaliseToken(m[1]);
    if (whole) out.add(whole);
    if (/\s/.test(m[1])) {
      for (const word of m[1].split(/\s+/)) {
        const t = normaliseToken(word);
        if (t) out.add(t);
      }
    }
  }
  const bare = src.replace(/`[^`\n]*`/g, ' ');
  const add = (raw) => {
    const t = normaliseToken(raw);
    if (t) out.add(t);
  };
  for (const m of bare.matchAll(/--[a-z][a-z0-9-]{2,}/g)) add(m[0]);
  for (const m of bare.matchAll(/(?:^|\s)(\/[a-z][a-z0-9-]{2,})/gm)) add(m[1]);
  for (const m of bare.matchAll(/\bCLAUDE_[A-Z0-9_]{2,}\b/g)) add(m[0]);
  for (const m of bare.matchAll(
    /\b(?:Pre|Post|Session|Subagent|User|Notification)[A-Z][a-zA-Z]+\b/g,
  ))
    add(m[0]);
  return out;
}

const MAX_LESSONS_PER_ENTRY = 3;
// A miss is most expensive on a Removed/Reverted/Changed/Renamed/Deprecated bullet, so those
// get a wider slate. The skill forbids the model from opening a lesson the router did not
// name, which makes a truncated lesson permanently unreachable.
const MAX_LESSONS_PER_HEAVY_ENTRY = 5;
const MAX_CONTEXT_LINES = 3;
// A tag carried by more than this share of the course is too generic to rescue a `Fixed`
// bullet with: the fallback only fires for a low-weight bullet when the tag is narrow.
const NARROW_TAG_DF = 0.1;

/**
 * Route one bullet to the lessons it affects. No model involved.
 *
 * 1. backticked identifiers -> token index, scored by inverse document frequency;
 * 2. otherwise keyword -> tag -> lessons carrying that tag;
 * 3. a "Fixed" bullet that matches nothing is `noise` and is never shown to a model.
 */
export function routeBullet(text, index, { withContext = false } = {}) {
  const { verb, platform, weight } = classifyBullet(text);
  const tokens = bulletTokens(text);

  // The tags this bullet's keywords fire, computed up front: they are the tag fallback's
  // input AND a relevance tie-break for token routing.
  const firedTags = new Set();
  const firedRes = [];
  for (const [re, tagList] of KEYWORD_TAGS) {
    if (re.test(text)) {
      firedRes.push(re);
      for (const tag of tagList) firedTags.add(tag);
    }
  }

  const scores = new Map(); // path -> {score, matched:Set, occ:number, tagOverlap:number}
  const bump = (path) => {
    if (!scores.has(path))
      scores.set(path, { score: 0, matched: new Set(), occ: 0, tagOverlap: 0 });
    return scores.get(path);
  };
  for (const t of tokens) {
    const hits = index.tokenToLessons.get(t);
    if (!hits) continue;
    const idf = Math.log(index.total / hits.size) + 0.5;
    for (const path of hits) {
      const s = bump(path);
      s.score += idf;
      s.matched.add(t);
      // How often the lesson actually uses the identifier — a lesson that mentions
      // `--plugin-dir` once in a "flags to re-pass" list is not the lesson that owns it.
      s.occ += occurrences(index.byPath.get(path), t);
    }
  }

  let via = scores.size > 0 ? 'token' : null;

  // The keyword->tag fallback. For a low-weight bullet (`Fixed`, `Bug`) it is not switched
  // off wholesale any more — that dropped real behaviour changes to hook events the course
  // teaches — but it demands a NARROW tag, so a generic "Fixed a crash" still routes nowhere.
  if (scores.size === 0) {
    const narrowOnly = weight <= 1;
    const maxDf = Math.max(1, Math.floor(index.total * NARROW_TAG_DF));
    for (const tag of firedTags) {
      const hits = index.tagToLessons.get(tag);
      if (!hits) continue;
      if (narrowOnly && hits.size > maxDf) continue;
      const idf = Math.log(index.total / hits.size) + 0.5;
      for (const path of hits) {
        const s = bump(path);
        s.score += idf * 0.5; // a tag match is weaker evidence than an identifier match
        s.matched.add(`#${tag}`);
      }
    }
    if (scores.size > 0) via = 'tag';
  }

  // Tag overlap: a lesson whose own frontmatter tags agree with the bullet's keywords is a
  // better route than one that merely happens to contain the same token.
  for (const [path, s] of scores) {
    const lesson = index.byPath.get(path);
    s.tagOverlap = lesson ? lesson.tags.filter((t) => firedTags.has(t)).length : 0;
  }

  const cap = weight >= 4 ? MAX_LESSONS_PER_HEAVY_ENTRY : MAX_LESSONS_PER_ENTRY;
  const all = [...scores.entries()].sort(
    (a, b) =>
      b[1].score - a[1].score ||
      b[1].tagOverlap - a[1].tagOverlap ||
      b[1].occ - a[1].occ ||
      a[0].localeCompare(b[0]),
  );
  const ranked = all.slice(0, cap);
  const truncated = all.length - ranked.length;

  const lessons = ranked.map(([path, s]) => {
    /** @type {{path: string, score: number, matched: string[], context?: {line: number, text: string}[]}} */
    const entry = {
      path,
      score: Number(s.score.toFixed(3)),
      matched: [...s.matched].sort(),
    };
    if (withContext)
      entry.context = contextLines(index.byPath.get(path), entry.matched, { firedRes });
    return entry;
  });

  // Noise follows the weight table, not one hardcoded verb string — and explicit boilerplate
  // ("Bug fixes and reliability improvements") is noise however it is phrased, so it can never
  // sit pending forever and freeze the pin.
  const noise = isBoilerplate(text) || (lessons.length === 0 && weight <= 1);

  return {
    id: entryId(text),
    text,
    verb,
    platform,
    weight,
    via: lessons.length ? via : 'none',
    noise,
    lessons,
    truncated,
    priority: weight * Math.max(lessons.length, noise ? 0 : 1),
  };
}

/** How many times a token occurs in a lesson body (cheap, case-insensitive). */
function occurrences(lesson, token) {
  if (!lesson || !token) return 0;
  const hay = lesson.body.toLowerCase();
  let n = 0;
  let i = hay.indexOf(token);
  while (i !== -1 && n < 50) {
    n++;
    i = hay.indexOf(token, i + token.length);
  }
  return n;
}

/**
 * The exact lesson lines that justify the route — the model's whole context.
 *
 * A tag-routed entry used to get `context: []` (every `#tag` needle was filtered out), which
 * forced the model to open whole lessons to decide anything — 20x the cost of the entire
 * deterministic bundle, paid by the weakest-evidence entries. So a tag route falls back to
 * the lesson's headings plus the lines the firing keyword regexes actually match.
 */
export function contextLines(lesson, matched, { firedRes = [] } = {}) {
  if (!lesson) return [];
  const out = [];
  const push = (i) => {
    if (out.length >= MAX_CONTEXT_LINES) return;
    if (out.some((c) => c.line === i + 1)) return;
    out.push({ line: i + 1, text: lesson.lines[i].trim().slice(0, 240) });
  };
  const needles = matched.filter((m) => !m.startsWith('#')).map((m) => m.toLowerCase());
  if (needles.length > 0) {
    for (let i = 0; i < lesson.lines.length && out.length < MAX_CONTEXT_LINES; i++) {
      if (needles.some((n) => lesson.lines[i].toLowerCase().includes(n))) push(i);
    }
    return out;
  }
  // Tag route: the lines a firing keyword matched, then headings to place them.
  if (firedRes.length > 0) {
    for (let i = 0; i < lesson.lines.length && out.length < MAX_CONTEXT_LINES; i++) {
      const line = lesson.lines[i];
      if (line.trim().length < 8) continue;
      if (firedRes.some((re) => re.test(line))) push(i);
    }
  }
  for (let i = 0; i < lesson.lines.length && out.length < MAX_CONTEXT_LINES; i++) {
    if (/^#{2,3}\s/.test(lesson.lines[i])) push(i);
  }
  return out;
}

// ---------------------------------------------------------------------------
// ledger
// ---------------------------------------------------------------------------

export async function readLedger(path = LEDGER_PATH) {
  const raw = await readFile(path, 'utf8');
  const ledger = JSON.parse(raw);
  if (typeof ledger.pin !== 'string' || !/^\d+(\.\d+)+$/.test(ledger.pin)) {
    throw new Error(`ledger ${path}: "pin" must be a dotted version string`);
  }
  if (!ledger.entries || typeof ledger.entries !== 'object') {
    throw new Error(`ledger ${path}: "entries" must be an object`);
  }
  return ledger;
}

// ---------------------------------------------------------------------------
// fetch
// ---------------------------------------------------------------------------

const HTTP_TIMEOUT_MS = 20_000;
const HTTP_ATTEMPTS = 3;

/**
 * GET with a hard timeout and a small retry. Without the timeout a half-open connection to
 * raw.githubusercontent.com blocked the weekly job until GitHub's 6-hour limit — six hours of
 * runner time, no issue update, and (concurrency: cancel-in-progress false) next week queued
 * behind it. A transient 5xx/429 is retried; a 404 is a hard failure and never retried.
 */
async function get(
  url,
  { attempts = HTTP_ATTEMPTS, sleep = (ms) => new Promise((r) => setTimeout(r, ms)) } = {},
) {
  let lastErr;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { 'user-agent': 'cc.codechup.com changelog-drift' },
        signal: AbortSignal.timeout(HTTP_TIMEOUT_MS),
      });
      if (!res.ok) {
        const err = new Error(`GET ${url} -> HTTP ${res.status}`);
        if (res.status < 500 && res.status !== 429) throw err; // 404 etc: do not retry
        lastErr = err;
      } else {
        return await res.text();
      }
    } catch (err) {
      if (
        err instanceof Error &&
        /-> HTTP [45]\d\d$/.test(err.message) &&
        !/HTTP (5\d\d|429)$/.test(err.message)
      )
        throw err;
      lastErr = err;
    }
    if (attempt < attempts) await sleep(500 * 2 ** (attempt - 1));
  }
  throw lastErr;
}

export async function npmLatestVersion() {
  // NPM_PACKAGE is a module constant, never user input.
  const { stdout } = await execAsync(`npm view ${NPM_PACKAGE} version`);
  return stdout.trim();
}

/**
 * Fetch + parse + assert. Never silently reports zero: if the pin is not among the parsed
 * headings, or no heading parsed at all, the parser is broken and this throws.
 *
 * @param {object} options
 * @param {string} options.pin ledger pin — drift is everything newer than this
 * @param {string|null} [options.rawText] preparsed raw changelog (tests); fetched when absent
 * @param {string|null} [options.docsText] preparsed docs mirror (tests); fetched when absent
 * @param {string|null} [options.npmVersion] npm's published version; looked up when undefined
 * @param {boolean} [options.checkNpm] set false to skip the npm cross-check entirely
 * @param {number|null} [options.minVersions] floor on parsed heading count (ledger "parsedVersionsFloor")
 */
export async function fetchDrift({
  pin,
  rawText = null,
  docsText = null,
  npmVersion = undefined,
  checkNpm = true,
  minVersions = null,
}) {
  const raw = rawText ?? (await get(RAW_CHANGELOG_URL));
  const docs = docsText ?? (await get(DOCS_CHANGELOG_URL));

  const parsed = parseRawChangelog(raw);
  const unrecognised = parsed.filter((v) => v.version === null);
  if (unrecognised.length > 0) {
    throw new Error(
      `parser broke: unrecognised '## …' heading(s) in the upstream CHANGELOG.md — ` +
        `${unrecognised.map((v) => JSON.stringify(v.raw)).join(', ')}. The changelog format ` +
        'changed; fix the parser. Do NOT treat this as "no drift".',
    );
  }
  const versions = parsed.filter((v) => v.version !== null);
  if (versions.length === 0) {
    throw new Error(
      'parser broke: no `## <version>` heading found in the upstream CHANGELOG.md — ' +
        'the format changed. Fix the parser; do NOT treat this as "no drift".',
    );
  }
  const known = new Set(versions.map((v) => v.version));
  if (!known.has(pin)) {
    throw new Error(
      `parser broke: the pinned version ${pin} was not found among ${versions.length} parsed ` +
        'headings. Either the parser is wrong or the pin is not a real release. ' +
        'Refusing to report drift from an unanchored parse.',
    );
  }
  const emptyVersions = versions.filter((v) => v.bullets.length === 0).map((v) => v.version);
  if (emptyVersions.length > versions.length / 2) {
    throw new Error(
      `parser broke: ${emptyVersions.length}/${versions.length} parsed versions have no bullets.`,
    );
  }

  const docsVersions = parseDocsChangelog(docs);
  if (docsVersions.length === 0) {
    throw new Error(
      'parser broke: no `<Update label="…">` block found in the docs changelog mirror.',
    );
  }
  const dates = datesFromDocs(docsVersions);

  const newest = versions
    .map((v) => v.version)
    .reduce((a, b) => (compareVersions(a, b) >= 0 ? a : b));

  // Anchor 2: the newest parsed heading can never be older than the pin. If the top section
  // is lost to a format change, this is what notices — the pin-membership check above cannot,
  // because it says nothing about anything ABOVE the pin, which is the only region that matters.
  if (compareVersions(newest, pin) < 0) {
    throw new Error(
      `parser broke: the newest parsed version ${newest} is older than the ledger pin ${pin}. ` +
        'A section above the pin was lost. Refusing to report drift.',
    );
  }

  // Anchor 3: a floor on how many version headings must parse. A format change usually halves
  // the count; a silent halving is exactly the failure mode this pipeline exists to prevent.
  if (minVersions !== null && versions.length < minVersions) {
    throw new Error(
      `parser broke: only ${versions.length} version headings parsed, below the recorded floor ` +
        `of ${minVersions} (ledger "parsedVersionsFloor"). The changelog format probably changed.`,
    );
  }

  let npm = npmVersion;
  let npmChecked = true;
  if (npm === undefined && checkNpm) {
    try {
      npm = await npmLatestVersion();
    } catch (err) {
      npm = null;
      npmChecked = false;
      // Loud, not buried: in Actions `::warning::` surfaces on the run summary, and the
      // snapshot records npmChecked:false so `report` can say the cross-check was skipped.
      process.stderr.write(
        `::warning::changelog-drift: npm cross-check SKIPPED — could not run ` +
          `\`npm view ${NPM_PACKAGE} version\`: ${err}\n`,
      );
    }
  } else if (npm === undefined) {
    npm = undefined;
    npmChecked = false;
  }
  if (npm && compareVersions(npm, newest) > 0) {
    throw new Error(
      `parser broke (or the changelog is behind): npm publishes ${NPM_PACKAGE}@${npm} but the ` +
        `newest version parsed from the changelog is ${newest}.`,
    );
  }
  // Anchor 4: when npm is reachable it must agree with the newest parsed heading exactly.
  // A lost top section shows up here as "npm is ahead" only if the loss crosses a release;
  // equality catches the rest.
  if (npm && compareVersions(npm, newest) !== 0) {
    process.stderr.write(
      `::warning::changelog-drift: npm publishes ${NPM_PACKAGE}@${npm} but the newest parsed ` +
        `changelog heading is ${newest} — the changelog may lag the release.\n`,
    );
  }

  const newer = versions
    .filter((v) => compareVersions(v.version, pin) > 0)
    .sort((a, b) => compareVersions(b.version, a.version));

  return {
    pin,
    newest,
    npm: npm ?? null,
    npmChecked,
    parsedVersions: versions.length,
    fetchedAt: new Date().toISOString(),
    dates,
    newer,
  };
}

// ---------------------------------------------------------------------------
// route
// ---------------------------------------------------------------------------

export function routeDrift(snapshot, index, ledger, { withContext = false } = {}) {
  const entries = [];
  const seen = new Set();
  for (const version of snapshot.newer) {
    for (const bullet of version.bullets) {
      const routed = routeBullet(bullet, index, { withContext });
      if (seen.has(routed.id)) continue; // same text re-shipped in two releases
      seen.add(routed.id);
      entries.push({
        ...routed,
        version: version.version,
        date: snapshot.dates[version.version] ?? null,
        ledger: ledger.entries[routed.id] ?? null,
      });
    }
  }
  const pending = entries
    .filter((e) => !e.noise && !e.ledger)
    .sort(
      (a, b) =>
        b.priority - a.priority ||
        compareVersions(b.version, a.version) ||
        a.id.localeCompare(b.id),
    );
  return {
    pin: snapshot.pin,
    newest: snapshot.newest,
    npmChecked: snapshot.npmChecked ?? null,
    counts: {
      total: entries.length,
      noise: entries.filter((e) => e.noise).length,
      recorded: entries.filter((e) => e.ledger).length,
      pending: pending.length,
    },
    entries,
    pending,
  };
}

// ---------------------------------------------------------------------------
// report
// ---------------------------------------------------------------------------

function parseReleaseDate(value) {
  if (!value) return null;
  const t = Date.parse(value);
  return Number.isNaN(t) ? null : new Date(t);
}

export function ageInDays(dateString, now = new Date()) {
  const d = parseReleaseDate(dateString);
  if (!d) return null;
  return Math.floor((now.getTime() - d.getTime()) / 86_400_000);
}

function escapeCell(text) {
  // `<`/`>` and backticks are escaped too: a bullet carrying raw HTML used to RENDER as HTML
  // in the issue body, and a stray backtick broke the row's code spans.
  return String(text)
    .replace(/\|/g, '\\|')
    .replace(/\r?\n/g, ' ')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/`/g, '&#96;');
}

/**
 * Hard cap on rendered rows. GitHub refuses an issue body over 65,536 characters, and at the
 * observed ~250 chars/row a neglected backlog would silently stop updating the issue exactly
 * when the table matters most. The threshold failure already communicates the severity.
 */
export const MAX_REPORT_ROWS = 50;

export function renderReport(routed, { now = new Date() } = {}) {
  const reasons = [];
  const ages = routed.pending.map((e) => ageInDays(e.date, now)).filter((a) => a !== null);
  const oldest = ages.length ? Math.max(...ages) : null;

  if (oldest !== null && oldest > MAX_PENDING_AGE_DAYS) {
    reasons.push(
      `the oldest pending entry is ${oldest} days old (limit ${MAX_PENDING_AGE_DAYS} days)`,
    );
  }
  if (routed.pending.length > MAX_PENDING_ENTRIES) {
    reasons.push(`${routed.pending.length} entries are pending (limit ${MAX_PENDING_ENTRIES})`);
  }

  const lines = [];
  lines.push('## Claude Code changelog drift');
  lines.push('');
  lines.push(
    `Ledger pin \`${routed.pin}\` → newest release \`${routed.newest}\`. ` +
      `${routed.counts.total} bullets newer than the pin: ` +
      `**${routed.counts.pending} pending**, ${routed.counts.recorded} already triaged, ` +
      `${routed.counts.noise} classed noise (unrouted \`Fixed\`).`,
  );
  lines.push('');
  lines.push(`Triage with \`/changelog-triage\`. Oldest pending release: ${oldest ?? 'n/a'} days.`);
  if (routed.npmChecked === false) {
    lines.push('');
    lines.push(
      '> :warning: **npm cross-check skipped** — `npm view` failed on this run, so the one ' +
        'assertion that can detect a wholly lost top section did not run.',
    );
  }
  lines.push('');

  if (routed.pending.length === 0) {
    lines.push('Nothing pending. :tada:');
  } else {
    lines.push('| Age | Version | Verb | Entry | Affects | id |');
    lines.push('| --- | ------- | ---- | ----- | ------- | -- |');
    for (const e of routed.pending.slice(0, MAX_REPORT_ROWS)) {
      const age = ageInDays(e.date, now);
      const affects = e.lessons.length
        ? e.lessons.map((l) => `\`${l.path.replace(/^content\/en\//, '')}\``).join('<br>') +
          (e.truncated ? `<br>_+${e.truncated} more matched_` : '')
        : '_(unrouted — needs a human)_';
      lines.push(
        `| ${age === null ? '?' : `${age}d`} | \`${e.version}\` | ${e.verb} | ${escapeCell(
          e.text,
        )} | ${affects} | \`${e.id}\` |`,
      );
    }
    if (routed.pending.length > MAX_REPORT_ROWS) {
      lines.push('');
      lines.push(
        `…and ${routed.pending.length - MAX_REPORT_ROWS} more — run ` +
          '`node scripts/changelog-drift.mjs route --pending` for the full list.',
      );
    }
  }

  lines.push('');
  if (reasons.length) {
    lines.push(`> **Failing:** ${reasons.join('; ')}.`);
  } else {
    lines.push('> Within thresholds.');
  }
  lines.push('');
  lines.push(
    `<sub>Generated by \`scripts/changelog-drift.mjs report\` — ledger \`research/changelog/reviewed.json\`.</sub>`,
  );

  return { markdown: lines.join('\n'), ok: reasons.length === 0, reasons, oldest };
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function flag(argv, name) {
  return argv.includes(`--${name}`);
}

function option(argv, name, fallback = null) {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : fallback;
}

async function loadSnapshot(argv, ledger) {
  const file = option(argv, 'snapshot');
  if (file) {
    // A missing --snapshot file is an ERROR, not a reason to silently fetch: `fetch`, `route`
    // and `report` in the weekly job must all describe the same release set.
    return JSON.parse(await readFile(file, 'utf8'));
  }
  return fetchDrift({
    pin: ledger.pin,
    checkNpm: !flag(argv, 'no-npm-check'),
    minVersions: ledger.parsedVersionsFloor ?? null,
  });
}

async function main(argv) {
  const command = argv[0];
  const ledger = await readLedger(option(argv, 'ledger', LEDGER_PATH));

  if (command === 'fetch') {
    const snapshot = await fetchDrift({
      pin: ledger.pin,
      checkNpm: !flag(argv, 'no-npm-check'),
      minVersions: ledger.parsedVersionsFloor ?? null,
    });
    const out = option(argv, 'snapshot');
    if (out) await writeFile(out, JSON.stringify(snapshot, null, 2));
    if (flag(argv, 'json')) {
      process.stdout.write(`${JSON.stringify(snapshot, null, 2)}\n`);
      return 0;
    }
    process.stdout.write(
      `pin ${snapshot.pin} | newest ${snapshot.newest} | npm ${snapshot.npm ?? 'unchecked'} | ` +
        `${snapshot.parsedVersions} versions parsed\n`,
    );
    if (snapshot.newer.length === 0) {
      process.stdout.write('no releases newer than the pin\n');
      return 0;
    }
    for (const v of snapshot.newer) {
      process.stdout.write(
        `\n## ${v.version}${snapshot.dates[v.version] ? ` (${snapshot.dates[v.version]})` : ''} — ${
          v.bullets.length
        } bullets\n`,
      );
      for (const b of v.bullets) process.stdout.write(`  - ${b}\n`);
    }
    return 0;
  }

  if (command === 'route') {
    const snapshot = await loadSnapshot(argv, ledger);
    const lessons = await loadLessons(option(argv, 'content', DEFAULT_CONTENT_ROOT));
    const index = buildIndex(lessons);
    const withContext = flag(argv, 'with-context');
    const routed = routeDrift(snapshot, index, ledger, { withContext });
    // The 25-entry cap is enforced HERE, not left to the model: a neglected backlog must not be
    // able to dump an unbounded bundle into a prompt.
    const max = Number(option(argv, 'max', '25'));
    const full = flag(argv, 'pending') ? routed.pending : routed.entries;
    const list = Number.isFinite(max) && max > 0 ? full.slice(0, max) : full;
    const omitted = full.length - list.length;

    if (flag(argv, 'json')) {
      process.stdout.write(`${JSON.stringify({ ...routed, entries: list }, null, 2)}\n`);
      return 0;
    }

    process.stdout.write(
      `pin ${routed.pin} -> ${routed.newest} | ${lessons.length} EN lessons indexed, ` +
        `${index.tokenToLessons.size} tokens\n` +
        `total ${routed.counts.total} | pending ${routed.counts.pending} | ` +
        `noise ${routed.counts.noise} | already recorded ${routed.counts.recorded}\n`,
    );
    for (const e of list) {
      process.stdout.write(
        `\n[${e.id}] ${e.version} ${e.verb}${e.noise ? ' (noise)' : ''} via=${e.via} w=${
          e.priority
        }\n  ${e.text}\n`,
      );
      for (const l of e.lessons) {
        process.stdout.write(`  -> ${l.path}  (${l.matched.join(', ')})\n`);
        for (const c of l.context ?? [])
          process.stdout.write(`       ${l.path}:${c.line}: ${c.text}\n`);
      }
      if (!e.lessons.length) process.stdout.write('  -> (no lesson matched)\n');
      // Never truncate silently: the triager must know to look wider than the named lessons.
      if (e.truncated) process.stdout.write(`  -> (+${e.truncated} more lessons also matched)\n`);
    }
    if (omitted > 0) {
      process.stdout.write(`\n(+${omitted} more entries omitted by --max ${max})\n`);
    }
    return 0;
  }

  if (command === 'report') {
    const snapshot = await loadSnapshot(argv, ledger);
    const lessons = await loadLessons(option(argv, 'content', DEFAULT_CONTENT_ROOT));
    const routed = routeDrift(snapshot, buildIndex(lessons), ledger);
    const report = renderReport(routed);
    const out = option(argv, 'out');
    if (out) await writeFile(out, `${report.markdown}\n`);
    process.stdout.write(`${report.markdown}\n`);
    return report.ok ? 0 : 1;
  }

  process.stderr.write(
    'usage: node scripts/changelog-drift.mjs <fetch|route|report> [options]\n' +
      '  fetch  [--snapshot <file>] [--json] [--no-npm-check]\n' +
      '  route  [--snapshot <file>] [--pending] [--with-context] [--json]\n' +
      '  report [--snapshot <file>] [--out <file>]\n',
  );
  return 2;
}

function isDirectRun() {
  const invoked = process.argv[1];
  if (!invoked) return false;
  try {
    return fileURLToPath(import.meta.url) === resolve(invoked);
  } catch {
    return false;
  }
}

if (isDirectRun()) {
  try {
    process.exitCode = await main(process.argv.slice(2));
  } catch (err) {
    process.stderr.write(`changelog-drift: ${err instanceof Error ? err.message : String(err)}\n`);
    process.exitCode = 1;
  }
}
