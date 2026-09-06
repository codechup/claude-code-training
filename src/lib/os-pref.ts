// The reader's OS choice for command blocks (D002: macOS, Linux and Windows
// get equal weight; D019: the OS tab choice is remembered).
//
//   cc:os -> "macos" | "linux" | "windows"
//
// P07 owns the `OSTabs` MDX component itself; this helper is the storage
// contract it reads and writes, kept here so the shell and the component
// agree on one key. Injectable storage, try/catch everywhere — same rules
// as `progress.ts`.
import { defaultStorage, type StorageLike } from './progress.ts';

export const OS_VALUES = ['macos', 'linux', 'windows'] as const;
export type OsPref = (typeof OS_VALUES)[number];

export const OS_STORAGE_KEY = 'cc:os';

export const OS_LABELS: Record<OsPref, string> = {
  macos: 'macOS',
  linux: 'Linux',
  windows: 'Windows',
};

export function isOsPref(value: unknown): value is OsPref {
  return typeof value === 'string' && (OS_VALUES as readonly string[]).includes(value);
}

/** The stored OS preference, or null when unset/invalid/unavailable. */
export function readOsPref(storage: StorageLike | null = defaultStorage()): OsPref | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(OS_STORAGE_KEY);
    return isOsPref(raw) ? raw : null;
  } catch {
    return null;
  }
}

/** Persist the OS preference. Returns false when storage refused the write. */
export function writeOsPref(
  value: OsPref,
  storage: StorageLike | null = defaultStorage(),
): boolean {
  if (!storage) return false;
  try {
    storage.setItem(OS_STORAGE_KEY, value);
    return true;
  } catch {
    return false;
  }
}

/**
 * The OS to show when nothing is stored yet — guessed from the user agent
 * platform string, defaulting to macOS/Linux-style commands.
 */
export function guessOsPref(platform: string | undefined): OsPref {
  const p = (platform ?? '').toLowerCase();
  if (p.includes('win')) return 'windows';
  if (p.includes('linux') || p.includes('android')) return 'linux';
  return 'macos';
}

/** The stored preference if there is one, otherwise a guess from `platform`. */
export function resolveOsPref(
  platform: string | undefined,
  storage: StorageLike | null = defaultStorage(),
): OsPref {
  return readOsPref(storage) ?? guessOsPref(platform);
}
