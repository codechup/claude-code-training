import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { checkRawColors } from './check-raw-colors.mjs';

const FIXTURES = fileURLToPath(new URL('./__fixtures__/raw-colors/', import.meta.url));

describe('checkRawColors', () => {
  it('allows raw colors inside styles/tokens.css and tokens elsewhere', async () => {
    const result = await checkRawColors(`${FIXTURES}good`);
    expect(result.offenders).toEqual([]);
    expect(result.ok).toBe(true);
  });

  it('does not flag an HTML numeric character reference (looks hex-ish but is not a color)', async () => {
    const result = await checkRawColors(`${FIXTURES}good`);
    expect(result.offenders.some((o) => /9788/.test(o))).toBe(false);
  });

  it('fails a raw hex/rgba literal outside tokens.css', async () => {
    const result = await checkRawColors(`${FIXTURES}bad`);
    expect(result.ok).toBe(false);
    expect(result.offenders.some((o) => /#ff0000/.test(o))).toBe(true);
    expect(result.offenders.some((o) => /rgba\(/.test(o))).toBe(true);
  });
});
