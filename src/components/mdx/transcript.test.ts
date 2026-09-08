import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  barTitle,
  loadTranscript,
  parseTranscript,
  rawText,
  renderTranscriptHtml,
  resolveTranscriptPath,
  segmentLine,
  sliceRange,
  TranscriptPathError,
  TranscriptRangeError,
} from './transcript.ts';

const REPO_ROOT = join(import.meta.dirname, '..', '..', '..');
const FIXTURE = 'src/components/mdx/__fixtures__/transcripts/sample-session.txt';

describe('resolveTranscriptPath', () => {
  it('accepts a path under the fixtures prefix', () => {
    expect(() => resolveTranscriptPath(FIXTURE, REPO_ROOT)).not.toThrow();
  });

  it('accepts a path under content/_shared/transcripts/', () => {
    expect(() =>
      resolveTranscriptPath('content/_shared/transcripts/m07-hooks/guard-bash.txt', REPO_ROOT),
    ).not.toThrow();
  });

  it('rejects a path outside both allowed prefixes (never a "root" escape hatch)', () => {
    expect(() => resolveTranscriptPath('content/en/l1-beginner/x.mdx', REPO_ROOT)).toThrow(
      TranscriptPathError,
    );
    expect(() => resolveTranscriptPath('src/components/mdx/Callout.astro', REPO_ROOT)).toThrow(
      TranscriptPathError,
    );
  });

  it('rejects path traversal even if it would resolve back inside an allowed prefix', () => {
    expect(() =>
      resolveTranscriptPath('content/_shared/transcripts/../../../etc/passwd', REPO_ROOT),
    ).toThrow(TranscriptPathError);
  });
});

describe('loadTranscript', () => {
  it('loads and parses a real fixture file', () => {
    const lines = loadTranscript(FIXTURE, REPO_ROOT);
    expect(lines.length).toBeGreaterThan(0);
    expect(lines.some((l) => l.role === 'prompt')).toBe(true);
    expect(lines.some((l) => l.role === 'result-ok')).toBe(true);
  });

  it('fails loudly (throws, naming the file) when the file does not exist — never a silent empty block', () => {
    const missing = 'content/_shared/transcripts/does-not-exist.txt';
    expect(() => loadTranscript(missing, REPO_ROOT)).toThrow(TranscriptPathError);
    try {
      loadTranscript(missing, REPO_ROOT);
      expect.unreachable();
    } catch (err) {
      expect(String(err)).toContain(missing);
    }
  });

  it('fails loudly for a path outside the allowlist, without ever reading the filesystem for it', () => {
    expect(() => loadTranscript('content/en/l1-beginner/x.mdx', REPO_ROOT)).toThrow(
      TranscriptPathError,
    );
  });
});

describe('parseTranscript', () => {
  it('tags each role by its marker and strips the marker from the text', () => {
    const raw = [
      'a plain narrative line',
      '› do the thing',
      '⏺ Bash(ls)',
      '✓ done',
      '✗ failed',
    ].join('\n');
    const lines = parseTranscript(raw);
    expect(lines).toEqual([
      { role: 'text', text: 'a plain narrative line' },
      { role: 'prompt', text: 'do the thing' },
      { role: 'tool', text: 'Bash(ls)' },
      { role: 'result-ok', text: 'done' },
      { role: 'result-fail', text: 'failed' },
    ]);
  });

  it('drops exactly one trailing blank line from a file ending in a newline', () => {
    expect(parseTranscript('› a\n⏺ b\n')).toHaveLength(2);
  });

  it('keeps an intentional blank line in the middle', () => {
    const lines = parseTranscript('› a\n\n⏺ b');
    expect(lines).toEqual([
      { role: 'prompt', text: 'a' },
      { role: 'text', text: '' },
      { role: 'tool', text: 'b' },
    ]);
  });

  it('never fabricates a role for text it was not given', () => {
    const lines = parseTranscript('just some prose');
    expect(lines).toEqual([{ role: 'text', text: 'just some prose' }]);
  });
});

describe('sliceRange', () => {
  const lines = parseTranscript('› a\n⏺ b\n✓ c\n✗ d');

  it('returns everything when no range is given', () => {
    expect(sliceRange(lines, undefined)).toHaveLength(4);
  });

  it('slices a 1-indexed inclusive range', () => {
    expect(sliceRange(lines, '2-3').map((l) => l.text)).toEqual(['b', 'c']);
  });

  // KILN §8.11.5. Silently widening the slice is the worst failure mode
  // here: it re-adds the `#` provenance header the author meant to hide
  // and it hides the typo. It must fail the build instead.
  it('throws on an unparseable range instead of silently returning the whole file', () => {
    expect(() => sliceRange(lines, 'nonsense')).toThrow(TranscriptRangeError);
    expect(() => sliceRange(lines, '2')).toThrow(TranscriptRangeError);
    expect(() => sliceRange(lines, '2-')).toThrow(TranscriptRangeError);
    expect(() => sliceRange(lines, '')).toThrow(TranscriptRangeError);
  });

  it('throws on a reversed range', () => {
    expect(() => sliceRange(lines, '3-2')).toThrow(TranscriptRangeError);
  });

  it('throws when the range starts before line 1 or past the end', () => {
    expect(() => sliceRange(lines, '0-2')).toThrow(TranscriptRangeError);
    expect(() => sliceRange(lines, '9-12')).toThrow(TranscriptRangeError);
  });

  it('names the offending file and range in the error message', () => {
    expect(() => sliceRange(lines, '3-2', 'content/_shared/transcripts/x/y.txt')).toThrow(
      /3-2.*content\/_shared\/transcripts\/x\/y\.txt/s,
    );
  });

  // Several lessons legitimately ask for "2-20" of an 18-line capture,
  // meaning "the rest of it"; a recapture losing a line must not break
  // the build.
  it('clamps an end past the last line rather than throwing', () => {
    expect(sliceRange(lines, '3-99').map((l) => l.text)).toEqual(['c', 'd']);
  });
});

describe('parseTranscript role coverage', () => {
  it('tags a leading # provenance header as meta, not as output', () => {
    const lines = parseTranscript('# Captured 2026-09-07, Claude Code 2.1.263\n› claude doctor');
    expect(lines[0]).toEqual({
      role: 'meta',
      text: '# Captured 2026-09-07, Claude Code 2.1.263',
    });
    expect(lines[1]?.role).toBe('prompt');
  });

  it('only treats a # on the FIRST line as provenance', () => {
    const lines = parseTranscript('› cat x\n# a shell comment in the output');
    expect(lines[1]?.role).toBe('text');
  });

  it('recognises a $ shell prompt and an Error line', () => {
    expect(parseTranscript('$ npm test')[0]).toEqual({ role: 'prompt', text: 'npm test' });
    expect(parseTranscript('Error: ENOENT')[0]?.role).toBe('result-fail');
  });

  // npm echoes the script it is about to run as "> vitest run". That is
  // output, not something a human typed, and must not get the prompt glyph.
  it("never paints npm's own '> ' command echo as typed input", () => {
    expect(parseTranscript('> vitest run')[0]).toEqual({ role: 'text', text: '> vitest run' });
  });
});

describe('segmentLine', () => {
  it('picks out file paths so they can be coloured at build time', () => {
    expect(segmentLine('Read src/auth.test.ts done')).toEqual([
      { kind: 'plain', text: 'Read ' },
      { kind: 'path', text: 'src/auth.test.ts' },
      { kind: 'plain', text: ' done' },
    ]);
  });

  it('picks out a bare filename and a home-relative path', () => {
    expect(segmentLine('wrote CLAUDE.md').some((s) => s.kind === 'path')).toBe(true);
    expect(segmentLine('saved to ~/.claude/plans/').some((s) => s.kind === 'path')).toBe(true);
  });

  it('never paints ordinary prose as a path', () => {
    for (const prose of ['pick one and/or the other', 'about 1/2 of the run', 'version 2.1.263']) {
      expect(segmentLine(prose)).toEqual([{ kind: 'plain', text: prose }]);
    }
  });
});

describe('renderTranscriptHtml', () => {
  const lines = parseTranscript('› claude doctor\nRunning: native\n\n✓ No issues found.');
  const html = renderTranscriptHtml(lines);

  // KILN §8.11.1 — the defect that made a 20-line recording 2000px tall.
  it('emits no source whitespace between elements', () => {
    // The signature of the old defect: a newline plus 8-12 spaces of source
    // indentation between two sibling elements, rendered literally inside
    // the <pre>. The only whitespace the output may contain is a single
    // space that is itself recorded content (a blank line, an empty gutter).
    expect(html).not.toMatch(/[\r\n\t]/);
    expect(html).not.toMatch(/>\s{2,}</);
    expect(html).not.toMatch(/>\s+<span class="cc-term__line/);
  });

  it('emits exactly one block-level line span per recorded line', () => {
    expect(html.match(/class="cc-term__line /g)).toHaveLength(4);
  });

  it('keeps a blank line as one line of height rather than collapsing it', () => {
    expect(html).toContain('<span class="cc-term__text"> </span>');
  });

  it('tags each line with its role so the TEXT can be coloured, not just a glyph', () => {
    expect(html).toContain('cc-term__line--prompt');
    expect(html).toContain('cc-term__line--result-ok');
  });

  it('escapes HTML in the recorded text', () => {
    expect(renderTranscriptHtml(parseTranscript('<script>alert(1)</script>'))).not.toContain(
      '<script>',
    );
    expect(renderTranscriptHtml(parseTranscript('a && b < c'))).toContain('a &amp;&amp; b &lt; c');
  });
});

describe('rawText / barTitle', () => {
  const lines = parseTranscript('# provenance\n› claude doctor\n✓ ok');

  it('reconstructs the recording verbatim for the copy button', () => {
    expect(rawText(lines)).toBe('# provenance\n› claude doctor\n✓ ok');
  });

  it('titles the terminal bar with the first recorded command', () => {
    expect(barTitle(lines, 'content/_shared/transcripts/m01/01-doctor.txt')).toBe('claude doctor');
  });

  it('falls back to the recording folder and file when nothing was typed', () => {
    expect(barTitle(parseTranscript('just output'), 'content/_shared/transcripts/m01/x.txt')).toBe(
      'm01/x.txt',
    );
  });

  it('truncates a long title so the bar never wraps at 390px', () => {
    const long = parseTranscript(`› ${'a'.repeat(200)}`);
    expect(barTitle(long, 'a/x.txt').length).toBe(72);
    expect(barTitle(long, 'a/x.txt').endsWith('…')).toBe(true);
  });
});
