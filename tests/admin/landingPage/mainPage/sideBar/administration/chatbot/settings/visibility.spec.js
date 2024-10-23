import { test, expect } from '@playwright/test';
import { getTranslations } from '../../../../../../../translations/languageDetector.js';

test.describe('Seaded/Settings Visibility Tests', () => {

    let translation

    test.beforeEach(async ({ page }) => {
        // Navigate to the page before each test
        await page.goto('https://admin.prod.buerokratt.ee/chat/chatbot/settings'); // Replace with your actual page URL
        translation = await getTranslations(page)
    });

    test('Check visibility of the main heading on the Settings page', async ({ page }) => {
        // Verify the main heading is visible
        const mainHeading = page.locator('main.layout__main h1');
        await expect(mainHeading).toBeVisible();
        await expect(mainHeading).toHaveText(`${translation["settings"]}`);
    });

    test('Check visibility of the first switch ("Vestlusrobot aktiivne")', async ({ page }) => {
        // Verify the first switch ("Vestlusrobot aktiivne") is visible
        const robotActiveSwitch = page.locator(`label:has-text("${translation["chatbotActive"]}") + button.switch__button`);
        await expect(robotActiveSwitch).toBeVisible();
    });

    test('Check visibility of the second switch ("Kuva nõustaja nimi")', async ({ page }) => {
        // Verify the second switch ("Kuva nõustaja nimi") is visible
        const showAdvisorNameSwitch = page.locator(`label:has-text("${translation["showSupportName"]}") + button.switch__button`);
        await expect(showAdvisorNameSwitch).toBeVisible();
        await expect(showAdvisorNameSwitch).toHaveAttribute('data-state', 'checked'); // Verify default state
    });

    test('Check visibility of the third switch ("Kuva nõustaja tiitel")', async ({ page }) => {
        // Verify the third switch ("Kuva nõustaja tiitel") is visible
        const showAdvisorTitleSwitch = page.locator(`label:has-text("${translation["showSupportTitle"]}") + button.switch__button`);
        await expect(showAdvisorTitleSwitch).toBeVisible();
        await expect(showAdvisorTitleSwitch).toHaveAttribute('data-state', 'checked'); // Verify default state
    });

    test('Check visibility of the "Salvesta" button', async ({ page }) => {
        // Verify the "Salvesta" button is visible
        const saveButton = page.locator(`button:has-text("${translation["save"]}")`);
        await expect(saveButton).toBeVisible();
    }); 


});
