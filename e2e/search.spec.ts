import { expect, test } from '@playwright/test';

/**
 * The command palette (KILN §8.10). The header's search button opens a
 * centred dialog — a full-screen sheet on a phone — with the input, grouped
 * Pagefind results, keyboard navigation, Esc to close and focus restored to
 * the trigger. Pagefind's index is a postbuild step, so these run against
 * the built site the Playwright webServer previews, not `astro dev`.
 *
 * These replace the two `test.fixme`s that stood here while search had no
 * entry point to drive.
 */

const dialog = '#cc-search-dialog';

test('search is reachable from the header on every page', async ({ page }) => {
  for (const path of ['/en/', '/tr/', '/en/l1-beginner/m01-start/what-claude-code-is/']) {
    await page.goto(path);
    const trigger = page.locator('[data-search-trigger]').first();
    await expect(trigger).toBeVisible();
    // The control names itself even when it renders as an icon alone at
    // 390 px (KILN §6: an icon-only control needs an accessible name).
    await expect(trigger).toHaveAttribute('aria-label', /.+/);
  }
});

test('the palette opens, traps focus in the input and closes on Escape', async ({ page }) => {
  await page.goto('/en/');
  const trigger = page.locator('[data-search-trigger]').first();
  await trigger.click();

  const palette = page.locator(dialog);
  await expect(palette).toBeVisible();
  await expect(page.locator('#cc-search-input')).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(palette).toBeHidden();
  // Focus goes back to the control that opened it — no keyboard dead end.
  await expect(trigger).toBeFocused();
});

test('the keyboard shortcut opens it too', async ({ page }) => {
  await page.goto('/en/');
  await page.keyboard.press('ControlOrMeta+k');
  await expect(page.locator(dialog)).toBeVisible();
});

test('search box returns results for a known lesson title', async ({ page }) => {
  await page.goto('/en/');
  await page.locator('[data-search-trigger]').first().click();
  await page.locator('#cc-search-input').fill('hooks');

  const results = page.locator('#cc-search-results a');
  await expect(results.first()).toBeVisible({ timeout: 15000 });
  // Every hit is a real route in the reader's own language.
  const hrefs = await results.evaluateAll((els) =>
    els.map((el) => (el as HTMLAnchorElement).getAttribute('href') ?? ''),
  );
  expect(hrefs.length).toBeGreaterThan(0);
  for (const href of hrefs) expect(href).toMatch(/^\/en\//);

  // Arrow keys move through the list, Enter opens the highlighted result.
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await page.waitForURL(/\/en\/.+/);
  await expect(page.locator('h1')).toBeVisible();
});
