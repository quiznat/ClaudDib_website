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

      if (!entry.isFile()) continue;
      if (!entry.name.endsWith('.html')) continue;

      const rel = path.relative(SITE_ROOT, fullPath).replaceAll(path.sep, '/');
      found.push(`/${rel}`);
    }
  }

  visit(root, 0);
  return [...new Set(found)].sort();
}

test.describe('site surface regression guard', () => {
  test('all html routes under maxdepth 3 return <400', async ({ request }) => {
    const htmlRoutes = walkHtmlFiles(SITE_ROOT, 3);

    // Keep this assert so accidental scanning breakages fail loudly.
    expect(htmlRoutes.length).toBeGreaterThan(20);

    for (const route of htmlRoutes) {
      const res = await request.get(route);
      expect(res.status(), `${route} status ${res.status()}`).toBeLessThan(400);
    }
  });
});
