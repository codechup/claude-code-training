// Small pure helpers for `Sources.astro`, split out to run under plain
// Vitest (see this plan's Handoff notes on `.astro` imports in this
// repo's `vitest.config.ts`).
import type { Source } from '../../content/schema.ts';

/** The URL's hostname, with a leading "www." stripped for display. */
export function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/** "channel · duration" (video sources), whichever parts are present. */
export function videoMeta(source: Pick<Source, 'channel' | 'duration'>): string | null {
  const parts = [source.channel, source.duration].filter(
    (p): p is string => typeof p === 'string' && p.length > 0,
  );
  return parts.length > 0 ? parts.join(' · ') : null;
}

/** `verified_at` as `YYYY-MM-DD`, matching the plain rendering this
 *  component replaces (`src/pages/[lang]/[level]/[module]/[slug]/index.astro`). */
export function verifiedDate(source: Pick<Source, 'verified_at'>): string {
  return source.verified_at.toISOString().slice(0, 10);
}
