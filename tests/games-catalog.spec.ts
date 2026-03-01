import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const SITE_ROOT = path.resolve(__dirname, '..');
const GAMES_ROOT = path.join(SITE_ROOT, 'games');

function listGameRoutesFromFs(): string[] {
  const entries = fs.readdirSync(GAMES_ROOT, { withFileTypes: true });

  return entries
    .filter(entry => entry.isDirectory())
    .map(entry => `/games/${entry.name}/index.html`)
    .filter(route => fs.existsSync(path.join(SITE_ROOT, route.slice(1))))
    .sort();
}

function isIgnorableConsoleError(message: string): boolean {
  return message.includes('fonts.googleapis.com') || message.includes('fonts.gstatic.com');
}

test.describe('games catalog coverage', () => {
  test('games index links every filesystem-backed game route', async ({ page }) => {
    const fsRoutes = listGameRoutesFromFs();
    expect(fsRoutes.length).toBeGreaterThanOrEqual(2);

    await page.goto('/games/index.html');

    const linkedRoutes = await page.locator('a[href]').evaluateAll(anchors => {
      const routes = new Set<string>();

      for (const anchor of anchors as HTMLAnchorElement[]) {
        const href = (anchor.getAttribute('href') || '').trim();
        if (!href) continue;

        try {
          const url = new URL(href, 'http://127.0.0.1');
          const pathname = url.pathname;
          if (pathname.startsWith('/games/') && pathname.endsWith('/index.html')) {
            routes.add(pathname);
          }
        } catch {
          // ignore malformed hrefs
        }
      }

      return [...routes].sort();
    });

    expect(linkedRoutes).toEqual(fsRoutes);
  });

  test('all filesystem-backed game routes load without runtime errors', async ({ browser }) => {
    const fsRoutes = listGameRoutesFromFs();

    for (const route of fsRoutes) {
      const page = await browser.newPage();
      const errors: string[] = [];

      page.on('pageerror', e => errors.push(e.message));
      page.on('console', msg => {
        if (msg.type() !== 'error') return;
        const text = msg.text();
        if (isIgnorableConsoleError(text)) return;
        errors.push(text);
      });

      const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
      expect(response?.status() ?? 0, `${route} should return < 400`).toBeLessThan(400);

      await expect(
        page.locator('canvas, #gameCanvas, #gameGrid, .game-grid').first(),
        `${route} did not render an expected game surface`,
      ).toBeVisible();

      expect(errors, `Console/runtime errors on ${route}:\n${errors.join('\n')}`).toEqual([]);
      await page.close();
    }
  });
});
