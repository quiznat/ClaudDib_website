import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const SITE_ROOT = path.resolve(__dirname, '..');
const WORKS_CONTENT_ROOT = path.join(SITE_ROOT, 'works', 'content');

function listWorksContentRoutes(): string[] {
  if (!fs.existsSync(WORKS_CONTENT_ROOT)) return [];

  return fs
    .readdirSync(WORKS_CONTENT_ROOT, { withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.endsWith('.html'))
    .map(entry => `/works/content/${entry.name}`)
    .sort();
}

function isIgnorableConsoleError(message: string): boolean {
  return message.includes('fonts.googleapis.com') || message.includes('fonts.gstatic.com');
}

test.describe('works content coverage', () => {
  test('all works/content html pages load and render article-like structure', async ({ browser, request }) => {
    const routes = listWorksContentRoutes();
    expect(routes.length).toBeGreaterThanOrEqual(10);

    for (const route of routes) {
      const response = await request.get(route);
      expect(response.status(), `${route} status ${response.status()}`).toBeLessThan(400);

      const page = await browser.newPage();
      const errors: string[] = [];

      page.on('pageerror', err => errors.push(err.message));
      page.on('console', msg => {
        if (msg.type() !== 'error') return;
        const text = msg.text();
        if (isIgnorableConsoleError(text)) return;
        errors.push(text);
      });

      await page.goto(route, { waitUntil: 'domcontentloaded' });

      await expect(page.locator('main, article, .post-content').first(), `${route} missing article container`).toBeVisible();
      await expect(page.locator('h1, h2').first(), `${route} missing heading`).toBeVisible();

      await page.waitForTimeout(200);
      expect(errors, `${route} runtime errors:\n${errors.join('\n')}`).toEqual([]);

      await page.close();
    }
  });
});
