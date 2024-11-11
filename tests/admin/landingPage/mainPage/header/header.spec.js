import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector';

test.describe('Header Functionality Tests', () => {
    let translations;

    test.beforeEach(async ({ page }) => {
        await page.goto('https://admin.prod.buerokratt.ee/chat/active');
        translations = await getTranslations(page);
        await page.waitForTimeout(2000);
    });

    test('Check top banner visibility', async ({ page }) => {
        const header = page.locator('header');
        const isVisible = await header.isVisible();
        expect(isVisible).toBe(true, 'Top banner is not visible');
    });

    test('Check logo visibility', async ({ page }) => {
        const logo = page.locator('header').getByRole('img');
        await expect(logo).toBeVisible();
    });

    test('Check unanswered/forwarded text in top banner', async ({ page }) => {
        const regexPattern = new RegExp(`\\b\\d+\\b\\s+${translations.unanswered}\\s+\\b\\d+\\b\\s+${translations.forwarded}\\s+\\b\\d+\\b\\s+${translations.pending}`, 'i');
    
        const p = page.locator('header .track p');
        await expect(p).toBeVisible();

        const text = await p.textContent();

        expect(regexPattern.test(text)).toBe(true, 'Text format does not match the expected unanswered/forwarded/pending format');
    });

    test('Check profile settings and info button visibility', async ({ page }) => {
        const button = page.locator('header').locator('button.btn.btn--text.btn--m').first();
        const isVisible = await button.isVisible();
        expect(isVisible).toBe(true, 'Profile settings and info button is not visible');
    });

    test('Check logout button visibility', async ({ page }) => {
        const logoutButton = page.locator('header').getByRole('button', { name: translations.logout });
        const isVisible = await logoutButton.isVisible();
        expect(isVisible).toBe(true, 'Logout button is not visible');
    });

    //Test to check the status switch button color change
    // test('Check status switch button color change', async ({ page }) => {
    //     const button = page.locator('header').locator('.switch__button');
    //     const initialColor = await button.evaluate(el => getComputedStyle(el).backgroundColor);

    //     // Get the first span child of the statusDotButton for checking color
    //     const statusDotButton = page.locator('header').locator('.btn.btn--text.btn--m').first();
    //     const statusColorSpan = statusDotButton.locator('span').first(); // First <span> child
    //     const initialStatusColor = await statusColorSpan.evaluate(el => getComputedStyle(el).backgroundColor);

    //     // Click to trigger color change
    //     await button.click();
    //     await page.waitForTimeout(400); // Wait for animation to complete

    //     const newColor = await button.evaluate(el => getComputedStyle(el).backgroundColor);
    //     expect(newColor).not.toBe(initialColor, 'Button background color did not change');

    //     const newStatusColor = await statusColorSpan.evaluate(el => getComputedStyle(el).backgroundColor);
    //     expect(newStatusColor).not.toBe(initialStatusColor, 'Active status dot color did not change');
    // });
});
