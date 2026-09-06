// The landing page's "what changed" feed (D062).
//
// Source: `research/deprecations.md` — the "Recent additions worth a 'New'
// badge (last ~6 months)" line, verified 2026-09-06 against Claude Code
// 2.1.263. That file is markdown prose, not data, and parsing it at build
// time would couple the site build to its wording, so the entries below are
// a small hand-maintained typed mirror of it. When `research/deprecations.md`
// changes, change this list in the same PR.
//
// Evidence rule (D093): the per-item release numbers drawn on the design
// canvas (`docs/design/canvas-out/Main.dc.html` shows 2.1.258 / 2.1.240)
// are design filler — `research/deprecations.md` records no per-feature
// version, so every entry here carries the one version the research file
// actually verifies against. P42 (the Playbook changelog page) re-reads the
// full changelog and can add exact versions then.
import type { Lang } from './slugs.ts';

export interface ChangeEntry {
  /** Claude Code release this was verified against. */
  version: string;
  /** Short headline, per language. */
  title: Record<Lang, string>;
  /** Where in the curriculum it is taught, per language. */
  where: Record<Lang, string>;
}

/** The Claude Code release the whole site is verified against (D096). */
export const VERIFIED_VERSION = '2.1.263';

export const CHANGES: ChangeEntry[] = [
  {
    version: VERIFIED_VERSION,
    title: {
      en: 'Per-session cache analytics in /cost',
      tr: '/cost içinde oturum başına önbellek analitiği',
    },
    where: { en: 'L2 · Models & effort', tr: 'S2 · Model ve efor' },
  },
  {
    version: VERIFIED_VERSION,
    title: { en: 'Design canvas via /design', tr: '/design ile tasarım kanvası' },
    where: { en: 'L4 · Visual', tr: 'S4 · Görsel' },
  },
  {
    version: VERIFIED_VERSION,
    title: {
      en: 'claude plugin eval and /skill-doctor',
      tr: 'claude plugin eval ve /skill-doctor',
    },
    where: { en: 'L3 · Plugins', tr: 'S3 · Plugin’ler' },
  },
  {
    version: VERIFIED_VERSION,
    title: { en: 'Fable 5.1 with a 1M-token context', tr: '1M token bağlamlı Fable 5.1' },
    where: { en: 'L2 · Models & effort', tr: 'S2 · Model ve efor' },
  },
  {
    version: VERIFIED_VERSION,
    title: { en: 'Spend limits in /usage', tr: '/usage içinde harcama limitleri' },
    where: { en: 'L2 · Models & effort', tr: 'S2 · Model ve efor' },
  },
];

/** The feed as flat, language-resolved rows for rendering. */
export function changesFor(lang: Lang): { version: string; title: string; where: string }[] {
  return CHANGES.map((c) => ({
    version: c.version,
    title: c.title[lang] ?? c.title.en,
    where: c.where[lang] ?? c.where.en,
  }));
}
