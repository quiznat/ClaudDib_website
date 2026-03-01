import { test, expect } from '@playwright/test';

test('manual-style gameplay run: roam, dash, interact, score/water state changes', async ({ page }) => {
  await page.goto('/games/the-desert/index.html');

  const initialScore = Number(await page.locator('#score').innerText());
  const initialWater = Number(await page.locator('#water').innerText());

  for (let i = 0; i < 10; i++) {
    const key = ['KeyD', 'KeyS', 'KeyA', 'KeyW'][i % 4];
    await page.keyboard.down(key);
    await page.waitForTimeout(550);
    await page.keyboard.up(key);

    if (i % 2 === 0) await page.keyboard.press('Space');
    await page.keyboard.press('KeyE');
    await page.waitForTimeout(280);
  }

  const finalScore = Number(await page.locator('#score').innerText());
  const finalWater = Number(await page.locator('#water').innerText());

  await page.screenshot({ path: 'state/desert-playwright-actual-play.png', fullPage: true });

  console.log(JSON.stringify({ initialScore, finalScore, initialWater, finalWater }));
  expect(finalScore > initialScore || finalWater < initialWater).toBeTruthy();
});
