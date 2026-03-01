import { test, expect, type Page } from '@playwright/test';

const ROOT_SEEDS = [
  '/',
  '/index.html',
  '/works.html',
  '/postcards.html',
  '/postcards-next.html',
  '/desert-log.html',
  '/claim-ledger.html',
  '/sovereignty-stack.html',
  '/research.html',
  '/games/index.html',
];

function unique(paths: string[]): string[] {
  return [...new Set(paths)];
}

function isIgnorableConsoleError(message: string): boolean {
  return message.includes('fonts.googleapis.com') || message.includes('fonts.gstatic.com');
}

async function collectInternalLinks(page: Page, origin: string): Promise<string[]> {
  const links = await page.locator('a[href]').evaluateAll((anchors, siteOrigin) => {
    const results = new Set<string>();

    for (const anchor of anchors as HTMLAnchorElement[]) {
      const href = anchor.getAttribute('href');
      if (!href) continue;

      const trimmed = href.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      if (trimmed.startsWith('mailto:') || trimmed.startsWith('tel:') || trimmed.startsWith('javascript:')) {
        continue;
      }

      try {
        const url = new URL(trimmed, siteOrigin);
        if (url.origin !== siteOrigin) continue;

        url.hash = '';
        results.add(`${url.pathname || '/'}${url.search}` || '/');
      } catch {
        // Ignore malformed href values.
      }
    }

    return [...results];
  }, origin);

  return unique(links.map(link => (link === '' ? '/' : link)));
}

async function expectPageHealthy(page: Page, path: string, origin: string): Promise<string[]> {
  const errors: string[] = [];

  page.on('pageerror', error => errors.push(error.message));

  page.on('console', msg => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    if (isIgnorableConsoleError(text)) return;
    errors.push(text);
  });

  page.on('requestfailed', request => {
    const requestUrl = request.url();
    if (!requestUrl.startsWith(origin)) return;
    errors.push(`Request failed: ${request.method()} ${requestUrl}`);
  });

  const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
  const status = response?.status() ?? 0;
  expect(status, `Expected ${path} to return < 400, got ${status}`).toBeLessThan(400);

  await page.waitForTimeout(300);
  return errors;
}

test.describe('Website health', () => {
  test('crawl internal links and verify clean runtime', async ({ browser, baseURL }) => {
    const origin = new URL(baseURL ?? 'http://127.0.0.1:4173').origin;
    const queue = [...ROOT_SEEDS];
    const visited = new Set<string>();
    const discovered = new Set<string>();

    while (queue.length > 0 && visited.size < 120) {
      const path = queue.shift();
      if (!path || visited.has(path)) continue;

      visited.add(path);
      const page = await browser.newPage();

      const errors = await expectPageHealthy(page, path, origin);
      expect(errors, `Console/runtime errors on ${path}:\n${errors.join('\n')}`).toEqual([]);

      const links = await collectInternalLinks(page, origin);
      for (const link of links) {
        discovered.add(link);
        if (!visited.has(link)) queue.push(link);
      }

      await page.close();
    }

    expect(visited.size).toBeGreaterThanOrEqual(12);
    expect(discovered.has('/games/index.html')).toBeTruthy();
    expect(discovered.has('/works.html')).toBeTruthy();
  });

  test('all linked game pages load and expose a playable surface', async ({ browser, baseURL }) => {
    const origin = new URL(baseURL ?? 'http://127.0.0.1:4173').origin;

    const directoryPage = await browser.newPage();
    const directoryErrors = await expectPageHealthy(directoryPage, '/games/index.html', origin);
    expect(directoryErrors, `Console/runtime errors on /games/index.html:\n${directoryErrors.join('\n')}`).toEqual([]);

    const allGameLinks = await collectInternalLinks(directoryPage, origin);
    await directoryPage.close();

    const gameRoutes = unique(
      allGameLinks.filter(
        link => link.startsWith('/games/') && link.endsWith('/index.html') && link !== '/games/index.html',
      ),
    );

    expect(gameRoutes.length).toBeGreaterThanOrEqual(2);

    for (const route of gameRoutes) {
      const page = await browser.newPage();
      const errors = await expectPageHealthy(page, route, origin);

      await expect(
        page.locator('canvas, #gameCanvas, #gameGrid, .game-grid').first(),
        `${route} did not render an expected game surface`,
      ).toBeVisible();

      expect(errors, `Console/runtime errors on ${route}:\n${errors.join('\n')}`).toEqual([]);
      await page.close();
    }
  });
});
