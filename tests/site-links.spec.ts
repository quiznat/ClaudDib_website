import { test, expect } from '@playwright/test';

const ROOT_PAGES = [
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

test.describe('site link integrity', () => {
  test('root pages load with no 4xx/5xx', async ({ request }) => {
    for (const path of ROOT_PAGES) {
      const res = await request.get(path);
      expect(res.status(), `${path} status ${res.status()}`).toBeLessThan(400);
    }
  });

  test('navigation links are reachable from homepage', async ({ page, request }) => {
    await page.goto('/');

    const hrefs = await page.$$eval('a[href]', as =>
      as
        .map(a => (a.getAttribute('href') || '').trim())
        .filter(h => h && !h.startsWith('#') && !h.startsWith('mailto:') && !h.startsWith('tel:'))
    );

    const unique = Array.from(new Set(hrefs))
      .filter(h => !h.startsWith('http://') && !h.startsWith('https://'))
      .map(h => (h.startsWith('/') ? h : `/${h}`));

    for (const href of unique) {
      const res = await request.get(href);
      expect(res.status(), `${href} status ${res.status()}`).toBeLessThan(400);
    }
  });
});
