// Build-time OG (social card) image rendering (D065): `satori` lays out a
// plain node tree into SVG, `sharp` rasterizes that SVG to a 1200x630 PNG.
//
// Kiln (docs/design/KILN.md §5): the card is the brand at its largest — the
// clay tile mark and the "Claude Code Academy" wordmark top-left, an eyebrow,
// the title in the display face, the publisher line bottom-left, and a clay
// rule along the bottom edge. The retired 3x3 sigil, the lowercase mono
// `codechup` wordmark and the letter-spaced `CLAUDE CODE ACADEMY` line are
// gone from here as well as from the site chrome (§5.2).
//
// A social card always renders on the DARK ground regardless of the viewer's
// OS theme, so every colour comes from the `:root[data-theme='dark']` block
// of tokens.css.
//
// Font note: satori parses TTF/OTF/WOFF but NOT WOFF2, so the faces here come
// from the STATIC `@fontsource/*` packages (which ship `.woff`) rather than
// the `@fontsource-variable/*` packages the site itself loads (WOFF2 only).
// Both the `latin` and `latin-ext` subsets of every face are registered as a
// family fallback pair (`"Fraunces", "Fraunces Ext"`) so Turkish letters
// outside plain latin (ı İ ş ğ ö ü ç) render instead of satori's
// missing-glyph box.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import satori from 'satori';
import sharp from 'sharp';

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

// Colours are READ from `src/styles/tokens.css` at render time, never
// copy-pasted as literals here — `scripts/check-raw-colors.mjs` bans raw
// hex/rgb literals everywhere outside that one file, and satori (unlike a
// browser) cannot resolve `var(--cc-x)` itself, so this is the one place a
// build script needs the *resolved* value rather than the property reference.
const TOKEN_NAMES = [
  'paper',
  'paper-raised',
  'line',
  'ink',
  'ink-muted',
  'accent',
  'on-accent',
] as const;
type TokenName = (typeof TOKEN_NAMES)[number];

let tokensPromise: Promise<Record<TokenName, string>> | null = null;

/**
 * Parse the explicit `:root[data-theme='dark']` block of tokens.css and pull
 * out the Kiln tokens this card uses. tokens.css documents that block as a
 * flat list of `--name: value;` declarations precisely so this can stay a
 * regex rather than a CSS parser.
 */
async function loadDarkTokens(): Promise<Record<TokenName, string>> {
  if (!tokensPromise) {
    tokensPromise = (async () => {
      const css = await readFile(join(process.cwd(), 'src', 'styles', 'tokens.css'), 'utf8');
      const block = /:root\[data-theme=['"]dark['"]\]\s*\{([^}]*)\}/.exec(css)?.[1];
      if (!block) throw new Error('tokens.css: could not find the :root[data-theme="dark"] block');

      const values = {} as Record<TokenName, string>;
      for (const name of TOKEN_NAMES) {
        const re = new RegExp(`--cc-${name}:\\s*([^;]+);`);
        const value = re.exec(block)?.[1]?.trim();
        if (!value) throw new Error(`tokens.css: missing --cc-${name} in the dark block`);
        values[name] = value;
      }
      return values;
    })();
  }
  return tokensPromise;
}

async function loadFontFile(specifier: string): Promise<Buffer> {
  const resolved = import.meta.resolve(specifier);
  return readFile(fileURLToPath(resolved));
}

/** `null` when the package is not installed — the caller falls back to Inter. */
async function tryLoadFontFile(specifier: string): Promise<Buffer | null> {
  try {
    return await loadFontFile(specifier);
  } catch {
    return null;
  }
}

interface LoadedFonts {
  inter400: Buffer;
  inter400Ext: Buffer;
  inter600: Buffer;
  inter600Ext: Buffer;
  /** Fraunces (display). Null when `@fontsource/fraunces` is not installed. */
  display: Buffer | null;
  displayExt: Buffer | null;
}

let fontsPromise: Promise<LoadedFonts> | null = null;

/** Fonts are read from disk once and cached for the life of the process. */
function loadFonts(): Promise<LoadedFonts> {
  if (!fontsPromise) {
    fontsPromise = Promise.all([
      loadFontFile('@fontsource/inter/files/inter-latin-400-normal.woff'),
      loadFontFile('@fontsource/inter/files/inter-latin-ext-400-normal.woff'),
      loadFontFile('@fontsource/inter/files/inter-latin-600-normal.woff'),
      loadFontFile('@fontsource/inter/files/inter-latin-ext-600-normal.woff'),
      // Display face. The site loads Fraunces from the VARIABLE package,
      // which ships WOFF2 only and satori cannot parse; the static package
      // ships the `.woff` files below. If it is absent the card still
      // renders — the display face simply falls back to Inter 600 — so a
      // missing optional dependency degrades the card instead of failing
      // the build.
      tryLoadFontFile('@fontsource/fraunces/files/fraunces-latin-600-normal.woff'),
      tryLoadFontFile('@fontsource/fraunces/files/fraunces-latin-ext-600-normal.woff'),
    ]).then(([inter400, inter400Ext, inter600, inter600Ext, display, displayExt]) => ({
      inter400,
      inter400Ext,
      inter600,
      inter600Ext,
      display,
      displayExt,
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
  // explicit `display: flex|contents|none` on every text-holding div, which
  // conflicts with the `-webkit-box` display the line-clamp title needs.
  const normalized = children && children.length === 1 ? children[0] : children;
  return { type, props: { style, children: normalized } };
}

/**
 * The Kiln mark (KILN §5.1) — the same 32-unit drawing as
 * `src/components/brand/Mark.astro`, so the `viewBox` does all the scaling
 * and there is no separate geometry to keep in sync.
 */
function mark(size: number, tile: string, ink: string): Node {
  return {
    type: 'svg',
    props: {
      width: size,
      height: size,
      viewBox: '0 0 32 32',
      style: { display: 'flex' },
      children: [
        { type: 'rect', props: { width: 32, height: 32, rx: 10, fill: tile } },
        {
          type: 'path',
          props: {
            d: 'M10.7 9.8 16.7 16l-6 6.2',
            fill: 'none',
            stroke: ink,
            'stroke-width': 2.8,
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
          },
        },
        {
          type: 'rect',
          props: { x: 19.7, y: 11.5, width: 3, height: 9, rx: 1.5, fill: ink },
        },
      ],
    },
  };
}

export interface OgCardInput {
  /** e.g. "Level 1 · Getting Claude Code running" */
  eyebrow: string;
  title: string;
  /** Wordmark, e.g. "Claude Code Academy" / "Claude Code Akademisi" (KILN §5.2). */
  brand?: string;
  /** Publisher line under the wordmark (KILN §5.2). */
  publisher?: string;
  /** @deprecated pre-Kiln mono wordmark; ignored. */
  wordmark?: string;
}

/** Render one OG card to a PNG buffer (1200x630). */
export async function renderOgCard({
  eyebrow,
  title,
  brand,
  publisher = 'by CodeChup',
}: OgCardInput): Promise<Buffer> {
  const [fonts, colors] = await Promise.all([loadFonts(), loadDarkTokens()]);

  const brandLine = brand ?? 'Claude Code Academy';
  const displayFamily = fonts.display
    ? 'Fraunces, Fraunces Ext, Inter, Inter Ext'
    : 'Inter, Inter Ext';

  const tree = h(
    'div',
    {
      display: 'flex',
      flexDirection: 'column',
      width: `${OG_WIDTH}px`,
      height: `${OG_HEIGHT}px`,
      backgroundColor: colors.paper,
      fontFamily: 'Inter, Inter Ext',
    },
    [
      h(
        'div',
        {
          display: 'flex',
          flex: '1',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px',
        },
        [
          // top: the lockup
          h('div', { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '16px' }, [
            mark(52, colors.accent, colors['on-accent']),
            h(
              'span',
              {
                display: 'flex',
                fontFamily: displayFamily,
                fontWeight: 600,
                fontSize: '30px',
                letterSpacing: '-0.02em',
                color: colors.ink,
              },
              [brandLine],
            ),
          ]),
          // middle: eyebrow + title
          h('div', { display: 'flex', flexDirection: 'column', maxWidth: '1000px' }, [
            h(
              'div',
              {
                display: 'flex',
                marginBottom: '20px',
                fontFamily: 'Inter, Inter Ext',
                fontWeight: 600,
                fontSize: '20px',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: colors['ink-muted'],
              },
              [eyebrow],
            ),
            h(
              'div',
              {
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 3,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontFamily: displayFamily,
                fontWeight: 600,
                fontSize: '62px',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                color: colors.ink,
              },
              [title],
            ),
          ]),
          // bottom: publisher line
          h(
            'div',
            {
              display: 'flex',
              fontFamily: 'Inter, Inter Ext',
              fontWeight: 400,
              fontSize: '22px',
              color: colors['ink-muted'],
            },
            [publisher],
          ),
        ],
      ),
      // the clay rule along the bottom edge
      h('div', {
        display: 'flex',
        width: '100%',
        height: '10px',
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
      { name: 'Inter', data: fonts.inter600, weight: 600, style: 'normal' },
      { name: 'Inter Ext', data: fonts.inter600Ext, weight: 600, style: 'normal' },
      ...(fonts.display
        ? [
            {
              name: 'Fraunces',
              data: fonts.display,
              weight: 600 as const,
              style: 'normal' as const,
            },
          ]
        : []),
      ...(fonts.displayExt
        ? [
            {
              name: 'Fraunces Ext',
              data: fonts.displayExt,
              weight: 600 as const,
              style: 'normal' as const,
            },
          ]
        : []),
    ],
  });

  return sharp(Buffer.from(svg)).resize(OG_WIDTH, OG_HEIGHT).png().toBuffer();
}
