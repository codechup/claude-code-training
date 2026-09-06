// Pure helpers for `CodeBlock.astro`, split out so they run under plain
// Vitest (this repo's `vitest.config.ts` has no Astro Vite plugin, so
// `.astro` files cannot be imported from a `.test.ts` — see this plan's
// Handoff notes).
//
// `CodeBlock.astro` does not call Shiki itself: the code sample is written
// as a real fenced code block in the MDX body (already highlighted by
// Astro's own markdown pipeline, `astro.config.ts`'s
// `markdown.shikiConfig`, dual-theme, D019) and passed to `CodeBlock` as
// its default slot; the frontmatter reads the already-rendered
// `<pre class="astro-code">…<code><span class="line">…</span></code></pre>`
// HTML via `Astro.slots.render('default')` and this module re-shapes it:
// line numbers, `highlight` lines, and `annotations` are all added here,
// never by re-highlighting the code.

/** One rendered source line: the original Shiki-highlighted inner HTML
 *  (untouched, so syntax colors survive) plus the same line's plain text
 *  (tags stripped, entities decoded) for the copy button. */
export interface CodeLine {
  html: string;
  text: string;
}

const LINE_OPEN = '<span class="line">';
const SPAN_OPEN_RE = /<span\b/g;
const SPAN_CLOSE = '</span>';
const TAG_RE = /<[^>]+>/g;
const ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
};

/** Strip HTML tags and decode the handful of entities Shiki's HTML escaper
 *  produces, recovering the exact original source text of one line. */
export function stripToText(html: string): string {
  return html.replace(TAG_RE, '').replace(/&amp;|&lt;|&gt;|&quot;|&#39;/g, (m) => ENTITIES[m] ?? m);
}

/**
 * Split a rendered `<pre class="astro-code">…</pre>` block (or just its
 * `<code>` contents) into one `CodeLine` per `<span class="line">`. A
 * single trailing empty line (from a source file ending in a newline) is
 * dropped, matching how editors normally count lines.
 */
export function extractLines(renderedHtml: string): CodeLine[] {
  const lines: CodeLine[] = [];
  let searchFrom = 0;
  for (;;) {
    const start = renderedHtml.indexOf(LINE_OPEN, searchFrom);
    if (start === -1) break;
    const contentStart = start + LINE_OPEN.length;
    const end = findMatchingClose(renderedHtml, contentStart);
    const html = renderedHtml.slice(contentStart, end);
    lines.push({ html, text: stripToText(html) });
    searchFrom = end + SPAN_CLOSE.length;
  }
  if (lines.length > 0 && lines[lines.length - 1]?.text === '') {
    lines.pop();
  }
  return lines;
}

/**
 * Given the index right after an opening `<span ...>`'s `>`, find the
 * index of the `</span>` that closes it, correctly skipping over any
 * nested `<span>` elements (Shiki wraps every colored token in its own
 * span inside each line span).
 */
function findMatchingClose(html: string, from: number): number {
  let depth = 1;
  let pos = from;
  while (depth > 0) {
    SPAN_OPEN_RE.lastIndex = pos;
    const nextOpen = SPAN_OPEN_RE.exec(html);
    const nextClose = html.indexOf(SPAN_CLOSE, pos);
    if (nextClose === -1) return html.length;
    if (nextOpen && nextOpen.index < nextClose) {
      depth += 1;
      pos = nextOpen.index + 5; // past "<span"
    } else {
      depth -= 1;
      if (depth === 0) return nextClose;
      pos = nextClose + SPAN_CLOSE.length;
    }
  }
  return html.length;
}

/**
 * Parse a `{3,7-9}`-style range string (the same shorthand Shiki/rehype
 * meta-string highlighting uses) into the set of 1-indexed line numbers it
 * selects. Accepts the string with or without its surrounding braces.
 * Invalid/empty input yields an empty set rather than throwing — a typo in
 * a `highlight` prop should never fail the build.
 */
export function parseLineRanges(spec: string | undefined | null): Set<number> {
  const out = new Set<number>();
  if (!spec) return out;
  const cleaned = spec.trim().replace(/^\{/, '').replace(/\}$/, '');
  if (!cleaned) return out;
  for (const part of cleaned.split(',')) {
    const piece = part.trim();
    if (!piece) continue;
    const range = /^(\d+)\s*-\s*(\d+)$/.exec(piece);
    if (range) {
      const [, fromStr, toStr] = range;
      const from = Number(fromStr);
      const to = Number(toStr);
      if (Number.isFinite(from) && Number.isFinite(to)) {
        const lo = Math.min(from, to);
        const hi = Math.max(from, to);
        for (let n = lo; n <= hi; n += 1) out.add(n);
      }
      continue;
    }
    const single = Number(piece);
    if (Number.isFinite(single)) out.add(single);
  }
  return out;
}

/** The full copy-button text: every line's plain text, newline-joined. */
export function joinRawCode(lines: CodeLine[]): string {
  return lines.map((l) => l.text).join('\n');
}
