// Build-time OG (social card) images (D065): one PNG per lesson and per
// section (level index, module index, and the standalone `playbook/` /
// `meta/` pages), at `/og/<lang>/<level>/[<module>/[<slug>/]]<...>.png`
// (the same path shape as the page it represents — see `ogImagePath` in
// `../../../lib/seo.ts`, which builds that URL for `Base.astro`).
//
// Draft lessons get no route at all, same as the real lesson pages
// (`src/pages/[lang]/[level]/[module]/[slug]/index.astro`) — an OG image
// for a page that doesn't exist would be worse than no `og:image` tag.
// Section indexes are not subject to the draft mechanism (P06), so every
// section gets a card.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { levelNumber } from '../../../lib/slugs.ts';
import { renderOgCard } from '../_render.ts';

// The Kiln wordmark (KILN §5.2), sentence case, per locale.
const WORDMARK: Record<string, string> = {
  en: 'Claude Code Academy',
  tr: 'Claude Code Akademisi',
};

const SITE_NAME: Record<string, string> = {
  en: 'CodeChup Claude Code Academy',
  tr: 'CodeChup Claude Code Akademisi',
};

function levelEyebrow(levelSlug: string): string {
  const n = levelNumber(levelSlug);
  if (n) return `Level ${n}`;
  if (levelSlug === 'playbook') return 'Playbook';
  if (levelSlug === 'meta') return 'Meta';
  return levelSlug;
}

interface OgPageProps {
  eyebrow: string;
  title: string;
  lang: string;
}

export async function getStaticPaths() {
  const lessons = await getCollection('lessons', ({ data }) => !data.draft);
  const sections = await getCollection('sections');
  const sectionById = new Map(sections.map((s) => [s.id, s]));

  const paths: { params: { lang: string; slug: string }; props: OgPageProps }[] = [];

  for (const entry of lessons) {
    const [lang, level, moduleSlug, slug] = entry.id.split('/');
    const moduleSection = sectionById.get(`${lang}/${level}/${moduleSlug}`);
    const n = levelNumber(level);
    const eyebrow = moduleSection
      ? n
        ? `Level ${n} · ${moduleSection.data.title}`
        : moduleSection.data.title
      : levelEyebrow(level);
    paths.push({
      params: { lang, slug: `${level}/${moduleSlug}/${slug}` },
      props: { eyebrow, title: entry.data.title, lang },
    });
  }

  for (const entry of sections) {
    const parts = entry.id.split('/');
    const lang = parts[0];
    if (parts.length === 2) {
      // Level (or top-level playbook/meta) index.
      const [, level] = parts;
      paths.push({
        params: { lang, slug: level },
        props: { eyebrow: SITE_NAME[lang] ?? SITE_NAME.en, title: entry.data.title, lang },
      });
    } else {
      // Module index, or a standalone playbook/meta page (same id shape).
      const [, level, moduleSlug] = parts;
      paths.push({
        params: { lang, slug: `${level}/${moduleSlug}` },
        props: { eyebrow: levelEyebrow(level), title: entry.data.title, lang },
      });
    }
  }

  return paths;
}

export const GET: APIRoute<OgPageProps> = async ({ props }) => {
  const { eyebrow, title, lang } = props;
  const png = await renderOgCard({
    eyebrow,
    title,
    brand: WORDMARK[lang] ?? WORDMARK.en,
  });

  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
