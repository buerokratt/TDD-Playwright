import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';

test.describe('Visibility Tests for "Välimus ja käitumine"/"Appearance and Behaviour" Page', async () => {
    let translation;
    test.beforeEach(async ({ page }) => {
        test.info().annotations.push({ type: 'repository', description: 'Buerokratt-Chatbot' });
        // Navigate to the page before each test
        await page.goto('https://admin.prod.buerokratt.ee/chat/chatbot/appearance');
        translation = await getTranslations(page);
    });

    test('Check visibility of the header', async ({ page }) => {
        const header = page.locator(`h1:has-text("${translation['appearanceAndBehaviour']}")`);
        await expect(header).toBeVisible();
    });

    test('Check visibility of animation duration input', async ({ page }) => {
        const label = page.locator(`label:has-text("${translation['widgetProactiveSeconds']}")`);
        await expect(label).toBeVisible();
        const inputField = page.locator('input[name="widgetProactiveSeconds"]');
        await expect(inputField).toBeVisible();
    });

    test('Check visibility of notification switch', async ({ page }) => {
        const notificationSwitch = page.locator(`label:has-text("${translation['widgetBubbleMessageText']}") + button.switch__button`);
        await expect(notificationSwitch).toBeVisible();
    });

    test('Check visibility of animation start time input', async ({ page }) => {
        const animationStartTimeInput = page.locator(`label:has-text("${translation['widgetBubbleMessageSeconds']}") + div input`);
        await expect(animationStartTimeInput).toBeVisible();
    });

    test('Check visibility of notification message input', async ({ page }) => {
        const notificationMessageInput = page.locator(`label:has-text("${translation['widgetBubbleMessageText']}") + div input`);
        await expect(notificationMessageInput).toBeVisible();

    });

    test('Check visibility of primary color picker', async ({ page }) => {
        const primaryColorPicker = page.locator(`label:has-text("${translation['widgetColor']}") + div input`);
        await expect(primaryColorPicker).toBeVisible();
    });

    test('Check visibility of color picker button', async ({ page }) => {
        const colorPickerButton = page.locator(`label:has-text("${translation['widgetColor']}") + div input`);
        await expect(colorPickerButton).toBeVisible();
    });

    test('Check visibility of animation dropdown', async ({ page }) => {
        const animationDropdown = page.locator(`label:has-text("${translation['widgetAnimation']}") + div div.select__trigger`);
        await expect(animationDropdown).toBeVisible();
    });

    test('Check visibility of save button', async ({ page }) => {
        const saveButton = page.locator(`button:has-text("${translation['save']}")`);
        await expect(saveButton).toBeVisible();
    });

    test('Check visibility of preview button', async ({ page }) => {
        const previewButton = page.locator(`button:has-text("${translation['preview']}")`);
        await expect(previewButton).toBeVisible();
    });


    test('test label input visibility', async ({ page }) => {
        // Locate the label based on its text
        const labelLocator = page.locator('label', { hasText: translation['widgetProactiveSeconds'] });

        // Locate the input field based on the label
        const inputContainer = labelLocator.locator('..'); // Move to parent container
        const inputLocator = inputContainer.locator('input');

        // Example usage: Assert the input is visible and interact with it
        await expect(inputLocator).toBeVisible();
    });

});
