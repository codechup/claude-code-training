/**
 * `cc-prose` — a Sätteri hast plugin making two prose-level repairs that CSS
 * alone cannot make. It runs over every Markdown and MDX body at build time,
 * so no lesson file changes (`content/**` is read-only).
 *
 * 1. **Tables get a scroll container.** A wide table used to be its own
 *    scroller (`display: block; overflow-x: auto` in prose.css). That did
 *    scroll, but it gave the reader no affordance and — because a scroll
 *    container holding no focusable content cannot be reached from a keyboard
 *    — it raised a *serious* axe violation (`scrollable-region-focusable`, two
 *    nodes on the install lesson at 390px). Neither a `tabindex` nor a wrapper
 *    can be expressed in a stylesheet, so every `<table>` is wrapped here in
 *    `<div class="cc-table-scroll" tabindex="0">`, styled in prose.css with a
 *    thin scrollbar and the same local/scroll gradient scroll-shadow the
 *    terminal body uses (KILN §8.1).
 *
 * 2. **Short inline code stops breaking mid-token.** `code-reviewer` split
 *    after its hyphen and rendered as two half-chips. A hyphen (Unicode line
 *    break class HY) is a legitimate break opportunity, and no CSS property
 *    suppresses it selectively — `word-break: keep-all` and every
 *    `overflow-wrap` value were measured against the built page and moved
 *    nothing. `white-space: nowrap` does suppress it, but applied to every
 *    chip it would push a 57-character `git clone …` past the 390px column.
 *    So the decision is made where the length is known: a chip holding one
 *    whitespace-free token of at most `NOWRAP_MAX` characters gets
 *    `.cc-code-nowrap` and never breaks, while a longer one keeps normal
 *    wrapping and — thanks to `box-decoration-break: clone` in prose.css —
 *    keeps a whole chip on each fragment.
 *
 * The visitors take Sätteri's own types; the pure helpers below them
 * (`shouldNowrap`, `withNowrapClass`, `tableWrapper`) carry the logic and are
 * unit-tested on their own.
 */
import type { HastPluginDefinition, HastVisitorContext } from 'satteri';
import type { Element } from 'hast';

/**
 * Longest token kept on one line. JetBrains Mono at 0.9em of body size is
 * ~8.6px per character, so 28 characters is ~240px — inside the narrowest
 * prose column on the site (a lab checklist row at 390px is ~308px wide).
 */
export const NOWRAP_MAX = 28;

/** A chip is held together when it is one token and short enough to fit. */
export function shouldNowrap(text: string): boolean {
  return text.length > 0 && text.length <= NOWRAP_MAX && !/\s/.test(text);
}

/** `className` as hast holds it, with `cc-code-nowrap` appended. */
export function withNowrapClass(existing: unknown): string[] {
  if (Array.isArray(existing)) return [...(existing as string[]), 'cc-code-nowrap'];
  if (typeof existing === 'string' && existing.length > 0) return [existing, 'cc-code-nowrap'];
  return ['cc-code-nowrap'];
}

/** The wrapper element put around each prose table. */
export function tableWrapper(): Element {
  return {
    type: 'element',
    tagName: 'div',
    properties: { className: ['cc-table-scroll'], tabIndex: 0 },
    children: [],
  };
}

export function visitTable(node: Element, ctx: HastVisitorContext): void {
  ctx.wrapNode(node, tableWrapper());
}

export function visitCode(node: Element, ctx: HastVisitorContext): void {
  // A code block's `<code>` is the block itself and wraps nothing.
  const parent = ctx.parent(node);
  if (parent?.type === 'element' && parent.tagName === 'pre') return;
  if (!shouldNowrap(ctx.textContent(node))) return;
  ctx.setProperty(node, 'className', withNowrapClass(node.properties?.className));
}

const proseHastPlugin: HastPluginDefinition = {
  name: 'cc-prose',
  element: [
    { filter: ['table'], visit: visitTable },
    { filter: ['code'], visit: visitCode },
  ],
};

export default proseHastPlugin;
