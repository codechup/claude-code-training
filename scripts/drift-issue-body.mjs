#!/usr/bin/env node
// Splice the generated drift table into the ONE `drift` issue's body without destroying human
// notes. Everything the generator owns lives between the markers; anything a person typed
// outside them is carried over verbatim.
//
//   node scripts/drift-issue-body.mjs <old-body|-> <report.md> <out.md>
import { readFileSync, writeFileSync } from 'node:fs';

const START = '<!-- drift:start -->';
const END = '<!-- drift:end -->';
const REGION = /<!-- drift:start -->[\s\S]*?<!-- drift:end -->/;

const [oldPath, reportPath, outPath] = process.argv.slice(2);
if (!reportPath || !outPath) {
  process.stderr.write('usage: drift-issue-body.mjs <old-body|-> <report.md> <out.md>\n');
  process.exit(2);
}

const read = (p) => {
  if (!p || p === '-') return '';
  try {
    return readFileSync(p, 'utf8');
  } catch {
    return '';
  }
};

const stamp = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
const region = [
  START,
  read(reportPath).trimEnd(),
  '',
  `_Regenerated ${stamp} by \`changelog-weekly\`. Anything written outside this block is kept._`,
  END,
].join('\n');

const old = read(oldPath);
writeFileSync(
  outPath,
  REGION.test(old) ? old.replace(REGION, region) : `${region}\n\n${old}`.trimEnd() + '\n',
);
