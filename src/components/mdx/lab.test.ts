import { describe, expect, it } from 'vitest';
import type { StorageLike } from '../../lib/progress.ts';
import { labRepoTreeUrl, labStorageKey, readLabChecklist, writeLabChecklist } from './lab.ts';

function memoryStorage(seed: Record<string, string> = {}): StorageLike {
  const map = new Map(Object.entries(seed));
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => void map.set(k, v),
    removeItem: (k) => void map.delete(k),
  };
}

const throwingStorage: StorageLike = {
  getItem() {
    throw new Error('storage disabled');
  },
  setItem() {
    throw new Error('storage disabled');
  },
  removeItem() {
    throw new Error('storage disabled');
  },
};

describe('labRepoTreeUrl', () => {
  it('builds the exact P22 tagging-convention URL', () => {
    expect(labRepoTreeUrl('lesson/m07-02-start')).toBe(
      'https://github.com/codechup/claude-code-lab/tree/lesson/m07-02-start',
    );
  });
});

describe('labStorageKey', () => {
  it('namespaces by lesson id', () => {
    expect(labStorageKey('en/l2-intermediate/m07-hooks/block-dangerous-commands')).toBe(
      'cc:lab:en/l2-intermediate/m07-hooks/block-dangerous-commands',
    );
  });
});

describe('lab checklist storage round-trip', () => {
  it('reads back what was written, namespaced per lesson', () => {
    const store = memoryStorage();
    expect(readLabChecklist('lesson-a', store)).toEqual([]);
    expect(writeLabChecklist('lesson-a', ['0', '2'], store)).toBe(true);
    expect(readLabChecklist('lesson-a', store)).toEqual(['0', '2']);
    // A different lesson id has its own, unrelated key.
    expect(readLabChecklist('lesson-b', store)).toEqual([]);
  });

  it('ignores a malformed stored value rather than throwing', () => {
    const store = memoryStorage({ [labStorageKey('x')]: '{"not":"an array"}' });
    expect(readLabChecklist('x', store)).toEqual([]);
  });

  it('never throws when storage throws', () => {
    expect(() => readLabChecklist('x', throwingStorage)).not.toThrow();
    expect(readLabChecklist('x', throwingStorage)).toEqual([]);
    expect(writeLabChecklist('x', ['0'], throwingStorage)).toBe(false);
    expect(readLabChecklist('x', null)).toEqual([]);
    expect(writeLabChecklist('x', ['0'], null)).toBe(false);
  });
});
