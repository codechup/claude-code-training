import { expect, test } from '@playwright/test';
import { axeCheck } from './helpers/axe.ts';

const paths = [
  '/en/',
  '/tr/',
  '/design/',
  '/404/',
  '/en/l1-beginner/m01-start/what-is-claude-code/',
];

for (const path of paths) {
  test(`a11y: ${path}`, async ({ page }) => {
    const response = await page.goto(path);
    // /404/ is expected to answer 404 — everything else should be a normal 200.
    if (path !== '/404/') {
      expect(response?.status()).toBe(200);
    }
    await axeCheck(page, path);
  });
}
