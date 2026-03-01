import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const SITE_ROOT = path.resolve(__dirname, '..');

function walkHtmlFiles(root: string, maxDepth = 3): string[] {
  const found: string[] = [];

  function visit(current: string, depth: number) {
    if (depth > maxDepth) return;

    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        visit(fullPath, depth + 1);
        continue;
      }

      if (!entry.isFile() || !entry.name.endsWith('.html')) continue;
      const rel = path.relative(SITE_ROOT, fullPath).replaceAll(path.sep, '/');
      found.push(`/${rel}`);
    }
  }

  visit(root, 0);
  return [...new Set(found)].sort();
}

function isIgnorableConsoleError(message: string): boolean {
  return message.includes('fonts.googleapis.com') || message.includes('fonts.gstatic.com');
}

test.describe('site runtime surface guard', () => {
  test('all html routes under maxdepth 3 load without runtime errors', async ({ browser }) => {
    const htmlRoutes = walkHtmlFiles(SITE_ROOT, 3);
    expect(htmlRoutes.length).toBeGreaterThan(20);

    for (const route of htmlRoutes) {
      const page = await browser.newPage();
      const errors: string[] = [];

      page.on('pageerror', err => errors.push(err.message));
      page.on('console', msg => {
        if (msg.type() !== 'error') return;
        const text = msg.text();
        if (isIgnorableConsoleError(text)) return;
        errors.push(text);
      });

      const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
      expect(response?.status() ?? 0, `${route} should return < 400`).toBeLessThan(400);

      await page.waitForTimeout(250);
      expect(errors, `${route} runtime errors:\n${errors.join('\n')}`).toEqual([]);

      await page.close();
    }
  });
});
