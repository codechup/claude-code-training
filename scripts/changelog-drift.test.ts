import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  MAX_PENDING_ENTRIES,
  ageInDays,
  buildIndex,
  bulletTokens,
  classifyBullet,
  compareVersions,
  datesFromDocs,
  entryId,
  extractTokens,
  fetchDrift,
  loadLessons,
  normaliseBulletText,
  parseDocsChangelog,
  parseRawChangelog,
  renderReport,
  routeBullet,
  routeDrift,
} from './changelog-drift.mjs';

const FIXTURES = fileURLToPath(new URL('../research/changelog/fixtures/', import.meta.url));
const LESSONS = `${FIXTURES}lessons`;

const rawSample = await readFile(`${FIXTURES}changelog-raw.sample.md`, 'utf8');
const docsSample = await readFile(`${FIXTURES}changelog-docs.sample.md`, 'utf8');
const rawBroken = await readFile(`${FIXTURES}changelog-raw.broken.md`, 'utf8');

const fixtureLessons = await loadLessons(LESSONS);
const fixtureIndex = buildIndex(fixtureLessons);

// The fixtures are trimmed copies of the real upstream files (see the comment at the top
// of each), so the tests exercise the shapes actually published — without the network.

describe('parseRawChangelog', () => {
  it('reads `## <semver>` headings and their `- ` bullets', () => {
    const versions = parseRawChangelog(rawSample);
    expect(versions.map((v) => v.version)).toEqual(['2.1.265', '2.1.263', '2.1.261']);
    expect(versions[0].bullets).toHaveLength(6);
    expect(versions[0].bullets[1]).toContain('--plugin-dir');
  });

  it('finds nothing when the heading shape changes (the "parser broke" case)', () => {
    expect(parseRawChangelog(rawBroken)).toEqual([]);
  });

  it('folds an indented continuation line back into its bullet', () => {
    const versions = parseRawChangelog('## 9.9.9\n\n- Added a thing\n  that wrapped\n');
    expect(versions[0].bullets).toEqual(['Added a thing that wrapped']);
  });
});

describe('parseDocsChangelog', () => {
  it('reads <Update label description> blocks and their `* ` bullets', () => {
    const versions = parseDocsChangelog(docsSample);
    expect(versions.map((v) => v.version)).toEqual(['2.1.265', '2.1.263', '2.1.261']);
    expect(versions[0].date).toBe('September 8, 2026');
    expect(versions[0].bullets).toHaveLength(6);
  });

  it('produces a version -> date map', () => {
    expect(datesFromDocs(parseDocsChangelog(docsSample))['2.1.263']).toBe('September 6, 2026');
  });

  it('agrees with the raw changelog on the bullets it carries', () => {
    const raw = parseRawChangelog(rawSample);
    const docs = parseDocsChangelog(docsSample);
    expect(docs[0].bullets).toEqual(raw[0].bullets);
  });
});

describe('compareVersions', () => {
  it('orders dotted versions numerically, not lexically', () => {
    expect(compareVersions('2.1.265', '2.1.263')).toBeGreaterThan(0);
    expect(compareVersions('2.1.9', '2.1.10')).toBeLessThan(0);
    expect(compareVersions('2.1.263', '2.1.263')).toBe(0);
  });
});

describe('entryId', () => {
  it('is stable across whitespace, case and trailing punctuation', () => {
    expect(entryId('Fixed  the thing.')).toBe(entryId('fixed the thing'));
  });

  it('differs for different bullets', () => {
    expect(entryId('Added A')).not.toBe(entryId('Added B'));
  });

  it('ignores backticks, so re-quoting upstream does not resurrect an entry', () => {
    expect(normaliseBulletText('Added `--bg`')).toBe('added --bg');
    expect(entryId('Added `--bg`')).toBe(entryId('Added --bg'));
  });
});

describe('classifyBullet', () => {
  it('reads the leading verb and weights it', () => {
    expect(classifyBullet('Removed the old flag')).toMatchObject({ verb: 'Removed', weight: 5 });
    expect(classifyBullet('Fixed a crash')).toMatchObject({ verb: 'Fixed', weight: 1 });
  });

  it('handles both platform prefixes the changelog actually uses', () => {
    expect(classifyBullet('Windows: Fixed Read refusing every file')).toMatchObject({
      platform: 'Windows',
      verb: 'Fixed',
    });
    expect(classifyBullet('[VSCode] Added automatic archiving of sessions')).toMatchObject({
      platform: 'VSCode',
      verb: 'Added',
    });
  });

  it('does not mistake a mid-sentence colon for a platform prefix', () => {
    expect(
      classifyBullet('Improved `/workflows` agent detail: tool calls are marked'),
    ).toMatchObject({ platform: null, verb: 'Improved' });
  });
});

describe('extractTokens / bulletTokens', () => {
  it('indexes inline-backticked spans and code-fence identifiers', () => {
    const tokens = extractTokens(
      'A plugin has a `plugin.json`.\n\n```bash\nclaude --plugin-dir ./x\n```\n',
    );
    expect(tokens.has('plugin.json')).toBe(true);
    expect(tokens.has('--plugin-dir')).toBe(true);
  });

  it('does not turn a fence marker into a token', () => {
    expect([...extractTokens('```bash\nls\n```')].some((t) => t.includes('`'))).toBe(false);
  });

  it('pulls the backticked identifiers out of a changelog bullet', () => {
    const tokens = bulletTokens('Added support for pointing `--plugin-dir` at a folder');
    expect(tokens.has('--plugin-dir')).toBe(true);
  });
});

describe('routeBullet', () => {
  const index = fixtureIndex;

  it('routes a bullet to the lesson whose body carries the identifier', () => {
    const routed = routeBullet(
      'Added support for pointing `--plugin-dir` at a folder of plugins',
      index,
      { withContext: true },
    );
    expect(routed.noise).toBe(false);
    expect(routed.via).toBe('token');
    expect(routed.lessons[0].path).toContain('m12-plugins/01-plugin-anatomy.mdx');
    expect(routed.lessons[0].context?.[0].text).toContain('--plugin-dir');
  });

  it('caps the routed lessons at three', () => {
    const routed = routeBullet('Changed `plugin.json` and `claude plugin details`', index);
    expect(routed.lessons.length).toBeLessThanOrEqual(3);
  });

  it('falls back to the keyword -> tag map when a bullet has no backticked token', () => {
    const routed = routeBullet('Added a new hooks event for teammate handoff', index);
    expect(routed.via).toBe('tag');
    expect(routed.lessons[0].path).toContain('m07-hooks');
    expect(routed.noise).toBe(false);
  });

  it('classes an unrouted "Fixed" bullet as noise and never rescues it by topic', () => {
    const routed = routeBullet(
      'Fixed the status line flickering on resize in some terminals',
      index,
    );
    expect(routed.noise).toBe(true);
    expect(routed.lessons).toEqual([]);
  });

  it('keeps an unrouted non-Fixed bullet pending — a human still has to look at it', () => {
    const routed = routeBullet('Removed the quokka rendering subsystem entirely', index);
    expect(routed.noise).toBe(false);
    expect(routed.lessons).toEqual([]);
  });
});

describe('fetchDrift assertions', () => {
  const args = { docsText: docsSample, npmVersion: null, checkNpm: false };

  it('returns only versions newer than the pin', async () => {
    const snapshot = await fetchDrift({ pin: '2.1.263', rawText: rawSample, ...args });
    expect(snapshot.newer.map((v) => v.version)).toEqual(['2.1.265']);
    expect(snapshot.newest).toBe('2.1.265');
    expect(snapshot.dates['2.1.265']).toBe('September 8, 2026');
  });

  it('fails loudly instead of reporting zero drift when the heading shape changes', async () => {
    await expect(fetchDrift({ pin: '2.1.263', rawText: rawBroken, ...args })).rejects.toThrow(
      /parser broke/,
    );
  });

  it('fails when the pin itself is not among the parsed headings', async () => {
    await expect(fetchDrift({ pin: '9.9.9', rawText: rawSample, ...args })).rejects.toThrow(
      /parser broke.*9\.9\.9/s,
    );
  });

  it('fails when the docs mirror stops using <Update> blocks', async () => {
    await expect(
      fetchDrift({ pin: '2.1.263', rawText: rawSample, docsText: '# nothing', checkNpm: false }),
    ).rejects.toThrow(/parser broke/);
  });

  it('fails when npm is ahead of the newest parsed version', async () => {
    await expect(
      fetchDrift({ pin: '2.1.263', rawText: rawSample, docsText: docsSample, npmVersion: '2.2.0' }),
    ).rejects.toThrow(/npm publishes/);
  });

  it('accepts npm being level with the newest parsed version', async () => {
    const snapshot = await fetchDrift({
      pin: '2.1.263',
      rawText: rawSample,
      docsText: docsSample,
      npmVersion: '2.1.265',
    });
    expect(snapshot.npm).toBe('2.1.265');
  });
});

describe('routeDrift + ledger', () => {
  const index = fixtureIndex;

  async function snapshot() {
    return fetchDrift({
      pin: '2.1.263',
      rawText: rawSample,
      docsText: docsSample,
      checkNpm: false,
    });
  }

  it('counts pending, noise and already-recorded entries', async () => {
    const routed = routeDrift(await snapshot(), index, { pin: '2.1.263', entries: {} });
    expect(routed.counts.total).toBe(6);
    expect(routed.counts.pending + routed.counts.noise).toBe(6);
    expect(routed.counts.recorded).toBe(0);
  });

  it('drops an entry the ledger already records, whatever its status', async () => {
    const first = routeDrift(await snapshot(), index, { pin: '2.1.263', entries: {} });
    const id = first.pending[0].id;
    const routed = routeDrift(await snapshot(), index, {
      pin: '2.1.263',
      entries: { [id]: { version: '2.1.265', status: 'noop', note: 'no lesson claim', pr: null } },
    });
    expect(routed.pending.some((e) => e.id === id)).toBe(false);
    expect(routed.counts.recorded).toBe(1);
  });

  it('orders pending entries by verb weight times lessons hit', async () => {
    const routed = routeDrift(await snapshot(), index, { pin: '2.1.263', entries: {} });
    const priorities = routed.pending.map((e) => e.priority);
    expect([...priorities].sort((a, b) => b - a)).toEqual(priorities);
  });
});

describe('renderReport', () => {
  const base = { pin: '2.1.263', newest: '2.1.265' };
  const entry = (over = {}) => ({
    id: 'abc123abc123',
    text: 'Added a thing',
    verb: 'Added',
    version: '2.1.265',
    date: 'September 8, 2026',
    lessons: [{ path: 'content/en/l1-beginner/m01-start/01-what-is.mdx' }],
    ...over,
  });

  it('renders a markdown table and passes inside the thresholds', () => {
    const report = renderReport(
      { ...base, counts: { total: 1, noise: 0, recorded: 0, pending: 1 }, pending: [entry()] },
      { now: new Date('2026-09-09T00:00:00Z') },
    );
    expect(report.ok).toBe(true);
    expect(report.markdown).toContain('| Age | Version | Verb | Entry | Affects | id |');
    expect(report.markdown).toContain('`abc123abc123`');
    expect(report.markdown).toContain('Within thresholds');
  });

  it('fails when the oldest pending entry is more than 21 days old', () => {
    const report = renderReport(
      { ...base, counts: { total: 1, noise: 0, recorded: 0, pending: 1 }, pending: [entry()] },
      { now: new Date('2026-10-15T00:00:00Z') },
    );
    expect(report.ok).toBe(false);
    expect(report.reasons.join(' ')).toMatch(/oldest pending entry is 37 days old/);
  });

  it('fails when more than 20 entries are pending', () => {
    const pending = Array.from({ length: MAX_PENDING_ENTRIES + 1 }, (_, i) =>
      entry({ id: `id${i}`, text: `Added thing ${i}` }),
    );
    const report = renderReport(
      {
        ...base,
        counts: { total: pending.length, noise: 0, recorded: 0, pending: pending.length },
        pending,
      },
      { now: new Date('2026-09-09T00:00:00Z') },
    );
    expect(report.ok).toBe(false);
    expect(report.reasons.join(' ')).toMatch(/21 entries are pending/);
  });

  it('escapes a pipe so one bullet cannot break the table', () => {
    const report = renderReport(
      {
        ...base,
        counts: { total: 1, noise: 0, recorded: 0, pending: 1 },
        pending: [entry({ text: 'Added `a|b` matching' })],
      },
      { now: new Date('2026-09-09T00:00:00Z') },
    );
    expect(report.markdown).toContain('a\\|b');
  });

  it('says so plainly when nothing is pending', () => {
    const report = renderReport({
      ...base,
      counts: { total: 0, noise: 0, recorded: 0, pending: 0 },
      pending: [],
    });
    expect(report.ok).toBe(true);
    expect(report.markdown).toContain('Nothing pending');
  });
});

describe('ageInDays', () => {
  it('reads the docs mirror date format', () => {
    expect(ageInDays('September 8, 2026', new Date('2026-09-09T12:00:00Z'))).toBe(1);
  });

  it('returns null for a version the docs mirror does not date', () => {
    expect(ageInDays(null)).toBeNull();
  });
});

describe('the real ledger', () => {
  it('is valid JSON with a dotted pin and an entries object', async () => {
    const ledger = JSON.parse(
      await readFile(
        fileURLToPath(new URL('../research/changelog/reviewed.json', import.meta.url)),
        'utf8',
      ),
    );
    expect(ledger.pin).toMatch(/^\d+\.\d+\.\d+$/);
    expect(typeof ledger.entries).toBe('object');
    for (const [id, entry] of Object.entries(ledger.entries)) {
      expect(id).toMatch(/^[0-9a-f]{12}$/);
      expect(['applied', 'noop', 'escalated']).toContain((entry as { status: string }).status);
    }
  });
});

// --- adversarial-review regressions (P49) ------------------------------------------------------
// Each of these reproduces a defect found by review; all four "fail open" shapes are covered.

describe('compareVersions is total and loud', () => {
  it('orders a pre-release below its release and above the previous release', () => {
    expect(compareVersions('2.1.266-rc.1', '2.1.265')).toBeGreaterThan(0);
    expect(compareVersions('2.1.265-rc.1', '2.1.265')).toBeLessThan(0);
    expect(compareVersions('2.1.265-rc.1', '2.1.265-rc.2')).toBeLessThan(0);
    expect(compareVersions('2.1.265-alpha', '2.1.265-beta')).toBeLessThan(0);
  });

  it('throws rather than returning NaN on an uncomparable value', () => {
    expect(() => compareVersions('latest', '2.1.265')).toThrow(/not a comparable version/);
    expect(() => compareVersions('2.1.x', '2.1.265')).toThrow(/not a comparable version/);
  });
});

describe('parseRawChangelog marks headings it cannot understand', () => {
  it('does not fold a decorated heading into the previous section', () => {
    const parsed = parseRawChangelog(
      '## 2.1.265\n\n- Added a\n\n## 2.1.263 (2026-09-02)\n\n- Added b\n',
    );
    expect(parsed.map((v) => v.version)).toEqual(['2.1.265', null]);
    expect(parsed[0].bullets).toEqual(['Added a']);
    expect(parsed[1].raw).toBe('2.1.263 (2026-09-02)');
  });
});

describe('fetchDrift anchors', () => {
  const opts = { docsText: docsSample, checkNpm: false };

  it('refuses to report drift when an unrecognised `## …` heading exists', async () => {
    const raw = rawSample.replace('## 2.1.265', '## 2.2.0-beta.1\n\n- Added x\n\n## 2.1.265');
    await expect(fetchDrift({ pin: '2.1.263', rawText: raw, ...opts })).rejects.toThrow(
      /unrecognised '## …' heading/,
    );
  });

  it('refuses when the top section is lost entirely', async () => {
    const raw = rawSample.replace(/## 2\.1\.265[\s\S]*?(?=## 2\.1\.263)/, '');
    await expect(fetchDrift({ pin: '2.1.265', rawText: raw, ...opts })).rejects.toThrow(
      /Refusing to report drift|older than the ledger pin/,
    );
  });

  it('refuses when the newest parsed version is older than the pin', async () => {
    // Reached directly: with the pin-membership anchor in front of it this is defence in depth.
    const raw = '## 2.1.265\n\n- Added a\n\n## 2.1.263\n\n- Added b\n';
    await expect(fetchDrift({ pin: '2.1.265', rawText: raw, ...opts })).resolves.toBeTruthy();
    await expect(fetchDrift({ pin: '2.1.300', rawText: raw, ...opts })).rejects.toThrow(
      /Refusing to report drift/,
    );
  });

  it('refuses when fewer headings parse than the recorded floor', async () => {
    await expect(
      fetchDrift({ pin: '2.1.265', rawText: rawSample, minVersions: 50, ...opts }),
    ).rejects.toThrow(/below the recorded floor/);
  });

  it('throws when npm publishes a pre-release ahead of the newest parsed heading', async () => {
    await expect(
      fetchDrift({
        pin: '2.1.265',
        rawText: rawSample,
        docsText: docsSample,
        npmVersion: '2.1.266-rc.1',
      }),
    ).rejects.toThrow(/npm publishes/);
  });
});

describe('classifyBullet covers the verbs a changelog actually uses', () => {
  it('weights Reverted/Restored and recognises a lowercase verb', () => {
    expect(classifyBullet('Reverted the X flag')).toMatchObject({ verb: 'Reverted', weight: 5 });
    expect(classifyBullet('Restored old behaviour')).toMatchObject({ verb: 'Restored', weight: 4 });
    expect(classifyBullet('fixed a thing')).toMatchObject({ verb: 'Fixed', weight: 1 });
    expect(classifyBullet('Bug fixes and reliability improvements')).toMatchObject({ weight: 1 });
  });
});

describe('routeBullet', () => {
  it('classes boilerplate as noise so it can never freeze the pin', () => {
    const r = routeBullet('Bug fixes and reliability improvements', fixtureIndex);
    expect(r.noise).toBe(true);
  });

  it('routes a Fixed bullet whose identifier is not backticked', () => {
    const r = routeBullet(
      'Fixed agent teammates and resumed subagents moving SubagentStart hook context out of the prompt prefix',
      fixtureIndex,
    );
    expect(r.noise).toBe(false);
    expect(r.lessons.length).toBeGreaterThan(0);
  });

  it('gives a tag-routed entry real context instead of an empty array', () => {
    const r = routeBullet('Changed how hooks receive session context on resume', fixtureIndex, {
      withContext: true,
    });
    expect(r.via).toBe('tag');
    expect(r.lessons.length).toBeGreaterThan(0);
    expect(r.lessons.every((l) => (l.context ?? []).length > 0)).toBe(true);
  });
});

describe('escapeCell', () => {
  it('neutralises raw HTML and backticks so a bullet cannot render as markup', () => {
    const routed = {
      pin: '2.1.261',
      newest: '2.1.265',
      counts: { total: 1, noise: 0, recorded: 0, pending: 1 },
      pending: [
        {
          id: 'x',
          version: '2.1.265',
          verb: 'Added',
          text: 'Added <img src=x onerror=alert(1)> and a `tick`',
          date: null,
          lessons: [],
        },
      ],
    };
    const { markdown } = renderReport(routed);
    expect(markdown).not.toContain('<img');
    expect(markdown).toContain('&lt;img');
  });
});
