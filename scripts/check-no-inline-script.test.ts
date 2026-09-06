import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { checkNoInlineScript } from './check-no-inline-script.mjs';

const FIXTURES = fileURLToPath(new URL('./__fixtures__/inline-script/', import.meta.url));

describe('checkNoInlineScript', () => {
  it('passes is:inline with src= and a normal bundled <script>', async () => {
    const result = await checkNoInlineScript(`${FIXTURES}good`);
    expect(result.offenders).toEqual([]);
    expect(result.ok).toBe(true);
  });

  it('fails is:inline with no src= (an inline script body)', async () => {
    const result = await checkNoInlineScript(`${FIXTURES}bad`);
    expect(result.ok).toBe(false);
    expect(result.offenders).toHaveLength(1);
    expect(result.offenders[0]).toMatch(/is:inline.*no src=/);
  });
});
