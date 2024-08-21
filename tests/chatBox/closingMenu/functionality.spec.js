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

test('should display feedback menu - yes, with answer', async ({ page }) => {
    await page.getByRole('button', { name: 'Jah, sain vastuse' }).click()
})

test('should display feedback menu - yes, without answer', async ({ page }) => {
    await page.getByRole('button', { name: 'Jah, vastuseta' }).click()
})

test('should display chatBox - do not wish to close', async ({ page }) => {
    page.getByRole('button', { name: 'Ei soovi sulgeda' }).click()
    await expect(page.locator('[aria-label="Kas soovite vestluse sulgeda?"]')).toBeHidden()
})