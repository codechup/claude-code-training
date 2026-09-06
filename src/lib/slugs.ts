// Derives routing pieces from a content-collection entry id.
//
// Lesson ids (from `src/content.config.ts`'s `generateId`) look like:
//   en/l1-beginner/m01-start/what-is-claude-code
// i.e. the numeric `NN-` prefix on the filename has already been stripped.
//
// Section ids (level or module `index.mdx`) look like:
//   en/l1-beginner
//   en/l1-beginner/m01-start
//
// Pure string helpers only — no `astro:content` import, so Vitest (node
// environment) can exercise this file directly.

/** The two locales the site ships (D015, D016). */
export const LANGS = ['en', 'tr'] as const;
export type Lang = (typeof LANGS)[number];

export function isLang(value: string): value is Lang {
  return (LANGS as readonly string[]).includes(value);
}

export interface LessonSlugParts {
  lang: string;
  level: string;
  module: string;
  slug: string;
}

export interface SectionSlugParts {
  lang: string;
  level: string;
  module?: string;
}

/**
 * Split a lesson entry id into {lang, level, module, slug}.
 * Throws if the id does not have exactly four segments.
 */
export function parseLessonId(id: string): LessonSlugParts {
  const parts = id.split('/');
  if (parts.length !== 4) {
    throw new Error(`Invalid lesson id "${id}": expected lang/level/module/slug`);
  }
  const [lang, level, module, slug] = parts;
  return { lang, level, module, slug };
}

/**
 * Split a section entry id into {lang, level} or {lang, level, module}.
 */
export function parseSectionId(id: string): SectionSlugParts {
  const parts = id.split('/');
  if (parts.length === 2) {
    const [lang, level] = parts;
    return { lang, level };
  }
  if (parts.length === 3) {
    const [lang, level, module] = parts;
    return { lang, level, module };
  }
  throw new Error(`Invalid section id "${id}": expected lang/level or lang/level/module`);
}

/** Strip a leading `NN-` (two digits and a dash) prefix from a filename stem. */
export function stripOrderPrefix(stem: string): string {
  return stem.replace(/^\d{2}-/, '');
}

/** Build the site path for a lesson from its slug parts. */
export function lessonPath({ lang, level, module, slug }: LessonSlugParts): string {
  return `/${lang}/${level}/${module}/${slug}/`;
}

/** Build the site path for a level index page. */
export function levelPath(lang: string, level: string): string {
  return `/${lang}/${level}/`;
}

/** Build the site path for a module index page. */
export function modulePath(lang: string, level: string, module: string): string {
  return `/${lang}/${level}/${module}/`;
}

/**
 * The numeric level a level slug encodes (`l1-beginner` -> 1), or `null`
 * for the non-numbered trees (`playbook`, `meta`).
 */
export function levelNumber(levelSlug: string): number | null {
  const match = /^l(\d)-/.exec(levelSlug);
  return match ? Number(match[1]) : null;
}

/**
 * The module's short id (`m07-hooks` -> "m07"), or the whole slug when it
 * doesn't carry an `mNN-` prefix.
 */
export function moduleShortId(moduleSlug: string): string {
  const match = /^(m\d+)-/.exec(moduleSlug);
  return match ? match[1] : moduleSlug;
}

/**
 * Swap the first path segment of an absolute site path for `lang`.
 * `/en/l1-beginner/` + "tr" -> `/tr/l1-beginner/`. A path with no locale
 * segment (`/`, `/design/`) is returned as `/<lang>/`.
 */
export function swapLangInPath(path: string, lang: string): string {
  const segments = path.split('/').filter(Boolean);
  if (segments.length === 0 || !isLang(segments[0])) return `/${lang}/`;
  segments[0] = lang;
  return `/${segments.join('/')}/`;
}

/** The entry id a path maps to, dropping the leading/trailing slashes. */
export function pathToId(path: string): string {
  return path.split('/').filter(Boolean).join('/');
}
