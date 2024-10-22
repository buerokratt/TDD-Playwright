import { getTranslations } from '@translation/languageDetector.js';
const { test, expect } = require('@playwright/test');

test.describe('Unanswered chats page tests', () => {
    let translation;
    test.beforeEach(async ({ page }) => {
        await page.goto('https://admin.prod.buerokratt.ee/chat/unanswered');
        await page.waitForTimeout(3000); // Wait for 3 seconds to ensure all elements are loaded
        translation = await getTranslations(page);
    });

    test.describe('Main section tests', () => {

        test.only('Check visibility of vertical tabs and placeholder text', async ({ page }) => {
            const verticalTabs = page.locator('.vertical-tabs');
            await expect(verticalTabs).toBeVisible();
            const verticalTabsList = page.locator('.vertical-tabs__list');
            await expect(verticalTabsList).toBeVisible();
            const placeholderText = page.locator(`p:has-text("${translation.chooseChatToBegin}")`);
            await expect(placeholderText).toBeVisible();
        });

    });

    test.describe('Selected chat section tests', () => {

        test('Check visibility of active chat header and body', async ({ page }) => {
            const translation = await getTranslations();
            const activeChatBody = page.locator('.active-chat__body');
            await expect(activeChatBody).toBeVisible();
            const headerParagraph = page.locator(`p:has-text("${translation.headerParagraph}")`);
            await expect(headerParagraph).toBeVisible();
            const headerTitle = page.locator(`h3:has-text("${translation.headerTitle}")`);
            await expect(headerTitle).toBeVisible();
        });

        test('Check visibility of "Take Over" button in toolbar', async ({ page }) => {
            const translation = await getTranslations();
            const takeOverButton = page.locator(`button:has-text("${translation.takeOver}")`);
            await expect(takeOverButton).toBeVisible();
        });

    });

    test.describe('Side actions tests', () => {

        test('Check visibility of side action buttons', async ({ page }) => {
            const translation = await getTranslations();
            const endChatButton = page.locator(`button:has-text("${translation.endChat}")`);
            await expect(endChatButton).toBeVisible();
            const askAuthButton = page.locator(`button:has-text("${translation.askAuthentication}")`);
            await expect(askAuthButton).toBeVisible();
            const askContactInfoButton = page.locator(`button:has-text("${translation.askContactInformation}")`);
            await expect(askContactInfoButton).toBeVisible();
            const askPermissionButton = page.locator(`button:has-text("${translation.askPermission}")`);
            await expect(askPermissionButton).toBeVisible();
            const forwardButton = page.locator(`button:has-text("${translation.forwardToColleague}")`);
            await expect(forwardButton).toBeVisible();
        });

    });

    test.describe('Meta information section tests', () => {

        test('Check visibility of active chat side meta information', async ({ page }) => {
            const translation = await getTranslations();
            const idParagraph = page.locator(`p:has-text("${translation.id}")`);
            await expect(idParagraph).toBeVisible();
            const endUserNameParagraph = page.locator(`p:has-text("${translation.endUserName}")`);
            await expect(endUserNameParagraph).toBeVisible();
            const chatStartedAtParagraph = page.locator(`p:has-text("${translation.chatStartedAt}")`);
            await expect(chatStartedAtParagraph).toBeVisible();
            const deviceParagraph = page.locator(`p:has-text("${translation.device}")`);
            await expect(deviceParagraph).toBeVisible();
            const locationParagraph = page.locator(`p:has-text("${translation.location}")`);
            await expect(locationParagraph).toBeVisible();
        });

    });

});
