import { test, expect } from '@playwright/test';

test.describe('Check Adventure gameplay loop', () => {
  test('loads and allows branching progression to an ending', async ({ page }) => {
    await page.goto('/games/check-adventure/index.html');

    await expect(page.locator('h1')).toContainText('Signal Dunes');
    await expect(page.locator('#scene-title')).toContainText('Gate');

    // choose first option in each scene to simulate a full run
    await page.locator('#choices button').first().click();
    await expect(page.locator('#scene-title')).toContainText('Dry Well');

    await page.locator('#choices button').first().click();
    await expect(page.locator('#scene-title')).toContainText('Glass Spire');

    await page.locator('#choices button').first().click();

    const endTitle = await page.locator('#scene-title').innerText();
    expect(['Clean Extraction', 'Costly Victory', 'Buried by the Dunes']).toContain(endTitle);

    // sanity: logs and run controls present
    await expect(page.locator('#log .entry').first()).toBeVisible();
    const shardsBeforeRestart = Number(await page.locator('#shards').innerText());
    await page.locator('#restart-inline').click();
    await expect(page.locator('#run')).toContainText('2');
    const shardsAfterRestart = Number(await page.locator('#shards').innerText());
    expect(shardsAfterRestart).toBeGreaterThanOrEqual(shardsBeforeRestart);
  });
});
