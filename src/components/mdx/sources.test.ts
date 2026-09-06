import { describe, expect, it } from 'vitest';
import { hostOf, verifiedDate, videoMeta } from './sources.ts';

describe('hostOf', () => {
  it('extracts the hostname, stripping a leading www.', () => {
    expect(hostOf('https://www.youtube.com/watch?v=1')).toBe('youtube.com');
    expect(hostOf('https://code.claude.com/docs/en/hooks')).toBe('code.claude.com');
  });

  it('falls back to the raw string for an unparseable URL rather than throwing', () => {
    expect(hostOf('not a url')).toBe('not a url');
  });
});

describe('videoMeta', () => {
  it('joins channel and duration', () => {
    expect(videoMeta({ channel: 'Anthropic', duration: '12:04' })).toBe('Anthropic · 12:04');
  });

  it('handles just one of the two being present', () => {
    expect(videoMeta({ channel: 'Anthropic', duration: undefined })).toBe('Anthropic');
    expect(videoMeta({ channel: undefined, duration: '12:04' })).toBe('12:04');
  });

  it('returns null when neither is present', () => {
    expect(videoMeta({ channel: undefined, duration: undefined })).toBeNull();
  });
});

describe('verifiedDate', () => {
  it('formats as YYYY-MM-DD', () => {
    expect(verifiedDate({ verified_at: new Date('2026-09-06T12:00:00Z') })).toBe('2026-09-06');
  });
});
