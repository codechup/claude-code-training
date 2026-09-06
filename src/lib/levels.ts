// Level badge colours (docs/design/CANVAS.md §6: "level badges `level-1…4`
// colours from §3"). The canvas draws them as tinted chips; here each level
// maps to an existing semantic token so no new colour literal enters the
// codebase (scripts/check-raw-colors.mjs).
//
// Contrast note (D036, WCAG 2.2 AA): the level colour is used for the chip's
// BACKGROUND TINT and border only. `--color-success` / `--color-warning`
// against `--color-bg-0` in the light theme sit below 4.5:1 for small text,
// so badge text is always `--color-ink`.

/** The semantic token a level's badge is tinted with. */
export function levelColorVar(level: number | null): string {
  switch (level) {
    case 1:
      return 'var(--color-info)';
    case 2:
      return 'var(--color-success)';
    case 3:
      return 'var(--color-warning)';
    case 4:
      return 'var(--color-accent)';
    default:
      return 'var(--color-ink-muted)';
  }
}

/** Inline style for a level badge / tinted chip. */
export function levelBadgeStyle(level: number | null): string {
  const c = levelColorVar(level);
  return [
    `background: color-mix(in srgb, ${c} 16%, transparent)`,
    `border: 1px solid color-mix(in srgb, ${c} 45%, transparent)`,
    'color: var(--color-ink)',
  ].join('; ');
}

/** Inline style for the accent rule / progress fill of a level. */
export function levelAccentStyle(level: number | null): string {
  return `background: ${levelColorVar(level)}`;
}

/** Whole hours, rounded to one decimal, for "18 lessons · 4 h". */
export function hoursFromMinutes(minutes: number): string {
  if (minutes <= 0) return '0';
  const hours = minutes / 60;
  return hours >= 10 || Number.isInteger(hours) ? String(Math.round(hours)) : hours.toFixed(1);
}
