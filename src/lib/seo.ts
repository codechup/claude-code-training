// hreflang / canonical helpers (D065). P09 owns the rest of the SEO surface
// (sitemap, OG images, robots.txt, RSS wiring) — this file only builds the
// alternates list every layout hands to `Base.astro`.
// Mirrors `HrefLangAlternate` in src/layouts/Base.astro (kept here rather
// than imported so this stays a plain, Astro-free TS module).
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
