import { expect, test } from '@playwright/test';
import { curriculumTree, langSwitch, themeToggle } from './helpers/chrome.ts';

// Structural checks for the shared shell (Header/Footer/LangSwitch/ThemeToggle)
// against the routes P01's stub currently serves. Content-specific assertions
// (lesson prose, nav breadcrumbs beyond what's here) belong to the plans that
// own that content (P06+) — this spec only proves the shell itself works.

for (const lang of ['en', 'tr'] as const) {
  test.describe(`shell: /${lang}/`, () => {
    test(`renders header, footer and correct html[lang]`, async ({ page }) => {
      const response = await page.goto(`/${lang}/`);
      expect(response?.status()).toBe(200);

      await expect(page.locator('html')).toHaveAttribute('lang', lang);
      await expect(
        page
          .getByRole('banner')
          .locator('a[href$="/' + lang + '/"]')
          .first(),
      ).toBeVisible();
      await expect(page.locator('footer')).toBeVisible();
      // Footer/Footer.astro's copy is per-locale (see src/components/shell/Footer.astro);
      // the verified Claude Code version number is the one substring common to both.
      await expect(page.locator('footer')).toContainText('2.1.263');
    });

    test('lang switch points at the other locale', async ({ page }) => {
      await page.goto(`/${lang}/`);
      const other = lang === 'en' ? 'tr' : 'en';
      // Kiln moves the control into the drawer below 1024px — the helper
      // resolves whichever copy this viewport actually shows.
      const switchLink = await langSwitch(page);
      await expect(switchLink).toBeVisible();
      await expect(switchLink).toHaveAttribute('href', `/${other}/`);
    });
  });
}

// LangSwitch (P06): when the sibling-language page is `draft: true` there is
// no page to link to, so the switch renders static text instead of a link
// into a 404. P12 translated the one lesson the repository has, so nothing
// is a draft at M0 and the drafted-target branch has no live subject left to
// drive — the unit coverage for it lives in `src/lib/nav`'s tests, and this
// spec asserts the working-link branch against the real bilingual lesson.
test.describe('lang switch: live target', () => {
  test('round-trips EN <-> TR on the bilingual lesson', async ({ page }) => {
    await page.goto('/en/l1-beginner/m01-start/what-claude-code-is/');
    const toTr = await langSwitch(page);
    await expect(toTr).toHaveAttribute('href', '/tr/l1-beginner/m01-start/what-claude-code-is/');
    await toTr.click();
    await page.waitForURL('**/tr/l1-beginner/m01-start/what-claude-code-is/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'tr');

    // The choice is remembered for the origin's `/` redirect (D017).
    const cookies = await page.context().cookies();
    expect(cookies.find((c) => c.name === 'cc_lang')?.value).toBe('tr');

    await expect(await langSwitch(page)).toHaveAttribute(
      'href',
      '/en/l1-beginner/m01-start/what-claude-code-is/',
    );
  });
});

// The tree is rendered TWICE on a lesson page (rail column + header drawer)
// and exactly one copy has layout at any viewport, so this scopes to the one
// the reader can reach instead of matching the role name, which would hit
// both and fail strict mode.
test('nav tree renders the whole curriculum on a lesson page', async ({ page }) => {
  await page.goto('/en/l1-beginner/m01-start/what-claude-code-is/');
  const sidebar = await curriculumTree(page);

  // Every level, first to last, is reachable without opening anything…
  await expect(sidebar.locator('a.cc-rail__level-link[href="/en/l1-beginner/"]')).toBeVisible();
  await expect(sidebar.locator('a.cc-rail__level-link[href="/en/l4-master/"]')).toBeVisible();

  // …and so is every module, as a disclosure summary. Kiln collapses the
  // modules the reader is not in (KILN §8.8), so their LESSON rows are
  // deliberately hidden until the module is opened — the old assertion on a
  // deep lesson href was asserting the absence of that disclosure.
  const distant = sidebar.locator('details.cc-rail__disclosure', {
    has: page.locator('a[href="/en/l4-master/m21-scale/"]'),
  });
  await expect(distant.locator('summary.cc-rail__module')).toBeVisible();
  await expect(distant).not.toHaveAttribute('open', '');
  await distant.locator('summary.cc-rail__module').click();
  await expect(distant.locator('a[href="/en/l4-master/m21-scale/"]')).toBeVisible();

  // The reader's own module is expanded to its lessons on arrival, with the
  // current lesson marked.
  await expect(
    sidebar.locator('a[href="/en/l1-beginner/m01-start/what-claude-code-is/"]'),
  ).toBeVisible();
  await expect(
    sidebar.locator('a[href="/en/l1-beginner/m01-start/what-claude-code-is/"]'),
  ).toHaveAttribute('aria-current', 'page');
});

// Real defect found by P47 (docs/launch/hardening.md §3/§7): the skip link
// jumped the visual scroll position but never moved keyboard focus, because
// none of the three layouts gave their `<main id="main">` a `tabindex="-1"`.
// This drives the link the way a keyboard-only visitor actually would —
// Tab from a fresh page load, Enter to activate — and asserts the DOM's
// actual focus target, not just the URL fragment.
test.describe('skip link', () => {
  test('Tab reaches the skip link and activating it moves keyboard focus into main', async ({
    page,
  }) => {
    await page.goto('/en/l1-beginner/m01-start/what-claude-code-is/');

    // The skip link is the first focusable element in the document.
    await page.keyboard.press('Tab');
    const skipLink = page.locator('.cc-skip');
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toHaveAttribute('href', '#main');

    await page.keyboard.press('Enter');

    const isMainFocused = await page.evaluate(
      () => document.activeElement === document.getElementById('main'),
    );
    expect(isMainFocused).toBe(true);
  });

  // Round-3 defect: the resting link is translated off the top of the screen,
  // but a transform does not clip what a box paints, so `--cc-shadow-2`
  // (0 18px 44px) fell back into the viewport as a pale rounded smudge beside
  // the brand mark on every page, in both themes, at every width. Elevation
  // now belongs to the focused state only.
  test('casts no shadow while it is off-screen, and one once focused', async ({ page }) => {
    await page.goto('/en/l1-beginner/m01-start/what-claude-code-is/');
    const skipLink = page.locator('.cc-skip');

    const shadowOf = () =>
      skipLink.evaluate((el) => getComputedStyle(el).boxShadow) as Promise<string>;

    expect(await shadowOf()).toBe('none');
    expect(await skipLink.evaluate((el) => el.getBoundingClientRect().bottom)).toBeLessThan(0);

    await page.keyboard.press('Tab');
    await expect(skipLink).toBeFocused();
    expect(await shadowOf()).not.toBe('none');
    // It slides in over `--cc-dur`, so poll rather than measure on the frame
    // the focus landed.
    await expect
      .poll(() => skipLink.evaluate((el) => el.getBoundingClientRect().top))
      .toBeGreaterThanOrEqual(0);
  });
});

// Round-3 defect: `/design/` aliased itself to Meta, so the header underlined
// "Meta" while the reader was on a page that is neither in Meta nor anywhere
// in the locale tree. KILN §7.2 names exactly three nav items; on /design/
// none of them is current.
test('the header marks no section as current on /design/', async ({ page }) => {
  await page.goto('/design/');
  await expect(page.locator('.cc-header__nav a')).toHaveCount(3);
  await expect(page.locator('.cc-header__nav a[aria-current]')).toHaveCount(0);
});

// Kiln retired the three-segment control for ONE icon button that cycles
// system -> light -> dark (KILN §7.2). `data-theme` therefore carries the
// RESOLVED theme, not the choice: from "system" under a light OS preference
// the first click lands on "light" and the attribute does not move, which is
// correct behaviour and what the pre-Kiln assertion mistook for a failure.
// The choice itself lives in `data-choice`, the button's accessible name
// names the state it will go to next, and `cc:theme` is what persists.
test.describe('theme toggle', () => {
  test('cycles system -> light -> dark and persists the choice', async ({ page }) => {
    await page.goto('/en/');
    const html = page.locator('html');
    const toggle = await themeToggle(page);
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('data-choice', 'system');

    await toggle.click();
    await expect(toggle).toHaveAttribute('data-choice', 'light');
    await expect(html).toHaveAttribute('data-theme', 'light');

    await toggle.click();
    await expect(toggle).toHaveAttribute('data-choice', 'dark');
    await expect(html).toHaveAttribute('data-theme', 'dark');

    // An icon-only control must say which way it will go (KILN §7.2).
    await expect(toggle).toHaveAttribute('aria-label', /.+/);

    await page.reload();
    await expect(html).toHaveAttribute('data-theme', 'dark');
    await expect(await themeToggle(page)).toHaveAttribute('data-choice', 'dark');

    // Third click returns to "system".
    await (await themeToggle(page)).click();
    await expect(await themeToggle(page)).toHaveAttribute('data-choice', 'system');
    expect(await page.evaluate(() => window.localStorage.getItem('cc:theme'))).toBe('system');
  });
});

// OS-specific command tabs: P07 ships `OSTabs` (four tabs, D002) and P12's
// M0 release lesson is the first page that renders one, so this is no longer
// a fixme. The macro OS lives in the shared `cc:os` key and the Windows
// PowerShell/WSL sub-choice in `cc:os:shell` (src/components/mdx/os-tabs.ts).
test.describe('OS tabs', () => {
  const LESSON_EN = '/en/l1-beginner/m01-start/what-claude-code-is/';
  const LESSON_TR = '/tr/l1-beginner/m01-start/what-claude-code-is/';

  test('shows all four tabs and switches panels', async ({ page }) => {
    await page.goto(LESSON_EN);
    const tablist = page.getByRole('tablist', { name: 'Operating system' });
    await expect(tablist.getByRole('tab')).toHaveCount(4);

    const linux = tablist.getByRole('tab', { name: 'Linux' });
    await linux.click();
    await expect(linux).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('tabpanel')).toContainText(
      'curl -fsSL https://claude.ai/install.sh',
    );
  });

  test('the choice persists across a real navigation', async ({ page }) => {
    await page.goto(LESSON_EN);
    const tablist = page.getByRole('tablist', { name: 'Operating system' });
    await tablist.getByRole('tab', { name: 'Windows (WSL)' }).click();

    const stored = await page.evaluate(() => ({
      os: window.localStorage.getItem('cc:os'),
      shell: window.localStorage.getItem('cc:os:shell'),
    }));
    expect(stored).toEqual({ os: 'windows', shell: 'wsl' });

    // Navigate to the TR twin — a different page, same stored preference.
    await page.goto(LESSON_TR);
    await expect(
      page.getByRole('tablist', { name: 'Operating system' }).getByRole('tab', {
        name: 'Windows (WSL)',
      }),
    ).toHaveAttribute('aria-selected', 'true');
  });
});
