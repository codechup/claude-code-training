import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import contentGates from './src/integrations/content-gates.ts';

// https://astro.build/config
export default defineConfig({
  site: 'https://cc.codechup.com',
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
    inlineStylesheets: 'never',
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
