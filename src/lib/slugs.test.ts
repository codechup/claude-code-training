import { describe, expect, it } from 'vitest';
import {
  isLang,
  LANGS,
  lessonPath,
  levelNumber,
  levelPath,
  moduleShortId,
  modulePath,
  parseLessonId,
  parseSectionId,
  pathToId,
  stripOrderPrefix,
  swapLangInPath,
} from './slugs.ts';

describe('parseLessonId', () => {
  it('splits a well-formed lesson id into its parts', () => {
    expect(parseLessonId('en/l1-beginner/m01-start/what-is-claude-code')).toEqual({
      lang: 'en',
      level: 'l1-beginner',
      module: 'm01-start',
      slug: 'what-is-claude-code',
    });
  });

  it('throws on a malformed id', () => {
    expect(() => parseLessonId('en/l1-beginner')).toThrow();
  });
});

describe('parseSectionId', () => {
  it('parses a level id', () => {
    expect(parseSectionId('en/l1-beginner')).toEqual({ lang: 'en', level: 'l1-beginner' });
  });

  it('parses a module id', () => {
    expect(parseSectionId('en/l1-beginner/m01-start')).toEqual({
      lang: 'en',
      level: 'l1-beginner',
      module: 'm01-start',
    });
  });

  it('throws on an id with too many segments', () => {
    expect(() => parseSectionId('en/l1-beginner/m01-start/extra/segment')).toThrow();
  });
});

describe('stripOrderPrefix', () => {
  it('removes a leading two-digit-dash prefix', () => {
    expect(stripOrderPrefix('01-what-is-claude-code')).toBe('what-is-claude-code');
  });

  it('leaves a stem without a prefix untouched', () => {
    expect(stripOrderPrefix('index')).toBe('index');
  });
});

describe('path builders', () => {
  it('builds a lesson path', () => {
    expect(
      lessonPath({
        lang: 'en',
        level: 'l1-beginner',
        module: 'm01-start',
        slug: 'what-is-claude-code',
      }),
    ).toBe('/en/l1-beginner/m01-start/what-is-claude-code/');
  });

  it('builds a level path', () => {
    expect(levelPath('en', 'l1-beginner')).toBe('/en/l1-beginner/');
  });

  it('builds a module path', () => {
    expect(modulePath('en', 'l1-beginner', 'm01-start')).toBe('/en/l1-beginner/m01-start/');
  });
});

describe('locales', () => {
  it('ships exactly en and tr (D015)', () => {
    expect([...LANGS]).toEqual(['en', 'tr']);
    expect(isLang('en')).toBe(true);
    expect(isLang('de')).toBe(false);
  });
});

describe('levelNumber', () => {
  it('reads the number out of a level slug', () => {
    expect(levelNumber('l1-beginner')).toBe(1);
    expect(levelNumber('l4-master')).toBe(4);
  });

  it('returns null for the non-numbered trees', () => {
    expect(levelNumber('playbook')).toBeNull();
    expect(levelNumber('meta')).toBeNull();
  });
});

describe('moduleShortId', () => {
  it('shortens an mNN- prefixed module slug', () => {
    expect(moduleShortId('m07-hooks')).toBe('m07');
    expect(moduleShortId('m21-scale')).toBe('m21');
  });

  it('leaves a slug without the prefix alone', () => {
    expect(moduleShortId('playbook')).toBe('playbook');
  });
});

describe('swapLangInPath', () => {
  it('swaps the first segment for the target locale', () => {
    expect(swapLangInPath('/en/l1-beginner/', 'tr')).toBe('/tr/l1-beginner/');
    expect(swapLangInPath('/tr/l1-beginner/m01-start/install/', 'en')).toBe(
      '/en/l1-beginner/m01-start/install/',
    );
  });

  it('falls back to the locale home for a path with no locale segment', () => {
    expect(swapLangInPath('/', 'tr')).toBe('/tr/');
    expect(swapLangInPath('/design/', 'en')).toBe('/en/');
  });
});

describe('pathToId', () => {
  it('turns a site path back into an entry id', () => {
    expect(pathToId('/en/l1-beginner/m01-start/install/')).toBe('en/l1-beginner/m01-start/install');
    expect(pathToId('/en/l1-beginner/')).toBe('en/l1-beginner');
  });
});
