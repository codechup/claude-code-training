import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  loadTranscript,
  parseTranscript,
  resolveTranscriptPath,
  sliceRange,
  TranscriptPathError,
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

  it('falls back to everything for a malformed or out-of-order range', () => {
    expect(sliceRange(lines, 'nonsense')).toHaveLength(4);
    expect(sliceRange(lines, '3-2')).toHaveLength(4);
  });
});
