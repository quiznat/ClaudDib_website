import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  timeout: 90_000,
  retries: process.env.CI ? 1 : 0,
  outputDir: `/tmp/clauddib-playwright-results-${process.pid}`, 
  reporter: [['list'], ['json', { outputFile: 'state/website-feedback/playwright-report.json' }]],
  use: {
    baseURL: 'http://127.0.0.1:4174',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'python3 -m http.server 4174 --bind 127.0.0.1 > /dev/null 2>&1',
    port: 4174,
    reuseExistingServer: true,
    cwd: '.',
  },
});
