import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: [
    'test/e2e/**/*.spec.ts',
    'src/extension/modules/**/test/e2e/**/*.spec.ts',
  ],
  timeout: 60_000,
  retries: 0,
  workers: 1,
  reporter: 'list',
  use: {
    trace: 'on-first-retry',
  },
  // Allow extra time for Electron cleanup (sidecar process)
  globalTimeout: 300_000,
});
