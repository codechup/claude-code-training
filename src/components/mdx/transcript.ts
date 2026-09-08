// `Transcript.astro`'s file-loading, parsing and MARKUP-BUILDING logic,
// split into a plain module so it (a) runs under this repo's plain-Vitest
// config (no Astro Vite plugin — `.astro` files can't be imported from a
// `.test.ts`) and (b) can be unit-tested without a real Astro build.
//
// D070/D093 (folded into D019): a transcript is a real, previously
// captured Claude Code session, never fabricated. This module makes that
// structural, not just a convention: `loadTranscript` only ever reads a
// file whose path starts with one of `ALLOWED_PREFIXES` — there is no
// "root" or "base" option an author could widen — and throws (not returns
// null / not an empty block) when the file does not exist, so a typo'd
// path fails the build loudly instead of silently rendering nothing.
//
// KILN §8.11.1 — WHY THE HTML IS BUILT HERE AS A STRING.
// The previous component emitted each line's markup across several source
// lines inside a `.map()` in `Transcript.astro`. Astro/JSX preserves the
// literal newlines and 8–12 spaces of source indentation between sibling
// elements as real text nodes, and three false `{cond && …}` branches
// added three more. Inside a `<pre>` every one of those is a rendered
// character, so one recorded line became ~7 physical lines and a 20-line
// recording rendered over 2000 px tall. Building the whole body as one
// escaped string and handing it to `set:html` removes the class of bug
// entirely: there is no source whitespace between elements to leak,
// because there is no source markup at all.
//
// KILN §8.11.5 — a malformed `range` must FAIL THE BUILD. It used to
// silently fall back to the whole file, which quietly re-introduced the
// provenance header line callers deliberately skip.
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

/**
 * Every transcript must live under one of these two prefixes (relative to
 * the repo root):
 *  - `content/_shared/transcripts/`  — real, captured lab sessions (D099).
 *  - `src/components/mdx/__fixtures__/transcripts/` — synthetic,
 *    clearly-labelled formatting samples for this component's own tests
 *    and the `/design/` gallery entry (never presented as a real lesson's
 *    evidence — see `__fixtures__/transcripts/sample-session.txt`'s own
 *    first line).
 */
export const ALLOWED_PREFIXES = [
  'content/_shared/transcripts/',
  'src/components/mdx/__fixtures__/transcripts/',
] as const;

export type TranscriptRole = 'prompt' | 'tool' | 'result-ok' | 'result-fail' | 'meta' | 'text';

export interface TranscriptLine {
  role: TranscriptRole;
  /** Text with the role marker (`›`, `⏺`, `✓`, `✗`) stripped. */
  text: string;
}

/** A run of one line's text, tagged with how it should be coloured. */
export interface TranscriptSegment {
  kind: 'plain' | 'path';
  text: string;
}

export class TranscriptPathError extends Error {}
export class TranscriptRangeError extends Error {}

/** Number of lines shown before a recording collapses behind `<details>` (KILN §8.1). */
export const COLLAPSE_AFTER = 24;

/** The visible glyph that opens a line of each role. `''` = no marker. */
export const ROLE_GLYPH: Record<TranscriptRole, string> = {
  prompt: '›',
  tool: '⏺',
  'result-ok': '✓',
  'result-fail': '✗',
  meta: '',
  text: '',
};

/**
 * Screen-reader-only prefix per role. State is never carried by colour
 * alone: the glyph is the visual signal, this is the assistive one.
 */
export const ROLE_LABEL: Record<TranscriptRole, string> = {
  prompt: 'prompt',
  tool: 'tool call',
  'result-ok': 'succeeded',
  'result-fail': 'failed',
  meta: 'about this recording',
  text: '',
};

/**
 * Validate `relPath` (repo-root-relative, e.g.
 * `content/_shared/transcripts/m07-hooks/guard-bash.txt`) and resolve it
 * to an absolute path. Throws `TranscriptPathError` — never returns a
 * fallback — for anything outside the allowlist or containing a `..`
 * traversal segment, so a lesson author can never point `<Transcript>` at
 * an arbitrary file and pass off inline prose as a "captured session".
 */
export function resolveTranscriptPath(relPath: string, cwd: string = process.cwd()): string {
  const normalized = relPath.replace(/\\/g, '/');
  if (normalized.split('/').includes('..')) {
    throw new TranscriptPathError(`Transcript path must not contain "..": "${relPath}"`);
  }
  const allowed = ALLOWED_PREFIXES.some((prefix) => normalized.startsWith(prefix));
  if (!allowed) {
    throw new TranscriptPathError(
      `Transcript path "${relPath}" is not under an allowed directory ` +
        `(${ALLOWED_PREFIXES.join(', ')}). A <Transcript> must reference a real, ` +
        `captured session file — never an inline/freeform prop (D070/D093).`,
    );
  }
  return resolve(join(cwd, normalized));
}

/**
 * Parse a raw transcript file's text into role-tagged lines.
 *
 *   `› prompt text`   -> prompt   (the reader's/author's input; `$ ` and
 *                                  `> ` at the start of a line count too)
 *   `⏺ tool text`     -> tool     (a tool call; `•` counts too)
 *   `✓ result text`   -> result-ok
 *   `✗ result text`   -> result-fail (as does a line opening `Error`/`FAIL`)
 *   a leading `#` on line 1 -> meta (the capture-provenance header every
 *                                  recording carries; callers usually skip
 *                                  it with `range`, and when they do not it
 *                                  renders dimmed rather than as output)
 *   anything else     -> text
 *
 * A single trailing blank line (a file ending in a newline) is dropped;
 * blank lines elsewhere are kept as empty `text` lines (real spacing in
 * the captured session).
 */
export function parseTranscript(raw: string): TranscriptLine[] {
  const rawLines = raw.replace(/\r\n/g, '\n').split('\n');
  if (rawLines.length > 0 && rawLines[rawLines.length - 1] === '') rawLines.pop();

  return rawLines.map((line, index): TranscriptLine => {
    if (index === 0 && line.startsWith('#')) return { role: 'meta', text: line };
    if (line.startsWith('›')) return { role: 'prompt', text: line.slice(1).trimStart() };
    if (line.startsWith('⏺') || line.startsWith('•'))
      return { role: 'tool', text: line.slice(1).trimStart() };
    if (line.startsWith('✓')) return { role: 'result-ok', text: line.slice(1).trimStart() };
    if (line.startsWith('✗') || line.startsWith('✖'))
      return { role: 'result-fail', text: line.slice(1).trimStart() };
    // `$ ` is a real shell prompt in 79 captures. `> ` deliberately is NOT:
    // in this corpus it is npm's own command echo ("> vitest run"), and
    // painting that as typed input would misrepresent the recording (D093).
    if (line.startsWith('$ ')) return { role: 'prompt', text: line.slice(2) };
    if (/^(?:Error\b|error:|FAIL\b|FAILED\b)/.test(line))
      return { role: 'result-fail', text: line };
    return { role: 'text', text: line };
  });
}

/**
 * Read + parse the transcript at `relPath`. Throws (build-time error, not
 * a silent empty block) when the path is disallowed or the file does not
 * exist.
 */
export function loadTranscript(relPath: string, cwd: string = process.cwd()): TranscriptLine[] {
  const abs = resolveTranscriptPath(relPath, cwd);
  let raw: string;
  try {
    raw = readFileSync(abs, 'utf8');
  } catch (err) {
    const code = (err as NodeJS.ErrnoException)?.code;
    if (code === 'ENOENT') {
      throw new TranscriptPathError(
        `Transcript file not found: "${relPath}" (resolved to "${abs}"). ` +
          `<Transcript src="…"> must point at a real captured session file — check the path.`,
      );
    }
    throw err;
  }
  return parseTranscript(raw);
}

/**
 * 1-indexed inclusive line range, e.g. `"2-4"`.
 *
 * KILN §8.11.5: an unparseable or reversed range now THROWS
 * (`TranscriptRangeError`, which Astro surfaces as a build error naming
 * the file) instead of silently returning the whole recording. Silently
 * widening the slice is the worst possible failure here — it re-adds the
 * `#` provenance header the author meant to hide, and it hides the typo.
 *
 * `to` past the end of the file is NOT an error: it is clamped. Several
 * lessons legitimately ask for `2-20` of an 18-line capture, meaning "the
 * rest of it", and a recording that gets one line shorter on re-capture
 * must not break the build.
 */
export function sliceRange(
  lines: TranscriptLine[],
  range: string | undefined,
  src?: string,
): TranscriptLine[] {
  if (range === undefined) return lines;
  const where = src ? ` (in <Transcript src="${src}">)` : '';
  const m = /^(\d+)\s*-\s*(\d+)$/.exec(range.trim());
  if (!m) {
    throw new TranscriptRangeError(
      `Transcript range "${range}"${where} is not a 1-indexed inclusive "from-to" range, ` +
        `e.g. range="2-14".`,
    );
  }
  const from = Number(m[1]);
  const to = Number(m[2]);
  if (from < 1) {
    throw new TranscriptRangeError(
      `Transcript range "${range}"${where} starts at line ${from}; lines are 1-indexed.`,
    );
  }
  if (from > to) {
    throw new TranscriptRangeError(
      `Transcript range "${range}"${where} is reversed (${from} > ${to}).`,
    );
  }
  if (from > lines.length) {
    throw new TranscriptRangeError(
      `Transcript range "${range}"${where} starts past the end of the recording ` +
        `(${lines.length} line${lines.length === 1 ? '' : 's'}).`,
    );
  }
  return lines.slice(from - 1, Math.min(lines.length, to));
}

/* ---------------------------------------------------------------------- *
 * Build-time colouring (KILN §8.1, §8.11.4)
 * ---------------------------------------------------------------------- */

/**
 * Candidate path-ish runs. Deliberately broad; `looksLikePath` below is
 * the actual gate, so prose such as "and/or" or "1/2" is never painted as
 * a filename.
 */
const PATH_CANDIDATE =
  /[A-Za-z]:[\\/][^\s"'`]+|[~.]?[\w@+-]*(?:[\\/][\w@.+-]+)+[\\/]?|\b[\w@+-]+\.(?:astro|bat|cfg|cjs|css|env|go|html|ini|js|json|jsonc|jsx|lock|log|md|mdx|mjs|php|png|ps1|py|rb|rs|scss|sh|sql|svg|toml|ts|tsx|txt|xml|ya?ml)\b/g;

const KNOWN_EXT = /\.[A-Za-z0-9]{1,6}(?:$|[\\/])/;

function looksLikePath(value: string): boolean {
  if (/^[A-Za-z]:[\\/]/.test(value)) return true;
  const hasSeparator = value.includes('/') || value.includes('\\');
  if (!hasSeparator) return true; // only the extension alternative reaches here
  if (/^[~.]|^[\\/]/.test(value)) return true;
  if (/[\\/]$/.test(value)) return true;
  return KNOWN_EXT.test(value);
}

/**
 * Split one line's text into plain and path-coloured runs, so file names
 * and directories read apart from the surrounding output (KILN §8.1) —
 * decided here, at build time, from the raw text. No runtime parsing, no
 * inline script, no ANSI escapes.
 */
export function segmentLine(text: string): TranscriptSegment[] {
  const segments: TranscriptSegment[] = [];
  let cursor = 0;
  PATH_CANDIDATE.lastIndex = 0;
  for (const match of text.matchAll(PATH_CANDIDATE)) {
    const value = match[0];
    const start = match.index ?? 0;
    if (!looksLikePath(value)) continue;
    if (start > cursor) segments.push({ kind: 'plain', text: text.slice(cursor, start) });
    segments.push({ kind: 'path', text: value });
    cursor = start + value.length;
  }
  if (cursor < text.length) segments.push({ kind: 'plain', text: text.slice(cursor) });
  return segments;
}

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** Escape text for insertion into HTML. */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ESCAPES[c] ?? c);
}

/**
 * The whole recording as ONE HTML string, with no whitespace whatsoever
 * between elements (KILN §8.11.1 — this is the fix for the leaked JSX
 * indentation that made every recorded line render as seven physical
 * ones).
 *
 * Each line is a block-level `<span>`; a blank line carries a single
 * space so it keeps exactly one line height under `white-space: pre`
 * rather than collapsing to zero.
 */
export function renderTranscriptHtml(lines: TranscriptLine[]): string {
  return lines
    .map((line) => {
      const glyph = ROLE_GLYPH[line.role];
      const label = ROLE_LABEL[line.role];
      const gutter = `<span class="cc-term__glyph" aria-hidden="true">${escapeHtml(glyph || ' ')}</span>`;
      const sr = label ? `<span class="sr-only">${escapeHtml(label)}: </span>` : '';
      const body =
        line.text === ''
          ? ' '
          : segmentLine(line.text)
              .map((seg) =>
                seg.kind === 'path'
                  ? `<span class="cc-term__path">${escapeHtml(seg.text)}</span>`
                  : escapeHtml(seg.text),
              )
              .join('');
      return `<span class="cc-term__line cc-term__line--${line.role}">${gutter}${sr}<span class="cc-term__text">${body}</span></span>`;
    })
    .join('');
}

/** The recording's raw text, for the copy button and the `aria-label`. */
export function rawText(lines: TranscriptLine[]): string {
  return lines
    .map((line) => {
      const glyph = ROLE_GLYPH[line.role];
      return glyph ? `${glyph} ${line.text}` : line.text;
    })
    .join('\n');
}

/**
 * A short title for the terminal bar: the first command that was actually
 * run, else the recording's file name. Truncated so the bar never wraps
 * at 390 px (KILN §8.1).
 */
export function barTitle(lines: TranscriptLine[], src: string, max = 72): string {
  const command = lines.find((l) => l.role === 'prompt' && l.text.trim() !== '')?.text.trim();
  // No command in this slice (an output-only excerpt): name the recording
  // by its lesson folder and file instead, so the bar still says what you
  // are looking at.
  const fallback = src.split('/').slice(-2).join('/');
  const title = command ?? fallback;
  return title.length > max ? `${title.slice(0, max - 1)}…` : title;
}
