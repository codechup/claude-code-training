import rss from '@astrojs/rss';
import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { describe, expect, it } from 'vitest';
import { buildFeedItems, type RssLessonInput } from './_rss-items.ts';

const LESSONS: RssLessonInput[] = [
  {
    id: 'en/l1-beginner/m01-start/what-claude-code-is',
    data: {
      title: 'What is Claude Code?',
      description: 'A first look at Claude Code.',
      updated: new Date('2026-01-01'),
      draft: false,
    },
  },
  {
    id: 'en/l1-beginner/m01-start/install',
    data: {
      title: 'Install',
      description: 'Install Claude Code.',
      updated: new Date('2026-03-01'),
      draft: false,
    },
  },
  {
    id: 'en/l1-beginner/m01-start/draft-lesson',
    data: {
      title: 'Draft lesson',
      description: 'Not yet published.',
      updated: new Date('2026-06-01'),
      draft: true,
    },
  },
  {
    id: 'tr/l1-beginner/m01-start/what-claude-code-is',
    data: {
      title: 'Claude Code nedir?',
      description: "Claude Code'a ilk bakış.",
      updated: new Date('2026-02-01'),
      draft: true,
    },
  },
];

describe('buildFeedItems', () => {
  it('scopes to the given language and excludes drafts', () => {
    const items = buildFeedItems('en', LESSONS);
    expect(items.map((i) => i.title)).toEqual(['Install', 'What is Claude Code?']);
  });

  it('excludes a draft lesson even when it is the newest', () => {
    const items = buildFeedItems('en', LESSONS);
    expect(items.some((i) => i.title === 'Draft lesson')).toBe(false);
  });

  it('sorts newest `updated` first', () => {
    const items = buildFeedItems('en', LESSONS);
    expect(items[0].pubDate.getTime()).toBeGreaterThan(items[1].pubDate.getTime());
  });

  it('excludes a draft TR twin, leaving the TR feed empty here', () => {
    expect(buildFeedItems('tr', LESSONS)).toEqual([]);
  });

  it('builds the lesson link from the entry id', () => {
    const items = buildFeedItems('en', LESSONS);
    const install = items.find((i) => i.title === 'Install');
    expect(install?.link).toBe('/en/l1-beginner/m01-start/install/');
  });
});

describe('RSS feed well-formedness', () => {
  it('produces valid, well-formed XML for the English feed', async () => {
    const response = await rss({
      title: 'CodeChup Claude Code Academy',
      description: 'New and updated lessons.',
      site: 'https://cc.codechup.com',
      items: buildFeedItems('en', LESSONS),
    });
    const xml = await response.text();

    const validation = XMLValidator.validate(xml);
    expect(validation).toBe(true);

    const parsed = new XMLParser({ ignoreAttributes: false }).parse(xml);
    expect(parsed.rss.channel.title).toBe('CodeChup Claude Code Academy');
    // Two non-draft EN lessons -> two <item> entries, newest first.
    expect(parsed.rss.channel.item).toHaveLength(2);
    expect(parsed.rss.channel.item[0].title).toBe('Install');
    expect(parsed.rss.channel.item[1].title).toBe('What is Claude Code?');
  });

  it('produces a valid, empty-but-well-formed feed for a language with no live lessons', async () => {
    const response = await rss({
      title: 'CodeChup Claude Code Akademisi',
      description: 'Yeni ve güncellenen dersler.',
      site: 'https://cc.codechup.com',
      items: buildFeedItems('tr', LESSONS),
    });
    const xml = await response.text();

    expect(XMLValidator.validate(xml)).toBe(true);
    const parsed = new XMLParser().parse(xml);
    expect(parsed.rss.channel.item).toBeUndefined();
  });
});
