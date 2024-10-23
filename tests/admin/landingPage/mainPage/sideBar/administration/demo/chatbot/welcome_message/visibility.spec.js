import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';

let translation;

test.describe('Settings - Welcome Message visibility tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('https://admin.prod.buerokratt.ee/chat/chatbot/welcome-message');
    translation = await getTranslations(page);
    await page.waitForTimeout(3000); // Ensure page loads fully
  });

  test('Heading is visible', async ({ page }) => {
    const heading = await page.locator(`h1:has-text("${translation.welcomeMessage}")`);
    await expect(heading).toBeVisible();
  });

  test.describe('Card Body visibility tests', () => {

    test('Greeting Active switch is visible', async ({ page }) => {
      const greetingSwitch = await page.locator(`label:has-text("${translation.greetingActive}") + button.switch__button`);
      await expect(greetingSwitch).toBeVisible();
    });

    test('Welcome Message textarea is visible', async ({ page }) => {
      const messageLabel = await page.locator(`label:has-text("${translation.welcomeMessage}")`);
      await expect(messageLabel).toBeVisible();

      const messageTextarea = await page.locator(`div.textarea__wrapper >> textarea`);
      await expect(messageTextarea).toBeVisible();
    });
  });

  test.describe('Card Footer visibility tests', () => {

    test('Save button is visible', async ({ page }) => {
      const saveButton = await page.locator(`button:has-text("${translation.save}")`);
      await expect(saveButton).toBeVisible();
    });

  });

});
