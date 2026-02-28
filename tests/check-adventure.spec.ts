import { test, expect } from '@playwright/test';

test.describe('Check Adventure Signal Run v2', () => {
  test('shows objective, supports power-ups, and reaches an ending in one run', async ({ page }) => {
    await page.goto('/games/check-adventure/index.html');

    await expect(page.locator('h1')).toContainText('Signal Run');
    await expect(page.locator('#goal')).toContainText('at least 4 intel');
    await expect(page.locator('#scene-title')).toContainText('Night Entry');

    // Take loud opening to gain a power-up
    await page.getByRole('button', { name: /Kick open relay hatch/i }).click();
    await expect(page.locator('#powerups')).toContainText('Battery Pack');

    // Continue with deterministic first narrative option until ending
    for (let i = 0; i < 6; i++) {
      const title = (await page.locator('#scene-title').innerText()).trim();
      if (['Clean Extraction', 'Legendary Extraction', 'Run Collapsed'].includes(title)) break;
      await page.locator('#choices button').last().click();
    }

    const endTitle = (await page.locator('#scene-title').innerText()).trim();
    expect(['Clean Extraction', 'Legendary Extraction', 'Run Collapsed']).toContain(endTitle);
    await expect(page.locator('#consequence-hint')).toBeVisible();
  });

  test('can produce a clear fail state from seeded high heat', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('checkAdventureSignalRun_v2', JSON.stringify({
        run: 1,
        day: 5,
        sceneId: 'gate',
        energy: 2,
        intel: 4,
        heat: 6,
        trust: 0,
        status: 'Compromised',
        powerups: { cloak: 0, battery: 0, key: 0 },
        tags: { stance: 'bold', balance: 'spent', mark: 'hunted', oath: 'raider' },
        powerUsedThisScene: false,
        ending: null,
        log: []
      }));
    });

    await page.goto('/games/check-adventure/index.html');
    await page.getByRole('button', { name: /Commit extraction now/i }).click();

    await expect(page.locator('#scene-title')).toContainText('Run Collapsed');
    await expect(page.locator('#status')).toContainText('Compromised');
  });

  test('restart resets run resources', async ({ page }) => {
    await page.goto('/games/check-adventure/index.html');

    await page.getByRole('button', { name: /Ghost through drainage canals/i }).click();
    await page.locator('#restart').click();

    await expect(page.locator('#day')).toContainText('1');
    await expect(page.locator('#energy')).toContainText('6');
    await expect(page.locator('#intel')).toContainText('0');
    await expect(page.locator('#scene-title')).toContainText('Night Entry');
  });
});
