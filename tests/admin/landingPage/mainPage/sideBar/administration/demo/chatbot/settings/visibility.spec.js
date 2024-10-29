import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';

let translation;

test.describe('Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://admin.prod.buerokratt.ee/chat/chatbot/settings');
    translation = await getTranslations(page);
    await page.waitForTimeout(3000);
  });

  test.describe('Main Heading', () => {
    test('should display main heading', async ({ page }) => {
      const heading = await page.getByRole('heading', { name: `${translation.settings}`, exact: true });
      await expect(heading).toBeVisible();
    });
  });

  test.describe('Card Header', () => {
    test('should display and interact with chatbot active switch', async ({ page }) => {
      const switchLabel = await page.getByText(`${translation.chatbotActive}`, { exact: true });
      const switchButton = await page.getByRole('switch', { name: `${translation.chatbotActive}`, exact: true });
      await expect(switchLabel).toBeVisible();
      await expect(switchButton).toBeVisible();
      await switchButton.click(); // Toggle the switch
    });
  });

  test.describe('Card Body', () => {
    test('should display and interact with show support name switch', async ({ page }) => {
      const switchLabel = await page.getByText(`${translation.showSupportName}`, { exact: true });
      const switchButton = await page.getByRole('switch', { name: `${translation.showSupportName}`, exact: true });
      await expect(switchLabel).toBeVisible();
      await expect(switchButton).toBeVisible();
      await switchButton.click(); // Toggle the switch
    });

    test('should display and interact with show support title switch', async ({ page }) => {
      const switchLabel = await page.getByText(`${translation.showSupportTitle}`, { exact: true });
      const switchButton = await page.getByRole('switch', { name: `${translation.showSupportTitle}`, exact: true });
      await expect(switchLabel).toBeVisible();
      await expect(switchButton).toBeVisible();
      await switchButton.click(); // Toggle the switch
    });
  });

  test.describe('Card Footer', () => {
    test('should display Save button', async ({ page }) => {
      const saveButton = await page.getByText(`${translation.save}`, {exact: true });
      await expect(saveButton).toBeVisible();
    });
  });
});
