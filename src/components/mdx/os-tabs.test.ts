import { describe, expect, it } from 'vitest';
import type { StorageLike } from '../../lib/progress.ts';
import { OS_STORAGE_KEY, readOsPref } from '../../lib/os-pref.ts';
import {
  isWindowsShell,
  persistTab,
  prefsForTab,
  readShellPref,
  resolveActiveTab,
  TAB_IDS,
  TAB_LABELS,
  tabIdFor,
  WINDOWS_SHELL_STORAGE_KEY,
  writeShellPref,
} from './os-tabs.ts';

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

describe('OSTabs always exposes all four D002 tabs', () => {
  it('has exactly macOS, Linux, Windows (PowerShell), Windows (WSL)', () => {
    expect(TAB_IDS).toEqual(['macos', 'linux', 'windows-powershell', 'windows-wsl']);
    expect(Object.keys(TAB_LABELS)).toHaveLength(4);
    expect(TAB_LABELS['windows-powershell']).toBe('Windows (PowerShell)');
    expect(TAB_LABELS['windows-wsl']).toBe('Windows (WSL)');
  });
});

describe('tabIdFor / prefsForTab', () => {
  it('maps macos/linux directly, independent of shell', () => {
    expect(tabIdFor('macos', 'powershell')).toBe('macos');
    expect(tabIdFor('macos', 'wsl')).toBe('macos');
    expect(tabIdFor('linux', 'wsl')).toBe('linux');
  });

  it('splits windows by shell', () => {
    expect(tabIdFor('windows', 'powershell')).toBe('windows-powershell');
    expect(tabIdFor('windows', 'wsl')).toBe('windows-wsl');
  });

  it('round-trips every tab through prefsForTab -> tabIdFor', () => {
    for (const tab of TAB_IDS) {
      const { macro, shell } = prefsForTab(tab);
      expect(tabIdFor(macro, shell)).toBe(tab);
    }
  });
});

describe('shell preference storage (cc:os:shell)', () => {
  it('round-trips', () => {
    const store = memoryStorage();
    expect(readShellPref(store)).toBeNull();
    expect(writeShellPref('wsl', store)).toBe(true);
    expect(store.getItem(WINDOWS_SHELL_STORAGE_KEY)).toBe('wsl');
    expect(readShellPref(store)).toBe('wsl');
  });

  it('rejects an unknown value', () => {
    expect(readShellPref(memoryStorage({ 'cc:os:shell': 'cmd' }))).toBeNull();
    expect(isWindowsShell('cmd')).toBe(false);
    expect(isWindowsShell('powershell')).toBe(true);
  });

  it('never throws when storage throws', () => {
    expect(() => readShellPref(throwingStorage)).not.toThrow();
    expect(writeShellPref('wsl', throwingStorage)).toBe(false);
    expect(readShellPref(null)).toBeNull();
    expect(writeShellPref('wsl', null)).toBe(false);
  });
});

describe('resolveActiveTab', () => {
  it('falls back to the guessed macro OS (powershell default) when nothing is stored', () => {
    expect(resolveActiveTab('macos', memoryStorage())).toBe('macos');
    expect(resolveActiveTab('windows', memoryStorage())).toBe('windows-powershell');
  });

  it('prefers the stored cc:os + cc:os:shell over the fallback', () => {
    const store = memoryStorage({ 'cc:os': 'windows', 'cc:os:shell': 'wsl' });
    expect(resolveActiveTab('macos', store)).toBe('windows-wsl');
  });
});

describe('persistTab writes both the shared cc:os key and the local shell key', () => {
  it('selecting Windows (WSL) writes cc:os=windows and cc:os:shell=wsl', () => {
    const store = memoryStorage();
    persistTab('windows-wsl', store);
    expect(readOsPref(store)).toBe('windows');
    expect(store.getItem(OS_STORAGE_KEY)).toBe('windows');
    expect(readShellPref(store)).toBe('wsl');
  });

  it('selecting macOS writes cc:os=macos', () => {
    const store = memoryStorage({ 'cc:os': 'windows', 'cc:os:shell': 'wsl' });
    persistTab('macos', store);
    expect(readOsPref(store)).toBe('macos');
  });

  it('never throws when storage throws', () => {
    expect(() => persistTab('windows-wsl', throwingStorage)).not.toThrow();
  });
});
