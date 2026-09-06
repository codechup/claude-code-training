import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

/** Fails on any serious/critical violation — tokens are AA by design, so a
 * real regression should fail here, not be silenced (D036). */
export async function axeCheck(page: Page, name: string): Promise<void> {
  const results = await new AxeBuilder({ page }).analyze();
  const bad = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(bad, `${name}: ${bad.map((v) => `${v.id} (${v.impact}) — ${v.help}`).join('; ')}`).toEqual(
    [],
  );
}
