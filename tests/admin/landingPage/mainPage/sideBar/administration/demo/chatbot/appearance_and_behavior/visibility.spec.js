import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';

let translation;

test.describe('Chat Appearance Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://admin.prod.buerokratt.ee/chat/chatbot/appearance');
    await page.waitForTimeout(3000);
    translation = await getTranslations(page);
  });

  test.describe('Header Section', () => {
    test('should display main heading', async ({ page }) => {
      const heading = await page.getByRole('heading', { 
        name: `${translation.appearanceAndBehaviour}` 
      });
      await expect(heading).toBeVisible();
    });
  });

  test.describe('Card Body Section', () => {
    test('should display widget proactive seconds input', async ({ page }) => {
      const label = await page.getByText(`${translation.widgetProactiveSeconds}`);
      const input = await page.getByLabel(`${translation.widgetProactiveSeconds}`);
      await expect(label).toBeVisible();
      await expect(input).toBeVisible();
      await expect(input).toHaveAttribute('type', 'number');
    });

    test('should display widget bubble message settings', async ({ page }) => {
      const switchLabel = await page.getByText(`${translation.widgetBubbleMessageText}`).nth(0);
      const switchButton = await page.locator(`label:has-text("${translation.widgetBubbleMessageText}") + button.switch__button`);
      await expect(switchLabel).toBeVisible();
      await expect(switchButton).toBeVisible();

      const secondsLabel = await page.getByText(`${translation.widgetBubbleMessageSeconds}`);
      const secondsInput = await page.getByLabel(`${translation.widgetBubbleMessageSeconds}`);
      await expect(secondsLabel).toBeVisible();
      await expect(secondsInput).toBeVisible();
      await expect(secondsInput).toHaveAttribute('type', 'number');

      const messageLabel = await page.getByText(`${translation.widgetBubbleMessageText}`).nth(1);
      const messageInput = await page.getByLabel(`${translation.widgetBubbleMessageText}`).nth(1);
      await expect(messageLabel).toBeVisible();
      await expect(messageInput).toBeVisible();
    });

    test('should display widget color picker', async ({ page }) => {
      const label = await page.getByText(`${translation.widgetColor}`);
      const colorPicker = await page.locator(`label:has-text("${translation.widgetColor}") + div input`);
      await expect(label).toBeVisible();
      await expect(colorPicker).toBeVisible();
    });

    test('should display widget animation dropdown', async ({ page }) => {
      const select = await page.getByRole('combobox', { 
        name: `${translation.widgetAnimation}` 
      });
      await expect(select).toBeVisible();
      
      // Verify dropdown options
      await select.click();
      const options = ['Jump', 'Shockwave', 'Wiggle'];
      for (const option of options) {
        const optionElement = await page.getByRole('option', { name: option });
        await expect(optionElement).toBeVisible();
      }
    });
  });

  test.describe('Card Footer Section', () => {
    test('should display action buttons', async ({ page }) => {
      const saveButton = await page.getByRole('button', { 
        name: `${translation.save}` 
      });
      const previewButton = await page.getByRole('button', { 
        name: `${translation.preview}` 
      });
      
      await expect(saveButton).toBeVisible();
      await expect(previewButton).toBeVisible();
    });
  });
});