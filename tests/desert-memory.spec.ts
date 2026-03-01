import { test, expect } from '@playwright/test';

test.describe('Desert Memory gameplay', () => {
  test('loads board, supports daily mode, and renders expected card count', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/games/desert-memory/index.html');

    await expect(page.locator('#gameGrid .card')).toHaveCount(16);
    await expect(page.locator('#pairs')).toContainText('0/8');

    await page.getByRole('button', { name: 'Daily Desert' }).click();
    await expect(page.locator('.game-subtitle')).toContainText('Daily Desert Challenge');
    await expect(page.locator('#gameGrid .card')).toHaveCount(16);

    expect(errors, `Console/page errors: ${errors.join('\n')}`).toEqual([]);
  });

  test('can complete a full run by matching all pairs', async ({ page }) => {
    await page.goto('/games/desert-memory/index.html');

    const pairs = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.card')) as HTMLElement[];
      const byImage = new Map<string, number[]>();

      cards.forEach((card, idx) => {
        const image = card.dataset.image || '';
        const list = byImage.get(image) || [];
        list.push(idx);
        byImage.set(image, list);
      });

      return Array.from(byImage.values());
    });

    expect(pairs.length).toBe(8);

    for (let i = 0; i < pairs.length; i++) {
      const [first, second] = pairs[i];
      await page.locator('#gameGrid .card').nth(first).click();
      await page.locator('#gameGrid .card').nth(second).click();
      await expect(page.locator('#pairs')).toContainText(`${i + 1}/8`);
    }

    await expect(page.locator('#winScreen')).toHaveClass(/active/);
    await expect(page.locator('#winMoves')).toContainText('8');
  });
});
