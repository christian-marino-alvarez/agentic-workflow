import { devices } from '@playwright/test';
import type { PlaywrightTestConfig } from '@serenity-js/playwright-test';

const config: PlaywrightTestConfig = {
  testDir: './',
  testMatch: [
    '**/test/e2e/**/*.test.ts',
    'test/e2e/**/*.test.ts'
  ],
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // VS Code tests should usually be sequential
  reporter: [
    ['line'],
    ['@serenity-js/playwright-test', {
      specDirectory: './test/e2e'
    }],
  ],
  use: {
    trace: 'on-first-retry',
    crew: [
      '@serenity-js/console-reporter',
    ],
  },
};

export default config;
