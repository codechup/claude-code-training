// Pure feed-item logic for `rss.xml.ts`, kept `astro:content`-free (plain
// `{ id, data }` in, plain RSS-item objects out — the same shape nav.ts
// uses) so Vitest can exercise the real filter/sort/link logic in the node
// environment (see rss.test.ts) without `astro:content` ever loading:
// per-language, non-draft lessons only, newest `updated` first (D065).
//
// Underscore-prefixed so Astro excludes it from routing (it lives inside
// `src/pages/[lang]/` only for proximity to `rss.xml.ts`, its one caller).
export interface RssLessonInput {
  id: string;
  data: {
    title: string;
    description: string;
    updated: Date;
    draft: boolean;
  };
}

export interface RssFeedItem {
  title: string;
  description: string;
  pubDate: Date;
  link: string;
}

export function buildFeedItems(lang: string, lessons: RssLessonInput[]): RssFeedItem[] {
  return lessons
    .filter((entry) => !entry.data.draft && entry.id.startsWith(`${lang}/`))
    .sort((a, b) => b.data.updated.getTime() - a.data.updated.getTime())
    .map((entry) => {
      const [, level, module, slug] = entry.id.split('/');
      return {
        title: entry.data.title,
        description: entry.data.description,
        pubDate: entry.data.updated,
        link: `/${lang}/${level}/${module}/${slug}/`,
      };
    });
}
