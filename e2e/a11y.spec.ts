import { expect, test } from '@playwright/test';
import { axeCheck } from './helpers/axe.ts';

const paths = [
  '/',
  '/en/',
  '/tr/',
  '/design/',
  '/404/',
  '/en/l1-beginner/m01-start/what-claude-code-is/',
  // The M0 release lesson in both languages (P12 acceptance criteria).
  '/tr/l1-beginner/m01-start/what-claude-code-is/',
];

// Routes whose status isn't asserted 200 exactly:
//  - "/" is a JS-free `<meta http-equiv="refresh">` fallback (see
//    src/pages/index.astro) — it answers 200 itself, but Playwright may
//    observe the eventual `/en/` navigation instead, so we don't pin it down.
//  - "/404/" is expected to answer 404.
const LOOSE_STATUS = new Set(['/', '/404/']);

for (const path of paths) {
  test(`a11y: ${path}`, async ({ page }) => {
    const response = await page.goto(path);
    if (!LOOSE_STATUS.has(path)) {
      expect(response?.status()).toBe(200);
    }
    if (path === '/') {
      // The 0-second meta refresh navigates away almost immediately, which
      // can otherwise tear down axe's execution context mid-analysis —
      // settle on the destination before checking it.
      await page.waitForURL('**/en/');
    }
    await axeCheck(page, path);
  });
}
