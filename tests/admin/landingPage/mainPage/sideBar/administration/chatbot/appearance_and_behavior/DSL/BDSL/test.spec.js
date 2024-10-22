import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';

let translation;

test.describe('Appearance and Behaviour Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigation and translation setup
    await page.goto('https://admin.prod.buerokratt.ee/chat/chatbot/appearance');
    translation = await getTranslations(page);
    await page.waitForTimeout(3000);
  });

  test.describe('Heading Tests', () => {
    test('Check visibility of heading', async ({ page }) => {
      const heading = page.locator(`h1:has-text("${translation.appearanceAndBehaviour}")`);
      await expect(heading).toBeVisible();
    });
  });

  test.describe('Card Body Tests', () => {
    test('Check visibility of Widget proactive seconds label and input', async ({ page }) => {
      const labelProactive = page.locator(`label:has-text("${translation.widgetProactiveSeconds}")`);
      const inputProactive = labelProactive.locator('..').locator('input');
      await expect(labelProactive).toBeVisible();
      await expect(inputProactive).toBeVisible();
    });

    test('Check visibility of Widget bubble message text switch', async ({ page }) => {
      const switchBubble = page.locator(`label:has-text("${translation.widgetBubbleMessageText}") + button.switch__button`);
      await expect(switchBubble).toBeVisible();
    });

    test('Check visibility of Widget bubble message seconds label and input', async ({ page }) => {
      const labelBubbleSeconds = page.locator(`label:has-text("${translation.widgetBubbleMessageSeconds}")`);
      const inputBubbleSeconds = labelBubbleSeconds.locator('..').locator('input');
      await expect(labelBubbleSeconds).toBeVisible();
      await expect(inputBubbleSeconds).toBeVisible();
    });

    test('Check visibility of Widget color picker', async ({ page }) => {
      const colorPickerButton = page.locator(`label:has-text("${translation.widgetColor}") + div input`);
      await expect(colorPickerButton).toBeVisible();
    });

    test('Check visibility of Widget animation dropdown', async ({ page }) => {
      const select = await page.getByRole('combobox', { name: `${translation.widgetAnimation}` });
      await expect(select).toBeVisible();
    });
  });

  test.describe('Card Footer Tests', () => {
    test('Check visibility of Save button', async ({ page }) => {
      const saveButton = page.locator(`button:has-text("${translation.save}")`);
      await expect(saveButton).toBeVisible();
    });

    test('Check visibility of Preview button', async ({ page }) => {
      const previewButton = page.locator(`button:has-text("${translation.preview}")`);
      await expect(previewButton).toBeVisible();
    });
  });
});
