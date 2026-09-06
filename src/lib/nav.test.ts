import { describe, expect, it } from 'vitest';
import {
  buildNav,
  findLevel,
  findModule,
  flattenLessons,
  lessonNeighbours,
  startHref,
  type LessonInput,
  type SectionInput,
} from './nav.ts';

function section(id: string, title: string, order: number): SectionInput {
  return { id, data: { title, description: `${title} description`, order } };
}

function lesson(id: string, order: number, extra: Partial<LessonInput['data']> = {}): LessonInput {
  return {
    id,
    data: {
      title: `Lesson ${order}`,
      description: 'desc',
      order,
      duration_min: 10,
      difficulty: 'core',
      tags: [],
      draft: false,
      ...extra,
    },
  };
}

const sections: SectionInput[] = [
  section('en/l2-intermediate', 'Intermediate', 2),
  section('en/l1-beginner', 'Beginner', 1),
  section('en/l1-beginner/m02-interact', 'Interact', 2),
  section('en/l1-beginner/m01-start', 'Start', 1),
  section('en/l2-intermediate/m05-models-effort', 'Models & effort', 1),
  section('tr/l1-beginner', 'Başlangıç', 1),
  section('tr/l1-beginner/m01-start', 'Başlangıç adımları', 1),
];

const lessons: LessonInput[] = [
  lesson('en/l1-beginner/m01-start/install', 2),
  lesson('en/l1-beginner/m01-start/what-claude-code-is', 1),
  lesson('en/l1-beginner/m01-start/secret', 3, { draft: true }),
  lesson('en/l1-beginner/m02-interact/prompting-basics', 1),
  lesson('en/l2-intermediate/m05-models-effort/model-family', 1, { duration_min: 15 }),
  lesson('tr/l1-beginner/m01-start/what-claude-code-is', 1, { draft: true }),
];

describe('buildNav', () => {
  const tree = buildNav('en', sections, lessons);

  it('nests levels, modules and lessons and sorts them by order', () => {
    expect(tree.levels.map((l) => l.slug)).toEqual(['l1-beginner', 'l2-intermediate']);
    expect(tree.levels[0].modules.map((m) => m.slug)).toEqual(['m01-start', 'm02-interact']);
    expect(tree.levels[0].modules[0].lessons.map((l) => l.slug)).toEqual([
      'what-claude-code-is',
      'install',
    ]);
  });

  it('excludes draft lessons from the tree and the counts', () => {
    const ids = flattenLessons(tree).map((l) => l.id);
    expect(ids).not.toContain('en/l1-beginner/m01-start/secret');
    expect(tree.levels[0].modules[0].lessons).toHaveLength(2);
    expect(tree.lessonCount).toBe(4);
  });

  it('never leaks the other language into a tree', () => {
    expect(flattenLessons(tree).every((l) => l.id.startsWith('en/'))).toBe(true);
    const trTree = buildNav('tr', sections, lessons);
    expect(trTree.levels.map((l) => l.slug)).toEqual(['l1-beginner']);
    // The only TR lesson is a draft, so the TR tree has zero live lessons.
    expect(trTree.lessonCount).toBe(0);
  });

  it('derives paths, level numbers, short module ids and durations', () => {
    const level = tree.levels[0];
    expect(level.path).toBe('/en/l1-beginner/');
    expect(level.number).toBe(1);
    expect(level.durationMin).toBe(30);
    expect(level.modules[0].shortId).toBe('m01');
    expect(level.modules[0].path).toBe('/en/l1-beginner/m01-start/');
    expect(level.modules[0].lessons[0].path).toBe('/en/l1-beginner/m01-start/what-claude-code-is/');
    expect(level.modules[0].lessons[1].indexInModule).toBe(2);
  });
});

describe('lessonNeighbours', () => {
  const tree = buildNav('en', sections, lessons);

  it('returns module context and whole-curriculum prev/next', () => {
    const found = lessonNeighbours(tree, 'en/l1-beginner/m01-start/install');
    expect(found).not.toBeNull();
    expect(found?.module.slug).toBe('m01-start');
    expect(found?.position).toBe(2);
    expect(found?.moduleTotal).toBe(2);
    expect(found?.prev?.slug).toBe('what-claude-code-is');
    // prev/next deliberately cross module boundaries.
    expect(found?.next?.slug).toBe('prompting-basics');
  });

  it('has no prev on the first lesson and no next on the last', () => {
    const first = lessonNeighbours(tree, 'en/l1-beginner/m01-start/what-claude-code-is');
    expect(first?.prev).toBeNull();
    const last = lessonNeighbours(tree, 'en/l2-intermediate/m05-models-effort/model-family');
    expect(last?.next).toBeNull();
  });

  it('returns null for an unknown or drafted lesson', () => {
    expect(lessonNeighbours(tree, 'en/l1-beginner/m01-start/secret')).toBeNull();
    expect(lessonNeighbours(tree, 'nope')).toBeNull();
  });
});

describe('lookups', () => {
  const tree = buildNav('en', sections, lessons);

  it('finds a level and a module by slug', () => {
    expect(findLevel(tree, 'l2-intermediate')?.title).toBe('Intermediate');
    expect(findModule(tree, 'l1-beginner', 'm02-interact')?.title).toBe('Interact');
    expect(findLevel(tree, 'nope')).toBeNull();
    expect(findModule(tree, 'l1-beginner', 'nope')).toBeNull();
  });

  it('points "Start" at the first live lesson, falling back to the first level', () => {
    expect(startHref(tree)).toBe('/en/l1-beginner/m01-start/what-claude-code-is/');
    const empty = buildNav('tr', sections, lessons);
    expect(startHref(empty)).toBe('/tr/l1-beginner/');
    expect(startHref(buildNav('de', sections, lessons))).toBe('/de/');
  });
});
