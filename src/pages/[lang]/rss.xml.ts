import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { buildFeedItems } from './_rss-items.ts';

export async function getStaticPaths() {
  return [{ params: { lang: 'en' } }, { params: { lang: 'tr' } }];
}

const titles: Record<string, string> = {
  en: 'CodeChup Claude Code Academy',
  tr: 'CodeChup Claude Code Akademisi',
};

const descriptions: Record<string, string> = {
  en: 'New and updated lessons.',
  tr: 'Yeni ve güncellenen dersler.',
};

export async function GET(context: APIContext) {
  const lang = context.params.lang as string;
  const lessons = await getCollection('lessons');

  return rss({
    title: titles[lang] ?? titles.en,
    description: descriptions[lang] ?? descriptions.en,
    site: context.site ?? 'https://cc.codechup.com',
    items: buildFeedItems(lang, lessons),
  });
}
