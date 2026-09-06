// Pure helpers + the storage contract for `Lab.astro`'s checklist
// (persisted per lesson, D020 — no accounts, `localStorage` only). Split
// out so it runs under this repo's plain-Vitest config (see this plan's
// Handoff notes on `.astro` imports).
import type { StorageLike } from '../../lib/progress.ts';

/** The lab sandbox repository every lesson's lab runs against (D007). */
export const LAB_REPO_URL = 'https://github.com/codechup/claude-code-lab';

/** The exact per-lesson tag to check out, per the tagging convention in
 *  `plans/P22-*.md`: `lesson/<module>-<nn>-start`. */
export function labRepoTreeUrl(repoTag: string): string {
  return `${LAB_REPO_URL}/tree/${repoTag}`;
}

export function labStorageKey(lessonId: string): string {
  return `cc:lab:${lessonId}`;
}

/** The set of checked checklist-item indexes (as strings) for `lessonId`.
 *  Never throws; returns an empty array when storage is unavailable, the
 *  key is unset, or the stored value isn't a string array. */
export function readLabChecklist(lessonId: string, storage: StorageLike | null): readonly string[] {
  if (!storage) return [];
  try {
    const raw = storage.getItem(labStorageKey(lessonId));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.every((v) => typeof v === 'string') ? parsed : [];
  } catch {
    return [];
  }
}

/** Persist the checked-item set for `lessonId`. Returns false when
 *  storage refused the write. */
export function writeLabChecklist(
  lessonId: string,
  checked: readonly string[],
  storage: StorageLike | null,
): boolean {
  if (!storage) return false;
  try {
    storage.setItem(labStorageKey(lessonId), JSON.stringify(checked));
    return true;
  } catch {
    return false;
  }
}
