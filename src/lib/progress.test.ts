import { describe, expect, it } from 'vitest';
import {
  clearQuiz,
  completedCount,
  isComplete,
  progressKey,
  quizKey,
  readProgress,
  readQuiz,
  setComplete,
  toggleComplete,
  writeProgress,
  writeQuiz,
  type StorageLike,
} from './progress.ts';

/** A Map-backed stand-in for `window.localStorage` (no jsdom in this repo). */
function memoryStorage(seed: Record<string, string> = {}): StorageLike {
  const map = new Map(Object.entries(seed));
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => void map.set(k, v),
    removeItem: (k) => void map.delete(k),
  };
}

/** Storage that throws on every operation — private browsing, blocked storage. */
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

describe('keys', () => {
  it('namespaces per language and per lesson (D020, D064)', () => {
    expect(progressKey('en')).toBe('cc:progress:en');
    expect(progressKey('tr')).toBe('cc:progress:tr');
    expect(quizKey('en/l1-beginner/m01-start/install')).toBe(
      'cc:quiz:en/l1-beginner/m01-start/install',
    );
  });
});

describe('progress round-trip', () => {
  it('writes and reads back completed lessons', () => {
    const store = memoryStorage();
    expect(readProgress('en', store)).toEqual({ completed: [] });

    setComplete('en', 'en/l1/m01/b', true, store);
    setComplete('en', 'en/l1/m01/a', true, store);
    expect(readProgress('en', store).completed).toEqual(['en/l1/m01/a', 'en/l1/m01/b']);
    expect(isComplete('en', 'en/l1/m01/a', store)).toBe(true);

    // Serialised under the documented key, as JSON.
    expect(JSON.parse(store.getItem('cc:progress:en') ?? '{}')).toEqual({
      completed: ['en/l1/m01/a', 'en/l1/m01/b'],
    });
  });

  it('keeps the two languages independent', () => {
    const store = memoryStorage();
    setComplete('en', 'en/l1/m01/a', true, store);
    expect(readProgress('tr', store).completed).toEqual([]);
  });

  it('toggles and un-completes', () => {
    const store = memoryStorage();
    expect(toggleComplete('en', 'x', store).completed).toEqual(['x']);
    expect(toggleComplete('en', 'x', store).completed).toEqual([]);
    setComplete('en', 'x', false, store);
    expect(isComplete('en', 'x', store)).toBe(false);
  });

  it('de-duplicates on write', () => {
    const store = memoryStorage();
    writeProgress('en', { completed: ['a', 'a', 'b'] }, store);
    expect(readProgress('en', store).completed).toEqual(['a', 'b']);
  });

  it('counts completed lessons out of a given set', () => {
    const store = memoryStorage();
    setComplete('en', 'a', true, store);
    setComplete('en', 'c', true, store);
    expect(completedCount('en', ['a', 'b', 'c', 'd'], store)).toBe(2);
  });
});

describe('robustness', () => {
  it('survives malformed JSON and wrong shapes', () => {
    expect(readProgress('en', memoryStorage({ 'cc:progress:en': 'not json' }))).toEqual({
      completed: [],
    });
    expect(readProgress('en', memoryStorage({ 'cc:progress:en': '"a string"' }))).toEqual({
      completed: [],
    });
    expect(
      readProgress('en', memoryStorage({ 'cc:progress:en': '{"completed":[1,"a",null]}' })),
    ).toEqual({ completed: ['a'] });
  });

  it('never throws when storage throws (D020)', () => {
    expect(() => readProgress('en', throwingStorage)).not.toThrow();
    expect(readProgress('en', throwingStorage)).toEqual({ completed: [] });
    expect(writeProgress('en', { completed: ['a'] }, throwingStorage)).toBe(false);
    expect(setComplete('en', 'a', true, throwingStorage)).toEqual({ completed: ['a'] });
    expect(readQuiz('x', throwingStorage)).toBeNull();
    expect(writeQuiz('x', { answers: {}, score: 0, total: 0 }, throwingStorage)).toBe(false);
    expect(clearQuiz('x', throwingStorage)).toBe(false);
  });

  it('treats a missing storage object as "no persistence"', () => {
    expect(readProgress('en', null)).toEqual({ completed: [] });
    expect(writeProgress('en', { completed: [] }, null)).toBe(false);
    expect(readQuiz('x', null)).toBeNull();
    expect(clearQuiz('x', null)).toBe(false);
  });
});

describe('quiz round-trip', () => {
  it('stores answers, score and total per lesson', () => {
    const store = memoryStorage();
    const id = 'en/l1-beginner/m01-start/install';
    expect(readQuiz(id, store)).toBeNull();

    writeQuiz(id, { answers: { q1: 2, q2: 0 }, score: 1, total: 2 }, store);
    expect(readQuiz(id, store)).toEqual({ answers: { q1: 2, q2: 0 }, score: 1, total: 2 });

    clearQuiz(id, store);
    expect(readQuiz(id, store)).toBeNull();
  });

  it('repairs a partially-written quiz record', () => {
    const store = memoryStorage({ 'cc:quiz:x': '{"score":"nope"}' });
    expect(readQuiz('x', store)).toEqual({ answers: {}, score: 0, total: 0 });
  });
});
