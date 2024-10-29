import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';

let translation;

test.describe('Appearance and Behaviour Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://admin.prod.buerokratt.ee/chat/chatbot/appearance');
    await page.waitForTimeout(3000);
    translation = await getTranslations(page);
  });

  test.describe('Heading Check', () => {
    test('should display the main heading correctly', async ({ page }) => {
      const heading = page.getByRole('heading', { name: `${translation.appearanceAndBehaviour}`, exact: true });
      await expect(heading).toBeVisible();
    });
  });

  test.describe('Card Body Tests', () => {
    test('should display widget proactive seconds input', async ({ page }) => {
      const container = page.locator('.card');
      const label = await container.getByText(`${translation.widgetProactiveSeconds}`);
      const input = await container.getByLabel(`${translation.widgetProactiveSeconds}`);
      await expect(label).toBeVisible();
      await expect(input).toBeVisible();
    });

    test('should display widget bubble message text switch', async ({ page }) => {
      const container = page.locator('.card');
      const label = await container.getByText(`${translation.widgetBubbleMessageText}`).nth(0);
      const switchButton = label.locator('+ button.switch__button');
      await expect(label).toBeVisible();
      await expect(switchButton).toBeVisible();
    });

    test('should display widget bubble message seconds input', async ({ page }) => {
      const container = page.locator('.card');
      const label = await container.getByText(`${translation.widgetBubbleMessageSeconds}`);
      const input = await container.getByLabel(`${translation.widgetBubbleMessageSeconds}`);
      await expect(label).toBeVisible();
      await expect(input).toBeVisible();
    });

    test('should display widget bubble message text input', async ({ page }) => {
      const container = page.locator('.card');
      const label = await container.getByText(`${translation.widgetBubbleMessageText}`).nth(1);
      const input = await container.getByLabel(`${translation.widgetBubbleMessageText}`).nth(1);
      await expect(label).toBeVisible();
      await expect(input).toBeVisible();
    });

    test('should display widget color input and color picker', async ({ page }) => {
      const container = page.locator('.card');
      const label = container.locator(`label:has-text("${translation.widgetColor}")`);
      const colorInput = label.locator('+ div input');
      await expect(label).toBeVisible();
      await expect(colorInput).toBeVisible();
    });

    test('should display widget animation dropdown', async ({ page }) => {
      const container = page.locator('.card');
      const select = await container.getByRole('combobox', { name: `${translation.widgetAnimation}`, exact: true });
      await expect(select).toBeVisible();
    });
  });

  test.describe('Card Footer Tests', () => {
    test('should display Save and Preview buttons', async ({ page }) => {
      const container = page.locator('.card__footer');
      const saveButton = container.getByRole('button', { name: `${translation.save}`, exact: true });
      const previewButton = container.getByRole('button', { name: `${translation.preview}`, exact: true });
      await expect(saveButton).toBeVisible();
      await expect(previewButton).toBeVisible();
    });
  });
});
