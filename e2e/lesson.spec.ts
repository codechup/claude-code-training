import { expect, test, type Page } from '@playwright/test';

// Level/module/lesson routes, exercised against the M0 release lesson
// (content/{en,tr}/l1-beginner/m01-start/01-what-claude-code-is.mdx, written
// by P12). P06's `00-placeholder` pair is gone, so these assertions now run
// against real content in both languages rather than a scaffold stub.

const EN = '/en/l1-beginner/m01-start/what-claude-code-is/';
const TR = '/tr/l1-beginner/m01-start/what-claude-code-is/';

/** The page's own content column, excluding the header drawer's rail copy. */
const main = (page: Page) => page.locator('main#main');

test('level index lists its modules', async ({ page }) => {
  const response = await page.goto('/en/l1-beginner/');
  expect(response?.status()).toBe(200);
  await expect(page.locator('h1')).toBeVisible();
  // Scoped to the main landmark: KILN §7.2 slots the full curriculum rail
  // into the (closed) header drawer on every page type, so an unscoped
  // locator also matches the drawer copy of the same link.
  await expect(main(page).locator('a[href="/en/l1-beginner/m01-start/"]')).toBeVisible();
});

test('module index lists its lessons', async ({ page }) => {
  const response = await page.goto('/en/l1-beginner/m01-start/');
  expect(response?.status()).toBe(200);
  await expect(page.locator('h1')).toBeVisible();
  await expect(main(page).locator(`a[href="${EN}"]`).first()).toBeVisible();
});

test('lesson page renders title, sources and the shared shell', async ({ page }) => {
  const response = await page.goto(EN);
  expect(response?.status()).toBe(200);
  await expect(page.locator('h1')).toContainText('What Claude Code is and how it works');
  // `header` alone is ambiguous now: `LessonMeta` renders a `<header>` of
  // its own around the title, so this asks for the banner landmark.
  await expect(page.getByRole('banner')).toBeVisible();
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
  await expect(main(page).locator(`a[href="${TR}"]`).first()).toBeVisible();
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

  // Module progress bar renders "n / m lessons" from localStorage (D020).
  // Kiln states the count, never the internal module id — the module is
  // already named by the page title and the breadcrumb.
  await expect(page.getByText(/0 \/ \d+ lessons/)).toBeVisible();

  // "On this page" lists the lesson's real H2s. Kiln renders the context
  // column once and presents it two ways (sticky column >= 1240, disclosure
  // below), so the list is in the DOM at every width — the disclosure is
  // opened first where that is how it is reached.
  const ctxToggle = page.locator('.cc-lesson__ctx-toggle');
  if (await ctxToggle.isVisible()) await ctxToggle.locator('summary').click();
  const toc = page.getByRole('navigation', { name: 'On this page' });
  await expect(toc.locator('a[href="#concept"]')).toBeVisible();
  await expect(toc.locator('a[href="#hands-on-lab"]')).toBeVisible();
});

test('marking a lesson done round-trips through localStorage', async ({ page }) => {
  await page.goto(EN);
  const toggle = page.getByRole('button', { name: 'Mark as done' });
  await toggle.click();
  await expect(page.getByText(/1 \/ \d+ lessons/)).toBeVisible();

  const stored = await page.evaluate(() => window.localStorage.getItem('cc:progress:en'));
  expect(stored).toContain('en/l1-beginner/m01-start/what-claude-code-is');

  await page.reload();
  await expect(page.getByText(/1 \/ \d+ lessons/)).toBeVisible();
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
      // KILN §8.4 gives the variant a deliberately stronger label.
      whenNotTo: 'When NOT to use this',
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
      await expect(lab.locator('.cc-lab__steps > li')).toHaveCount(5);
      await expect(lab.locator('.cc-lab__expected')).toBeVisible();
      await expect(lab.locator('.cc-lab__checklist input[type="checkbox"]')).toHaveCount(5);
      await expect(page.locator('figure.cc-term')).toHaveCount(4);
      // Every transcript links back to its raw recording in the repository.
      const raw = page.locator('figure.cc-term a.cc-term__raw').first();
      await expect(raw).toHaveAttribute(
        'href',
        /content\/_shared\/transcripts\/m01-start\/.+\.txt$/,
      );

      // Quiz: three questions (D064), each a real radio group.
      await expect(page.locator('.cc-quiz')).toHaveCount(3);

      // Sources: at least one official docs entry, marked as such (D041).
      await expect(page.locator('.cc-sources__chip--official').first()).toBeVisible();
      await expect(
        page.locator('.cc-sources a[href*="code.claude.com/docs"]').first(),
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

// Round-3 defect: a wide prose table used to be its own scroller. It scrolled,
// but the reader saw nothing to say so and a keyboard could not reach it —
// axe raised `scrollable-region-focusable` (serious) on both tables of this
// lesson at 390px. Each table is now wrapped at build time (src/lib/prose-hast.ts)
// in a focusable `.cc-table-scroll` container.
test('every prose table sits in a focusable scroll container', async ({ page }) => {
  await page.goto('/en/l1-beginner/m01-start/install/');

  const tables = page.locator('.cc-body table');
  const count = await tables.count();
  expect(count).toBeGreaterThan(0);

  for (let i = 0; i < count; i += 1) {
    const wrapper = tables.nth(i).locator('xpath=..');
    await expect(wrapper).toHaveClass(/cc-table-scroll/);
    await expect(wrapper).toHaveAttribute('tabindex', '0');
    expect(await wrapper.evaluate((el) => getComputedStyle(el).overflowX)).toBe('auto');
  }
});

// Round-3 defect: the whole label row was always the hit area (a `<label>`
// forwards its clicks), but the control itself measured 22x22 and read as a
// sub-44px target. The input now fills its row, so what the pointer lands on
// and what an audit measures are the same box.
test('a lab checkbox and a quiz answer are hit anywhere on their row', async ({ page }) => {
  await page.goto(EN);

  for (const [row, control] of [
    ['.cc-lab__check', '.cc-lab__box'],
    ['.cc-quiz__option', '.cc-quiz__radio'],
  ]) {
    const hits = await page.evaluate(
      ([rowSel, ctrlSel]) => {
        const el = document.querySelector(rowSel)!;
        el.scrollIntoView({ block: 'center' });
        const r = el.getBoundingClientRect();
        const ctrl = el.querySelector(ctrlSel);
        const corners: [number, number][] = [
          [r.left + 2, r.top + 2],
          [r.right - 2, r.top + 2],
          [r.left + 2, r.bottom - 2],
          [r.right - 2, r.bottom - 2],
        ];
        return {
          size: [Math.round(r.width), Math.round(r.height)],
          all: corners.every(([x, y]) => document.elementFromPoint(x, y) === ctrl),
        };
      },
      [row, control],
    );
    expect(hits.size[0]).toBeGreaterThanOrEqual(44);
    expect(hits.size[1]).toBeGreaterThanOrEqual(44);
    expect(hits.all).toBe(true);
  }
});
