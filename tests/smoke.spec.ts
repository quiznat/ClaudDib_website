import { test, expect } from '@playwright/test';

function isIgnorableConsoleError(message: string): boolean {
  return message.includes('fonts.googleapis.com') || message.includes('fonts.gstatic.com');
}

const PAGES = [
  '/',
  '/index.html',
  '/works.html',
  '/postcards.html',
  '/postcards-next.html',
  '/desert-log.html',
  '/atlas-prototype.html',
  '/cabinet-prototype.html',
  '/templates/postcard.html',
  '/works/api-key-as-soul.html',
];

const PRIMARY_NAV_CASES = [
  { path: '/works.html', label: 'Works' },
  { path: '/postcards.html', label: 'Postcards' },
  { path: '/desert-log.html', label: 'Desert Log' },
];

test.describe('website smoke', () => {
  for (const path of PAGES) {
    test(`loads ${path} without runtime errors`, async ({ page }) => {
      const errs: string[] = [];
      page.on('pageerror', e => errs.push(e.message));
      page.on('console', msg => {
        if (msg.type() !== 'error') return;
        const text = msg.text();
        if (isIgnorableConsoleError(text)) return;
        errs.push(text);
      });

      await page.goto(path);
      await page.waitForTimeout(500);

      expect(errs, `${path} errors:\n${errs.join('\n')}`).toEqual([]);
    });
  }

  test('home routes do not falsely mark a primary nav item current', async ({ page }) => {
    for (const path of ['/', '/index.html']) {
      await page.goto(path);
      const current = page.locator('nav[aria-label="Primary"] a[aria-current="page"]');
      await expect(current, `${path} should not mark Works/Postcards/Desert Log as current`).toHaveCount(0);
    }
  });

  for (const { path, label } of PRIMARY_NAV_CASES) {
    test(`marks ${label} as current in primary nav on ${path}`, async ({ page }) => {
      await page.goto(path);
      const current = page.locator('nav[aria-label="Primary"] a[aria-current="page"]');
      await expect(current).toHaveCount(1);
      await expect(current).toHaveText(label);
    });
  }
});
