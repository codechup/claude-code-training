import { describe, expect, it } from 'vitest';
import { alternatesFor, ogImagePath, pageTitle } from './seo.ts';

describe('alternatesFor', () => {
  it('includes the current page and x-default pointing at itself when there is no sibling', () => {
    const alts = alternatesFor('en', '/en/l1-beginner/', null);
    expect(alts).toEqual([
      { lang: 'en', path: '/en/l1-beginner/' },
      { lang: 'x-default', path: '/en/l1-beginner/' },
    ]);
  });

  it('adds the sibling-language alternate when a translation exists', () => {
    const alts = alternatesFor('en', '/en/l1-beginner/', '/tr/l1-beginner/');
    expect(alts).toEqual([
      { lang: 'en', path: '/en/l1-beginner/' },
      { lang: 'tr', path: '/tr/l1-beginner/' },
      { lang: 'x-default', path: '/en/l1-beginner/' },
    ]);
  });

  it('x-default always points at English, even when English is the sibling', () => {
    const alts = alternatesFor('tr', '/tr/l1-beginner/', '/en/l1-beginner/');
    expect(alts).toEqual([
      { lang: 'tr', path: '/tr/l1-beginner/' },
      { lang: 'en', path: '/en/l1-beginner/' },
      { lang: 'x-default', path: '/en/l1-beginner/' },
    ]);
  });

  it('x-default falls back to the current (Turkish) page when no English sibling exists', () => {
    const alts = alternatesFor('tr', '/tr/l1-beginner/', null);
    expect(alts.find((a) => a.lang === 'x-default')).toEqual({
      lang: 'x-default',
      path: '/tr/l1-beginner/',
    });
  });
});

describe('pageTitle', () => {
  it('suffixes the site name', () => {
    expect(pageTitle('Beginner', 'CodeChup Claude Code Academy')).toBe(
      'Beginner — CodeChup Claude Code Academy',
    );
  });

  it('does not double the site name on the landing page itself', () => {
    expect(pageTitle('CodeChup Claude Code Academy', 'CodeChup Claude Code Academy')).toBe(
      'CodeChup Claude Code Academy',
    );
  });
});

describe('ogImagePath', () => {
  it('builds the OG path for a lesson', () => {
    expect(ogImagePath('en', '/en/l1-beginner/m01-start/what-claude-code-is/')).toBe(
      '/og/en/l1-beginner/m01-start/what-claude-code-is.png',
    );
  });

  it('builds the OG path for a module index', () => {
    expect(ogImagePath('en', '/en/l1-beginner/m01-start/')).toBe(
      '/og/en/l1-beginner/m01-start.png',
    );
  });

  it('builds the OG path for a level index', () => {
    expect(ogImagePath('tr', '/tr/l1-beginner/')).toBe('/og/tr/l1-beginner.png');
  });

  it('returns null for the locale landing page (no per-page card)', () => {
    expect(ogImagePath('en', '/en/')).toBeNull();
  });

  it('returns null when the path does not start with the given language', () => {
    expect(ogImagePath('en', '/design/')).toBeNull();
  });
});
