// Generates the Claude Design artboards (*.dc.html) for P00 from shared CSS + per-artboard bodies.
// Run: node docs/design/canvas-src/build.mjs   → writes ../canvas-out/*.dc.html + canvas.json
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, '..', 'canvas-out');
mkdirSync(out, { recursive: true });

// ---- tokens (dark first; light overrides) -------------------------------------------------
const T = {
  dark: {
    bg0: '#0b0d12', bg1: '#11141b', bg2: '#171b24', bg3: '#1f2430',
    ink: '#efe9dc', inkSoft: '#b9b3a6', inkMuted: '#958f84', accentText: '#e6b731',
    line: 'rgba(239,233,220,0.10)', lineStrong: 'rgba(239,233,220,0.32)',
    gold: '#e6b731', goldInk: '#22190a', caret: '#ff4d3d',
    ok: '#61cb7c', warn: '#fe8c2c', danger: '#f75e51', info: '#6ac5e8',
    prompt: '#8fd3ff',
  },
  light: {
    bg0: '#f6f3ec', bg1: '#fbf9f4', bg2: '#ffffff', bg3: '#efece4',
    ink: '#16181d', inkSoft: '#4c4f57', inkMuted: '#666a72', accentText: '#7a5c00',
    line: 'rgba(22,24,29,0.12)', lineStrong: 'rgba(22,24,29,0.36)',
    gold: '#c99a12', goldInk: '#1c1503', caret: '#e63b2c',
    ok: '#1f8f45', warn: '#c4620b', danger: '#d0362a', info: '#1d7fb0',
    prompt: '#1d6fa8',
  },
};

const fonts = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap">`;

const css = (t) => `
  :root { color-scheme: ${t === T.dark ? 'dark' : 'light'}; }
  body { margin:0; background:${t.bg0}; color:${t.ink}; font-family:'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif; font-size:16px; line-height:1.5; -webkit-font-smoothing:antialiased; }
  a { color:${t.ink}; text-decoration:none; } a:hover { color:${t.gold}; }
  .mono { font-family:'JetBrains Mono', ui-monospace, Menlo, Consolas, monospace; font-variant-numeric: tabular-nums; }
  .eyebrow { font-family:'JetBrains Mono', ui-monospace, monospace; font-size:12px; letter-spacing:0.08em; text-transform:uppercase; color:${t.inkMuted}; }
  .eyebrow::before { content:'// '; color:${t.caret}; }
  .h1 { font-weight:700; font-size:56px; line-height:1.02; letter-spacing:-0.02em; text-wrap:balance; }
  .h2 { font-weight:600; font-size:32px; line-height:1.1; letter-spacing:-0.015em; }
  .h3 { font-weight:600; font-size:20px; line-height:1.3; letter-spacing:-0.01em; }
  .soft { color:${t.inkSoft}; } .muted { color:${t.inkMuted}; }
  .card { background:${t.bg2}; border:1px solid ${t.line}; border-radius:10px; box-shadow: inset 0 1px 0 rgba(255,255,255,0.04); }
  .btn { display:inline-flex; align-items:center; justify-content:center; gap:8px; height:44px; padding:0 18px; border-radius:6px; font-weight:500; font-size:15px; border:1px solid transparent; white-space:nowrap; }
  .btn-primary { background:${t.gold}; color:${t.goldInk}; }
  .btn-ghost { border-color:${t.lineStrong}; color:${t.ink}; background:transparent; }
  .btn-soft { background:${t.bg3}; color:${t.ink}; }
  .chip { display:inline-flex; align-items:center; height:28px; padding:0 10px; border-radius:4px; background:${t.bg3}; color:${t.inkSoft}; font-family:'JetBrains Mono', monospace; font-size:12px; letter-spacing:0.04em; }
  .hr { height:1px; background:${t.line}; }
  .term { background:${t.bg1}; border:1px solid ${t.line}; border-radius:10px; font-family:'JetBrains Mono', monospace; font-size:13px; line-height:1.6; color:${t.inkSoft}; overflow:hidden; }
  .term .bar { display:flex; align-items:center; gap:8px; height:36px; padding:0 14px; border-bottom:1px solid ${t.line}; color:${t.inkMuted}; font-size:12px; }
  .term .dot { width:10px; height:10px; border-radius:999px; background:${t.bg3}; }
  .term .body { padding:14px 16px; white-space:pre; }
  .p { color:${t.prompt}; } .u { color:${t.ink}; } .g { color:${t.accentText}; } .ok { color:${t.ok}; } .d { color:${t.inkMuted}; } .r { color:${t.caret}; }
  .caret { display:inline-block; width:0.55em; height:1em; background:${t.caret}; vertical-align:-0.15em; }
  .sigil { display:inline-block; }
  .kbd { font-family:'JetBrains Mono', monospace; font-size:12px; padding:2px 6px; border:1px solid ${t.lineStrong}; border-bottom-width:2px; border-radius:4px; color:${t.inkSoft}; }
  .grid { display:grid; gap:16px; }
  .row { display:flex; align-items:center; gap:12px; }
  .col { display:flex; flex-direction:column; gap:12px; }
  .badge { display:inline-flex; align-items:center; height:22px; padding:0 8px; border-radius:4px; font-family:'JetBrains Mono', monospace; font-size:11px; letter-spacing:0.06em; text-transform:uppercase; }
  .level-1 { background:rgba(106,197,232,0.15); color:${t.info}; }
  .level-2 { background:rgba(97,203,124,0.15); color:${t.ok}; }
  .level-3 { background:rgba(254,140,44,0.15); color:${t.warn}; }
  .level-4 { background:rgba(230,183,49,0.18); color:${t.gold}; }
  .callout { border:1px solid ${t.line}; border-radius:10px; padding:14px 16px; background:${t.bg1}; display:flex; gap:12px; }
  .callout.warn { border-color:rgba(254,140,44,0.4); }
  .callout.changed { border-color:rgba(255,77,61,0.4); }
  .tab { height:32px; padding:0 12px; border-radius:6px 6px 0 0; font-family:'JetBrains Mono', monospace; font-size:12px; color:${t.inkMuted}; display:inline-flex; align-items:center; border:1px solid transparent; border-bottom:none; }
  .tab.on { color:${t.ink}; background:${t.bg1}; border-color:${t.line}; }
  .progress { height:4px; background:${t.bg3}; border-radius:999px; overflow:hidden; }
  .progress > div { height:100%; background:${t.gold}; }
  .nav a { display:block; padding:6px 10px; border-radius:6px; font-size:14px; color:${t.inkSoft}; }
  .nav a.on { background:${t.bg3}; color:${t.ink}; }
  .nav .lvl { font-family:'JetBrains Mono', monospace; font-size:11px; letter-spacing:0.08em; text-transform:uppercase; color:${t.inkMuted}; margin:14px 10px 6px; }
  .toc a { display:block; font-size:13px; color:${t.inkMuted}; padding:4px 0 4px 12px; border-left:1px solid ${t.line}; }
  .toc a.on { color:${t.ink}; border-left-color:${t.gold}; }
  .swatch { border-radius:8px; border:1px solid ${t.line}; padding:10px; display:flex; flex-direction:column; gap:6px; }
  .swatch .c { height:44px; border-radius:6px; border:1px solid ${t.line}; }
  .swatch .n { font-family:'JetBrains Mono', monospace; font-size:11px; color:${t.inkSoft}; }
  .swatch .v { font-family:'JetBrains Mono', monospace; font-size:11px; color:${t.inkMuted}; }
  .focus { outline:2px solid ${t.gold}; outline-offset:2px; }
  .quiz-opt { display:flex; align-items:center; gap:12px; padding:12px 14px; border:1px solid ${t.line}; border-radius:8px; }
  .quiz-opt.right { border-color:${t.ok}; }
  .quiz-opt.wrong { border-color:${t.danger}; }
  .radio { width:18px; height:18px; border-radius:999px; border:2px solid ${t.lineStrong}; }
  .radio.on { border-color:${t.ok}; background:${t.ok}; box-shadow: inset 0 0 0 3px ${t.bg2}; }
`;

// sigil: 24-unit grid, cell 6, gap 2, margin 1, gold cell top-right. `mono` = hollow gold cell.
const sigil = (size, t, opts = {}) => {
  const ink = opts.ink ?? t.ink;
  const cells = [[1,1],[9,1],[1,9],[9,9],[17,9],[1,17],[9,17],[17,17]]
    .map(([x, y]) => `<rect x="${x}" y="${y}" width="6" height="6" rx="1"/>`).join('');
  const gold = opts.mono
    ? `<rect x="17.75" y="1.75" width="4.5" height="4.5" rx="0.75" fill="none" stroke="${ink}" stroke-width="1.5"/>`
    : `<rect x="17" y="1" width="6" height="6" rx="1" fill="${t.gold}"/>`;
  return `<svg class="sigil" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}" role="img" aria-label="CodeChup"><g fill="${ink}">${cells}</g>${gold}</svg>`;
};

// lockup: sigil + lowercase mono wordmark with signal-red caret + academy line
const lockup = (t, size = 28) => `
<div class="row" style="gap:10px; align-items:center;">
  ${sigil(size, t)}
  <div class="col" style="gap:2px; line-height:1;">
    <div class="mono" style="font-size:${Math.round(size * 0.5)}px; font-weight:500; letter-spacing:0.02em; color:${t.ink};">codechup<span class="caret" style="margin-left:2px;"></span></div>
    <div class="mono" style="font-size:${Math.round(size * 0.36)}px; letter-spacing:0.18em; text-transform:uppercase; color:${t.inkSoft};">claude code academy</div>
  </div>
</div>`;

const icon = {
  search: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>`,
  moon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>`,
  globe: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>`,
  copy: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></svg>`,
  check: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12l5 5L20 7"/></svg>`,
  arrow: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`,
  menu: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>`,
  clock: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`,
  flag: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><path d="M5 21V4h12l-2 4 2 4H5"/></svg>`,
  lab: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><path d="M9 3v7L4 19a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3l-5-9V3M8 3h8"/></svg>`,
  thumb: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><path d="M7 10v11H3V10zM7 10l4-7a2 2 0 0 1 3 2v4h5a2 2 0 0 1 2 2l-1 8a2 2 0 0 1-2 2H7"/></svg>`,
};

const wrap = (t, body, extra = '') => `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  ${fonts}
  <style>${css(t)}${extra}</style>
</helmet>
${body}
</x-dc>
</body>
</html>
`;

const termHero = (t) => `
<div class="term" style="box-shadow:0 24px 60px -24px rgba(0,0,0,0.6);">
  <div class="bar"><span class="dot"></span><span class="dot"></span><span class="dot"></span><span style="margin-left:8px;">~/my-app — claude</span></div>
  <div class="body"><span class="p">❯</span> <span class="u">claude</span>
<span class="d">Claude Code v2.1.263 · Fable 5.1 · effort high · plan mode off</span>

<span class="p">›</span> <span class="u">add a PreToolUse hook that blocks rm -rf outside /tmp</span>

<span class="d">⏺ Read .claude/settings.json</span>
<span class="d">⏺ Write .claude/hooks/guard-bash.mjs</span>
<span class="d">⏺ Edit .claude/settings.json  +9 −0</span>
<span class="ok">✓</span> Hook registered. Try it: <span class="g">rm -rf ./build</span> → <span class="r">blocked (exit 2)</span>

<span class="p">›</span> <span class="caret"></span></div>
</div>`;

const header = (t, width) => `
<header style="display:flex; align-items:center; justify-content:space-between; height:64px; padding:0 ${width > 800 ? 32 : 16}px; border-bottom:1px solid ${t.line}; background:${t.bg0};">
  ${lockup(t, width > 800 ? 28 : 24)}
  ${width > 800 ? `
  <nav class="row" style="gap:22px; font-size:14px;">
    <a href="#">Curriculum</a><a href="#">Playbook</a><a href="#">Changelog</a><a href="#" class="muted">Design</a>
  </nav>
  <div class="row" style="gap:10px;">
    <div class="row" style="gap:8px; height:36px; padding:0 12px; border:1px solid ${t.line}; border-radius:6px; color:${t.inkMuted}; font-size:13px; min-width:200px;">${icon.search}<span>Search lessons</span><span class="kbd" style="margin-left:auto;">Ctrl K</span></div>
    <div class="row" style="gap:6px; height:36px; padding:0 10px; border:1px solid ${t.line}; border-radius:6px; font-size:13px;">${icon.globe}<span class="mono">EN</span><span class="muted">/</span><span class="mono muted">TR</span></div>
    <div class="row" style="width:36px; height:36px; justify-content:center; border:1px solid ${t.line}; border-radius:6px;">${icon.moon}</div>
  </div>` : `
  <div class="row" style="gap:8px;">
    <div class="row" style="width:44px; height:44px; justify-content:center;">${icon.search}</div>
    <div class="row" style="width:44px; height:44px; justify-content:center;">${icon.menu}</div>
  </div>`}
</header>`;

const levels = [
  { n: 1, name: 'Beginner', cls: 'level-1', lessons: 18, hours: '4 h', blurb: 'Install, authenticate, prompt well, control permissions, give Claude memory.' },
  { n: 2, name: 'Intermediate', cls: 'level-2', lessons: 24, hours: '7 h', blurb: 'Pick the right model and effort, write skills and hooks, ship PRs.' },
  { n: 3, name: 'Advanced', cls: 'level-3', lessons: 28, hours: '10 h', blurb: 'Subagents, MCP servers, plugins, headless runs and CI automation.' },
  { n: 4, name: 'Master', cls: 'level-4', lessons: 22, hours: '9 h', blurb: 'Multi-agent workflows, autonomous loops, multi-session plans, artifacts.' },
];

const levelCard = (t, l, wide) => `
<div class="card col" style="padding:${wide ? 22 : 18}px; gap:12px;">
  <div class="row" style="justify-content:space-between;">
    <span class="badge ${l.cls}">Level ${l.n}</span>
    <span class="mono muted" style="font-size:12px;">${l.lessons} lessons · ${l.hours}</span>
  </div>
  <div class="h3">${l.name}</div>
  <div class="soft" style="font-size:14px;">${l.blurb}</div>
  <div class="row" style="justify-content:space-between; margin-top:auto;">
    <div class="progress" style="flex:1;"><div style="width:${[70, 25, 0, 0][l.n - 1]}%"></div></div>
    <span class="mono muted" style="font-size:12px;">${[70, 25, 0, 0][l.n - 1]}%</span>
  </div>
</div>`;

// ---- Main = landing 1280 ----------------------------------------------------------------------
const landing1280 = (t) => `
<div style="width:1280px; min-height:1950px; background:${t.bg0};">
  ${header(t, 1280)}
  <section style="display:grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap:48px; padding:80px 64px 64px; align-items:center;">
    <div class="col" style="gap:22px;">
      <span class="eyebrow">Zero to autonomous</span>
      <h1 class="h1" style="margin:0;">Learn Claude Code the way you will actually use it.</h1>
      <p class="soft" style="font-size:18px; margin:0; max-width:52ch;">A levelled, hands-on curriculum for developers. Every feature gets a lab you run in your own terminal, the mistakes people make with it, and sources verified against the current release.</p>
      <div class="row" style="gap:12px;">
        <a class="btn btn-primary" href="#">Start Level 1 ${icon.arrow}</a>
        <a class="btn btn-ghost" href="#">See the curriculum map</a>
      </div>
      <div class="row" style="gap:18px; font-size:13px;" >
        <span class="mono muted">verified on v2.1.263</span><span class="muted">·</span><span class="mono muted">EN / TR</span><span class="muted">·</span><span class="mono muted">free, MIT</span>
      </div>
    </div>
    ${termHero(t)}
  </section>

  <section style="padding:0 64px 64px;">
    <div class="row" style="justify-content:space-between; margin-bottom:20px;">
      <div class="col" style="gap:6px;"><span class="eyebrow">Four levels</span><div class="h2">Pick up where you are.</div></div>
      <span class="muted" style="font-size:14px;">Progress is saved in this browser. No account.</span>
    </div>
    <div class="grid" style="grid-template-columns: repeat(4, minmax(0, 1fr));">
      ${levels.map((l) => levelCard(t, l, true)).join('')}
    </div>
  </section>

  <section style="padding:0 64px 64px;">
    <div class="col" style="gap:6px; margin-bottom:20px;"><span class="eyebrow">Curriculum map</span><div class="h2">Every feature, one lesson each.</div></div>
    <div class="card" style="padding:24px; display:grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap:24px;">
      ${[
        ['Level 1', ['m01 Start', 'm02 Interact', 'm03 Memory', 'm04 Commands']],
        ['Level 2', ['m05 Models & effort', 'm06 Skills', 'm07 Hooks', 'm08 Git', 'm09 Prompting']],
        ['Level 3', ['m10 Subagents', 'm11 MCP', 'm12 Plugins', 'm13 Headless & CI', 'm14 Security', 'm15 Platforms']],
        ['Level 4', ['m16 Orchestration', 'm17 Autonomy', 'm18 Multi-session', 'm19 Visual', 'm20 Team', 'm21 Scale']],
      ].map(([h, ms]) => `<div class="col" style="gap:8px;"><div class="mono" style="font-size:12px; letter-spacing:0.08em; text-transform:uppercase; color:${t.inkMuted};">${h}</div>${ms.map((m) => `<a href="#" style="font-size:14px; color:${t.inkSoft};">${m}</a>`).join('')}</div>`).join('')}
    </div>
  </section>

  <section style="padding:0 64px 72px; display:grid; grid-template-columns: 1.2fr 1fr; gap:32px;">
    <div class="col" style="gap:14px;">
      <span class="eyebrow">What changed</span>
      <div class="h2">Kept current with the release.</div>
      ${[
        ['2.1.263', 'Per-session cache analytics in /cost', 'L2 · Models & effort'],
        ['2.1.258', 'Design canvas via /design', 'L4 · Visual'],
        ['2.1.240', 'claude plugin eval and /skill-doctor', 'L3 · Plugins'],
      ].map(([v, s, l]) => `<div class="row" style="justify-content:space-between; padding:12px 0; border-top:1px solid ${t.line};"><div class="row"><span class="chip">${v}</span><span style="font-size:15px;">${s}</span></div><span class="mono muted" style="font-size:12px;">${l}</span></div>`).join('')}
    </div>
    <div class="card col" style="padding:24px; gap:12px;">
      <span class="eyebrow">Playbook</span>
      <div class="h3">CLAUDE.md, rule, skill, hook, agent or MCP?</div>
      <p class="soft" style="margin:0; font-size:14px;">A decision tree for the question every team asks in week two, plus the anti-pattern catalogue and the glossary.</p>
      <a class="btn btn-soft" href="#" style="align-self:flex-start;">Open the playbook</a>
    </div>
  </section>

  <footer style="padding:24px 64px; border-top:1px solid ${t.line}; display:flex; justify-content:space-between; align-items:center;">
    <div class="row" style="gap:10px;">${sigil(18, t, { ink: t.inkMuted })}<span class="mono muted" style="font-size:12px;">codechup · claude code academy</span></div>
    <span class="mono muted" style="font-size:12px;">MIT · verified on Claude Code 2.1.263 · edit on GitHub</span>
  </footer>
</div>`;

// ---- landing 390 ------------------------------------------------------------------------------
const landing390 = (t) => `
<div style="width:390px; min-height:1950px; background:${t.bg0};">
  ${header(t, 390)}
  <section class="col" style="padding:40px 16px 32px; gap:18px;">
    <span class="eyebrow">Zero to autonomous</span>
    <h1 class="h1" style="margin:0; font-size:38px;">Learn Claude Code the way you will actually use it.</h1>
    <p class="soft" style="margin:0; font-size:16px;">Levelled, hands-on, verified against the current release. Labs run in your own terminal.</p>
    <a class="btn btn-primary" href="#" style="width:100%;">Start Level 1 ${icon.arrow}</a>
    <a class="btn btn-ghost" href="#" style="width:100%;">Curriculum map</a>
    <div class="term" style="font-size:12px;">
      <div class="bar"><span class="dot"></span><span class="dot"></span><span class="dot"></span><span style="margin-left:6px;">~/my-app</span></div>
      <div class="body"><span class="p">›</span> <span class="u">add a PreToolUse hook that
  blocks rm -rf outside /tmp</span>
<span class="d">⏺ Write .claude/hooks/guard-bash.mjs</span>
<span class="ok">✓</span> Hook registered.
<span class="p">›</span> <span class="caret"></span></div>
    </div>
  </section>
  <section class="col" style="padding:0 16px 32px; gap:12px;">
    <span class="eyebrow">Four levels</span>
    ${levels.map((l) => levelCard(t, l, false)).join('')}
  </section>
  <section class="col" style="padding:0 16px 40px; gap:10px;">
    <span class="eyebrow">What changed</span>
    ${[['2.1.263', 'Cache analytics in /cost'], ['2.1.258', '/design canvas'], ['2.1.240', 'plugin eval, /skill-doctor']].map(([v, s]) => `<div class="row" style="padding:10px 0; border-top:1px solid ${t.line};"><span class="chip">${v}</span><span style="font-size:14px;">${s}</span></div>`).join('')}
  </section>
  <footer style="padding:20px 16px; border-top:1px solid ${t.line};" class="col">
    <div class="row" style="gap:8px;">${sigil(16, t, { ink: t.inkMuted })}<span class="mono muted" style="font-size:11px;">codechup · claude code academy</span></div>
    <span class="mono muted" style="font-size:11px;">MIT · v2.1.263</span>
  </footer>
</div>`;

// ---- lesson page ------------------------------------------------------------------------------
const lessonBody = (t, wide) => `
<div class="col" style="gap:20px;">
  <div class="row" style="gap:8px; flex-wrap:wrap;">
    <span class="badge level-2">Level 2</span><span class="mono muted" style="font-size:12px;">m07 Hooks · lesson 2 of 7</span>
  </div>
  <h1 class="h2" style="margin:0; font-size:${wide ? 40 : 30}px;">Block dangerous commands with a PreToolUse hook</h1>
  <div class="row" style="gap:14px; flex-wrap:wrap; font-size:13px;" >
    <span class="row muted" style="gap:6px;">${icon.clock} 20 min</span>
    <span class="row muted" style="gap:6px;">${icon.flag} core</span>
    <span class="chip">hooks</span><span class="chip">security</span>
    <span class="mono muted">updated 2026-09-06 · verified v2.1.263</span>
  </div>
  <div class="hr"></div>

  <div class="callout"><div class="col" style="gap:4px;"><span class="eyebrow">You will</span><span style="font-size:15px;">Write a hook that inspects every Bash call before it runs, exits with code 2 to block, and returns a JSON reason Claude can read.</span></div></div>

  <div class="callout warn"><div class="col" style="gap:4px;"><span class="eyebrow">When not to use this</span><span class="soft" style="font-size:14px;">A permission deny rule in settings.json is simpler when you only need to block a fixed command pattern. Reach for a hook when the decision depends on arguments or repository state.</span></div></div>

  <div class="col" style="gap:8px;">
    <div class="row" style="gap:0;"><span class="tab on">macOS / Linux</span><span class="tab">Windows</span></div>
    <div class="term" style="border-radius:0 10px 10px 10px;">
      <div class="bar"><span>.claude/hooks/guard-bash.mjs</span><span class="row" style="margin-left:auto; gap:6px;">${icon.copy} copy</span></div>
      <div class="body"><span class="d">1</span>  <span class="u">const input = JSON.parse(await readStdin());</span>
<span class="d">2</span>  <span class="u">const cmd = input.tool_input?.command ?? '';</span>
<span class="d">3</span>  <span class="u">if (/rm\\s+-rf\\s+(?!\\/tmp)/.test(cmd)) {</span>   <span class="g">← anything outside /tmp</span>
<span class="d">4</span>  <span class="u">  console.log(JSON.stringify({ decision: 'block', reason: 'rm -rf outside /tmp' }));</span>
<span class="d">5</span>  <span class="u">  process.exit(2);</span>
<span class="d">6</span>  <span class="u">}</span></div>
    </div>
  </div>

  <div class="card col" style="padding:18px; gap:12px;">
    <div class="row" style="gap:8px;">${icon.lab}<span class="h3">Lab · run it against the sandbox repo</span></div>
    <div class="col" style="gap:8px; font-size:14px;">
      ${['git checkout lesson/m07-02-start', 'Register the hook in .claude/settings.json under PreToolUse', 'Ask Claude to delete the build folder and watch it get blocked'].map((s, i) => `<div class="row" style="gap:10px;"><span class="mono" style="width:22px; height:22px; border-radius:4px; background:${t.bg3}; display:inline-flex; align-items:center; justify-content:center; font-size:11px;">${i + 1}</span><span>${s}</span></div>`).join('')}
    </div>
    <div class="term" style="font-size:12px;"><div class="body"><span class="p">›</span> <span class="u">delete the build folder</span>
<span class="d">⏺ Bash(rm -rf ./build)</span>
<span class="r">✗ PreToolUse hook blocked: rm -rf outside /tmp</span>
<span class="d">I will use the project's clean script instead.</span>
<span class="d">⏺ Bash(npm run clean)</span></div></div>
    <div class="row" style="gap:8px; font-size:13px;" ><span class="row" style="gap:6px; color:${t.ok};">${icon.check} expected: exit 2, Claude picks an alternative</span></div>
  </div>

  <div class="callout changed"><div class="col" style="gap:4px;"><span class="eyebrow">Changed</span><span class="soft" style="font-size:14px;">Project-scope <span class="mono">defaultMode: bypassPermissions</span> is ignored since 2.1.x. Hooks still run in every mode.</span></div></div>

  <div class="col" style="gap:10px;">
    <div class="h3">Check yourself</div>
    <div class="card col" style="padding:16px; gap:8px;">
      <div style="font-size:15px;">Which exit code makes Claude abandon the tool call?</div>
      <div class="quiz-opt"><span class="radio"></span><span>0</span></div>
      <div class="quiz-opt right"><span class="radio on"></span><span>2</span><span class="mono" style="margin-left:auto; font-size:12px; color:${t.ok};">correct</span></div>
      <div class="quiz-opt"><span class="radio"></span><span>1</span></div>
    </div>
  </div>

  <div class="col" style="gap:10px;">
    <div class="h3">Sources</div>
    ${[
      ['official', 'Hooks reference', 'code.claude.com/docs/en/hooks', 'verified 2026-09-06'],
      ['video', 'Hooks in 12 minutes', 'youtube.com · 12:04 · Anthropic', 'verified 2026-09-06'],
      ['repo', 'guard-bash example', 'github.com/codechup/claude-code-lab', 'verified 2026-09-06'],
    ].map(([k, n, u, v]) => `<div class="row" style="gap:12px; padding:10px 0; border-top:1px solid ${t.line};"><span class="chip">${k}</span><div class="col" style="gap:2px;"><span style="font-size:14px;">${n}</span><span class="mono muted" style="font-size:12px;">${u}</span></div><span class="mono muted" style="margin-left:auto; font-size:11px;">${v}</span></div>`).join('')}
  </div>

  <div class="row" style="justify-content:space-between; padding-top:8px;">
    <span class="row muted" style="gap:8px; font-size:14px;">Was this helpful? <span class="row" style="gap:6px;">${icon.thumb}<span style="display:inline-block; transform:rotate(180deg);">${icon.thumb}</span></span></span>
    <a class="mono muted" style="font-size:12px;" href="#">Edit this page on GitHub</a>
  </div>
  <div class="hr"></div>
  <div class="row" style="justify-content:space-between;">
    <a class="btn btn-ghost" href="#">← Hook anatomy</a>
    <a class="btn btn-soft" href="#">Format on save ${icon.arrow}</a>
  </div>
  <div class="row" style="gap:10px;"><div class="progress" style="flex:1;"><div style="width:29%"></div></div><span class="mono muted" style="font-size:12px;">2 / 7 in m07</span></div>
</div>`;

const sidebar = (t) => `
<aside class="nav col" style="gap:0; width:240px; padding:20px 12px; border-right:1px solid ${t.line};">
  <div class="lvl">Level 1 · Beginner</div>
  <a href="#">m01 Start</a><a href="#">m02 Interact</a><a href="#">m03 Memory</a><a href="#">m04 Commands</a>
  <div class="lvl">Level 2 · Intermediate</div>
  <a href="#">m05 Models &amp; effort</a><a href="#">m06 Skills</a>
  <a href="#" style="color:${t.ink};">m07 Hooks</a>
  <div class="col" style="gap:2px; padding-left:10px;">
    <a href="#">Hook anatomy</a><a class="on" href="#">Block dangerous commands</a><a href="#">Format on save</a><a href="#">Notify when done</a>
  </div>
  <a href="#">m08 Git</a><a href="#">m09 Prompting</a>
  <div class="lvl">Level 3 · Advanced</div>
  <a href="#">m10 Subagents</a><a href="#">m11 MCP</a><a href="#" class="muted">…</a>
</aside>`;

const toc = (t) => `
<aside class="toc col" style="gap:2px; width:200px; padding:24px 0 0 20px;">
  <span class="eyebrow" style="margin-bottom:8px;">On this page</span>
  <a class="on" href="#">You will</a><a href="#">When not to use this</a><a href="#">The hook</a><a href="#">Lab</a><a href="#">Anti-patterns</a><a href="#">Check yourself</a><a href="#">Sources</a>
</aside>`;

const lesson1280 = (t) => `
<div style="width:1280px; min-height:1900px; background:${t.bg0};">
  ${header(t, 1280)}
  <div style="display:grid; grid-template-columns: 240px minmax(0, 1fr) 220px; gap:0; align-items:start;">
    ${sidebar(t)}
    <main style="padding:32px 48px; max-width:760px;">${lessonBody(t, true)}</main>
    ${toc(t)}
  </div>
</div>`;

const lesson390 = (t) => `
<div style="width:390px; min-height:2700px; background:${t.bg0};">
  ${header(t, 390)}
  <div class="row" style="height:40px; padding:0 16px; border-bottom:1px solid ${t.line}; gap:8px; font-size:12px;" ><span class="mono muted">L2</span><span class="muted">/</span><span class="mono muted">m07 Hooks</span><span class="muted">/</span><span class="mono">Block dangerous commands</span></div>
  <main style="padding:24px 16px 32px;">${lessonBody(t, false)}</main>
</div>`;

// ---- brand ------------------------------------------------------------------------------------
const brand = (t) => `
<div style="width:1200px; min-height:900px; background:${t.bg0}; padding:40px; display:grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap:32px;">
  <div class="card col" style="padding:24px; gap:18px;">
    <span class="eyebrow">Sigil</span>
    <div class="row" style="gap:28px; align-items:flex-end;">${[16, 24, 32, 64, 128].map((s) => sigil(s, t)).join('')}</div>
    <p class="soft" style="margin:0; font-size:13px; max-width:60ch;">Shared with the CodeChup family: 3×3 rounded cells on a 24-unit grid (cell 6, gap 2, margin 1), one gold cell top-right. Never rotated, recoloured or moved. Minimum 16 px.</p>
    <div class="row" style="gap:20px;">
      <div class="col" style="gap:6px; align-items:center;">${sigil(40, t, { mono: true })}<span class="mono muted" style="font-size:11px;">one-colour</span></div>
      <div class="col" style="gap:6px; align-items:center;"><span style="display:inline-block; background:${t.ink}; border-radius:8px; padding:6px;">${sigil(40, t, { ink: t.bg0 })}</span><span class="mono muted" style="font-size:11px;">on light</span></div>
      <div class="col" style="gap:6px; align-items:center;"><span style="display:inline-block; background:#0b0d12; border-radius:6px; padding:4px;">${sigil(24, T.dark)}</span><span class="mono muted" style="font-size:11px;">favicon 32</span></div>
    </div>
  </div>
  <div class="card col" style="padding:24px; gap:18px;">
    <span class="eyebrow">Lockups</span>
    ${lockup(t, 28)}
    ${lockup(t, 40)}
    <div class="row" style="gap:10px;">${sigil(20, t)}<span class="mono" style="font-size:14px;">codechup<span class="caret"></span> <span class="soft">/ claude code academy</span></span></div>
    <p class="soft" style="margin:0; font-size:13px; max-width:60ch;">Wordmark is lowercase JetBrains Mono with the CodeChup signal-red caret; the academy line is uppercase mono at 0.18em tracking. Clear space one cell module on all sides.</p>
  </div>
  <div class="card col" style="padding:24px; gap:14px;">
    <span class="eyebrow">Voice</span>
    <div class="h3">Quiet chrome, one loud decision.</div>
    <p class="soft" style="margin:0; font-size:14px;">Sentence case. Gold is spent only on the primary action, the sigil cell and progress. The red caret marks the prompt, never decoration. No emoji, no gradients, no marketing filler.</p>
  </div>
  <div class="card" style="padding:0; overflow:hidden;">
    <div style="padding:14px 18px; border-bottom:1px solid ${t.line};" class="eyebrow">Social card 1200×630</div>
    <div style="width:100%; aspect-ratio:1200/630; background:${t.bg1}; padding:36px; display:flex; flex-direction:column; justify-content:space-between; position:relative;">
      ${lockup(t, 40)}
      <div class="col" style="gap:8px;"><span class="eyebrow">Level 2 · Hooks</span><div class="h2" style="font-size:34px; max-width:20ch;">Block dangerous commands with a PreToolUse hook</div></div>
      <div style="position:absolute; left:0; right:0; bottom:0; height:8px; background:${t.gold};"></div>
    </div>
  </div>
</div>`;

// ---- tokens -----------------------------------------------------------------------------------
const swatches = (t, n = 99) => [
  ['bg-0', t.bg0, 'page ground'], ['bg-1', t.bg1, 'code, terminal'], ['bg-2', t.bg2, 'cards'], ['bg-3', t.bg3, 'raised, chips'],
  ['ink', t.ink, 'primary text'], ['ink-soft', t.inkSoft, 'secondary'], ['ink-muted', t.inkMuted, 'meta, placeholders'], ['line', t.line, 'hairlines'],
  ['accent', t.gold, 'primary CTA, sigil, progress'], ['accent-ink', t.goldInk, 'text on gold'], ['accent-text', t.accentText, 'gold as text, annotations'], ['caret', t.caret, 'prompt, changed'], ['prompt', t.prompt, 'shell prompt'],
  ['success', t.ok, 'passed'], ['warning', t.warn, 'when-not-to-use'], ['danger', t.danger, 'blocked, errors'], ['info', t.info, 'level 1'],
].slice(0, n).map(([n, v, r]) => `<div class="swatch"><div class="c" style="background:${v};"></div><span class="n">--color-${n}</span><span class="v">${v}</span><span class="v">${r}</span></div>`).join('');

const tokens = (t) => `
<div style="width:1200px; min-height:1250px; background:${t.bg0}; padding:40px;" class="col">
  <div class="row" style="justify-content:space-between; margin-bottom:8px;">
    <div class="col" style="gap:6px;"><span class="eyebrow">Tokens</span><div class="h2">Dark and light from one set.</div></div>
    <span class="mono muted" style="font-size:12px;">tokens.css → Tailwind @theme · no raw colours elsewhere</span>
  </div>
  <div style="display:grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap:24px;">
    <div class="card col" style="padding:20px; gap:12px; background:${T.dark.bg0}; color:${T.dark.ink};">
      <span class="mono" style="font-size:12px; color:${T.dark.inkMuted};">[data-theme=dark]</span>
      <div class="grid" style="grid-template-columns: repeat(4, minmax(0, 1fr)); gap:10px;">${swatches(T.dark)}</div>
    </div>
    <div class="card col" style="padding:20px; gap:12px; background:${T.light.bg0}; color:${T.light.ink};">
      <span class="mono" style="font-size:12px; color:${T.light.inkMuted};">[data-theme=light]</span>
      <div class="grid" style="grid-template-columns: repeat(4, minmax(0, 1fr)); gap:10px;">${swatches(T.light)}</div>
    </div>
  </div>
  <div style="display:grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap:24px; margin-top:24px;">
    <div class="card col" style="padding:20px; gap:10px;">
      <span class="eyebrow">Type</span>
      <div style="font-size:40px; font-weight:700; letter-spacing:-0.02em; line-height:1.05;">Inter 700 · 40</div>
      <div style="font-size:32px; font-weight:600; letter-spacing:-0.015em;">Inter 600 · 32</div>
      <div style="font-size:20px; font-weight:600;">Inter 600 · 20</div>
      <div style="font-size:16px;">Inter 400 · 16 body, line 1.5, measure 65ch</div>
      <div style="font-size:14px;" class="soft">Inter 400 · 14 secondary</div>
      <div class="mono" style="font-size:14px;">JetBrains Mono 400 · 14 code</div>
      <div class="mono" style="font-size:12px; letter-spacing:0.08em; text-transform:uppercase;" >Mono 500 · 12 eyebrow 0.08em</div>
      <div class="mono muted" style="font-size:11px;">Scale: 11 12 13 14 16 18 20 24 32 40 56</div>
    </div>
    <div class="card col" style="padding:20px; gap:10px;">
      <span class="eyebrow">Shape &amp; space</span>
      <div class="row" style="gap:10px;">${[4, 6, 10, 16].map((r) => `<div class="col" style="align-items:center; gap:4px;"><div style="width:44px; height:44px; border-radius:${r}px; background:${t.bg3}; border:1px solid ${t.lineStrong};"></div><span class="mono muted" style="font-size:11px;">r${r}</span></div>`).join('')}</div>
      <div class="row" style="gap:6px; align-items:flex-end;">${[4, 8, 12, 16, 24, 32, 48].map((s) => `<div class="col" style="align-items:center; gap:4px;"><div style="width:${s}px; height:${s}px; background:${t.gold}; opacity:0.8;"></div><span class="mono muted" style="font-size:10px;">${s}</span></div>`).join('')}</div>
      <p class="soft" style="margin:0; font-size:13px;">4-pt scale. Gutter 16 on phone, 32/64 on desktop. Sections 48–80 apart. Hairlines over boxes; 1 px inset top highlight on raised cards.</p>
    </div>
    <div class="card col" style="padding:20px; gap:10px;">
      <span class="eyebrow">Motion &amp; a11y</span>
      <div class="mono soft" style="font-size:13px;">--dur-1 120ms · --dur-2 200ms · --dur-3 320ms</div>
      <div class="mono soft" style="font-size:13px;">--ease-out cubic-bezier(.2,0,0,1)</div>
      <p class="soft" style="margin:0; font-size:13px;">Terminal caret blinks; nothing else animates by default. <span class="mono">prefers-reduced-motion</span> stops the caret. AA contrast on every text/surface pair, 44 px targets, visible dual focus ring:</p>
      <div class="row" style="gap:12px;"><span class="btn btn-primary focus">Focused</span><span class="btn btn-ghost">Rest</span></div>
    </div>
  </div>
</div>`;

// ---- components -------------------------------------------------------------------------------
const components = (t) => `
<div style="width:1200px; min-height:1550px; background:${t.bg0}; padding:40px;" class="col">
  <div class="col" style="gap:6px; margin-bottom:8px;"><span class="eyebrow">Components</span><div class="h2">The MDX vocabulary every lesson is built from.</div></div>
  <div style="display:grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap:24px;">
    <div class="card col" style="padding:20px; gap:14px;">
      <span class="eyebrow">Buttons &amp; chips</span>
      <div class="row" style="gap:10px; flex-wrap:wrap;"><span class="btn btn-primary">Primary</span><span class="btn btn-soft">Secondary</span><span class="btn btn-ghost">Ghost</span><span class="btn btn-primary" style="opacity:0.45;">Disabled</span></div>
      <div class="row" style="gap:8px; flex-wrap:wrap;"><span class="chip">hooks</span><span class="chip">mcp</span><span class="chip">2.1.263</span><span class="badge level-1">Level 1</span><span class="badge level-2">Level 2</span><span class="badge level-3">Level 3</span><span class="badge level-4">Level 4</span></div>
      <div class="row" style="gap:8px;"><span class="kbd">Shift</span><span class="muted">+</span><span class="kbd">Tab</span><span class="soft" style="font-size:13px;">toggle plan mode</span></div>
    </div>
    <div class="card col" style="padding:20px; gap:14px;">
      <span class="eyebrow">Callouts</span>
      <div class="callout"><div class="col" style="gap:2px;"><span class="eyebrow">Note</span><span style="font-size:14px;">Neutral information the reader should not skip.</span></div></div>
      <div class="callout warn"><div class="col" style="gap:2px;"><span class="eyebrow">When not to use</span><span style="font-size:14px;">The simpler tool that usually suffices.</span></div></div>
      <div class="callout changed"><div class="col" style="gap:2px;"><span class="eyebrow">Changed</span><span style="font-size:14px;">Old behaviour → new behaviour, one line, version.</span></div></div>
    </div>
    <div class="card col" style="padding:20px; gap:12px;">
      <span class="eyebrow">Code block · OS tabs · annotations</span>
      <div class="row" style="gap:0;"><span class="tab on">macOS</span><span class="tab">Linux</span><span class="tab">Windows</span></div>
      <div class="term" style="border-radius:0 10px 10px 10px;">
        <div class="bar"><span>install</span><span class="row" style="margin-left:auto; gap:6px;">${icon.copy} copy</span></div>
        <div class="body"><span class="d">1</span>  <span class="u">brew install --cask claude-code</span>   <span class="g">← native installer</span>
<span class="d">2</span>  <span class="u">claude --version</span>
<span class="d">3</span>  <span class="ok">2.1.263 (Claude Code)</span></div>
      </div>
      <p class="muted" style="margin:0; font-size:12px;">The tab choice is remembered site-wide (localStorage cc:os).</p>
    </div>
    <div class="card col" style="padding:20px; gap:12px;">
      <span class="eyebrow">Transcript · real session, simplified</span>
      <div class="term"><div class="body"><span class="p">›</span> <span class="u">why does the test in auth.test.ts fail?</span>
<span class="d">⏺ Read src/auth.test.ts</span>
<span class="d">⏺ Bash(npx vitest run auth)  exit 1</span>
<span class="d">⏺ Edit src/auth.ts  +2 −1</span>
<span class="ok">✓</span> Fixed: token expiry compared seconds to ms.</div></div>
      <p class="muted" style="margin:0; font-size:12px;">Roles: prompt (›), tool (⏺), result (✓/✗). Never fabricated; captured from the lab repo.</p>
    </div>
    <div class="card col" style="padding:20px; gap:12px;">
      <span class="eyebrow">Quiz</span>
      <div style="font-size:15px;">Which scope can set bypassPermissions?</div>
      <div class="quiz-opt wrong"><span class="radio" style="border-color:${t.danger};"></span><span>Project .claude/settings.json</span><span class="mono" style="margin-left:auto; font-size:12px; color:${t.danger};">ignored there</span></div>
      <div class="quiz-opt right"><span class="radio on"></span><span>User or managed settings</span><span class="mono" style="margin-left:auto; font-size:12px; color:${t.ok};">correct</span></div>
      <div class="quiz-opt"><span class="radio"></span><span>Any scope</span></div>
    </div>
    <div class="card col" style="padding:20px; gap:12px;">
      <span class="eyebrow">Decision tree · inline SVG</span>
      <svg width="100%" viewBox="0 0 520 190" font-family="Inter, sans-serif" font-size="12">
        <g fill="${t.bg3}" stroke="${t.lineStrong}"><rect x="10" y="70" width="150" height="44" rx="6"/><rect x="220" y="20" width="130" height="40" rx="6"/><rect x="220" y="120" width="130" height="40" rx="6"/><rect x="390" y="120" width="120" height="40" rx="6"/></g>
        <g fill="${t.ink}"><text x="85" y="88" text-anchor="middle">Should it run</text><text x="85" y="104" text-anchor="middle">every time?</text><text x="285" y="44" text-anchor="middle">Write a hook</text><text x="285" y="144" text-anchor="middle">Needs tools?</text><text x="450" y="144" text-anchor="middle">Skill</text></g>
        <g stroke="${t.inkMuted}" fill="none" stroke-width="1.5"><path d="M160 84 L220 40"/><path d="M160 100 L220 140"/><path d="M350 140 L390 140"/></g>
        <g fill="${t.gold}" font-family="JetBrains Mono, monospace" font-size="11"><text x="176" y="52">yes</text><text x="176" y="132">no</text><text x="362" y="132">yes</text></g>
      </svg>
    </div>
    <div class="card col" style="padding:20px; gap:12px;">
      <span class="eyebrow">Lesson meta · sources · feedback</span>
      <div class="row" style="gap:14px; font-size:13px; flex-wrap:wrap;"><span class="row muted" style="gap:6px;">${icon.clock} 20 min</span><span class="row muted" style="gap:6px;">${icon.flag} core</span><span class="mono muted">verified v2.1.263</span></div>
      <div class="row" style="gap:12px; padding:10px 0; border-top:1px solid ${t.line};"><span class="chip">official</span><div class="col" style="gap:2px;"><span style="font-size:14px;">Hooks reference</span><span class="mono muted" style="font-size:12px;">code.claude.com/docs/en/hooks</span></div><span class="mono muted" style="margin-left:auto; font-size:11px;">verified 2026-09-06</span></div>
      <div class="row" style="gap:12px; padding:10px 0; border-top:1px solid ${t.line};"><span class="chip">video</span><div class="col" style="gap:2px;"><span style="font-size:14px;">Hooks in 12 minutes</span><span class="mono muted" style="font-size:12px;">youtube.com · 12:04 · Anthropic</span></div><span class="mono muted" style="margin-left:auto; font-size:11px;">verified 2026-09-06</span></div>
      <div class="row muted" style="gap:8px; font-size:14px;">Was this helpful? ${icon.thumb}<span style="display:inline-block; transform:rotate(180deg);">${icon.thumb}</span></div>
    </div>
    <div class="card col" style="padding:20px; gap:12px;">
      <span class="eyebrow">Search · language · theme</span>
      <div class="row" style="gap:8px; height:44px; padding:0 14px; border:1px solid ${t.lineStrong}; border-radius:6px; font-size:14px;">${icon.search}<span>pretooluse</span><span class="caret"></span><span class="kbd" style="margin-left:auto;">Esc</span></div>
      <div class="col" style="gap:4px; font-size:14px;"><div class="row" style="justify-content:space-between; padding:8px 10px; background:${t.bg3}; border-radius:6px;"><span>Block dangerous commands with a PreToolUse hook</span><span class="mono muted" style="font-size:11px;">L2 · m07</span></div><div class="row" style="justify-content:space-between; padding:8px 10px;"><span class="soft">Hook anatomy</span><span class="mono muted" style="font-size:11px;">L2 · m07</span></div></div>
      <div class="row" style="gap:10px;"><div class="row" style="gap:6px; height:36px; padding:0 10px; border:1px solid ${t.line}; border-radius:6px; font-size:13px;">${icon.globe}<span class="mono">EN</span><span class="muted">/</span><span class="mono muted">TR</span></div><div class="row" style="width:36px; height:36px; justify-content:center; border:1px solid ${t.line}; border-radius:6px;">${icon.moon}</div><span class="muted" style="font-size:12px;">TR twin missing → “Türkçesi hazırlanıyor”</span></div>
    </div>
  </div>
</div>`;


const lum = (hex) => { const c = hex.replace('#',''); const [r,g,b] = [0,2,4].map((i) => parseInt(c.slice(i,i+2),16)/255).map((v) => v <= 0.03928 ? v/12.92 : ((v+0.055)/1.055) ** 2.4); return 0.2126*r+0.7152*g+0.0722*b; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return ((x + 0.05) / (y + 0.05)).toFixed(1); };
const pairs = (t) => [['ink on bg-0', t.ink, t.bg0], ['ink-soft on bg-2', t.inkSoft, t.bg2], ['ink-muted on bg-2', t.inkMuted, t.bg2], ['accent-ink on accent', t.goldInk, t.gold], ['accent-text on bg-1', t.accentText, t.bg1], ['caret on bg-0', t.caret, t.bg0]].map(([p, a, b]) => [p, ratio(a, b)]);

// ---- /design page -----------------------------------------------------------------------------
const designPage = (t) => `
<div style="width:1280px; min-height:1750px; background:${t.bg0};">
  ${header(t, 1280)}
  <div style="display:grid; grid-template-columns: 220px minmax(0, 1fr); gap:0;">
    <aside class="toc col" style="gap:2px; padding:32px 0 0 32px; position:sticky; top:0;">
      <span class="eyebrow" style="margin-bottom:8px;">/design</span>
      ${['brand', 'tokens', 'type', 'space', 'motion', 'components', 'transcript', 'a11y', 'canvas', 'changelog'].map((s, i) => `<a href="#" class="${i === 1 ? 'on' : ''}">${s}</a>`).join('')}
    </aside>
    <main class="col" style="padding:32px 48px 64px; gap:32px; max-width:900px;">
      <div class="col" style="gap:10px;">
        ${lockup(t, 32)}
        <h1 class="h1" style="margin:12px 0 0; font-size:44px;">Design</h1>
        <div class="mono muted" style="font-size:12px;">design version 2026.09.1 · living page · EN only</div>
        <p class="soft" style="margin:0; font-size:18px; max-width:56ch; font-style:italic;">If a screen disagrees with this page, the screen is wrong.</p>
      </div>
      <div class="col" style="gap:12px;">
        <span class="eyebrow">Principles</span>
        <div class="grid" style="grid-template-columns: repeat(3, minmax(0, 1fr));">
          ${[['Quiet chrome, one loud decision', 'Gold only on the primary action, sigil and progress.'], ['Terminal is the hero', 'Real transcripts, mono numerals, the red caret as prompt.'], ['Phone first, AA always', '390 px perfect, 44 px targets, dual focus ring, reduced motion.']].map(([h, p]) => `<div class="card col" style="padding:16px; gap:6px;"><div class="h3" style="font-size:16px;">${h}</div><div class="soft" style="font-size:13px;">${p}</div></div>`).join('')}
        </div>
      </div>
      <div class="col" style="gap:12px;">
        <span class="eyebrow">Tokens · live from tokens.css</span>
        <div class="grid" style="grid-template-columns: repeat(4, minmax(0, 1fr)); gap:10px;">${swatches(t, 8)}</div>
        <div class="card" style="padding:0; overflow:hidden;">
          <div class="row" style="padding:10px 14px; border-bottom:1px solid ${t.line}; font-size:12px;" ><span class="mono muted" style="width:220px;">pair</span><span class="mono muted" style="width:90px;">ratio</span><span class="mono muted">result</span></div>
          ${pairs(t).map(([p, r]) => `<div class="row" style="padding:10px 14px; border-top:1px solid ${t.line}; font-size:13px;"><span class="mono" style="width:220px;">${p}</span><span class="mono" style="width:90px;">${r}:1</span><span class="badge ${Number(r) >= 4.5 ? 'level-2' : 'level-3'}">${Number(r) >= 4.5 ? 'AA pass' : 'AA large only'}</span></div>`).join('')}
        </div>
      </div>
      <div class="col" style="gap:12px;">
        <span class="eyebrow">Components · every state</span>
        <div class="row" style="gap:10px; flex-wrap:wrap;"><span class="btn btn-primary">Rest</span><span class="btn btn-primary" style="filter:brightness(1.06);">Hover</span><span class="btn btn-primary focus">Focus</span><span class="btn btn-primary" style="opacity:0.45;">Disabled</span><span class="btn btn-primary"><span class="mono">…</span> Loading</span></div>
      </div>
      <div class="col" style="gap:12px;">
        <span class="eyebrow">Canvas</span>
        <div class="card row" style="padding:16px; gap:16px;">
          <div style="width:160px; height:100px; border-radius:6px; background:${t.bg1}; border:1px solid ${t.line}; display:grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap:4px; padding:8px;">${Array.from({ length: 6 }).map((_, i) => `<div style="background:${i === 2 ? t.gold : t.bg3}; border-radius:3px;"></div>`).join('')}</div>
          <div class="col" style="gap:4px;"><span style="font-size:15px;">Approved design canvas · 2026-09</span><span class="soft" style="font-size:13px;">Eight artboards: brand, tokens, landing 1280/390, lesson 1280/390, components, this page. Prompts logged in docs/design/CANVAS.md.</span><a href="#" class="mono" style="font-size:12px; color:${t.gold};">open the canvas →</a></div>
        </div>
      </div>
      <div class="col" style="gap:8px;">
        <span class="eyebrow">Changelog</span>
        <div class="row" style="gap:12px; padding:10px 0; border-top:1px solid ${t.line}; font-size:14px;"><span class="chip">2026.09.1</span><span>Initial token set, brand lockups, landing, lesson page, components.</span></div>
      </div>
    </main>
  </div>
</div>`;

// ---- emit -------------------------------------------------------------------------------------
const files = {
  'Main.dc.html': landing1280(T.dark),
  'Landing390.dc.html': landing390(T.dark),
  'Lesson1280.dc.html': lesson1280(T.dark),
  'Lesson390.dc.html': lesson390(T.dark),
  'LessonLight.dc.html': lesson1280(T.light),
  'Brand.dc.html': brand(T.dark),
  'Tokens.dc.html': tokens(T.dark),
  'Components.dc.html': components(T.dark),
  'DesignPage.dc.html': designPage(T.dark),
};
for (const [name, body] of Object.entries(files)) writeFileSync(join(out, name), wrap(name.startsWith('LessonLight') ? T.light : T.dark, body));

const canvas = {
  artboards: [
    { file: 'Brand.dc.html', title: 'Brand', x: 0, y: 0, w: 1200, h: 900 },
    { file: 'Tokens.dc.html', title: 'Tokens', x: 1300, y: 0, w: 1200, h: 1250 },
    { file: 'Main.dc.html', title: 'Landing 1280', x: 0, y: 1400, w: 1280, h: 1950 },
    { file: 'Landing390.dc.html', title: 'Landing 390', x: 1380, y: 1400, w: 390, h: 1950 },
    { file: 'Lesson1280.dc.html', title: 'Lesson 1280', x: 0, y: 3500, w: 1280, h: 1900 },
    { file: 'Lesson390.dc.html', title: 'Lesson 390', x: 1380, y: 3500, w: 390, h: 2700 },
    { file: 'LessonLight.dc.html', title: 'Lesson 1280 · light theme', x: 1870, y: 3500, w: 1280, h: 1900 },
    { file: 'Components.dc.html', title: 'Components', x: 0, y: 6350, w: 1200, h: 1550 },
    { file: 'DesignPage.dc.html', title: '/design page', x: 1300, y: 6350, w: 1280, h: 1750 },
  ],
  annotations: [
    { id: 'brief', x: 0, y: -160, w: 520, text: 'CodeChup Claude Code Academy — P00 canvas.\nDecisions D029–D032: dark-leaning terminal aesthetic, dark+light, Inter + JetBrains Mono, CodeChup sub-brand.\nApprove here or comment; tokens.css is derived from the Tokens artboard (P05).' },
    { id: 'theme-note', x: 1870, y: 3360, w: 360, text: 'Light theme: same tokens, swapped values. Toggle follows system preference (D030).' },
  ],
  launch: { view: 'canvas' },
};
writeFileSync(join(out, 'canvas.json'), JSON.stringify(canvas, null, 2));
console.log('wrote', Object.keys(files).length, 'artboards to', out);
