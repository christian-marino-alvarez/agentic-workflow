import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Exclude Playwright E2E specs (*.spec.ts) from Vitest runs
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/*.spec.ts',
    ],
  },
});
