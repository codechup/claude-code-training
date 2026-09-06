import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // `.claude/**/*.test.mjs` collects this repo's own dogfooded Claude Code
    // setup (P11's hook tests) so they run in CI alongside everything else —
    // P11's Handoff notes flagged that they were manual-only until whoever
    // owned this file added them.
    include: [
      'tools/**/*.test.ts',
      'scripts/**/*.test.ts',
      'src/**/*.test.ts',
      '.claude/**/*.test.mjs',
    ],
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['tools/**/*.ts', 'scripts/**/*.ts', 'src/lib/**/*.ts'],
      exclude: ['**/*.test.ts', '**/*.d.ts'],
    },
  },
});
