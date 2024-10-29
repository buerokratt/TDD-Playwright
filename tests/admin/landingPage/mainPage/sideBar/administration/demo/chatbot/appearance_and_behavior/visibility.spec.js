import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';

let translation;

test.describe('Appearance and Behaviour', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://admin.prod.buerokratt.ee/chat/chatbot/appearance');
    translation = await getTranslations(page);
    await page.waitForTimeout(3000);
  });

  test('Heading verification', async ({ page }) => {
    const heading = await page.getByRole('heading', { name: `${translation.appearanceAndBehaviour}` });
    await expect(heading).toBeVisible();
  });

  test.describe('Card Body', () => {
    test('Widget proactive seconds input visibility', async ({ page }) => {
      const label = await page.getByText(`${translation.widgetProactiveSeconds}`);
      const input = await page.getByLabel(`${translation.widgetProactiveSeconds}`);
      await expect(label).toBeVisible();
      await expect(input).toBeVisible();
    });

    test('Widget bubble message text switch visibility', async ({ page }) => {
      const label = await page.getByText(`${translation.widgetBubbleMessageText}`).nth(0);
      const switchButton = await page.locator(`label:has-text("${translation.widgetBubbleMessageText}") + button.switch__button`);
      await expect(label).toBeVisible();
      await expect(switchButton).toBeVisible();
    });

    test('Widget bubble message seconds input visibility', async ({ page }) => {
      const label = await page.getByText(`${translation.widgetBubbleMessageSeconds}`);
      const input = await page.getByLabel(`${translation.widgetBubbleMessageSeconds}`);
      await expect(label).toBeVisible();
      await expect(input).toBeVisible();
    });

    test('Widget bubble message text input visibility', async ({ page }) => {
      const label = await page.getByText(`${translation.widgetBubbleMessageText}`).nth(1);
      const input = await page.getByLabel(`${translation.widgetBubbleMessageText}`).nth(1);
      await expect(label).toBeVisible();
      await expect(input).toBeVisible();
    });

    test('Widget color input visibility', async ({ page }) => {
      const label = await page.getByText(`${translation.widgetColor}`);
      const colorInput = await page.locator(`label:has-text("${translation.widgetColor}") + div input`);
      await expect(label).toBeVisible();
      await expect(colorInput).toBeVisible();
    });

    test('Widget animation dropdown visibility', async ({ page }) => {
      const select = await page.getByRole('combobox', { name: `${translation.widgetAnimation}` });
      await expect(select).toBeVisible();
    });
  });

  test.describe('Card Footer', () => {
    test('Save button visibility', async ({ page }) => {
      const saveButton = await page.getByRole('button', { name: `${translation.save}` });
      await expect(saveButton).toBeVisible();
    });

    test('Preview button visibility', async ({ page }) => {
      const previewButton = await page.getByRole('button', { name: `${translation.preview}` });
      await expect(previewButton).toBeVisible();
    });
  });
});
