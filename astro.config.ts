import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { satteri } from '@astrojs/markdown-satteri';
import contentGates from './src/integrations/content-gates.ts';
import proseHastPlugin from './src/lib/prose-hast.ts';

// https://astro.build/config
export default defineConfig({
  site: 'https://cc.codechup.com',
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
    /*
     * Every page carries its CSS inline (~15 kB gzipped) instead of linking
     * it. Astro chunks scoped styles per component, so `'never'` put EIGHT
     * render-blocking stylesheets in the head of a lesson page — around
     * 450 ms of serialised round trips on Lighthouse's throttled link, and
     * enough to hold the Turkish lesson route at 0.88 against a 0.9 budget.
     * Inlining takes it to 0.91 and costs nothing at parse time.
     *
     * CSP-safe: the deploy policy is `style-src 'self' 'unsafe-inline'`
     * (docs/release/M3-release.md), which the level chips' `style=`
     * attributes already require. The no-inline rule this repo enforces is
     * about `<script>` bodies (scripts/check-no-inline-script.mjs), which
     * still holds — nothing below emits one.
     */
    inlineStylesheets: 'always',
  },
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'tr'],
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: false,
    },
  },
  integrations: [
    mdx(),
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en-US',
          tr: 'tr-TR',
        },
      },
      filter: (page) => {
        const path = new URL(page).pathname;
        if (path === '/' || path === '/404/') return false;
        if (path.startsWith('/og/')) return false;
        return true;
      },
    }),
    contentGates(),
  ],
  vite: {
    plugins: [tailwindcss()],
    // Never inline hoisted <script> bodies into HTML: the origin serves a `script-src 'self'` CSP
    // (no nonces/hashes), so every script must be an external same-origin file.
    build: { assetsInlineLimit: 0 },
  },
  markdown: {
    /*
     * Sätteri is Astro 7's default Markdown processor; naming it explicitly is
     * how a hast plugin joins the pipeline (`markdown.rehypePlugins` is the
     * legacy unified path and would pull in a second processor). `cc-prose`
     * makes two repairs that need the document tree rather than a stylesheet:
     * a focusable scroll container around every table, and a no-break class on
     * short inline code. `@astrojs/mdx` extends this config, so MDX bodies get
     * both too. See src/lib/prose-hast.ts.
     */
    processor: satteri({ hastPlugins: [proseHastPlugin] }),
    shikiConfig: {
      themes: {
        light: 'github-light-high-contrast',
        dark: 'github-dark-dimmed',
      },
      defaultColor: false,
    },
  },
  image: {
    domains: ['i.ytimg.com'],
  },
});
