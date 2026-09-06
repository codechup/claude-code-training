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

// LangSwitch's draft mechanism (P06): when the sibling-language page is
// `draft: true` there is no page to link to, so the switch renders static
// text instead of a link into a 404. content/tr/l1-beginner/m01-start/
// 01-what-claude-code-is.mdx is still a draft, so the EN lesson shows the
// Turkish notice; the placeholder pair is live in both languages, so the
// same control there is a working link.
test.describe('lang switch: draft target', () => {
  test('shows "Türkçesi hazırlanıyor" instead of a link into a 404', async ({ page }) => {
    await page.goto('/en/l1-beginner/m01-start/what-claude-code-is/');
    await expect(page.locator('#cc-lang-switch')).toHaveCount(0);
    await expect(page.locator('#cc-lang-switch-draft')).toContainText('Türkçesi hazırlanıyor');
  });

  test('round-trips EN <-> TR when both languages are live', async ({ page }) => {
    await page.goto('/en/l1-beginner/m01-start/placeholder/');
    const toTr = page.locator('#cc-lang-switch');
    await expect(toTr).toHaveAttribute('href', '/tr/l1-beginner/m01-start/placeholder/');
    await toTr.click();
    await page.waitForURL('**/tr/l1-beginner/m01-start/placeholder/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'tr');

    // The choice is remembered for the origin's `/` redirect (D017).
    const cookies = await page.context().cookies();
    expect(cookies.find((c) => c.name === 'cc_lang')?.value).toBe('tr');

    await expect(page.locator('#cc-lang-switch')).toHaveAttribute(
      'href',
      '/en/l1-beginner/m01-start/placeholder/',
    );
  });
});

test('nav tree renders the whole curriculum on a lesson page', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/en/l1-beginner/m01-start/placeholder/');
  const sidebar = page.getByRole('navigation', { name: 'Curriculum' });
  await expect(sidebar.locator('a[href="/en/l1-beginner/"]')).toBeVisible();
  await expect(sidebar.locator('a[href="/en/l4-master/m21-scale/"]')).toBeVisible();
  // The active module is expanded to its lessons.
  await expect(
    sidebar.locator('a[href="/en/l1-beginner/m01-start/what-claude-code-is/"]'),
  ).toBeVisible();
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

// OS-specific command tabs (macOS/Windows/Linux) are a lesson MDX component
// that doesn't exist yet — P07 (mdx-components-a) owns `OSTabs`. Un-skip
// this once that component lands and pick a lesson page that renders one.
test.fixme('OS-tab persistence — pending P07 (OSTabs MDX component)', async () => {});
