import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.goto('https://prod.buerokratt.ee/');
    await page.getByLabel('Ava vestlus').click();
});

test.describe('chat box functionality', () => {
    test('should display details on button click', async ({ page }) => {
        const detailsButton = await page.getByRole('button', { name: 'Detailid' }); 
        await expect(detailsButton).toBeEnabled();

        // Toggle details
        await detailsButton.click();
        await expect(page.getByText('BürokrattTervist!0/')).toBeHidden();
        await expect(page.getByText('BürokrattTutvuge teenuse')).toBeVisible();

        await detailsButton.click();
        await expect(page.getByText('BürokrattTervist!0/')).toBeVisible();
        await expect(page.getByText('BürokrattTutvuge teenuse')).toBeHidden();
    });

    test('should minimize chat box on button click', async ({ page }) => {
        const minimizeButton = page.getByLabel('Minimeeri');
        await expect(minimizeButton).toBeEnabled();
        await minimizeButton.click();
        await expect(page.getByText('BürokrattTervist!0/')).toBeHidden();
    });

    test('should close chat box on button click', async ({ page }) => {
        const closeButton = page.getByLabel('Sulge');
        await expect(closeButton).toBeEnabled();
        await closeButton.click();
        await expect(page.getByText('BürokrattTervist!0/')).toBeHidden();
    });

    test('confirm/send/enter button', async ({ page }) => {
        const sendButton = page.getByLabel('Saada');
        await expect(sendButton).toBeEnabled();
        await page.getByPlaceholder('Kirjutage oma sõnum...').fill('Maksuvaba miinimum?');
        await sendButton.click();
        await expect(page.getByRole('img', { name: 'Person icon' })).toBeVisible();
    });
})

