import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tools/**/*.test.ts', 'scripts/**/*.test.ts', 'src/**/*.test.ts'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['tools/**/*.ts', 'scripts/**/*.ts', 'src/lib/**/*.ts'],
      exclude: ['**/*.test.ts', '**/*.d.ts'],
    },
  },
});
