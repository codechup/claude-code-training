// Lesson progress and quiz results live in `localStorage` — there are no
// user accounts (D020, D064).
//
//   cc:progress:<lang>   -> { completed: string[] }  (lesson entry ids)
//   cc:quiz:<lessonId>   -> { answers: Record<string, number>, score, total }
//
// Every read and write is wrapped in try/catch: `localStorage` throws in
// private-browsing / blocked-storage modes and a thrown error must never
// take a lesson page down with it. The storage object is injectable so the
// Vitest suite (node environment — no jsdom in this repo) can exercise both
// a working store and a throwing one.

export interface ProgressState {
  completed: string[];
}

export interface QuizState {
  /** questionId -> chosen option index. */
  answers: Record<string, number>;
  score: number;
  total: number;
}

/**
 * Minimal structural type for the parts of the Web Storage API used here —
 * lets a plain object stand in as a test double.
 */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const EMPTY: ProgressState = { completed: [] };

export function progressKey(lang: string): string {
  return `cc:progress:${lang}`;
}

export function quizKey(lessonId: string): string {
  return `cc:quiz:${lessonId}`;
}

/** The browser's localStorage, or null when it is unavailable. */
export function defaultStorage(): StorageLike | null {
  try {
    const store = globalThis.localStorage;
    return store ?? null;
  } catch {
    return null;
  }
}

function read<T>(storage: StorageLike | null, key: string, fallback: T): T {
  if (!storage) return fallback;
  try {
    const raw = storage.getItem(key);
    if (!raw) return fallback;
    const parsed: unknown = JSON.parse(raw);
    if (parsed === null || typeof parsed !== 'object') return fallback;
    return parsed as T;
  } catch {
    return fallback;
  }
}

function write(storage: StorageLike | null, key: string, value: unknown): boolean {
  if (!storage) return false;
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/** All completed lesson ids for `lang`. Never throws. */
export function readProgress(
  lang: string,
  storage: StorageLike | null = defaultStorage(),
): ProgressState {
  const state = read<ProgressState>(storage, progressKey(lang), EMPTY);
  const completed = Array.isArray(state.completed)
    ? state.completed.filter((id): id is string => typeof id === 'string')
    : [];
  return { completed };
}

/** Replace the stored progress for `lang`. Returns false if storage failed. */
export function writeProgress(
  lang: string,
  state: ProgressState,
  storage: StorageLike | null = defaultStorage(),
): boolean {
  return write(storage, progressKey(lang), { completed: [...new Set(state.completed)].sort() });
}

export function isComplete(
  lang: string,
  lessonId: string,
  storage: StorageLike | null = defaultStorage(),
): boolean {
  return readProgress(lang, storage).completed.includes(lessonId);
}

export function setComplete(
  lang: string,
  lessonId: string,
  complete: boolean,
  storage: StorageLike | null = defaultStorage(),
): ProgressState {
  const current = readProgress(lang, storage).completed;
  const next = complete
    ? [...new Set([...current, lessonId])]
    : current.filter((id) => id !== lessonId);
  const state: ProgressState = { completed: next.sort() };
  writeProgress(lang, state, storage);
  return state;
}

/** Toggle a lesson's completed flag and return the new state. */
export function toggleComplete(
  lang: string,
  lessonId: string,
  storage: StorageLike | null = defaultStorage(),
): ProgressState {
  return setComplete(lang, lessonId, !isComplete(lang, lessonId, storage), storage);
}

/**
 * How many of `lessonIds` are complete. Used by the module progress bar
 * ("n / m in m07") and the landing page's per-level bars.
 */
export function completedCount(
  lang: string,
  lessonIds: string[],
  storage: StorageLike | null = defaultStorage(),
): number {
  const done = new Set(readProgress(lang, storage).completed);
  return lessonIds.filter((id) => done.has(id)).length;
}

export function readQuiz(
  lessonId: string,
  storage: StorageLike | null = defaultStorage(),
): QuizState | null {
  const state = read<QuizState | null>(storage, quizKey(lessonId), null);
  if (!state || typeof state !== 'object') return null;
  const answers =
    state.answers && typeof state.answers === 'object'
      ? state.answers
      : ({} as QuizState['answers']);
  return {
    answers,
    score: typeof state.score === 'number' ? state.score : 0,
    total: typeof state.total === 'number' ? state.total : 0,
  };
}

export function writeQuiz(
  lessonId: string,
  state: QuizState,
  storage: StorageLike | null = defaultStorage(),
): boolean {
  return write(storage, quizKey(lessonId), state);
}

export function clearQuiz(
  lessonId: string,
  storage: StorageLike | null = defaultStorage(),
): boolean {
  if (!storage) return false;
  try {
    storage.removeItem(quizKey(lessonId));
    return true;
  } catch {
    return false;
  }
}
