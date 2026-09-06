// @ts-check
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      '.astro/**',
      'node_modules/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
      'public/**',
      // Owned by concurrently-running plans (P02/P03/P00) — not this plan's
      // scope, and actively being written by other sessions.
      'tools/**',
      'plans/**',
      'research/**',
      'docs/**',
      'DECISIONS.md',
    ],
  },
  ...tseslint.configs.recommended,
  ...astro.configs['flat/recommended'],
  {
    rules: {
      // Astro components commonly declare props/types that aren't "used" in
      // the eslint sense (used only in the frontmatter <-> template bridge).
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
);
