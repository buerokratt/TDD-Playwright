import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';

let translation;

test.describe('Appearance and Behaviour', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('https://admin.prod.buerokratt.ee/chat/chatbot/appearance');
    translation = await getTranslations(page);
    await page.waitForTimeout(3000); // Ensure all elements load properly
  });

  test.describe('Main Heading', () => {
    test('should display the main heading', async ({ page }) => {
      const heading = await page.getByRole('heading', { name: `${translation.appearanceAndBehaviour}`, exact: true });
      await expect(heading).toBeVisible();
    });
  });

  test.describe('Card Body', () => {
    
    test('should display and interact with widget proactive seconds input', async ({ page }) => {
      const label = await page.getByText(`${translation.widgetProactiveSeconds}`, { exact: true });
      const input = await page.getByLabel(`${translation.widgetProactiveSeconds}`, { exact: true });
      await expect(label).toBeVisible();
      await expect(input).toBeVisible();
    });

    test('should toggle widget bubble message switch', async ({ page }) => {
      const label = await page.getByText(`${translation.widgetBubbleMessageText}`).nth(0);
      const switchButton = await page.getByText(`${translation.widgetBubbleMessageText}`, { exact: true }).nth(0);
      await expect(label).toBeVisible();
      await switchButton.click();
    });

    test('should display widget bubble message seconds input', async ({ page }) => {
      const label = await page.getByText(`${translation.widgetBubbleMessageSeconds}`, { exact: true });
      const input = await page.getByLabel(`${translation.widgetBubbleMessageSeconds}`, { exact: true });
      await expect(label).toBeVisible();
      await expect(input).toBeVisible();
    });

    test('should display and interact with widget bubble message text input', async ({ page }) => {
      const label = await page.getByText(`${translation.widgetBubbleMessageText}`, { exact: true }).nth(1);
      const input = await page.getByLabel(`${translation.widgetBubbleMessageText}`, { exact: true }).nth(1);
      await expect(label).toBeVisible();
      await expect(input).toBeVisible();
    });

    test('should open color pallet for widget color input', async ({ page }) => {
      const label = await page.getByText(`${translation.widgetColor}`, { exact: true });
      const input = await page.getByLabel(`${translation.widgetColor}`, { exact: true });
      await expect(label).toBeVisible();
      await input.click(); // Assume this opens the color pallet
    });

    test('should select widget animation from dropdown', async ({ page }) => {
      const select = await page.getByRole('combobox', { name: `${translation.widgetAnimation}`, exact: true });
      await expect(select).toBeVisible();
    });
  });

  test.describe('Card Footer', () => {
    
    test('should display and interact with Save and Preview buttons', async ({ page }) => {
      const saveButton = await page.getByRole('button', { name: `${translation.save}`, exact: true });
      const previewButton = await page.getByRole('button', { name: `${translation.preview}`, exact: true });
      await expect(saveButton).toBeVisible();
      await expect(previewButton).toBeVisible();
      await saveButton.click();
    });
  });
});
