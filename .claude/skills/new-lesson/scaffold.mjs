#!/usr/bin/env node
// Scaffolds one lesson: the English MDX from the D006 template, the Turkish `draft: true` twin,
// and the shared transcript folder the lab recording will land in (D099).
//
//   node .claude/skills/new-lesson/scaffold.mjs <level>/<module>/<NN-slug>
//   node .claude/skills/new-lesson/scaffold.mjs l2-intermediate/m07-hooks/03-format-on-save
//
// Deliberately mechanical: it writes structure, never prose or facts. The lesson-writer fills it
// in from a lesson-researcher brief and a real transcript. Refuses to overwrite an existing file.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

const arg = process.argv[2];
if (!arg) {
  console.error('usage: node .claude/skills/new-lesson/scaffold.mjs <level>/<module>/<NN-slug>');
  process.exit(1);
}

// --- parse and validate the path ---------------------------------------------------------------
const parts = arg
  .replace(/\\/g, '/')
  .replace(/^\/+|\/+$/g, '')
  .split('/');
if (parts.length !== 3) {
  console.error(`error: expected <level>/<module>/<NN-slug>, got "${arg}"`);
  process.exit(1);
}
const [level, module, file] = parts;

const LEVELS = { 'l1-beginner': 1, 'l2-intermediate': 2, 'l3-advanced': 3, 'l4-master': 4 };
if (!(level in LEVELS)) {
  console.error(
    `error: unknown level "${level}" (expected one of ${Object.keys(LEVELS).join(', ')})`,
  );
  process.exit(1);
}
if (!/^m\d{2}-[a-z0-9-]+$/.test(module)) {
  console.error(`error: module must look like "m07-hooks", got "${module}"`);
  process.exit(1);
}
const m = file.match(/^(\d{2})-([a-z0-9-]+)$/);
if (!m) {
  console.error(`error: lesson must look like "03-format-on-save", got "${file}"`);
  process.exit(1);
}
const [, nn, slug] = m;
const order = Number(nn);

// --- verified_version comes from the inventory heading, never from memory (D096) ---------------
function verifiedVersion() {
  const heading = readFileSync(join(root, 'research', 'feature-inventory.md'), 'utf8').split(
    '\n',
  )[0];
  const found = heading.match(/Claude Code (\d+\.\d+\.\d+)/);
  if (!found) {
    console.error('error: could not read the verified version from research/feature-inventory.md');
    process.exit(1);
  }
  return found[1];
}

const version = verifiedVersion();
const today = new Date().toISOString().slice(0, 10);
const title = slug.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase());

function frontmatter({ t, description, draft, tags }) {
  return `---
title: '${t.replace(/'/g, "''")}'
description: '${description.replace(/'/g, "''")}'
level: ${LEVELS[level]}
module: '${module}'
order: ${order}
duration_min: 15
difficulty: core
tags: [${tags.map((x) => `'${x}'`).join(', ')}]
verified_version: '${version}'
updated: ${today}
draft: ${draft}
sources:
  - type: official
    title: 'TODO official Claude Code doc for this lesson'
    url: 'https://code.claude.com/docs/en/overview.md'
    verified_at: ${today}
---`;
}

// The English template, in the D006 order (docs/CURRICULUM.md §3). Every heading is present so a
// writer deletes nothing and the reviewer agent can check order mechanically.
const enBody = `

{/* Template: docs/CURRICULUM.md §3 (D006). Section order is fixed — fill each in, never drop one. */}

## Objectives and prerequisites

TODO — what the reader can DO after this lesson, as outcomes. Then the prerequisites.

## When NOT to use this

TODO — the honest boundary: two or three situations where this is the wrong tool, and what to use
instead. This section is mandatory (D090).

## Concept

TODO — how it actually works, not just the syntax. Include one example prompt (D027) and cover
macOS, Linux and Windows in every command block (D002).

## Hands-on lab

TODO — numbered steps against the lab repo tag \`lesson/${module}-${nn}-start\`.

**Expected result:** TODO — one explicit, checkable outcome.

**Checklist:**

- [ ] TODO

{/* Paste a trimmed excerpt of the REAL recording from
     content/_shared/transcripts/${module}/${nn}-${slug}/. Never write output the tool did not
     print (D070, D093, D099). */}

## Anti-patterns

TODO — each anti-pattern with its fix.

## Changed

{/* Only if a behaviour was superseded: two sentences plus the version (D044). Otherwise delete
     this heading. */}

## Quiz

TODO — 3 to 5 multiple-choice questions, one defensible answer each (D064).

## Sources

TODO — the official doc link is mandatory; videos carry channel and duration; every entry has a
\`verified_at\` date someone actually fetched (D041–D043). Keep this list in sync with the
\`sources\` frontmatter above.
`;

const trBody = `

{/* Türkçe çeviri henüz yapılmadı. \`draft: true\` kaldığı sürece bu sayfa gezinmede görünmez.
     Çeviriyi \`/translate-lesson content/en/${level}/${module}/${nn}-${slug}.mdx\` ile üretin;
     kurallar: .claude/rules/i18n.md (D016, D018). */}

Bu dersin Türkçesi hazırlanıyor.
`;

// --- write ------------------------------------------------------------------------------------
const targets = [
  {
    path: join('content', 'en', level, module, `${nn}-${slug}.mdx`),
    body:
      frontmatter({
        t: title,
        description: `TODO one-sentence description of ${title}.`,
        draft: false,
        tags: [module.replace(/^m\d{2}-/, '')],
      }) + enBody,
  },
  {
    path: join('content', 'tr', level, module, `${nn}-${slug}.mdx`),
    body:
      frontmatter({
        t: title,
        description: `TODO one-sentence description of ${title}.`,
        draft: true,
        tags: [module.replace(/^m\d{2}-/, '')],
      }) + trBody,
  },
  {
    path: join('content', '_shared', 'transcripts', module, `${nn}-${slug}`, 'README.md'),
    body: `# Transcript — ${module}/${nn}-${slug}

Raw Claude Code session recordings for this lesson's lab. **Real recordings only** (D070, D093,
D099): the writing session runs the lab against the lab repo tag \`lesson/${module}-${nn}-start\`
and saves what the terminal actually printed. The lesson renders a trimmed copy.

Trimming means deleting lines and redacting local paths, usernames and anything
\`.claude/rules/public-hygiene.md\` forbids — never rewriting output into something cleaner than
the tool produced. This folder is scanned by \`scripts/check-public-hygiene.mjs\` like every other
tracked file.

Files here are outside the content collections and outside the EN/TR parity gate.

| File | Lab step | Recorded on | Claude Code version |
| ---- | -------- | ----------- | ------------------- |
| TODO | TODO     | TODO        | ${version}          |
`,
  },
];

const existing = targets.filter((t) => existsSync(join(root, t.path)));
if (existing.length > 0) {
  const list = existing.map((t) => `  ${t.path.replace(/\\/g, '/')}`).join('\n');
  console.error(`error: refusing to overwrite:\n${list}`);
  process.exit(1);
}

for (const t of targets) {
  const abs = join(root, t.path);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, t.body, 'utf8');
  console.log(`created ${t.path.replace(/\\/g, '/')}`);
}

console.log(
  `\nnext: run the lesson-researcher agent for ${level}/${module}/${nn}-${slug}, run the lab and save the\n` +
    `recording, then let the lesson-writer agent fill the template in. Verify with: npm run gate`,
);
