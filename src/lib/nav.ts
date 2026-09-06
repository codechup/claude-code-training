// The level -> module -> lesson tree every navigation component reads from
// (D061: left level/module/lesson tree, prev/next bar with a progress
// indicator).
//
// Deliberately pure: it takes plain `{ id, data }` arrays rather than
// importing `astro:content`, so route files call `getCollection()` and hand
// the results in, and Vitest can exercise the tree shape in the node
// environment with fixtures.
import {
  levelNumber,
  levelPath,
  lessonPath,
  moduleShortId,
  modulePath,
  parseLessonId,
  parseSectionId,
} from './slugs.ts';

export interface SectionInput {
  id: string;
  data: {
    title: string;
    description: string;
    order: number;
    summary?: string;
  };
}

export interface LessonInput {
  id: string;
  data: {
    title: string;
    description: string;
    order: number;
    duration_min: number;
    difficulty: 'intro' | 'core' | 'advanced';
    tags: string[];
    draft: boolean;
  };
}

export interface NavLesson {
  id: string;
  slug: string;
  title: string;
  description: string;
  order: number;
  durationMin: number;
  difficulty: 'intro' | 'core' | 'advanced';
  tags: string[];
  path: string;
  /** 1-based position inside its module (drafts already excluded). */
  indexInModule: number;
}

export interface NavModule {
  id: string;
  slug: string;
  /** `m07-hooks` -> "m07". */
  shortId: string;
  title: string;
  description: string;
  order: number;
  path: string;
  lessons: NavLesson[];
}

export interface NavLevel {
  id: string;
  slug: string;
  /** 1–4 for `l1-beginner`…`l4-master`; null for `playbook` / `meta`. */
  number: number | null;
  title: string;
  description: string;
  order: number;
  path: string;
  modules: NavModule[];
  lessonCount: number;
  durationMin: number;
}

export interface NavTree {
  lang: string;
  levels: NavLevel[];
  lessonCount: number;
}

function bySlugOrder<T extends { order: number; slug: string }>(a: T, b: T): number {
  return a.order - b.order || a.slug.localeCompare(b.slug);
}

/**
 * Build the navigation tree for one language.
 *
 * Drafts are excluded outright: a `draft: true` lesson has no route, no nav
 * entry, and (see `src/pages/[lang]/rss.xml.ts` and P09's sitemap/Pagefind
 * wiring) no place in any generated index.
 */
export function buildNav(lang: string, sections: SectionInput[], lessons: LessonInput[]): NavTree {
  const prefix = `${lang}/`;

  const levelSections = sections.filter(
    (s) => s.id.startsWith(prefix) && s.id.split('/').length === 2,
  );
  const moduleSections = sections.filter(
    (s) => s.id.startsWith(prefix) && s.id.split('/').length === 3,
  );
  const liveLessons = lessons.filter((l) => l.id.startsWith(prefix) && !l.data.draft);

  const levels: NavLevel[] = levelSections
    .map((levelSection) => {
      const { level } = parseSectionId(levelSection.id);

      const modules: NavModule[] = moduleSections
        .filter((m) => m.id.startsWith(`${prefix}${level}/`))
        .map((moduleSection) => {
          const parsed = parseSectionId(moduleSection.id);
          const moduleSlug = parsed.module ?? '';

          const moduleLessons = liveLessons
            .filter((l) => l.id.startsWith(`${prefix}${level}/${moduleSlug}/`))
            .map((l) => {
              const parts = parseLessonId(l.id);
              return {
                id: l.id,
                slug: parts.slug,
                title: l.data.title,
                description: l.data.description,
                order: l.data.order,
                durationMin: l.data.duration_min,
                difficulty: l.data.difficulty,
                tags: l.data.tags,
                path: lessonPath(parts),
                indexInModule: 0,
              } satisfies NavLesson;
            })
            .sort(bySlugOrder)
            .map((lesson, i) => ({ ...lesson, indexInModule: i + 1 }));

          return {
            id: moduleSection.id,
            slug: moduleSlug,
            shortId: moduleShortId(moduleSlug),
            title: moduleSection.data.title,
            description: moduleSection.data.description,
            order: moduleSection.data.order,
            path: modulePath(lang, level, moduleSlug),
            lessons: moduleLessons,
          } satisfies NavModule;
        })
        .sort(bySlugOrder);

      const allLessons = modules.flatMap((m) => m.lessons);

      return {
        id: levelSection.id,
        slug: level,
        number: levelNumber(level),
        title: levelSection.data.title,
        description: levelSection.data.description,
        order: levelSection.data.order,
        path: levelPath(lang, level),
        modules,
        lessonCount: allLessons.length,
        durationMin: allLessons.reduce((sum, l) => sum + l.durationMin, 0),
      } satisfies NavLevel;
    })
    .sort(bySlugOrder);

  return {
    lang,
    levels,
    lessonCount: levels.reduce((sum, l) => sum + l.lessonCount, 0),
  };
}

/** Every lesson in the tree, in reading order. */
export function flattenLessons(tree: NavTree): NavLesson[] {
  return tree.levels.flatMap((level) => level.modules.flatMap((mod) => mod.lessons));
}

export interface LessonNeighbours {
  level: NavLevel;
  module: NavModule;
  lesson: NavLesson;
  prev: NavLesson | null;
  next: NavLesson | null;
  /** 1-based position of this lesson inside its module. */
  position: number;
  /** Number of live lessons in this module. */
  moduleTotal: number;
}

/**
 * Locate a lesson in the tree and return its module context plus the
 * previous/next lesson in whole-curriculum reading order (prev/next cross
 * module and level boundaries; the "n / m" counter beside the progress bar
 * stays module-scoped, exactly as drawn in `Lesson1280.dc.html`).
 */
export function lessonNeighbours(tree: NavTree, lessonId: string): LessonNeighbours | null {
  const flat = flattenLessons(tree);
  const index = flat.findIndex((l) => l.id === lessonId);
  if (index === -1) return null;

  for (const level of tree.levels) {
    for (const mod of level.modules) {
      const lesson = mod.lessons.find((l) => l.id === lessonId);
      if (!lesson) continue;
      return {
        level,
        module: mod,
        lesson,
        prev: index > 0 ? flat[index - 1] : null,
        next: index < flat.length - 1 ? flat[index + 1] : null,
        position: lesson.indexInModule,
        moduleTotal: mod.lessons.length,
      };
    }
  }
  return null;
}

/** The level entry for a level slug, or null. */
export function findLevel(tree: NavTree, levelSlug: string): NavLevel | null {
  return tree.levels.find((l) => l.slug === levelSlug) ?? null;
}

/** The module entry for a level/module slug pair, or null. */
export function findModule(tree: NavTree, levelSlug: string, moduleSlug: string): NavModule | null {
  return findLevel(tree, levelSlug)?.modules.find((m) => m.slug === moduleSlug) ?? null;
}

/**
 * The first lesson of the curriculum for this language — the landing page's
 * primary CTA target ("Start Level 1"). Falls back to the first level's
 * index page when no lesson is live yet.
 */
export function startHref(tree: NavTree): string {
  const first = flattenLessons(tree)[0];
  if (first) return first.path;
  return tree.levels[0]?.path ?? `/${tree.lang}/`;
}
