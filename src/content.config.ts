import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { lessonSchema, sectionSchema } from './content/schema.ts';

const lessons = defineCollection({
  loader: glob({
    base: './content',
    pattern: '*/l*/m*/[0-9][0-9]-*.mdx',
    // Strip the `NN-` ordering prefix from the filename so the entry id
    // matches the public URL, e.g.
    //   en/l1-beginner/m01-start/01-what-is-claude-code.mdx
    //   -> en/l1-beginner/m01-start/what-is-claude-code
    generateId: ({ entry }) => {
      const parts = entry.split('/');
      const filename = parts.pop() ?? '';
      const slug = filename.replace(/\.mdx?$/, '').replace(/^\d{2}-/, '');
      return [...parts, slug].join('/');
    },
  }),
  schema: lessonSchema,
});

const sections = defineCollection({
  loader: glob({
    base: './content',
    pattern: ['*/l*/index.mdx', '*/l*/m*/index.mdx'],
    // en/l1-beginner/index.mdx           -> en/l1-beginner
    // en/l1-beginner/m01-start/index.mdx -> en/l1-beginner/m01-start
    generateId: ({ entry }) => entry.replace(/\/index\.mdx?$/, ''),
  }),
  schema: sectionSchema,
});

export const collections = { lessons, sections };
