import { expect, test } from '@playwright/test';

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
      await expect(page.locator('header a[href$="/' + lang + '/"]').first()).toBeVisible();
      await expect(page.locator('footer')).toBeVisible();
      // Footer/Footer.astro's copy is per-locale (see src/components/shell/Footer.astro);
      // the verified Claude Code version number is the one substring common to both.
      await expect(page.locator('footer')).toContainText('2.1.263');
    });

    test('lang switch points at the other locale', async ({ page }) => {
      await page.goto(`/${lang}/`);
      const other = lang === 'en' ? 'tr' : 'en';
      const switchLink = page.locator('#cc-lang-switch');
      await expect(switchLink).toBeVisible();
      // Client-side script rewrites href from "#" to the sibling-locale path.
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
    const toTr = page.locator('#cc-lang-switch');
    await expect(toTr).toHaveAttribute('href', '/tr/l1-beginner/m01-start/what-claude-code-is/');
    await toTr.click();
    await page.waitForURL('**/tr/l1-beginner/m01-start/what-claude-code-is/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'tr');

    // The choice is remembered for the origin's `/` redirect (D017).
    const cookies = await page.context().cookies();
    expect(cookies.find((c) => c.name === 'cc_lang')?.value).toBe('tr');

    await expect(page.locator('#cc-lang-switch')).toHaveAttribute(
      'href',
      '/en/l1-beginner/m01-start/what-claude-code-is/',
    );
  });
});

test('nav tree renders the whole curriculum on a lesson page', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/en/l1-beginner/m01-start/what-claude-code-is/');
  const sidebar = page.getByRole('navigation', { name: 'Curriculum' });
  await expect(sidebar.locator('a[href="/en/l1-beginner/"]')).toBeVisible();
  await expect(sidebar.locator('a[href="/en/l4-master/m21-scale/"]')).toBeVisible();
  // The active module is expanded to its lessons.
  await expect(
    sidebar.locator('a[href="/en/l1-beginner/m01-start/what-claude-code-is/"]'),
  ).toBeVisible();
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
});

test.describe('theme toggle', () => {
  test('flips data-theme on click and persists across reload', async ({ page }) => {
    await page.goto('/en/');
    const html = page.locator('html');
    const toggle = page.locator('#cc-theme-toggle');
    await expect(toggle).toBeVisible();

    const before = await html.getAttribute('data-theme');
    await toggle.click();
    const after = await html.getAttribute('data-theme');
    expect(after).not.toBe(before);

    await page.reload();
    await expect(html).toHaveAttribute('data-theme', after ?? '');
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
