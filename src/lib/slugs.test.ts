import { describe, expect, it } from 'vitest';
import {
  lessonPath,
  levelPath,
  modulePath,
  parseLessonId,
  parseSectionId,
  stripOrderPrefix,
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
