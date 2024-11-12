import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';
let translation;

test.describe('Buerokratt-Chatbot', () => {
  test.beforeEach(async ({ page }) => {
    test.info().annotations.push({ type: 'repository', description: 'Buerokratt-Chatbot' });
    await page.goto('https://admin.prod.buerokratt.ee/chat/chatbot/welcome-message');
    translation = await getTranslations(page);
    await page.waitForTimeout(3000);
  });

  test('should display heading', async ({ page }) => {
    const heading = await page.getByRole('heading', { name: `${translation.welcomeMessage}`, exact: true });
    await expect(heading).toBeVisible();
  });

  test.describe('Card Body - Greeting Active Switch', () => {
    test('should display and toggle the Greeting Active switch', async ({ page }) => {
      const cardBody = page.locator('.card__body').first();
      const switchLabel = await cardBody.getByText(`${translation.greetingActive}`, { exact: true });
      const switchButton = await cardBody.getByLabel(`${translation.greetingActive}`, { exact: true });

      await expect(switchLabel).toBeVisible();
      await expect(switchButton).toBeVisible();

      const initialState = await switchButton.isChecked();
      await switchButton.click();
      await expect(switchButton.isChecked()).not.toBe(initialState);

      // Revert to original state
      await switchButton.click();
    });
  });

  test.describe('Card Body - Welcome Message Textarea', () => {
    test('should display and update the Welcome Message textarea', async ({ page }) => {
      const cardBody = page.locator('.card__body').first();
      const textareaLabel = await cardBody.getByText(`${translation.welcomeMessage}`, { exact: true });
      const textarea = await cardBody.getByLabel(`${translation.welcomeMessage}`, { exact: true });

      await expect(textareaLabel).toBeVisible();
      await expect(textarea).toBeVisible();

      const initialText = await textarea.inputValue();
      await textarea.fill('Updated Welcome Message');
      const saveButton = await page.getByText(`${translation.save}`, { exact: true });
      await saveButton.click();
      await page.waitForTimeout(1000);
      
      // Refresh page and verify
      await page.reload();
      await expect(textarea).toHaveValue('Updated Welcome Message');

      // Revert to original text
      await textarea.fill(initialText);
      await saveButton.click();
    });
  });
});
