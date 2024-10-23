// file: tests/chat/chatbot/settings.spec.js

import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';

let translation;

test.describe('Settings Page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('https://admin.prod.buerokratt.ee/chat/chatbot/settings');
    translation = await getTranslations(page);
    await page.waitForTimeout(3000); // Ensure elements are loaded
  });

  test.describe('Main Heading', () => {
    test('should display the Settings heading', async ({ page }) => {
      const heading = await page.locator(`h1:has-text("${translation.settings}")`);
      await expect(heading).toBeVisible();
    });
  });

  test.describe('Card Header', () => {
    test('should have "Chatbot active" switch', async ({ page }) => {
      const label = await page.getByText(`${translation.chatbotActive}`);
      const switchButton = await page.locator(`label:has-text("${translation.chatbotActive}") + button.switch__button`);
      await expect(label).toBeVisible();
      await expect(switchButton).toBeVisible();
    });
  });

  test.describe('Card Body', () => {
    test('should have "Show support name" switch', async ({ page }) => {
      const label = await page.getByText(`${translation.showSupportName}`);
      const switchButton = await page.locator(`label:has-text("${translation.showSupportName}") + button.switch__button`);
      await expect(label).toBeVisible();
      await expect(switchButton).toBeVisible();
    });

    test('should have "Show support title" switch', async ({ page }) => {
      const label = await page.getByText(`${translation.showSupportTitle}`);
      const switchButton = await page.locator(`label:has-text("${translation.showSupportTitle}") + button.switch__button`);
      await expect(label).toBeVisible();
      await expect(switchButton).toBeVisible();
    });
  });

  test.describe('Card Footer', () => {
    test('should have a Save button', async ({ page }) => {
      const saveButton = await page.getByText(`${translation.save}`);
      await expect(saveButton).toBeVisible();
    });
  });
});
