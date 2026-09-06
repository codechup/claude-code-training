import { describe, expect, it } from 'vitest';
import type { StorageLike } from './progress.ts';
import {
  guessOsPref,
  isOsPref,
  OS_STORAGE_KEY,
  readOsPref,
  resolveOsPref,
  writeOsPref,
} from './os-pref.ts';

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

describe('os-pref', () => {
  it('round-trips the OS choice under cc:os (D019)', () => {
    const store = memoryStorage();
    expect(readOsPref(store)).toBeNull();
    expect(writeOsPref('windows', store)).toBe(true);
    expect(store.getItem(OS_STORAGE_KEY)).toBe('windows');
    expect(readOsPref(store)).toBe('windows');
  });

  it('ignores a stored value that is not a known OS', () => {
    expect(readOsPref(memoryStorage({ 'cc:os': 'plan9' }))).toBeNull();
    expect(isOsPref('macos')).toBe(true);
    expect(isOsPref('plan9')).toBe(false);
    expect(isOsPref(7)).toBe(false);
  });

  it('never throws when storage throws', () => {
    expect(() => readOsPref(throwingStorage)).not.toThrow();
    expect(readOsPref(throwingStorage)).toBeNull();
    expect(writeOsPref('linux', throwingStorage)).toBe(false);
    expect(readOsPref(null)).toBeNull();
    expect(writeOsPref('linux', null)).toBe(false);
  });

  it('guesses from the platform string when nothing is stored (D002)', () => {
    expect(guessOsPref('Win32')).toBe('windows');
    expect(guessOsPref('Linux x86_64')).toBe('linux');
    expect(guessOsPref('MacIntel')).toBe('macos');
    expect(guessOsPref(undefined)).toBe('macos');
  });

  it('prefers the stored value over the guess', () => {
    expect(resolveOsPref('Win32', memoryStorage({ 'cc:os': 'linux' }))).toBe('linux');
    expect(resolveOsPref('Win32', memoryStorage())).toBe('windows');
  });
});
