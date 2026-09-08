import type { Locator, Page } from '@playwright/test';

/**
 * Viewport-aware handles on the Kiln header (KILN §7.2).
 *
 * The redesign gave the header two faces. At >= 1024 px the language and
 * theme controls sit in the right cluster; below it they move into the
 * mobile drawer, and the cluster copies are `display: none`. Both copies are
 * in the DOM on every page, so a spec that reaches for one by id fails at
 * 390 px ("element is not visible") and a spec that reaches for one by role
 * fails strict mode at 1280 px (two matches, one hidden).
 *
 * Everything below resolves to whichever copy the reader can actually use at
 * the current viewport, opening the drawer first when that is where the
 * control lives.
 */

const DESKTOP_MIN = 1024;

function isDesktop(page: Page): boolean {
  return (page.viewportSize()?.width ?? 0) >= DESKTOP_MIN;
}

/** Opens the mobile drawer when the viewport is below the desktop breakpoint. */
export async function openDrawerIfMobile(page: Page): Promise<boolean> {
  if (isDesktop(page)) return false;
  const drawer = page.locator('details.cc-drawer');
  if (!(await drawer.evaluate((el: HTMLDetailsElement) => el.open))) {
    await page.locator('.cc-drawer__button').click();
    await page.locator('.cc-drawer__sheet').waitFor({ state: 'visible' });
  }
  return true;
}

/** The language control the reader can reach right now. */
export async function langSwitch(page: Page): Promise<Locator> {
  if (isDesktop(page)) return page.locator('#cc-lang-switch');
  await openDrawerIfMobile(page);
  return page.locator('.cc-drawer__prefs .cc-lang');
}

/** The theme control the reader can reach right now. */
export async function themeToggle(page: Page): Promise<Locator> {
  if (isDesktop(page)) return page.locator('#cc-theme-toggle');
  await openDrawerIfMobile(page);
  return page.locator('.cc-drawer__prefs .cc-theme');
}

/**
 * The curriculum tree the reader can reach right now: the sticky rail
 * column at >= 900 px, the drawer copy below it. Both are rendered on every
 * lesson page and exactly one has layout (see `Sidebar.astro`).
 */
export async function curriculumTree(page: Page): Promise<Locator> {
  if ((page.viewportSize()?.width ?? 0) >= 900) return page.locator('.cc-lesson__rail nav');
  await openDrawerIfMobile(page);
  return page.locator('.cc-drawer__tree nav');
}
