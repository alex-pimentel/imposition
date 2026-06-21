import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 120000,
  use: {
    headless: true,
    trace: 'on-first-retry',
  },
  reporter: 'list',
});
