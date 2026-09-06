# CodeChup Claude Code Academy

A free, bilingual (English / Türkçe) course that teaches [Claude
Code](https://claude.com/product/claude-code) from zero to expert — for
developers who are new to AI-assisted coding and for experienced users who
want depth. Every feature (hooks, skills, subagents, MCP, plugins,
headless/CI, workflows, memory, plan mode, the Agent SDK, and more) gets a
hands-on lesson with a lab, anti-patterns, a quiz, and verified sources.

Live at [cc.codechup.com](https://cc.codechup.com) (EN default, TR
available). Built by [CodeChup](https://codechup.com).

---

## Türkçe

Claude Code'u sıfırdan uzmanlığa taşıyan, ücretsiz ve iki dilli (İngilizce /
Türkçe) bir kurs. Hem yapay zeka destekli kodlamaya yeni başlayanlar hem de
derinlemesine bilgi arayan deneyimli kullanıcılar için hazırlandı. Hook'lar,
skill'ler, subagent'lar, MCP, eklentiler, headless/CI kullanımı, workflow'lar,
bellek yönetimi, plan modu, Agent SDK ve daha fazlası; her özellik uygulamalı
bir ders, bir laboratuvar, anti-pattern örnekleri, bir quiz ve doğrulanmış
kaynaklarla anlatılır.

[cc.codechup.com](https://cc.codechup.com) adresinde yayında (varsayılan
dil İngilizce, Türkçe seçeneği mevcuttur). [CodeChup](https://codechup.com)
tarafından geliştirilmektedir.

---

## Development

Requires Node **24** and npm **11** (see `.nvmrc`).

```bash
npm install       # install dependencies
npm run dev       # start the dev server
npm run build     # production build (runs the content gate, then pagefind)
npm run preview   # preview the production build
npm run typecheck # astro check
npm run lint      # eslint + prettier --check + inline-script guard
npm run format    # prettier --write
npm test          # vitest (unit tests, with coverage)
npm run test:e2e  # playwright end-to-end + accessibility tests
npm run gate      # run the content gate (EN/TR parity, schema, fences) alone
npm run plan       # the internal multi-session plan CLI (tools/plan)
```

## License

MIT — see [LICENSE](./LICENSE). Content (lessons, docs) is licensed MIT as
well.
