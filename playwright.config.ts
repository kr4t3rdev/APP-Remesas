import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  retries: 0,
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:4173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: true,
  },
  webServer: {
    command: 'pnpm build:web && python3 -m http.server 4173 --directory dist --bind localhost',
    url: process.env.E2E_BASE_URL || 'http://localhost:4173',
    reuseExistingServer: true,
    timeout: 240_000,
  },
  reporter: [['list']],
});
