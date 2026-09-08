// Sample data for the `/design` page's `<Sources>` specimen (KILN §8.7).
//
// It is the exact shape of a real lesson's `sources[]` frontmatter
// (`src/content/schema.ts`), and it exists so the component can be shown in
// all four of its row types — `official`, `article`, `video`, `repo` —
// without borrowing a real lesson's citations. It is demo data and the page
// says so next to it; nothing here is presented as a verified source (D093).
import type { Source } from '../../../content/schema.ts';

export const sampleSources: Source[] = [
  {
    type: 'official',
    title: 'Hooks reference',
    url: 'https://code.claude.com/docs/en/hooks',
    verified_at: new Date('2026-09-06'),
  },
  {
    type: 'article',
    title: 'Writing a PreToolUse guard that fails closed',
    url: 'https://example.com/blog/pretooluse-guard',
    verified_at: new Date('2026-09-06'),
  },
  {
    type: 'video',
    title: 'Hooks in 12 minutes',
    url: 'https://www.youtube.com/watch?v=example',
    channel: 'Anthropic',
    duration: '12:04',
    verified_at: new Date('2026-09-06'),
  },
  {
    type: 'repo',
    title: 'guard-bash example',
    url: 'https://github.com/codechup/claude-code-lab',
    verified_at: new Date('2026-09-06'),
  },
];
