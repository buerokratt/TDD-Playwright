import { test, expect } from '@playwright/test';

test.beforeEach('prepair page for each test', async ({ page }) => {
    await page.goto('https://prod.buerokratt.ee/');
    await page.getByLabel('Ava vestlus').click();
    await page.getByPlaceholder('Kirjutage oma sõnum...').click();
    await page.getByPlaceholder('Kirjutage oma sõnum...').fill('Maksuvaba miinimum?');
    await page.getByLabel('Saada').click();

    await page.waitForTimeout(10000)

    await page.getByLabel('Sulge').click();
})

test.describe('closing menu visibility', () => {
    test('should display the closing menu title', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Kas soovite vestluse sulgeda?' })).toBeVisible();
    });

    test('should display the yes with answer button', async ({ page }) => {
        await expect(page.getByRole('button', { name: 'Jah, sain vastuse' })).toBeVisible();
    });

    test('should display the yes with no answer button', async ({ page }) => {
        await expect(page.getByRole('button', { name: 'Jah, vastuseta' })).toBeVisible();
    });

    test('should display the do not wish to close button', async ({ page }) => {
        await expect(page.getByRole('button', { name: 'Ei soovi sulgeda' })).toBeVisible();
    });
})