import { test, expect } from '@playwright/test';

test.beforeEach('prepair page for each test', async ({ page }) => {
    await page.goto('https://prod.buerokratt.ee/');
    await page.getByLabel('Ava vestlus').click();
    await page.getByPlaceholder('Kirjutage oma sõnum...').click();
    await page.getByPlaceholder('Kirjutage oma sõnum...').fill('Maksuvaba miinimum?');
    await page.getByLabel('Saada').click();

    // wait for answer - otherwise all the tests will fail
    await page.waitForTimeout(10000)

    await page.getByLabel('Sulge').click();
    await page.getByRole('button', { name: 'Jah, sain vastuse' }).click();

})

test.describe('feedback menu visibility', () => {
    test('should display the feedback menu title', async ({ page }) => {
        await expect(page.getByText('Kuidas jäite rahule antud')).toBeVisible();
    });

    test('should display numeric menu', async ({ page }) => {
        for (let i = 0; i <= 10; i++) {
            const buttonName = i.toString();
            // Check if the button with the corresponding number is visible
            await expect(page.getByRole('button', { name: buttonName, exact: true })).toBeVisible();
        }
    })

    test('should display thank you message', async ({ page }) => {
        await expect(page.getByText('Oleme tänulikud, kui annate')).toBeVisible();
    })

    test('should display feedback input area', async ({ page }) => {
        await expect(page.getByPlaceholder('Sisestage oma tagasiside...')).toBeVisible();
    })

    test('should display skip button', async ({ page }) => {
        await expect(page.getByRole('button', { name: 'Jäta vahele' })).toBeVisible();
    })

    test('should display confirm button', async ({ page }) => {
        await expect(page.getByRole('button', { name: 'Kinnita' })).toBeVisible();
    })

    test('should display download dialog button', async ({ page }) => {
        await expect(page.getByRole('button', { name: 'Lae vestlus alla' })).toBeVisible();
    })
})

