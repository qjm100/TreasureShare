import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './specs',
  timeout: 60000,
  retries: 1,
  workers: 3,
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'off',
    navigationTimeout: 45000,
  },
  reporter: [
    ['list'],
    ['json', { outputFile: 'test-results.json' }],
  ],
});
