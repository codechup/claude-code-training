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
  // Playbook and Meta (P42/P44) shipped after this suite was written and
  // aren't covered elsewhere in this file. Running axe against all 20 of
  // their EN+TR routes would roughly double this spec's runtime for little
  // extra signal, since every route in a section shares the same layout and
  // the same aggregated-MDX-body rendering path; instead this samples one
  // route per section per language, picking the most content-heavy or
  // interactive page in each: `decision-trees` renders a custom SVG diagram
  // component (the most likely place for a missed aria-label), and
  // `how-this-site-was-built` is the longest prose page in Meta. The TR
  // samples are draft:true stubs, which is deliberate: a translation-wave
  // stub still has to clear the same AA bar as finished content. The
  // remaining Playbook/Meta routes get structural (non-a11y) coverage in
  // `lesson.spec.ts`'s "Playbook and Meta section pages" describe block.
  '/en/playbook/decision-trees/',
  '/tr/playbook/decision-trees/',
  '/en/meta/how-this-site-was-built/',
  '/tr/meta/how-this-site-was-built/',
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
