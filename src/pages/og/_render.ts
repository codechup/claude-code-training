// Build-time OG (social card) image rendering (D065): `satori` lays out a
// plain node tree into SVG, `sharp` rasterizes that SVG to a 1200x630 PNG.
//
// Layout mirrors `docs/design/canvas-out/Brand.dc.html`'s "Social card
// 1200×630" artboard: lockup top-left (sigil + wordmark), an eyebrow line,
// the title, and an 8px gold bar along the bottom. Colors are the dark-theme
// values from `src/styles/tokens.css` (a social-card preview always renders
// on a dark ground regardless of the viewer's OS theme).
//
// Font note (plan P09): satori cannot parse WOFF2, only TTF/OTF/WOFF, so
// fonts are loaded from `@fontsource/inter` and `@fontsource/jetbrains-mono`
// (the static, non-variable packages, which ship `.woff` files) rather than
// the `@fontsource-variable/inter` package the rest of the site uses (that
// one only ships `.woff2`). Both the `latin` and `latin-ext` subsets are
// loaded and registered as CSS font-family fallbacks (`"Inter", "Inter
// Ext"`) so Turkish letters outside the plain latin subset (ı, İ, ş, ğ, ö,
// ü, ç) still render instead of falling back to satori's missing-glyph box.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import satori from 'satori';
import sharp from 'sharp';

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

// Colors are READ from `src/styles/tokens.css` at render time, never
// copy-pasted as literals here — `scripts/check-raw-colors.mjs` (CLAUDE.md:
// "Design only through tokens") bans raw hex/rgb literals everywhere
// outside that one file, and satori (unlike a browser) cannot resolve
// `var(--color-x)` itself, so this is the one place a build script needs
// the *resolved* value rather than the custom-property reference.
const TOKEN_NAMES = ['bg-1', 'ink', 'ink-muted', 'caret', 'accent'] as const;
type TokenName = (typeof TOKEN_NAMES)[number];

let tokensPromise: Promise<Record<TokenName, string>> | null = null;

/**
 * Parse the explicit `:root[data-theme='dark']` block of tokens.css (a
 * social card always renders on a dark ground regardless of the viewer's
 * OS theme) and pull out the handful of `--color-*` values this card uses.
 */
async function loadDarkTokens(): Promise<Record<TokenName, string>> {
  if (!tokensPromise) {
    tokensPromise = (async () => {
      const css = await readFile(join(process.cwd(), 'src', 'styles', 'tokens.css'), 'utf8');
      const block = /:root\[data-theme=['"]dark['"]\]\s*\{([^}]*)\}/.exec(css)?.[1];
      if (!block) throw new Error('tokens.css: could not find the :root[data-theme="dark"] block');

      const values = {} as Record<TokenName, string>;
      for (const name of TOKEN_NAMES) {
        const re = new RegExp(`--color-${name}:\\s*([^;]+);`);
        const value = re.exec(block)?.[1]?.trim();
        if (!value) throw new Error(`tokens.css: missing --color-${name} in the dark block`);
        values[name] = value;
      }
      return values;
    })();
  }
  return tokensPromise;
}

const SIGIL_CELLS: [number, number][] = [
  [1, 1],
  [9, 1],
  [1, 9],
  [9, 9],
  [17, 9],
  [1, 17],
  [9, 17],
  [17, 17],
];

async function loadFontFile(specifier: string): Promise<Buffer> {
  const resolved = import.meta.resolve(specifier);
  return readFile(fileURLToPath(resolved));
}

interface LoadedFonts {
  inter400: Buffer;
  inter400Ext: Buffer;
  inter700: Buffer;
  inter700Ext: Buffer;
  mono500: Buffer;
  mono500Ext: Buffer;
}

let fontsPromise: Promise<LoadedFonts> | null = null;

/** Fonts are read from disk once and cached for the life of the process. */
function loadFonts(): Promise<LoadedFonts> {
  if (!fontsPromise) {
    fontsPromise = Promise.all([
      loadFontFile('@fontsource/inter/files/inter-latin-400-normal.woff'),
      loadFontFile('@fontsource/inter/files/inter-latin-ext-400-normal.woff'),
      loadFontFile('@fontsource/inter/files/inter-latin-700-normal.woff'),
      loadFontFile('@fontsource/inter/files/inter-latin-ext-700-normal.woff'),
      loadFontFile('@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff'),
      loadFontFile('@fontsource/jetbrains-mono/files/jetbrains-mono-latin-ext-500-normal.woff'),
    ]).then(([inter400, inter400Ext, inter700, inter700Ext, mono500, mono500Ext]) => ({
      inter400,
      inter400Ext,
      inter700,
      inter700Ext,
      mono500,
      mono500Ext,
    }));
  }
  return fontsPromise;
}

// satori accepts a plain `{ type, props }` tree — the same shape JSX compiles
// to — so this file never needs a JSX pragma or a `react` runtime dependency.
type Node = { type: string; props: Record<string, unknown> };

function h(
  type: string,
  style: Record<string, string | number>,
  children?: (Node | string)[],
): Node {
  // Mirror JSX's own children shape: `<div>{"x"}</div>` compiles to a plain
  // string prop, not a one-element array — and satori's internal "does this
  // div wrap into more than one line" check (which gates its "needs an
  // explicit display" rule) keys off `typeof children === 'string'`. A
  // single-item array here would look, to that check, like a div that has
  // already wrapped into multiple lines, and satori would then require an
  // explicit `display: flex|contents|none` on every text-holding div,
  // which conflicts with the `-webkit-box` display the line-clamp title
  // needs. Unwrapping keeps this file's children ergonomics (always pass
  // an array) without hitting that.
  const normalized = children && children.length === 1 ? children[0] : children;
  return { type, props: { style, children: normalized } };
}

// Coordinates are the raw 24-unit grid (see Header.astro's SIGIL_CELLS) —
// the `viewBox` does the scaling to `size`, exactly like the header's own
// inline SVG, so this never needs its own scale math.
function sigil(size: number, inkColor: string, accentColor: string): Node {
  return {
    type: 'svg',
    props: {
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      style: { display: 'flex' },
      children: [
        ...SIGIL_CELLS.map(([x, y]) => ({
          type: 'rect',
          props: { x, y, width: 6, height: 6, rx: 1, fill: inkColor },
        })),
        { type: 'rect', props: { x: 17, y: 1, width: 6, height: 6, rx: 1, fill: accentColor } },
      ],
    },
  };
}

export interface OgCardInput {
  /** e.g. "Level 1 · Getting Claude Code running" */
  eyebrow: string;
  title: string;
  /** The mono wordmark line, e.g. "codechup" (D016/D017: same in both languages). */
  wordmark?: string;
  /** The mono line under the wordmark, e.g. "claude code academy" / "claude code akademisi". */
  wordmarkSub?: string;
}

/** Render one OG card to a PNG buffer (1200x630). */
export async function renderOgCard({
  eyebrow,
  title,
  wordmark = 'codechup',
  wordmarkSub = 'claude code academy',
}: OgCardInput): Promise<Buffer> {
  const [fonts, colors] = await Promise.all([loadFonts(), loadDarkTokens()]);

  const tree = h(
    'div',
    {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      width: `${OG_WIDTH}px`,
      height: `${OG_HEIGHT}px`,
      padding: '48px',
      backgroundColor: colors['bg-1'],
      fontFamily: 'Inter, Inter Ext',
    },
    [
      // top: sigil + wordmark lockup
      h('div', { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px' }, [
        sigil(40, colors.ink, colors.accent),
        h('div', { display: 'flex', flexDirection: 'column', gap: '2px' }, [
          h(
            'span',
            {
              display: 'flex',
              fontFamily: 'JetBrains Mono, JetBrains Mono Ext',
              fontWeight: 500,
              fontSize: '20px',
              letterSpacing: '0.02em',
              color: colors.ink,
            },
            [wordmark],
          ),
          h(
            'span',
            {
              display: 'flex',
              fontFamily: 'JetBrains Mono, JetBrains Mono Ext',
              fontWeight: 500,
              fontSize: '14px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: colors['ink-muted'],
            },
            [wordmarkSub],
          ),
        ]),
      ]),
      // middle: eyebrow + title
      h('div', { display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '1000px' }, [
        h(
          'div',
          {
            display: 'flex',
            fontFamily: 'JetBrains Mono, JetBrains Mono Ext',
            fontWeight: 500,
            fontSize: '14px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: colors['ink-muted'],
          },
          [
            h('span', { display: 'flex', color: colors.caret }, ['// ']),
            h('span', { display: 'flex' }, [eyebrow]),
          ],
        ),
        h(
          'div',
          {
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontFamily: 'Inter, Inter Ext',
            fontWeight: 700,
            fontSize: '40px',
            lineHeight: 1.15,
            letterSpacing: '-0.015em',
            color: colors.ink,
          },
          [title],
        ),
      ]),
      // bottom: 8px gold bar
      h('div', {
        display: 'flex',
        width: '100%',
        height: '8px',
        backgroundColor: colors.accent,
      }),
    ],
  );

  const svg = await satori(tree as never, {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts: [
      { name: 'Inter', data: fonts.inter400, weight: 400, style: 'normal' },
      { name: 'Inter Ext', data: fonts.inter400Ext, weight: 400, style: 'normal' },
      { name: 'Inter', data: fonts.inter700, weight: 700, style: 'normal' },
      { name: 'Inter Ext', data: fonts.inter700Ext, weight: 700, style: 'normal' },
      { name: 'JetBrains Mono', data: fonts.mono500, weight: 500, style: 'normal' },
      { name: 'JetBrains Mono Ext', data: fonts.mono500Ext, weight: 500, style: 'normal' },
    ],
  });

  return sharp(Buffer.from(svg)).resize(OG_WIDTH, OG_HEIGHT).png().toBuffer();
}
