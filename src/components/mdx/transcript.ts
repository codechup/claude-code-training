// `Transcript.astro`'s file-loading and parsing logic, split into a plain
// module so it (a) runs under this repo's plain-Vitest config (no Astro
// Vite plugin — `.astro` files can't be imported from a `.test.ts`, see
// this plan's Handoff notes) and (b) can be unit-tested for the
// "missing/disallowed file fails loudly" requirement without needing a
// real Astro build.
//
// D070/D093 (folded into D019): a transcript is a real, previously
// captured Claude Code session, never fabricated. This module makes that
// structural, not just a convention: `loadTranscript` only ever reads a
// file whose path starts with one of `ALLOWED_PREFIXES` — there is no
// "root" or "base" option an author could widen — and throws (not returns
// null / not an empty block) when the file does not exist, so a typo'd
// path fails the build loudly instead of silently rendering nothing.
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

export type TranscriptRole = 'prompt' | 'tool' | 'result-ok' | 'result-fail' | 'text';

export interface TranscriptLine {
  role: TranscriptRole;
  /** Text with the role marker (`›`, `⏺`, `✓`, `✗`) stripped. */
  text: string;
}

export class TranscriptPathError extends Error {}

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
 *   `› prompt text`   -> prompt   (the reader's/author's input)
 *   `⏺ tool text`     -> tool     (a tool call, muted)
 *   `✓ result text`   -> result-ok
 *   `✗ result text`   -> result-fail
 *   anything else     -> text     (plain narrative / assistant prose)
 *
 * A single trailing blank line (a file ending in a newline) is dropped;
 * blank lines elsewhere are kept as empty `text` lines (real spacing in
 * the captured session).
 */
export function parseTranscript(raw: string): TranscriptLine[] {
  const rawLines = raw.replace(/\r\n/g, '\n').split('\n');
  if (rawLines.length > 0 && rawLines[rawLines.length - 1] === '') rawLines.pop();

  return rawLines.map((line): TranscriptLine => {
    if (line.startsWith('›')) return { role: 'prompt', text: line.slice(1).trimStart() };
    if (line.startsWith('⏺')) return { role: 'tool', text: line.slice(1).trimStart() };
    if (line.startsWith('✓')) return { role: 'result-ok', text: line.slice(1).trimStart() };
    if (line.startsWith('✗')) return { role: 'result-fail', text: line.slice(1).trimStart() };
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

/** 1-indexed line range, e.g. "2-4", limiting which parsed lines render. */
export function sliceRange(lines: TranscriptLine[], range: string | undefined): TranscriptLine[] {
  if (!range) return lines;
  const m = /^(\d+)\s*-\s*(\d+)$/.exec(range.trim());
  if (!m) return lines;
  const [, fromStr, toStr] = m;
  const from = Math.max(1, Number(fromStr));
  const to = Math.min(lines.length, Number(toStr));
  if (!Number.isFinite(from) || !Number.isFinite(to) || from > to) return lines;
  return lines.slice(from - 1, to);
}
