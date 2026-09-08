// Chrome strings for the two locales (D016: EN is the source, TR is a
// translation; D018: English technical terms are kept in Turkish copy and
// explained on first use — that rule applies to lesson prose, but the same
// spirit is why "Playbook" and "Claude Code" stay untranslated below).
//
// Lesson CONTENT never comes from here — only site chrome: nav labels,
// buttons, meta labels, empty states. Turkish strings are written with full
// diacritics (ç ğ ı İ ö ş ü) and this file must stay UTF-8.
import type { Lang } from '../slugs.ts';

export interface UiStrings {
  siteName: string;
  siteTagline: string;
  /** The product name, set in the Fraunces wordmark (KILN §5.2). */
  brandName: string;
  /** The publisher line under the wordmark — footer and drawer only. */
  brandPublisher: string;
  skipToContent: string;
  mainNav: string;
  curriculum: string;
  playbook: string;
  changelog: string;
  design: string;
  searchLessons: string;
  searchHint: string;
  openMenu: string;
  start: string;
  startLevel1: string;
  seeCurriculumMap: string;
  language: string;
  drafted: string;
  min: string;
  lessons: string;
  hours: string;
  verifiedOn: string;
  updated: string;
  onThisPage: string;
  previous: string;
  next: string;
  editOnGitHub: string;
  wasThisHelpful: string;
  sources: string;
  breadcrumb: string;
  lessonOf: (n: number, total: number, moduleId: string) => string;
  inModule: (done: string | number, total: string | number, moduleId: string) => string;
  progressNote: string;
  whatChanged: string;
  whatChangedLead: string;
  fourLevels: string;
  fourLevelsLead: string;
  curriculumMap: string;
  curriculumMapLead: string;
  playbookCardTitle: string;
  playbookCardBody: string;
  openThePlaybook: string;
  heroEyebrow: string;
  heroTitle: string;
  heroBody: string;
  heroBodyShort: string;
  free: string;
  noLessonsYet: string;
  feedSource: string;
  placeholderBadge: string;
  placeholderNote: string;
  notFoundTitle: string;
  notFoundBody: string;
  backHome: string;
  difficulty: Record<'intro' | 'core' | 'advanced', string>;
  levelName: Record<1 | 2 | 3 | 4, string>;
  levelLabel: (n: number) => string;
}

const en: UiStrings = {
  siteName: 'Claude Code Academy',
  siteTagline: 'Learn Claude Code from zero to autonomous — hands-on, source-verified lessons.',
  brandName: 'Claude Code Academy',
  brandPublisher: 'by CodeChup',
  skipToContent: 'Skip to content',
  mainNav: 'Main',
  curriculum: 'Curriculum',
  playbook: 'Playbook',
  changelog: 'Changelog',
  design: 'Design',
  searchLessons: 'Search lessons',
  searchHint: 'Ctrl K',
  openMenu: 'Menu',
  start: 'Start',
  startLevel1: 'Start Level 1',
  seeCurriculumMap: 'See the curriculum map',
  language: 'Language',
  drafted: 'English version coming',
  min: 'min',
  lessons: 'lessons',
  hours: 'h',
  verifiedOn: 'verified on',
  updated: 'updated',
  onThisPage: 'On this page',
  previous: 'Previous',
  next: 'Next',
  editOnGitHub: 'Edit this page on GitHub',
  wasThisHelpful: 'Was this helpful?',
  sources: 'Sources',
  breadcrumb: 'Breadcrumb',
  lessonOf: (n, total, moduleId) => `${moduleId} · lesson ${n} of ${total}`,
  inModule: (done, total, moduleId) => `${done} / ${total} in ${moduleId}`,
  progressNote: 'Progress is saved in this browser. No account.',
  whatChanged: 'What changed',
  whatChangedLead: 'Kept current with the release.',
  fourLevels: 'Four levels',
  fourLevelsLead: 'Pick up where you are.',
  curriculumMap: 'Curriculum map',
  curriculumMapLead: 'Every feature, one lesson each.',
  playbookCardTitle: 'CLAUDE.md, rule, skill, hook, agent or MCP?',
  playbookCardBody:
    'A decision tree for the question every team asks in week two, plus the anti-pattern catalogue and the glossary.',
  openThePlaybook: 'Open the playbook',
  heroEyebrow: 'Zero to autonomous',
  heroTitle: 'Learn Claude Code the way you will actually use it.',
  heroBody:
    'A levelled, hands-on curriculum for developers. Every feature gets a lab you run in your own terminal, the mistakes people make with it, and sources verified against the current release.',
  heroBodyShort:
    'Levelled, hands-on, verified against the current release. Labs run in your own terminal.',
  free: 'free, MIT',
  noLessonsYet: 'Lessons for this module are being written.',
  feedSource: 'Source:',
  placeholderBadge: 'Placeholder',
  placeholderNote:
    'This page exists to prove the build, routing and content gate work end to end. It is not a finished lesson — the real lesson replaces it.',
  notFoundTitle: 'Page not found',
  notFoundBody: "This page doesn't exist.",
  backHome: 'Back to the English site',
  difficulty: { intro: 'intro', core: 'core', advanced: 'advanced' },
  levelName: { 1: 'Beginner', 2: 'Intermediate', 3: 'Advanced', 4: 'Master' },
  levelLabel: (n) => `Level ${n}`,
};

const tr: UiStrings = {
  siteName: 'Claude Code Akademisi',
  siteTagline:
    "Claude Code'u sıfırdan otonom kullanıma: uygulamalı ve kaynağı doğrulanmış derslerle.",
  brandName: 'Claude Code Akademisi',
  brandPublisher: 'CodeChup tarafından',
  skipToContent: 'İçeriğe geçin',
  mainNav: 'Ana menü',
  curriculum: 'Müfredat',
  playbook: 'Playbook',
  changelog: 'Değişiklikler',
  design: 'Tasarım',
  searchLessons: 'Derslerde ara',
  searchHint: 'Ctrl K',
  openMenu: 'Menü',
  start: 'Başlayın',
  startLevel1: "Seviye 1'e başlayın",
  seeCurriculumMap: 'Müfredat haritasına bakın',
  language: 'Dil',
  drafted: 'Türkçesi hazırlanıyor',
  min: 'dk',
  lessons: 'ders',
  hours: 'sa',
  verifiedOn: 'doğrulandı',
  updated: 'güncellendi',
  onThisPage: 'Bu sayfada',
  previous: 'Önceki',
  next: 'Sonraki',
  editOnGitHub: "Bu sayfayı GitHub'da düzenleyin",
  wasThisHelpful: 'Bu sayfa işinize yaradı mı?',
  sources: 'Kaynaklar',
  breadcrumb: 'Sayfa yolu',
  lessonOf: (n, total, moduleId) => `${moduleId} · ders ${n} / ${total}`,
  inModule: (done, total, moduleId) => `${moduleId} içinde ${done} / ${total}`,
  progressNote: 'İlerlemeniz bu tarayıcıda saklanır. Hesap gerekmez.',
  whatChanged: 'Neler değişti',
  whatChangedLead: 'Güncel sürümle birlikte güncelleniyor.',
  fourLevels: 'Dört seviye',
  fourLevelsLead: 'Kaldığınız yerden devam edin.',
  curriculumMap: 'Müfredat haritası',
  curriculumMapLead: 'Her özellik için bir ders.',
  playbookCardTitle: 'CLAUDE.md, rule, skill, hook, agent mı yoksa MCP mi?',
  playbookCardBody:
    'Her ekibin ikinci haftasında sorduğu sorunun karar ağacı; ayrıca anti-pattern kataloğu ve sözlük.',
  openThePlaybook: 'Playbook’u açın',
  heroEyebrow: 'Sıfırdan otonom kullanıma',
  heroTitle: "Claude Code'u gerçekten kullanacağınız şekilde öğrenin.",
  heroBody:
    'Geliştiriciler için seviyeli ve uygulamalı bir müfredat. Her özelliğin kendi terminalinizde çalıştırdığınız bir laboratuvarı, sık yapılan hataları ve güncel sürüme göre doğrulanmış kaynakları var.',
  heroBodyShort:
    'Seviyeli, uygulamalı ve güncel sürüme göre doğrulanmış. Laboratuvarlar kendi terminalinizde çalışır.',
  free: 'ücretsiz, MIT',
  noLessonsYet: 'Bu modülün dersleri yazılıyor.',
  feedSource: 'Kaynak:',
  placeholderBadge: 'Yer tutucu',
  placeholderNote:
    'Bu sayfa; derleme, yönlendirme ve içerik kapısının uçtan uca çalıştığını göstermek için var. Tamamlanmış bir ders değildir — gerçek ders bunun yerini alacak.',
  notFoundTitle: 'Sayfa bulunamadı',
  notFoundBody: 'Bu sayfa bulunamadı.',
  backHome: 'Türkçe siteye dön',
  difficulty: { intro: 'giriş', core: 'temel', advanced: 'ileri' },
  levelName: { 1: 'Başlangıç', 2: 'Orta', 3: 'İleri', 4: 'Usta' },
  levelLabel: (n) => `Seviye ${n}`,
};

export const ui: Record<Lang, UiStrings> = { en, tr };

/** UI strings for `lang`, falling back to English for an unknown locale. */
export function t(lang: string): UiStrings {
  return ui[lang as Lang] ?? ui.en;
}

/** The other locale — LangSwitch's target. */
export function otherLang(lang: string): Lang {
  return lang === 'tr' ? 'en' : 'tr';
}

/**
 * The "the page you asked for isn't translated yet" message, always shown
 * in the language it is about: switching EN -> TR when the Turkish page is
 * still a draft reads "Türkçesi hazırlanıyor".
 */
export function draftNotice(targetLang: string): string {
  return t(targetLang).drafted;
}
