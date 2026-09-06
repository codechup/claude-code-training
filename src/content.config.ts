import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { lessonSchema, sectionSchema } from './content/schema.ts';

// Content lives in parallel `content/en/**` and `content/tr/**` trees that
// share the same slugs (D015). Two collections cover it:
//
//   lessons   <lang>/<level>/<module>/NN-<slug>.mdx
//   sections  <lang>/<level>/index.mdx and <lang>/<level>/<module>/index.mdx
//
// `content/_shared/**` (transcripts, the shared source index — P23 and each
// content plan) is explicitly excluded from both: it is data for MDX
// components, not routable content.
const NOT_SHARED = '!_shared/**';

const lessons = defineCollection({
  loader: glob({
    base: './content',
    pattern: ['*/*/*/[0-9][0-9]-*.mdx', NOT_SHARED],
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
    // `*/playbook/!(index).mdx` and `*/meta/!(index).mdx` pick up the
    // standalone, non-numbered reference pages those two trees hold
    // (`playbook/glossary.mdx` and friends). They are section-shaped, not
    // lessons: no level/module/order-prefix and no draft mechanism —
    // `scripts/content-gate.ts` validates them with `sectionSchema` too.
    pattern: [
      '*/*/index.mdx',
      '*/*/*/index.mdx',
      '*/playbook/!(index).mdx',
      '*/meta/!(index).mdx',
      NOT_SHARED,
    ],
    // en/l1-beginner/index.mdx           -> en/l1-beginner
    // en/l1-beginner/m01-start/index.mdx -> en/l1-beginner/m01-start
    // en/playbook/glossary.mdx           -> en/playbook/glossary
    generateId: ({ entry }) =>
      entry.endsWith('/index.mdx')
        ? entry.slice(0, -'/index.mdx'.length)
        : entry.replace(/\.mdx?$/, ''),
  }),
  schema: sectionSchema,
});

export const collections = { lessons, sections };
