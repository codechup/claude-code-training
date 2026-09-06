// Sample data for `Gallery.mdx`'s `<Sources>` demo — the exact shape of a
// real lesson's `sources[]` frontmatter (`src/content/schema.ts`), values
// borrowed from `docs/design/canvas-out/Components.dc.html`'s own mock.
import type { Source } from '../../../content/schema.ts';

export const sampleSources: Source[] = [
  {
    type: 'official',
    title: 'Hooks reference',
    url: 'https://code.claude.com/docs/en/hooks',
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
