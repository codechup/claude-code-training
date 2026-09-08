#!/usr/bin/env node
// Fails the build if a raw colour literal appears anywhere under src/ or
// public/ OUTSIDE src/styles/tokens.css.
//
// The design system is token-only (CLAUDE.md: "Design only through tokens";
// docs/design/KILN.md §2): every colour a component uses must resolve to a
// `--cc-*` custom property (directly, or via a Tailwind `@theme` alias
// defined in app.css) so one edit to tokens.css restyles the whole site and
// the two themes stay in sync. `tokens.css` is the one file allowed to spell
// out literal colour values — that is the definition site.
//
// Three kinds of literal are caught:
//   1. hex             #fff, #ffff, #ffffff, #ffffffff
//   2. colour function rgb() rgba() hsl() hsla() lab() lch() oklab() oklch()
//   3. named colours   the CSS named-colour keywords, in value position —
//                      `color: black`, `border: 1px solid white`,
//                      `--x: rebeccapurple`, `color-mix(in srgb, red 20%, …)`.
//      `transparent`, `currentColor`, `inherit` and `none` are NOT colours in
//      this sense and stay allowed.
import { readdir, readFile } from 'node:fs/promises';
import { join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const EXTS = /\.(astro|css|ts|tsx|mdx|js|mjs|cjs|svg|html)$/;

// Relative-to-root paths (posix-normalised) that may contain literals.
//   styles/tokens.css — the definition site.
//   favicon.svg       — a standalone asset served on its own; it is fetched
//                       outside any document, so it cannot reference the
//                       stylesheet's custom properties and MUST inline its
//                       colours. Keep it in sync with KILN §5.1 by hand.
const ALLOWED_PATHS = new Set(['styles/tokens.css', 'favicon.svg']);

// Negative lookbehind excludes HTML numeric character references like
// `&#9788;` (a sun/moon glyph, not a colour) — a literal "#" preceded by "&".
const HEX_COLOR = /(?<!&)#(?:[0-9a-fA-F]{3,4}){1,2}\b/g;
const FUNC_COLOR = /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\s*\(/g;

// The CSS named colours (CSS Color 4), minus `transparent` and
// `currentcolor`, which are keywords rather than literal values.
const NAMED = [
  'aliceblue',
  'antiquewhite',
  'aqua',
  'aquamarine',
  'azure',
  'beige',
  'bisque',
  'black',
  'blanchedalmond',
  'blue',
  'blueviolet',
  'brown',
  'burlywood',
  'cadetblue',
  'chartreuse',
  'chocolate',
  'coral',
  'cornflowerblue',
  'cornsilk',
  'crimson',
  'cyan',
  'darkblue',
  'darkcyan',
  'darkgoldenrod',
  'darkgray',
  'darkgreen',
  'darkgrey',
  'darkkhaki',
  'darkmagenta',
  'darkolivegreen',
  'darkorange',
  'darkorchid',
  'darkred',
  'darksalmon',
  'darkseagreen',
  'darkslateblue',
  'darkslategray',
  'darkslategrey',
  'darkturquoise',
  'darkviolet',
  'deeppink',
  'deepskyblue',
  'dimgray',
  'dimgrey',
  'dodgerblue',
  'firebrick',
  'floralwhite',
  'forestgreen',
  'fuchsia',
  'gainsboro',
  'ghostwhite',
  'gold',
  'goldenrod',
  'gray',
  'green',
  'greenyellow',
  'grey',
  'honeydew',
  'hotpink',
  'indianred',
  'indigo',
  'ivory',
  'khaki',
  'lavender',
  'lavenderblush',
  'lawngreen',
  'lemonchiffon',
  'lightblue',
  'lightcoral',
  'lightcyan',
  'lightgoldenrodyellow',
  'lightgray',
  'lightgreen',
  'lightgrey',
  'lightpink',
  'lightsalmon',
  'lightseagreen',
  'lightskyblue',
  'lightslategray',
  'lightslategrey',
  'lightsteelblue',
  'lightyellow',
  'lime',
  'limegreen',
  'linen',
  'magenta',
  'maroon',
  'mediumaquamarine',
  'mediumblue',
  'mediumorchid',
  'mediumpurple',
  'mediumseagreen',
  'mediumslateblue',
  'mediumspringgreen',
  'mediumturquoise',
  'mediumvioletred',
  'midnightblue',
  'mintcream',
  'mistyrose',
  'moccasin',
  'navajowhite',
  'navy',
  'oldlace',
  'olive',
  'olivedrab',
  'orange',
  'orangered',
  'orchid',
  'palegoldenrod',
  'palegreen',
  'paleturquoise',
  'palevioletred',
  'papayawhip',
  'peachpuff',
  'peru',
  'pink',
  'plum',
  'powderblue',
  'purple',
  'rebeccapurple',
  'red',
  'rosybrown',
  'royalblue',
  'saddlebrown',
  'salmon',
  'sandybrown',
  'seagreen',
  'seashell',
  'sienna',
  'silver',
  'skyblue',
  'slateblue',
  'slategray',
  'slategrey',
  'snow',
  'springgreen',
  'steelblue',
  'tan',
  'teal',
  'thistle',
  'tomato',
  'turquoise',
  'violet',
  'wheat',
  'white',
  'whitesmoke',
  'yellow',
  'yellowgreen',
].join('|');

// Properties (and any custom property) whose value is a colour. Restricting
// the match to these keeps English prose — "a black box", "the Red Hat
// build" — from being flagged, while still catching every real declaration.
const COLOR_PROP =
  '--[a-z0-9-]+|color|background|background-color|border|border-color|border-top|border-right|' +
  'border-bottom|border-left|border-top-color|border-right-color|border-bottom-color|' +
  'border-left-color|border-inline-color|border-block-color|outline|outline-color|fill|stroke|' +
  'box-shadow|text-shadow|text-decoration|text-decoration-color|text-emphasis-color|caret-color|' +
  'accent-color|column-rule|column-rule-color|scrollbar-color|stop-color|flood-color|' +
  'lighting-color|stroke|fill-opacity|background-image';

// A colour keyword in the value of one of those properties…
const NAMED_IN_DECL = new RegExp(
  String.raw`(?:^|[;{"'\s])(?:${COLOR_PROP})\s*:\s*[^;{}"'\n]*?\b(${NAMED})\b`,
  'gi',
);
// …or as an argument to a colour function, e.g. `color-mix(in srgb, black 8%, …)`.
const NAMED_IN_FUNC = new RegExp(String.raw`\bcolor-mix\s*\([^)]*?\b(${NAMED})\b`, 'gi');
// …or as an SVG presentation attribute, e.g. `fill="white"`.
const NAMED_IN_ATTR = new RegExp(
  String.raw`\b(?:fill|stroke|stop-color|flood-color|lighting-color)\s*=\s*["'](${NAMED})["']`,
  'gi',
);

function toPosix(p) {
  return p.split(sep).join('/');
}

async function walk(dir) {
  const out = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (err) {
    if (err.code === 'ENOENT') return out;
    throw err;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (entry.isFile()) out.push(full);
  }
  return out;
}

/**
 * Scan one or more roots (default: `<cwd>/src` and `<cwd>/public`) for raw
 * colour literals outside the allowed definition sites. A single root may be
 * passed as a string. Returns `{ ok, offenders, filesChecked }`.
 *
 * @param {string | string[]} [roots]
 */
export async function checkRawColors(
  roots = [join(process.cwd(), 'src'), join(process.cwd(), 'public')],
) {
  const rootList = Array.isArray(roots) ? roots : [roots];
  const multi = rootList.length > 1;

  const offenders = [];
  let filesChecked = 0;

  for (const root of rootList) {
    const files = (await walk(root)).filter((f) => EXTS.test(f));
    for (const file of files) {
      const rel = toPosix(relative(root, file));
      if (ALLOWED_PATHS.has(rel)) continue;
      filesChecked += 1;

      const label = multi ? `${toPosix(relative(process.cwd(), root))}/${rel}` : rel;
      const text = await readFile(file, 'utf8');
      const lines = text.split(/\r?\n/);
      lines.forEach((line, i) => {
        for (const m of line.matchAll(HEX_COLOR)) {
          offenders.push(
            `${label}:${i + 1}: raw color literal "${m[0]}" (use a token from tokens.css)`,
          );
        }
        for (const m of line.matchAll(FUNC_COLOR)) {
          offenders.push(
            `${label}:${i + 1}: raw color function "${m[0]}…" (use a token from tokens.css)`,
          );
        }
        // One declaration can match more than one of the three named-colour
        // patterns (`background: color-mix(in srgb, black …)` matches two),
        // so report each keyword on a line once.
        const named = new Set();
        for (const re of [NAMED_IN_DECL, NAMED_IN_FUNC, NAMED_IN_ATTR]) {
          re.lastIndex = 0;
          for (const m of line.matchAll(re)) named.add(m[1]);
        }
        for (const keyword of named) {
          offenders.push(
            `${label}:${i + 1}: named CSS color "${keyword}" in a colour value (use a token from tokens.css)`,
          );
        }
      });
    }
  }

  return { ok: offenders.length === 0, offenders, filesChecked };
}

function isDirectRun() {
  const invoked = process.argv[1];
  if (!invoked) return false;
  try {
    return fileURLToPath(import.meta.url) === resolve(invoked);
  } catch {
    return false;
  }
}

if (isDirectRun()) {
  const result = await checkRawColors();
  if (result.ok) {
    console.log(`check-raw-colors: OK (${result.filesChecked} files scanned)`);
  } else {
    console.error(`check-raw-colors: found ${result.offenders.length} problem(s):\n`);
    for (const o of result.offenders) console.error(`  - ${o}`);
    console.error(
      '\nRaw colour literals are banned outside src/styles/tokens.css — add or reuse a --cc-* token instead.',
    );
    process.exit(1);
  }
}
