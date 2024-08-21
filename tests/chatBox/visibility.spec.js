import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.goto('https://prod.buerokratt.ee/');
    await page.getByLabel('Ava vestlus').click();
});

test.describe('chatbox navBar visibility', () => {
    test('should display the chat box', async ({ page }) => {
        await expect(page.getByText('BürokrattTervist!0/')).toBeVisible();
    });

    test('should display the chat box title', async ({ page }) => {
        await expect(page.getByText('Bürokratt')).toBeVisible();
    });

    test('should display the details icon', async ({ page }) => {
        await expect(page.getByLabel('Detailid')).toBeVisible();
    });

    test('should display the minimize chat icon', async ({ page }) => {
        await expect(page.getByLabel('Minimeeri')).toBeVisible();
    });

    test('should display the close chat icon', async ({ page }) => {
        await expect(page.getByLabel('Sulge')).toBeVisible();
    });
});

test.describe('chatbox robot visibility', () => {	  
    test('should display the Bürokratt robot icon', async ({ page }) => {
        await expect(page.getByRole('img', { name: 'Robot icon' })).toBeVisible();
    });

    test('should display the greeting text', async ({ page }) => {
        await expect(page.getByText('Tervist!')).toBeVisible();
    });
})

test.describe('chatbox form visibility', () => {
    
    test('should display the input area', async ({ page }) => {
        await expect(page.locator('input[aria-label="Sisesta tekst"]')).toBeVisible();
    });

    test('should display the placeholder text', async ({ page }) => {
        await expect(page.getByPlaceholder('Kirjutage oma sõnum...')).toBeVisible();
    });

    test('should display the send button', async ({ page }) => {
        await expect(page.getByLabel('Saada')).toBeVisible();
    });
});