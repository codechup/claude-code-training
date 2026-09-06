import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { runContentGate } from './content-gate.ts';

const FIXTURES = fileURLToPath(new URL('./__fixtures__/content-gate/', import.meta.url));

describe('runContentGate', () => {
  it('exits ok with no content present', async () => {
    const result = await runContentGate({ contentRoot: join(FIXTURES, 'does-not-exist') });
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.filesChecked).toBe(0);
  });

  it('passes a well-formed EN/TR lesson pair', async () => {
    const result = await runContentGate({ contentRoot: join(FIXTURES, 'good') });
    expect(result.errors).toEqual([]);
    expect(result.ok).toBe(true);
    expect(result.filesChecked).toBe(2);
  });

  it('fails a fence opened without a language tag', async () => {
    const result = await runContentGate({ contentRoot: join(FIXTURES, 'bad-fence') });
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => /code fence opened without a language tag/.test(e))).toBe(
      true,
    );
  });

  it('fails an EN lesson with no TR counterpart', async () => {
    const result = await runContentGate({ contentRoot: join(FIXTURES, 'bad-parity') });
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => /missing TR counterpart/.test(e))).toBe(true);
  });

  it('allows draft: true without --no-drafts', async () => {
    const result = await runContentGate({ contentRoot: join(FIXTURES, 'bad-draft') });
    expect(result.ok).toBe(true);
  });

  it('rejects draft: true with --no-drafts', async () => {
    const result = await runContentGate({
      contentRoot: join(FIXTURES, 'bad-draft'),
      noDrafts: true,
    });
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => /draft: true is not allowed with --no-drafts/.test(e))).toBe(
      true,
    );
  });
});
