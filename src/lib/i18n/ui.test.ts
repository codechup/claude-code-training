import { describe, expect, it } from 'vitest';
import { draftNotice, otherLang, t, ui } from './ui.ts';

describe('ui dictionary', () => {
  it('defines exactly the same keys in both locales', () => {
    expect(Object.keys(ui.tr).sort()).toEqual(Object.keys(ui.en).sort());
  });

  it('has no empty string in either locale', () => {
    for (const [lang, strings] of Object.entries(ui)) {
      for (const [key, value] of Object.entries(strings)) {
        if (typeof value === 'string') {
          expect(value.length, `${lang}.${key}`).toBeGreaterThan(0);
        }
      }
    }
  });

  it('falls back to English for an unknown locale', () => {
    expect(t('de')).toBe(ui.en);
    expect(t('tr')).toBe(ui.tr);
  });

  it('swaps to the other locale', () => {
    expect(otherLang('en')).toBe('tr');
    expect(otherLang('tr')).toBe('en');
  });
});

// plans/P06 pitfall: "a mis-encoded save (not UTF-8) will silently corrupt
// ş/ğ/ı/İ/ö/ü/ç". These assertions fail loudly if that ever happens.
describe('Turkish diacritics (D016, D018)', () => {
  function trStrings(): string[] {
    return Object.values(ui.tr).filter((v): v is string => typeof v === 'string');
  }

  it('carries real Turkish characters', () => {
    const all = trStrings().join(' ');
    for (const ch of ['ş', 'ğ', 'ı', 'İ', 'ö', 'ü', 'ç']) {
      expect(all, `missing "${ch}"`).toContain(ch);
    }
  });

  it('contains no replacement characters or mojibake', () => {
    for (const value of trStrings()) {
      expect(value).not.toContain('�');
      expect(value).not.toMatch(/Ã.|Å.|Ä±/);
    }
  });

  it('spells the draft notice exactly as the design canvas does', () => {
    expect(ui.tr.drafted).toBe('Türkçesi hazırlanıyor');
    // The notice is always written in the language of the page that is
    // missing, so switching EN -> a still-untranslated TR page reads Turkish.
    expect(draftNotice('tr')).toBe('Türkçesi hazırlanıyor');
    expect(draftNotice('en')).toBe('English version coming');
  });

  it('keeps English technical terms in Turkish chrome (D018)', () => {
    expect(ui.tr.playbook).toBe('Playbook');
    expect(ui.tr.siteName).toContain('Claude Code');
  });
});

describe('formatters', () => {
  it('renders the module counters in each language', () => {
    expect(ui.en.inModule(2, 7, 'm07')).toBe('2 / 7 in m07');
    expect(ui.tr.inModule(2, 7, 'm07')).toBe('m07 içinde 2 / 7');
    expect(ui.en.lessonOf(2, 7, 'm07 Hooks')).toBe('m07 Hooks · lesson 2 of 7');
    expect(ui.en.levelLabel(3)).toBe('Level 3');
    expect(ui.tr.levelLabel(3)).toBe('Seviye 3');
  });

  it('accepts placeholder tokens so the client script can re-render labels', () => {
    expect(ui.en.inModule('{done}', '{total}', 'm07')).toBe('{done} / {total} in m07');
  });
});
