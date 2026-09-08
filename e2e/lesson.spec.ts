import { expect, test } from '@playwright/test';

// Level/module/lesson routes, exercised against the M0 release lesson
// (content/{en,tr}/l1-beginner/m01-start/01-what-claude-code-is.mdx, written
// by P12). P06's `00-placeholder` pair is gone, so these assertions now run
// against real content in both languages rather than a scaffold stub.

const EN = '/en/l1-beginner/m01-start/what-claude-code-is/';
const TR = '/tr/l1-beginner/m01-start/what-claude-code-is/';

test('level index lists its modules', async ({ page }) => {
  const response = await page.goto('/en/l1-beginner/');
  expect(response?.status()).toBe(200);
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('a[href="/en/l1-beginner/m01-start/"]')).toBeVisible();
});

test('module index lists its lessons', async ({ page }) => {
  const response = await page.goto('/en/l1-beginner/m01-start/');
  expect(response?.status()).toBe(200);
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator(`a[href="${EN}"]`).first()).toBeVisible();
});

test('lesson page renders title, sources and the shared shell', async ({ page }) => {
  const response = await page.goto(EN);
  expect(response?.status()).toBe(200);
  await expect(page.locator('h1')).toContainText('What Claude Code is and how it works');
  await expect(page.locator('header')).toBeVisible();
  await expect(page.locator('footer')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Sources' })).toBeVisible();
});

test('the TR twin is live and is a real translation', async ({ page }) => {
  const response = await page.goto(TR);
  expect(response?.status()).toBe(200);
  await expect(page.locator('html')).toHaveAttribute('lang', 'tr');
  await expect(page.locator('h1')).toContainText('Claude Code nedir ve nasıl çalışır');
  // Turkish diacritics survive the pipeline (D018) and the Sources block is
  // the localised one, not the English string.
  await expect(page.getByRole('heading', { name: 'Kaynaklar' })).toBeVisible();
});

test('TR module index lists the translated lesson', async ({ page }) => {
  await page.goto('/tr/l1-beginner/m01-start/');
  await expect(page.locator(`a[href="${TR}"]`).first()).toBeVisible();
});

// Un-skipped by P06 (content-pipeline), rewritten by P12 (M0 release): the
// placeholder lesson that used to give m01-start a second entry is gone, so
// m01-start holds exactly one lesson and the prev/next bar has neither
// neighbour to point at until P13 writes 02-install.
test('lesson prev/next bar, TOC and module progress', async ({ page }) => {
  await page.goto(EN);

  // m01-start holds exactly one lesson at M0, so both slots render their
  // empty spacer: the bar is in the DOM, with neither a prev nor a next link.
  const prevNext = page.getByRole('navigation', { name: 'Previous / Next' });
  await expect(prevNext).toHaveCount(1);
  // Lesson 01 is the first of its module: no prev link; a next link once the
  // module has more than one live lesson (P13 onward).
  await expect(prevNext.locator('a[rel="prev"]')).toHaveCount(0);

  // Module progress bar renders "n / m in m01" from localStorage (D020).
  await expect(page.getByText(/0 \/ \d+ in m01/)).toBeVisible();

  // "On this page" lists the lesson's real H2s.
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(EN);
  const toc = page.getByRole('navigation', { name: 'On this page' });
  await expect(toc.locator('a[href="#concept"]')).toBeVisible();
  await expect(toc.locator('a[href="#hands-on-lab"]')).toBeVisible();
});

test('marking a lesson done round-trips through localStorage', async ({ page }) => {
  await page.goto(EN);
  const toggle = page.getByRole('button', { name: 'Mark as done' });
  await toggle.click();
  await expect(page.getByText(/1 \/ \d+ in m01/)).toBeVisible();

  const stored = await page.evaluate(() => window.localStorage.getItem('cc:progress:en'));
  expect(stored).toContain('en/l1-beginner/m01-start/what-claude-code-is');

  await page.reload();
  await expect(page.getByText(/1 \/ \d+ in m01/)).toBeVisible();
});

// Un-skipped by P12 (the M0 release plan), replacing
// `test.fixme('full curriculum navigation — pending P13+ …')`. The full
// curriculum is still only one lesson deep, so this asserts what the M0
// release actually ships: every D006 template section present, in order, in
// both languages, rendered by real MDX components rather than raw markdown.
test.describe('M0 release lesson: the D006 template renders end to end', () => {
  const cases = [
    {
      lang: 'en',
      path: EN,
      headings: [
        'Objectives & prerequisites',
        'Concept',
        'Hands-on lab',
        'Anti-patterns',
        'Quiz',
        'Sources',
      ],
      whenNotTo: 'When not to use this',
      changed: 'Changed',
    },
    {
      lang: 'tr',
      path: TR,
      headings: [
        'Hedefler ve ön koşullar',
        'Kavram',
        'Uygulamalı laboratuvar',
        'Anti-pattern’ler',
        'Quiz',
        'Kaynaklar',
      ],
      whenNotTo: 'Bunu ne zaman kullanmamalı',
      changed: 'Değişti',
    },
  ] as const;

  for (const c of cases) {
    test(`${c.lang}: sections, components and the real transcripts`, async ({ page }) => {
      await page.goto(c.path);

      for (const heading of c.headings) {
        await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
      }

      // The two template sections that are callouts, not headings (D006/D044).
      await expect(page.getByText(c.whenNotTo, { exact: true })).toBeVisible();
      await expect(page.getByText(c.changed, { exact: true })).toBeVisible();

      // Lab: numbered steps, an expected result, a checklist, and four real
      // captured transcripts (D099) — no fabricated output anywhere.
      const lab = page.locator('.cc-lab');
      await expect(lab).toHaveCount(1);
      await expect(lab.locator('.cc-lab-steps li')).toHaveCount(5);
      await expect(lab.locator('.cc-lab-expected')).toBeVisible();
      await expect(lab.locator('.cc-lab-checklist input[type="checkbox"]')).toHaveCount(5);
      await expect(page.locator('figure.cc-transcript')).toHaveCount(4);
      // Every transcript links back to its raw recording in the repository.
      const raw = page.locator('figure.cc-transcript a.cc-transcript-raw').first();
      await expect(raw).toHaveAttribute(
        'href',
        /content\/_shared\/transcripts\/m01-start\/.+\.txt$/,
      );

      // Quiz: three questions (D064), each a real radio group.
      await expect(page.locator('.cc-quiz')).toHaveCount(3);

      // Sources: at least one official docs entry, marked as such (D041).
      await expect(page.locator('.cc-mdx-sources-official').first()).toBeVisible();
      await expect(
        page.locator('.cc-mdx-sources a[href*="code.claude.com/docs"]').first(),
      ).toBeVisible();

      // The lesson is not a placeholder any more.
      await expect(page.locator('.cc-placeholder')).toHaveCount(0);
    });
  }
});

// Playbook and Meta (P42/P44): the two non-numbered reference trees, whose
// "modules" are standalone pages rather than lesson groups (see
// `src/pages/[lang]/[level]/index.astro` and `.../[module]/index.astro`).
// They shipped after this suite was written, so this covers every EN route
// in both sections and their TR twins with the same checks the lesson/section
// tests above already make (200, a visible h1 matching the real title, and
// the shared shell). Full axe passes are sampled rather than run on every one
// of these 20 routes — see the dedicated block in a11y.spec.ts.
test.describe('Playbook and Meta section pages', () => {
  const routes: { path: string; lang: 'en' | 'tr'; h1: string }[] = [
    // Playbook (EN) — six routes: the level index plus its five reference pages.
    { path: '/en/playbook/', lang: 'en', h1: 'Playbook' },
    { path: '/en/playbook/decision-trees/', lang: 'en', h1: 'Decision trees' },
    { path: '/en/playbook/best-practices/', lang: 'en', h1: 'Best-practice digest' },
    { path: '/en/playbook/anti-patterns/', lang: 'en', h1: 'Anti-pattern catalogue' },
    { path: '/en/playbook/changelog/', lang: 'en', h1: 'Changed since 2025' },
    { path: '/en/playbook/glossary/', lang: 'en', h1: 'Glossary' },
    // Playbook (TR twins) — decision-trees, best-practices, anti-patterns and
    // changelog are draft:true stubs (P44 in progress); sections aren't
    // subject to the lesson draft mechanism, so they still route and render.
    { path: '/tr/playbook/', lang: 'tr', h1: 'Playbook' },
    { path: '/tr/playbook/decision-trees/', lang: 'tr', h1: 'Karar ağaçları' },
    { path: '/tr/playbook/best-practices/', lang: 'tr', h1: 'En iyi pratikler özeti' },
    { path: '/tr/playbook/anti-patterns/', lang: 'tr', h1: 'Anti-pattern kataloğu' },
    { path: '/tr/playbook/changelog/', lang: 'tr', h1: "2025'ten beri değişenler" },
    { path: '/tr/playbook/glossary/', lang: 'tr', h1: 'Sözlük' },
    // Meta (EN) — four routes.
    { path: '/en/meta/', lang: 'en', h1: 'Meta' },
    { path: '/en/meta/how-this-site-was-built/', lang: 'en', h1: 'How this site was built' },
    { path: '/en/meta/contributing/', lang: 'en', h1: 'Contributing' },
    { path: '/en/meta/sources-index/', lang: 'en', h1: 'Sources index' },
    // Meta (TR twins) — how-this-site-was-built, contributing and
    // sources-index are draft:true stubs (P44 in progress).
    { path: '/tr/meta/', lang: 'tr', h1: 'Meta' },
    { path: '/tr/meta/how-this-site-was-built/', lang: 'tr', h1: 'Bu site nasıl inşa edildi' },
    { path: '/tr/meta/contributing/', lang: 'tr', h1: 'Katkıda bulunma' },
    { path: '/tr/meta/sources-index/', lang: 'tr', h1: 'Kaynak dizini' },
  ];

  for (const { path, lang, h1 } of routes) {
    test(`${path} renders its title, lang and the shared shell`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('lang', lang);
      await expect(page.locator('h1')).toContainText(h1);
      // The page banner, not the `.cc-head` wrapper these section pages also
      // render around their own h1/description.
      await expect(page.getByRole('banner')).toBeVisible();
      await expect(page.locator('footer')).toBeVisible();
    });
  }

  test('the EN playbook index links to all five reference pages', async ({ page }) => {
    await page.goto('/en/playbook/');
    for (const slug of [
      'decision-trees',
      'best-practices',
      'anti-patterns',
      'changelog',
      'glossary',
    ]) {
      // Scoped to the rendered MDX body: the sidebar nav (`Curriculum`) also
      // links to every section, which would otherwise make this ambiguous.
      await expect(page.locator(`.cc-prose a[href="/en/playbook/${slug}/"]`)).toBeVisible();
    }
  });

  test('the EN meta index links to its three other pages', async ({ page }) => {
    await page.goto('/en/meta/');
    for (const slug of ['how-this-site-was-built', 'contributing', 'sources-index']) {
      await expect(page.locator(`.cc-prose a[href="/en/meta/${slug}/"]`)).toBeVisible();
    }
  });
});

test('a quiz answer is scored instantly and survives a reload', async ({ page }) => {
  await page.goto(EN);
  const quiz = page.locator('.cc-quiz').first();
  await quiz.getByRole('radio').nth(1).check();
  await expect(quiz.getByText('Correct.')).toBeVisible();

  const stored = await page.evaluate(() =>
    window.localStorage.getItem('cc:quiz:en/l1-beginner/m01-start/what-claude-code-is'),
  );
  expect(stored).toContain('q1');

  await page.reload();
  await expect(page.locator('.cc-quiz').first().getByRole('radio').nth(1)).toBeChecked();
});
