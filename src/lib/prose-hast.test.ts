import { describe, expect, it, vi } from 'vitest';
import proseHastPlugin, {
  NOWRAP_MAX,
  shouldNowrap,
  tableWrapper,
  visitCode,
  visitTable,
  withNowrapClass,
} from './prose-hast.ts';
import type { Element } from 'hast';
import type { HastVisitorContext } from 'satteri';

function el(tagName: string, properties: Element['properties'] = {}): Element {
  return { type: 'element', tagName, properties, children: [] };
}

/**
 * A stand-in for Sätteri's visitor context: only the four members the plugin
 * touches are implemented, so the mock is cast rather than fully built.
 */
function context(opts: { text?: string; parent?: Element; textContent?: () => string } = {}) {
  const calls = { wrapped: [] as unknown[], props: [] as [string, unknown][] };
  const ctx = {
    textContent: opts.textContent ?? (() => opts.text ?? ''),
    parent: () => opts.parent,
    setProperty: (_node: unknown, key: string, value: unknown) => calls.props.push([key, value]),
    wrapNode: (_node: unknown, wrapper: unknown) => calls.wrapped.push(wrapper),
  } as unknown as HastVisitorContext;
  return { ctx, calls };
}

describe('shouldNowrap', () => {
  it('holds a short single token together', () => {
    expect(shouldNowrap('code-reviewer')).toBe(true);
    expect(shouldNowrap('x'.repeat(NOWRAP_MAX))).toBe(true);
  });

  it('lets whitespace, over-long tokens and empties wrap', () => {
    expect(shouldNowrap('npm ci')).toBe(false);
    expect(shouldNowrap('x'.repeat(NOWRAP_MAX + 1))).toBe(false);
    expect(shouldNowrap('')).toBe(false);
  });
});

describe('withNowrapClass', () => {
  it('appends to an array, a string, and nothing', () => {
    expect(withNowrapClass(['kept'])).toEqual(['kept', 'cc-code-nowrap']);
    expect(withNowrapClass('kept')).toEqual(['kept', 'cc-code-nowrap']);
    expect(withNowrapClass(undefined)).toEqual(['cc-code-nowrap']);
    expect(withNowrapClass('')).toEqual(['cc-code-nowrap']);
  });
});

describe('visitTable', () => {
  it('wraps the table in a focusable scroll container', () => {
    const { ctx, calls } = context();
    visitTable(el('table'), ctx);
    expect(calls.wrapped).toEqual([
      {
        type: 'element',
        tagName: 'div',
        properties: { className: ['cc-table-scroll'], tabIndex: 0 },
        children: [],
      },
    ]);
  });

  it('builds a fresh wrapper each time', () => {
    expect(tableWrapper()).not.toBe(tableWrapper());
  });
});

describe('visitCode', () => {
  it('marks a short chip', () => {
    const { ctx, calls } = context({ text: 'docs-writer', parent: el('p') });
    visitCode(el('code'), ctx);
    expect(calls.props).toEqual([['className', ['cc-code-nowrap']]]);
  });

  it('keeps an existing class', () => {
    const { ctx, calls } = context({ text: 'docs-writer', parent: el('p') });
    visitCode(el('code', { className: ['kept'] }), ctx);
    expect(calls.props).toEqual([['className', ['kept', 'cc-code-nowrap']]]);
  });

  it('leaves a long or spaced chip alone', () => {
    for (const text of ['npm ci', 'x'.repeat(NOWRAP_MAX + 1)]) {
      const { ctx, calls } = context({ text, parent: el('p') });
      visitCode(el('code'), ctx);
      expect(calls.props).toEqual([]);
    }
  });

  it('never touches a code block, and never reads its text', () => {
    const textContent = vi.fn(() => 'short');
    const { ctx, calls } = context({ parent: el('pre'), textContent });
    visitCode(el('code'), ctx);
    expect(calls.props).toEqual([]);
    expect(textContent).not.toHaveBeenCalled();
  });

  it('handles a parentless node', () => {
    const { ctx, calls } = context({ text: 'a-b', parent: undefined });
    visitCode(el('code'), ctx);
    expect(calls.props).toEqual([['className', ['cc-code-nowrap']]]);
  });
});

describe('the plugin definition', () => {
  it('registers one filtered visitor per tag', () => {
    expect(proseHastPlugin.name).toBe('cc-prose');
    const visitors = proseHastPlugin.element;
    expect(Array.isArray(visitors) && visitors.map((v) => v.filter)).toEqual([['table'], ['code']]);
  });
});
