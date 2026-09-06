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
