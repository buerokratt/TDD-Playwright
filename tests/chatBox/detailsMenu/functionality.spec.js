import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.goto('https://prod.buerokratt.ee/');
    await page.getByLabel('Ava vestlus').click();
});

test('should open a popup page for terms of service', async ({ page, context }) => {
    await page.getByRole('button', { name: 'Detailid' }).click()
    await page.getByRole('button', { name: 'Tutvuge teenuse tingimustega' }).click();
    const newPage = await context.waitForEvent('page');

    await expect(newPage).toHaveURL('https://www.kratid.ee/kasutustingimused');
    const title = await newPage.title();
    expect(title).toContain('Kasutustingimused');
})

test('should redirect to TARA-test page for authentication', async ({ page }) => {
    // make a query to chatbot to get authentication button in details menu - why?
    await page.getByPlaceholder('Kirjutage oma sõnum...').fill('Maksuvaba miinimum?');
    await page.getByLabel('Saada').click()

    await page.getByRole('button', { name: 'Detailid' }).click()

    await page.getByRole('button', { name: 'Isikustage TARA kaudu' }).click();
    await page.waitForURL();
    await expect(page).toHaveTitle(/Riigi autentimisteenus/)
    await expect(page).toHaveURL(/.*tara-test\.ria\.ee.*/);
})
