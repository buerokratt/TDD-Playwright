import { test, expect } from '@playwright/test';
import { getTranslations } from '../../../../../../../translations/languageDetector';

test.describe('Welcome message/Tervitussõnum Visibility Tests', () => {

    let translation;

    test.beforeEach(async ({ page }) => {
        test.info().annotations.push({ type: 'repository', description: 'Buerokratt-Chatbot' });
        
        await page.goto('https://admin.prod.buerokratt.ee/chat/chatbot/welcome-message');
        translation = await getTranslations(page);
    });

    test('Check visibility of the main title', async ({ page }) => {
        // Check if the main title is visible
        const mainTitle = page.locator(`h1:has-text("${translation["welcomeMessage"]}")`);
        await expect(mainTitle).toBeVisible();
    });

    test('Check if the textarea is visible and contains text', async ({ page }) => {
        // Locate the textarea within its surrounding structure
        const textarea = page.locator('.textarea__wrapper textarea');
    
        // Check if the textarea is visible
        await expect(textarea).toBeVisible();
    
        // Retrieve the value from the textarea
        const textareaValue = await textarea.inputValue();
    
        // Check if the textarea contains any text
        await expect(textareaValue).not.toBe('');
    });

    test('Check visibility of the switch label "Tervitus aktiivne"', async ({ page }) => {
        // Check if the switch label "Tervitus aktiivne" is visible
        const switchLabel = page.locator(`label:has-text("${translation["greetingActive"]}")`);
        await expect(switchLabel).toBeVisible();
    });

    test('Check visibility of the switch button', async ({ page }) => {
        const switchButton = page.locator('.switch__button').nth(1);
        await expect(switchButton).toBeVisible();
    });

    test('Check visibility of the textarea label', async ({ page }) => {
        // Check if the textarea label is visible
        const textareaLabel = page.locator(`label:has-text("${translation["welcomeMessage"]}")`);
        await expect(textareaLabel).toBeVisible();
    });

    test('Check if the textarea contains text', async ({ page }) => {
        // Locate the correct textarea using XPath with translation
        const textarea = page.locator(`//label[text()="${translation["welcomeMessage"]}"]/following-sibling::div//textarea`);

        // Retrieve the value from the textarea
        const textareaValue = await textarea.inputValue();

        // Check if the textarea contains any text
        await expect(textareaValue).not.toBe('');
    });

    test.skip('Check if the character count reflects the length of the message ### LOOK ISSUE INSIDE', async ({ page }) => {

        test.info().annotations.push({
            type: 'Known bug',
            description: 'It doesnt display the character count on first load',
        })
        // Locate the correct textarea using XPath with translation
        const textarea = page.locator(`//label[text()="${translation["welcomeMessage"]}"]/following-sibling::div//textarea`);

        // Retrieve the value from the textarea
        const textareaValue = await textarea.inputValue();

        // Verify the character count reflects the length of the message
        const charCount = page.locator('.textarea__max-length-bottom');
        await expect(charCount).toBeVisible();

        // Verify that the character count matches the length of the message
        const messageLength = textareaValue.length;
        await expect(charCount).toHaveText(`${messageLength}/250`);
    });

    test('Check visibility of the "Salvesta" button', async ({ page }) => {
        // Check if the "Salvesta" button is visible
        const saveButton = page.locator(`button.btn--primary:has-text("${translation["save"]}")`);
        await expect(saveButton).toBeVisible();
    });

});
