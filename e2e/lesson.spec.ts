import { expect, test } from '@playwright/test';

// Level/module/lesson routes already exist against the one seed lesson
// (content/en+tr/l1-beginner/m01-start/01-what-is-claude-code.mdx, added by
// P01's scaffold) — these are structural checks against that seed, not
// against real curriculum content, which doesn't exist until P13+. Do not
// assert on the seed lesson's prose; P06 may replace/reshape this content
// pipeline before real lessons land.

test('level index lists its modules', async ({ page }) => {
  const response = await page.goto('/en/l1-beginner/');
  expect(response?.status()).toBe(200);
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('a[href="/en/l1-beginner/m01-start/"]')).toBeVisible();
});

test('module index lists its lessons', async ({ page }) => {
  const response = await page.goto('/en/l1-beginner/m01-start/');
  expect(response?.status()).toBe(200);
  await expect(page.locator('h1')).toBeVisible();
  await expect(
    page.locator('a[href="/en/l1-beginner/m01-start/what-is-claude-code/"]'),
  ).toBeVisible();
});

test('lesson page renders title, sources and the shared shell', async ({ page }) => {
  const response = await page.goto('/en/l1-beginner/m01-start/what-is-claude-code/');
  expect(response?.status()).toBe(200);
  await expect(page.locator('h1')).toContainText('What is Claude Code?');
  await expect(page.locator('header')).toBeVisible();
  await expect(page.locator('footer')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Sources' })).toBeVisible();
});

test('TR lesson counterpart is a draft: true stub and has no live page yet', async ({ page }) => {
  // content/tr/l1-beginner/m01-start/01-what-is-claude-code.mdx is
  // `draft: true` (CLAUDE.md: "a draft: true stub is acceptable until the TR
  // wave") — the EN/TR *path* parity check (content-gate.ts) is satisfied by
  // the file's existence, but getStaticPaths filters drafts out, so the
  // route correctly 404s until the TR wave un-drafts it.
  const response = await page.goto('/tr/l1-beginner/m01-start/what-is-claude-code/');
  expect(response?.status()).toBe(404);
});

test('TR module index does not list the still-draft lesson', async ({ page }) => {
  await page.goto('/tr/l1-beginner/m01-start/');
  await expect(
    page.locator('a[href="/tr/l1-beginner/m01-start/what-is-claude-code/"]'),
  ).toHaveCount(0);
});

// Lesson prev/next navigation and an in-page table of contents are MDX/UI
// components that don't exist yet — P07 (mdx-components-a) and P08
// (mdx-components-b) own them. Un-skip once those land and a real lesson
// wires them in.
test.fixme('lesson prev/next navigation — pending P07/P08 (MDX components)', async () => {});

// The full curriculum (real lessons beyond the P01 seed) is written across
// M1/M2 (starting P13). Un-skip broader content assertions once that lands;
// P12 (the M0 release plan) is responsible for un-skipping this suite.
test.fixme('full curriculum navigation — pending P13+ (real lesson content)', async () => {});
