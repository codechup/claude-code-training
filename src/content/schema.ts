// Shared zod schemas for lesson / section frontmatter.
//
// These are imported both by `src/content.config.ts` (Astro's content
// collections) and by `scripts/content-gate.ts` (a plain Node script run
// before Astro is even invoked), so this file must not import anything from
// `astro:content` or other Astro-only modules.
import { z } from 'zod';

export const sourceSchema = z.object({
  type: z.enum(['official', 'video', 'article', 'repo']),
  title: z.string().min(1),
  url: z.url(),
  channel: z.string().optional(),
  duration: z.string().optional(),
  verified_at: z.coerce.date(),
});

export type Source = z.infer<typeof sourceSchema>;

export const labSchema = z.object({
  repo_tag: z.string().min(1),
});

export type Lab = z.infer<typeof labSchema>;

// Lesson frontmatter. `lang`, `level` (slug form, e.g. "l1-beginner"),
// `module` (slug form, e.g. "m01-start") and `slug` are derived from the
// file path (see `src/lib/slugs.ts`) and are never re-typed here — but the
// numeric `level` and the `module` id below ARE required in frontmatter so
// the content gate can assert they match the path the file lives at.
export const lessonSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  level: z.int().min(1).max(5),
  module: z.string().min(1),
  order: z.int().min(0),
  duration_min: z.int().positive(),
  difficulty: z.enum(['intro', 'core', 'advanced']),
  tags: z.array(z.string()),
  verified_version: z.string().min(1),
  updated: z.coerce.date(),
  draft: z.boolean().default(false),
  sources: z.array(sourceSchema),
  lab: labSchema.optional(),
});

export type LessonFrontmatter = z.infer<typeof lessonSchema>;

// Section frontmatter for level/module `index.mdx` files.
export const sectionSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  order: z.int().min(0),
});

export type SectionFrontmatter = z.infer<typeof sectionSchema>;
