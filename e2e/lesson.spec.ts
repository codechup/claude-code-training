import { expect, test } from '@playwright/test';

// Level/module/lesson routes already exist against the one seed lesson
// (content/en+tr/l1-beginner/m01-start/01-what-claude-code-is.mdx, added by
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
    page.locator('a[href="/en/l1-beginner/m01-start/what-claude-code-is/"]'),
  ).toBeVisible();
});

test('lesson page renders title, sources and the shared shell', async ({ page }) => {
  const response = await page.goto('/en/l1-beginner/m01-start/what-claude-code-is/');
  expect(response?.status()).toBe(200);
  await expect(page.locator('h1')).toContainText('What is Claude Code?');
  await expect(page.locator('header')).toBeVisible();
  await expect(page.locator('footer')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Sources' })).toBeVisible();
});

test('TR lesson counterpart is a draft: true stub and has no live page yet', async ({ page }) => {
  // content/tr/l1-beginner/m01-start/01-what-claude-code-is.mdx is
  // `draft: true` (CLAUDE.md: "a draft: true stub is acceptable until the TR
  // wave") — the EN/TR *path* parity check (content-gate.ts) is satisfied by
  // the file's existence, but getStaticPaths filters drafts out, so the
  // route correctly 404s until the TR wave un-drafts it.
  const response = await page.goto('/tr/l1-beginner/m01-start/what-claude-code-is/');
  expect(response?.status()).toBe(404);
});

test('TR module index does not list the still-draft lesson', async ({ page }) => {
  await page.goto('/tr/l1-beginner/m01-start/');
  await expect(
    page.locator('a[href="/tr/l1-beginner/m01-start/what-claude-code-is/"]'),
  ).toHaveCount(0);
});

// Un-skipped by P06 (content-pipeline): PrevNext, the module progress bar and
// the "On this page" TOC are page chrome this plan owns (D061), not MDX
// components — they exist now and are exercised against m01-start's two live
// lessons (00-placeholder and 01-what-claude-code-is).
test('lesson prev/next navigation, TOC and module progress', async ({ page }) => {
  await page.goto('/en/l1-beginner/m01-start/placeholder/');

  // First lesson of the whole curriculum: no "previous", a real "next".
  const prevNext = page.getByRole('navigation', { name: 'Previous / Next' });
  await expect(prevNext).toBeVisible();
  await expect(
    prevNext.locator('a[href="/en/l1-beginner/m01-start/what-claude-code-is/"]'),
  ).toBeVisible();
  await expect(prevNext.locator('a[rel="prev"]')).toHaveCount(0);

  // Module progress bar renders "n / m in m01" from localStorage (D020).
  await expect(page.getByText('0 / 2 in m01')).toBeVisible();

  // Follow "next" and confirm the reverse link comes back.
  await prevNext.locator('a[rel="next"]').click();
  await page.waitForURL('**/m01-start/what-claude-code-is/');
  await expect(
    page.locator('a[rel="prev"][href="/en/l1-beginner/m01-start/placeholder/"]'),
  ).toBeVisible();
});

test('placeholder lesson is visibly marked as a placeholder', async ({ page }) => {
  await page.goto('/en/l1-beginner/m01-start/placeholder/');
  await expect(page.getByText('Placeholder', { exact: true })).toBeVisible();
  await page.goto('/tr/l1-beginner/m01-start/placeholder/');
  await expect(page.getByText('Yer tutucu', { exact: true })).toBeVisible();
});

test('marking a lesson done round-trips through localStorage', async ({ page }) => {
  await page.goto('/en/l1-beginner/m01-start/placeholder/');
  const toggle = page.getByRole('button', { name: 'Mark as done' });
  await toggle.click();
  await expect(page.getByText('1 / 2 in m01')).toBeVisible();

  const stored = await page.evaluate(() => window.localStorage.getItem('cc:progress:en'));
  expect(stored).toContain('en/l1-beginner/m01-start/placeholder');

  await page.reload();
  await expect(page.getByText('1 / 2 in m01')).toBeVisible();
});

// The full curriculum (real lessons beyond the P01 seed) is written across
// M1/M2 (starting P13). Un-skip broader content assertions once that lands;
// P12 (the M0 release plan) is responsible for un-skipping this suite.
test.fixme('full curriculum navigation — pending P13+ (real lesson content)', async () => {});
