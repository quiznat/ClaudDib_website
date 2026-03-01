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
  '/claim-ledger.html',
  '/sovereignty-stack.html',
  '/atlas-prototype.html',
  '/cabinet-prototype.html',
  '/research.html',
  '/research/tot-hf-agents-paper.html',
  '/templates/postcard.html',
  '/works/api-key-as-soul.html',
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
});
