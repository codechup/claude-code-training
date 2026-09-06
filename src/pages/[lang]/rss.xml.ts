import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

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
  const lessons = await getCollection(
    'lessons',
    ({ id, data }) => !data.draft && id.startsWith(`${lang}/`),
  );

  return rss({
    title: titles[lang] ?? titles.en,
    description: descriptions[lang] ?? descriptions.en,
    site: context.site ?? 'https://cc.codechup.com',
    items: lessons
      .sort((a, b) => b.data.updated.getTime() - a.data.updated.getTime())
      .map((entry) => {
        const [, level, module, slug] = entry.id.split('/');
        return {
          title: entry.data.title,
          description: entry.data.description,
          pubDate: entry.data.updated,
          link: `/${lang}/${level}/${module}/${slug}/`,
        };
      }),
  });
}
