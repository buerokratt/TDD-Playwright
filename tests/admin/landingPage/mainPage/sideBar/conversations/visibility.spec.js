import { test, expect } from '@playwright/test';

const TIMEOUT = 500000


test.beforeEach('test', async ({ page }) => {
    await page.goto('https://admin.test.buerokratt.ee/chat/active');
    // page is authenticated
    await expect(page).toHaveURL('https://admin.test.buerokratt.ee/chat/active');
});


test.describe('conversations tab with sub tabs visibility', () => {

    test('should have the correct URL', async ({ page }) => {
        await expect(page).toHaveURL('https://admin.test.buerokratt.ee/chat/active');
    });

    test('should have all tabs', async ({ page }) => {
        await expect(page.getByRole('button', { name: 'Vestlused', exact: true })).toBeVisible();
        await expect(page.getByRole('link', { name: /Vastamata/ })).toBeVisible();
        await expect(page.getByRole('link', { name: /Aktiivsed/ })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Ajalugu' })).toBeVisible();
        await expect(page.getByRole('link', { name: /Ootel/ })).toBeVisible();
    });


    test('should not have visible subtabs when conversations tab is closed', async ({ page }) => {

        // Ensure the subtabs are visible initially
        await expect(page.getByRole('link', { name: /Vastamata/ })).toBeVisible();
        await expect(page.getByRole('link', { name: /Aktiivsed/ })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Ajalugu' })).toBeVisible();
        await expect(page.getByRole('link', { name: /Ootel/ })).toBeVisible();

        // Close the conversations tab (assuming there's a button or method to collapse the tab)
        await page.getByRole('button', { name: 'Vestlused', exact: true }).click();

        // Assert that the subtabs are no longer visible
        await expect(page.getByRole('link', { name: /Vastamata/ })).not.toBeVisible();
        await expect(page.getByRole('link', { name: /Aktiivsed/ })).not.toBeVisible();
        await expect(page.getByRole('link', { name: 'Ajalugu' })).not.toBeVisible();
        await expect(page.getByRole('link', { name: /Ootel/ })).not.toBeVisible();
    })

    test('should display conversations tab and subtabs after page refresh', async ({ page }) => {

        // Refresh the page
        await page.reload();

        // Check that the conversations tab is visible
        await expect(page.getByRole('button', { name: 'Vestlused', exact: true })).toBeVisible();

        // Ensure the subtabs are visible initially
        await expect(page.getByRole('link', { name: /Vastamata/ })).toBeVisible();
        await expect(page.getByRole('link', { name: /Aktiivsed/ })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Ajalugu' })).toBeVisible();
        await expect(page.getByRole('link', { name: /Ootel/ })).toBeVisible();

    })

    test('should activate "Vastamata" tab when clicked on it', async ({ page }) => {
        await page.getByRole('link', { name: /Vastamata/ }).click();

        await expect(page.getByRole('link', { name: /Vastamata/ })).toHaveClass(/active/);

        // Ensure other tabs are not active
        await expect(page.getByRole('link', { name: /Aktiivsed/ })).not.toHaveClass(/active/);
        await expect(page.getByRole('link', { name: 'Ajalugu' })).not.toHaveClass(/active/);
        await expect(page.getByRole('link', { name: /Ootel/ })).not.toHaveClass(/active/);

    })

    test('should activate "Aktiivsed" tab when clicked on it', async ({ page }) => {
        await page.getByRole('link', { name: /Aktiivsed/ }).click();

        await expect(page.getByRole('link', { name: /Aktiivsed/ })).toHaveClass(/active/);

        await expect(page.getByRole('link', { name: /Vastamata/ })).not.toHaveClass(/active/);
        await expect(page.getByRole('link', { name: 'Ajalugu' })).not.toHaveClass(/active/);
        await expect(page.getByRole('link', { name: /Ootel/ })).not.toHaveClass(/active/);

    })

    test('should activate "Ajalugu" tab when clicked on it', async ({ page }) => {
        await page.getByRole('link', { name: "Ajalugu" }).click();

        await expect(page.getByRole('link', { name: 'Ajalugu' })).toHaveClass(/active/);

        await expect(page.getByRole('link', { name: /Vastamata/ })).not.toHaveClass(/active/);
        await expect(page.getByRole('link', { name: /Aktiivsed/ })).not.toHaveClass(/active/);
        await expect(page.getByRole('link', { name: /Ootel/ })).not.toHaveClass(/active/);

    })

    test('should activate "Ootel" tab when clicked on it', async ({ page }) => {
        await page.getByRole('link', { name: /Ootel/ }).click();

        await expect(page.getByRole('link', { name: /Ootel/ })).toHaveClass(/active/);

        await expect(page.getByRole('link', { name: /Vastamata/ })).not.toHaveClass(/active/);
        await expect(page.getByRole('link', { name: /Aktiivsed/ })).not.toHaveClass(/active/);
        await expect(page.getByRole('link', { name: 'Ajalugu' })).not.toHaveClass(/active/);
    })
});