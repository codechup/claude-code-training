// hreflang / canonical / OG-image helpers (D065).
// Mirrors `HrefLangAlternate` in src/layouts/Base.astro (kept here rather
// than imported so this stays a plain, Astro-free TS module).
import { pathToId } from './slugs.ts';

export interface HrefLangAlternate {
  /** BCP-47 language tag, e.g. "en" or "tr". Use "x-default" for the fallback. */
  lang: string;
  /** Absolute path, e.g. "/en/l1-beginner/". */
  path: string;
}

/**
 * The `<link rel="alternate" hreflang>` set for a page.
 *
 * A locale is only advertised when its page actually exists: `altPath` is
 * null for a lesson whose sibling-language file is still `draft: true`, and
 * pointing hreflang at a 404 is worse than omitting it. `x-default` always
 * points at the English page when there is one, otherwise at the page itself.
 */
export function alternatesFor(
  lang: string,
  path: string,
  altPath: string | null | undefined,
): HrefLangAlternate[] {
  const alternates: HrefLangAlternate[] = [{ lang, path }];
  if (altPath) alternates.push({ lang: lang === 'en' ? 'tr' : 'en', path: altPath });

  const english = lang === 'en' ? path : altPath;
  alternates.push({ lang: 'x-default', path: english ?? path });
  return alternates;
}

/** Page title, suffixed with the site name unless it already is the site name. */
export function pageTitle(title: string, siteName: string): string {
  return title === siteName ? title : `${title} — ${siteName}`;
}

/**
 * The build-time OG image path for a page (D065), or `null` when that page
 * has none.
 *
 * Every lesson and section gets a card, rendered by
 * `src/pages/og/[lang]/[...slug].png.ts`, at the exact same path shape as
 * the page itself: `/en/l1-beginner/m01-start/what-claude-code-is/` maps to
 * `/og/en/l1-beginner/m01-start/what-claude-code-is.png`. Locale landing
 * pages and any other route with nothing after the language segment
 * (`/en/`) have no per-page card yet, so this returns `null` rather than a
 * link to an image that was never generated — `Base.astro` renders no
 * `og:image` meta tag in that case (see its Handoff-noted caller, since
 * `Base.astro`/`Lesson.astro`/`Section.astro` are outside this plan's
 * owned_paths and never pass this explicitly — it derives from `lang` +
 * `path`, which every page already has).
 */
export function ogImagePath(lang: string, path: string): string | null {
  const segments = pathToId(path).split('/');
  if (segments.length === 0 || segments[0] !== lang) return null;
  const rest = segments.slice(1);
  if (rest.length === 0) return null;
  return `/og/${lang}/${rest.join('/')}.png`;
}
