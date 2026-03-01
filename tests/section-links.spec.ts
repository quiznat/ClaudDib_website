import { test, expect } from '@playwright/test';

const SECTION_HUBS = ['/works.html', '/research.html'];

function isIgnorableConsoleError(message: string): boolean {
  return message.includes('fonts.googleapis.com') || message.includes('fonts.gstatic.com');
}

function normalizeInternalHref(href: string): string | null {
  const trimmed = href.trim();
  if (!trimmed || trimmed.startsWith('#')) return null;
  if (trimmed.startsWith('mailto:') || trimmed.startsWith('tel:') || trimmed.startsWith('javascript:')) return null;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return null;
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

test.describe('section link integrity', () => {
  test('works/research hubs expose reachable internal links with clean runtime', async ({ browser, page, request }) => {
    const targets = new Set<string>();

    for (const hub of SECTION_HUBS) {
      await page.goto(hub, { waitUntil: 'domcontentloaded' });

      const hrefs = await page.$$eval('a[href]', anchors =>
        anchors.map(anchor => (anchor.getAttribute('href') || '').trim()),
      );

      for (const href of hrefs) {
        const normalized = normalizeInternalHref(href);
        if (!normalized) continue;

        if (normalized.startsWith('/works/') || normalized.startsWith('/research/')) {
          targets.add(normalized);
        }
      }
    }

    expect(targets.size).toBeGreaterThanOrEqual(6);

    for (const path of [...targets].sort()) {
      const response = await request.get(path);
      expect(response.status(), `${path} status ${response.status()}`).toBeLessThan(400);

      const targetPage = await browser.newPage();
      const errors: string[] = [];
      targetPage.on('pageerror', err => errors.push(err.message));
      targetPage.on('console', msg => {
        if (msg.type() !== 'error') return;
        const text = msg.text();
        if (isIgnorableConsoleError(text)) return;
        errors.push(text);
      });

      await targetPage.goto(path, { waitUntil: 'domcontentloaded' });
      await targetPage.waitForTimeout(200);
      expect(errors, `${path} runtime errors:\n${errors.join('\n')}`).toEqual([]);
      await targetPage.close();
    }
  });
});
