import { expect, test } from '@playwright/test';

/**
 * The terminal (`Transcript`) — KILN §8.1 and §8.11, the component the
 * redesign was largely called for.
 *
 * Before Kiln a single recording rendered over 2000 px tall: `Transcript`
 * emitted its per-line markup across several source lines inside a `.map()`,
 * so Astro wrote the literal newlines and 8-12 spaces of JSX indentation
 * into the `<pre>` as text, and `white-space: pre-wrap` turned each recorded
 * line into roughly seven physical ones. `pre-wrap` also beat the scroller,
 * so a long command re-wrapped mid-token instead of scrolling.
 *
 * These are the two acceptance criteria from KILN §10 that pin that down, so
 * neither defect can come back unnoticed:
 *
 *   - a recording scrolls horizontally rather than wrapping;
 *   - a 20-line recording renders under 600 px tall.
 */

// A lesson whose transcripts include a command far wider than the column.
const LESSON = '/en/l1-beginner/m01-start/first-session/';

test.describe('terminal', () => {
  test('the body scrolls horizontally instead of wrapping', async ({ page }) => {
    await page.goto(LESSON);

    const bodies = page.locator('.cc-term__body');
    const count = await bodies.count();
    expect(count).toBeGreaterThan(0);

    // Every terminal on the page keeps the two properties that make it a
    // terminal — no exceptions, no "this one is short so it can wrap".
    for (let i = 0; i < count; i++) {
      const style = await bodies.nth(i).evaluate((el) => {
        const cs = getComputedStyle(el);
        return { whiteSpace: cs.whiteSpace, overflowX: cs.overflowX };
      });
      expect(style.whiteSpace).toBe('pre');
      expect(['auto', 'scroll']).toContain(style.overflowX);
    }

    // At least one recording is genuinely wider than its column, and the
    // scroller — not the page — is what moves.
    const widest = await bodies.evaluateAll((els) =>
      Math.max(...els.map((el) => el.scrollWidth - el.clientWidth)),
    );
    expect(widest).toBeGreaterThan(0);

    const overflowing = bodies.filter({ has: page.locator('code') }).first();
    const scrolled = await overflowing.evaluate((el) => {
      const target = el.scrollWidth > el.clientWidth ? el : null;
      if (!target) return null;
      target.scrollLeft = 200;
      return target.scrollLeft;
    });
    if (scrolled !== null) expect(scrolled).toBeGreaterThan(0);

    // The page itself never gains a horizontal scrollbar because of it.
    const pageScrolls = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    expect(pageScrolls).toBe(false);
  });

  test('a 20-line recording renders under 600px tall', async ({ page }) => {
    await page.goto(LESSON);

    const figures = page.locator('figure.cc-term');
    const measured = await figures.evaluateAll((els) =>
      els.map((el) => {
        const body = el.querySelector('.cc-term__body code');
        // One line per block-level line span; a recording emits no literal
        // newlines, which is exactly the defect this guards.
        const lines = body ? body.querySelectorAll('.cc-term__line').length : 0;
        return { lines, height: el.getBoundingClientRect().height };
      }),
    );

    expect(measured.length).toBeGreaterThan(0);

    // Every recording of 20 lines or fewer fits inside 600 px, and the
    // longer ones are capped by the collapse (KILN §8.1: 24 lines, 32rem).
    for (const { lines, height } of measured) {
      expect(lines).toBeGreaterThan(0);
      if (lines <= 20) {
        expect(
          height,
          `a ${lines}-line recording rendered ${Math.round(height)}px tall`,
        ).toBeLessThan(600);
      }
    }

    // And at least one of them really is around the 20-line mark, so the
    // assertion above has a live subject rather than passing vacuously.
    expect(measured.some((m) => m.lines >= 10 && m.lines <= 20)).toBe(true);
  });

  test('a recording longer than 24 lines collapses behind a disclosure', async ({ page }) => {
    // KILN §8.1: no JS — a plain <details> — and the collapsed body is capped.
    await page.goto('/en/l3-advanced/m12-plugins/validate-and-eval/');

    const expand = page.locator('figure.cc-term details.cc-term__expand').first();
    await expect(expand).toHaveCount(1);

    const summary = expand.locator('summary');
    await expect(summary).toContainText(/Show all \d+ lines/);

    const collapsed = await expand.evaluate(
      (el) => el.closest('figure')!.getBoundingClientRect().height,
    );
    await summary.click();
    const expanded = await expand.evaluate(
      (el) => el.closest('figure')!.getBoundingClientRect().height,
    );
    expect(expanded).toBeGreaterThan(collapsed);
  });

  test('the terminal surface stays dark in the light theme', async ({ page }) => {
    // KILN §1.2 / §2.2: a recording is an artefact of the course and gets a
    // real terminal in BOTH themes, never a washed-out paragraph.
    await page.goto(LESSON);
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));

    const bg = await page
      .locator('figure.cc-term')
      .first()
      .evaluate((el) => {
        const value = getComputedStyle(el).backgroundColor;
        const [r, g, b] = value.match(/\d+/g)!.map(Number);
        return (r * 299 + g * 587 + b * 114) / 1000;
      });
    expect(bg).toBeLessThan(60);
  });

  test('the body is keyboard-scrollable and shows a focus ring', async ({ page }) => {
    await page.goto(LESSON);
    const body = page.locator('.cc-term__body').first();
    await expect(body).toHaveAttribute('tabindex', '0');
    await body.focus();
    await expect(body).toBeFocused();
    const outline = await body.evaluate((el) => getComputedStyle(el).outlineWidth);
    expect(outline).not.toBe('0px');
  });
});
