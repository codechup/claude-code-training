import { describe, expect, it } from 'vitest';
import { extractLines, joinRawCode, parseLineRanges, stripToText } from './codeblock.ts';

describe('stripToText', () => {
  it('strips shiki token spans and decodes entities', () => {
    const html =
      '<span style="--shiki-light:token-a">const</span> <span style="--shiki-light:token-b">x</span> = <span>&quot;a &amp; b&quot;</span> &lt;3&gt;';
    expect(stripToText(html)).toBe('const x = "a & b" <3>');
  });

  it('is a no-op on plain text', () => {
    expect(stripToText('plain text')).toBe('plain text');
  });
});

describe('extractLines', () => {
  it('splits one CodeLine per shiki line span', () => {
    const html =
      '<pre class="astro-code"><code>' +
      '<span class="line"><span style="c">echo</span><span style="c"> hi</span></span>\n' +
      '<span class="line"><span style="c">ls</span><span style="c"> -la</span></span>\n' +
      '<span class="line"></span></code></pre>';
    const lines = extractLines(html);
    // Trailing empty line (source ending in \n) is dropped.
    expect(lines).toHaveLength(2);
    expect(lines[0]?.text).toBe('echo hi');
    expect(lines[1]?.text).toBe('ls -la');
    expect(lines[0]?.html).toContain('<span style="c">echo</span>');
  });

  it('keeps a real intentional blank line in the middle', () => {
    const html =
      '<span class="line">a</span>\n<span class="line"></span>\n<span class="line">b</span>\n';
    const lines = extractLines(html);
    expect(lines.map((l) => l.text)).toEqual(['a', '', 'b']);
  });

  it('returns an empty array for html with no line spans', () => {
    expect(extractLines('<pre><code>no lines here</code></pre>')).toEqual([]);
  });
});

describe('joinRawCode', () => {
  it('newline-joins every line’s plain text, gutter/annotations excluded by construction', () => {
    const lines = [
      { html: '<b>echo</b>', text: 'echo hi' },
      { html: '<b>ls</b>', text: 'ls -la' },
    ];
    expect(joinRawCode(lines)).toBe('echo hi\nls -la');
  });

  it('round-trips a real rendered block back to its original source', () => {
    const html =
      '<span class="line"><span style="c">claude</span><span style="c"> --version</span></span>\n' +
      '<span class="line"></span>';
    expect(joinRawCode(extractLines(html))).toBe('claude --version');
  });
});

describe('parseLineRanges', () => {
  it('parses a mix of singles and ranges, with or without braces', () => {
    expect([...parseLineRanges('{3,7-9}')].sort((a, b) => a - b)).toEqual([3, 7, 8, 9]);
    expect([...parseLineRanges('3,7-9')].sort((a, b) => a - b)).toEqual([3, 7, 8, 9]);
  });

  it('normalizes a reversed range', () => {
    expect([...parseLineRanges('9-7')].sort((a, b) => a - b)).toEqual([7, 8, 9]);
  });

  it('ignores whitespace', () => {
    expect([...parseLineRanges(' 1 , 3 - 4 ')].sort((a, b) => a - b)).toEqual([1, 3, 4]);
  });

  it('returns an empty set for missing, empty or garbage input', () => {
    expect(parseLineRanges(undefined).size).toBe(0);
    expect(parseLineRanges(null).size).toBe(0);
    expect(parseLineRanges('').size).toBe(0);
    expect(parseLineRanges('{}').size).toBe(0);
    expect(parseLineRanges('not-a-range').size).toBe(0);
  });
});
