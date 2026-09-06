// Pure helpers + the storage contract for `OSTabs.astro`.
//
// D002 requires four tabs with equal weight: macOS, Linux, Windows
// (PowerShell) and Windows (WSL). The shared `cc:os` preference
// (`src/lib/os-pref.ts`, P06, read-only from this plan — `src/lib/**` is
// outside P07's `owned_paths`) only stores three macro values
// (`'macos' | 'linux' | 'windows'`): it predates the PowerShell/WSL split
// and this plan cannot extend it (no `shared_paths` were granted for
// `src/lib/**`). Rather than silently dropping a tab, `OSTabs` keeps using
// `cc:os` for the macro choice (so cross-page persistence and any future
// consumer of that key keep working unchanged) and adds one key of its
// own, `cc:os:shell`, to remember which Windows shell was last chosen.
// Flagged in this plan's Handoff notes for whoever owns `os-pref.ts` next
// to consider folding `cc:os:shell` into a real four-value contract.
import { OS_VALUES, type OsPref, readOsPref, writeOsPref } from '../../lib/os-pref.ts';
import type { StorageLike } from '../../lib/progress.ts';

export const WINDOWS_SHELL_STORAGE_KEY = 'cc:os:shell';

export const WINDOWS_SHELLS = ['powershell', 'wsl'] as const;
export type WindowsShell = (typeof WINDOWS_SHELLS)[number];

export function isWindowsShell(value: unknown): value is WindowsShell {
  return typeof value === 'string' && (WINDOWS_SHELLS as readonly string[]).includes(value);
}

/** The four tabs shown, in display order — always all four (D002). */
export const TAB_IDS = ['macos', 'linux', 'windows-powershell', 'windows-wsl'] as const;
export type TabId = (typeof TAB_IDS)[number];

export const TAB_LABELS: Record<TabId, string> = {
  macos: 'macOS',
  linux: 'Linux',
  'windows-powershell': 'Windows (PowerShell)',
  'windows-wsl': 'Windows (WSL)',
};

/** The stored Windows-shell preference, or null when unset/invalid/unavailable. */
export function readShellPref(storage: StorageLike | null): WindowsShell | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(WINDOWS_SHELL_STORAGE_KEY);
    return isWindowsShell(raw) ? raw : null;
  } catch {
    return null;
  }
}

/** Persist the Windows-shell preference. Returns false when storage refused the write. */
export function writeShellPref(value: WindowsShell, storage: StorageLike | null): boolean {
  if (!storage) return false;
  try {
    storage.setItem(WINDOWS_SHELL_STORAGE_KEY, value);
    return true;
  } catch {
    return false;
  }
}

/** The concrete tab id for a macro OS + (for windows) shell preference. */
export function tabIdFor(macro: OsPref, shell: WindowsShell): TabId {
  if (macro === 'macos') return 'macos';
  if (macro === 'linux') return 'linux';
  return shell === 'wsl' ? 'windows-wsl' : 'windows-powershell';
}

/** The macro `cc:os` value + (for windows) shell value a given tab writes. */
export function prefsForTab(tab: TabId): { macro: OsPref; shell: WindowsShell } {
  if (tab === 'macos') return { macro: 'macos', shell: 'powershell' };
  if (tab === 'linux') return { macro: 'linux', shell: 'powershell' };
  if (tab === 'windows-wsl') return { macro: 'windows', shell: 'wsl' };
  return { macro: 'windows', shell: 'powershell' };
}

/** The tab to show on load: the stored `cc:os` (+ `cc:os:shell` for
 *  Windows) preference, or `fallback` (a guess, e.g. from `os-pref.ts`'s
 *  `guessOsPref`) when nothing is stored yet. */
export function resolveActiveTab(fallback: OsPref, storage: StorageLike | null): TabId {
  const macro = readOsPref(storage) ?? fallback;
  const shell = readShellPref(storage) ?? 'powershell';
  return tabIdFor(macro, shell);
}

/** Persist the OS/shell choice a tab click represents. Never throws. */
export function persistTab(tab: TabId, storage: StorageLike | null): void {
  const { macro, shell } = prefsForTab(tab);
  writeOsPref(macro, storage);
  writeShellPref(shell, storage);
}

export { OS_VALUES };
export type { OsPref };
