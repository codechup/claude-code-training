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
  // A lesson may never claim a verified_version ahead of the ledger pin. Before this suite the
  // assertion only held for *numeric* values: `2.1.266-rc.1` and `latest` both compared as NaN,
  // `NaN > 0` is false, and the gate passed them.
  it('fails a lesson whose verified_version is numerically above the pin', async () => {
    const result = await runContentGate({ contentRoot: join(FIXTURES, 'pin-above') });
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => /is newer than the changelog/.test(e))).toBe(true);
  });

  it('fails a lesson whose verified_version is a PRE-RELEASE above the pin', async () => {
    const result = await runContentGate({ contentRoot: join(FIXTURES, 'pin-prerelease') });
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => /is newer than the changelog/.test(e))).toBe(true);
  });

  it('fails a lesson whose verified_version is not a version at all', async () => {
    const result = await runContentGate({ contentRoot: join(FIXTURES, 'pin-nonversion') });
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => /verified_version|semver/.test(e))).toBe(true);
  });
});
