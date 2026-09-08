// Level hues (docs/design/KILN.md §2.3). Each level owns one hue, defined
// once in tokens.css as `--cc-level-1…4`, and it is used for WAYFINDING ONLY:
// the level chip, the rail marker and the progress ring. Never a background
// fill larger than a chip (KILN §2.3).
//
// Contrast note (KILN §10, WCAG 2.2 AA): the level hue carries the chip's
// tint and border, never its text. Chip text is always `--cc-ink`, which
// clears AA against every tint at both themes' paper values; the hue itself
// is only ever asked to clear 3:1 as a non-text boundary.
//
// The export shape is unchanged from the pre-Kiln module so existing callers
// (LessonMeta, ProgressBar, the level and lesson routes) keep working.

/** The token a level's chip, marker and ring are drawn with. */
export function levelColorVar(level: number | null): string {
  switch (level) {
    case 1:
      return 'var(--cc-level-1)';
    case 2:
      return 'var(--cc-level-2)';
    case 3:
      return 'var(--cc-level-3)';
    case 4:
      return 'var(--cc-level-4)';
    default:
      return 'var(--cc-ink-faint)';
  }
}

/** Inline style for a level chip: hue as tint and hairline, ink as text. */
export function levelBadgeStyle(level: number | null): string {
  const c = levelColorVar(level);
  return [
    `background: color-mix(in srgb, ${c} 14%, transparent)`,
    `border: 1px solid color-mix(in srgb, ${c} 42%, transparent)`,
    'color: var(--cc-ink)',
  ].join('; ');
}

/** Inline style for the rail marker / progress fill of a level. */
export function levelAccentStyle(level: number | null): string {
  return `background: ${levelColorVar(level)}`;
}

/** Whole hours, rounded to one decimal, for "18 lessons · 4 h". */
export function hoursFromMinutes(minutes: number): string {
  if (minutes <= 0) return '0';
  const hours = minutes / 60;
  return hours >= 10 || Number.isInteger(hours) ? String(Math.round(hours)) : hours.toFixed(1);
}
