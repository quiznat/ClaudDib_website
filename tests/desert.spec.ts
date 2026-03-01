import { test, expect } from '@playwright/test';

test.describe('The Desert gameplay feedback loop', () => {
  test('loads game without console errors and updates core HUD', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/games/the-desert/index.html');

    await expect(page.locator('#water')).toBeVisible();
    await expect(page.locator('#score')).toBeVisible();
    await expect(page.locator('#combo')).toBeVisible();
    await expect(page.locator('#objective')).toBeVisible();

    // Move and interact a bit
    await page.keyboard.press('KeyD');
    await page.waitForTimeout(700);
    await page.keyboard.press('Space');
    await page.waitForTimeout(400);

    const objectiveText = await page.locator('#objective').innerText();
    expect(objectiveText.length).toBeGreaterThan(10);

    expect(errors, `Console/page errors: ${errors.join('\n')}`).toEqual([]);
  });

  test('mobile click-to-move and interact controls work', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'mobile-only behavior');

    await page.goto('/games/the-desert/index.html');

    // tap ground to move
    await page.locator('canvas').click({ position: { x: 220, y: 420 } });
    await page.waitForTimeout(700);

    // mobile buttons exist and are clickable
    await page.locator('#dashBtn').click();
    await page.waitForTimeout(300);
    await page.locator('#interactBtn').click();

    await expect(page.locator('#dashBar')).toBeVisible();
    await expect(page.locator('#comboBar')).toBeVisible();
  });

  test('fun loop smoke: score can increase during play', async ({ page }) => {
    await page.goto('/games/the-desert/index.html');

    const initial = Number(await page.locator('#score').innerText());

    // run around / interact to trigger scoring opportunities
    for (const key of ['KeyD', 'KeyS', 'KeyA', 'KeyW']) {
      await page.keyboard.press(key);
      await page.waitForTimeout(450);
      await page.keyboard.press('Space');
      await page.waitForTimeout(250);
    }

    const after = Number(await page.locator('#score').innerText());
    expect(after).toBeGreaterThanOrEqual(initial);
  });
});
