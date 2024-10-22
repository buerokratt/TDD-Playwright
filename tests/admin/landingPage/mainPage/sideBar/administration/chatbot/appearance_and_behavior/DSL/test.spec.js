import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';

let translation;

test.describe('Appearance and Behaviour Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://admin.prod.buerokratt.ee/chat/chatbot/appearance');
    translation = await getTranslations(page);
    await page.waitForTimeout(3000); // Ensure all elements load properly
  });

  test('Check page heading visibility', async ({ page }) => {
    const headingLocator = page.locator(`h1:has-text("${translation.appearanceAndBehaviour}")`);
    await expect(headingLocator).toBeVisible();
  });

  test.only('Check proactive seconds label and input visibility', async ({ page }) => {
    const label = await page.getByText(`${translation.widgetProactiveSeconds}`);
    const input = await page.getByLabel(`${translation.widgetProactiveSeconds}`);
    
    await expect(label).toBeVisible();
    await expect(input).toBeVisible();

    // const labelLocator = page.locator(`label:has-text("${translation.widgetProactiveSeconds}")`);
    // await expect(labelLocator).toBeVisible();
    // const inputLocator = page.locator(`label:has-text("${translation.widgetProactiveSeconds}") + input[type="number"]`);
    // await expect(inputLocator).toBeVisible();
  });

  test('Check bubble message text switch visibility', async ({ page }) => {
    const switchLocator = page.locator(`label:has-text("${translation.widgetBubbleMessageText}") + button.switch__button`);
    await expect(switchLocator).toBeVisible();
  });

  test('Check bubble message seconds label and input visibility', async ({ page }) => {
    const labelLocator = page.locator(`label:has-text("${translation.widgetBubbleMessageSeconds}")`);
    await expect(labelLocator).toBeVisible();
    const inputLocator = page.locator(`label:has-text("${translation.widgetBubbleMessageSeconds}") + input[type="number"]`);
    await expect(inputLocator).toBeVisible();
  });

  test('Check widget color input visibility', async ({ page }) => {
    const colorPickerLocator = page.locator(`label:has-text("${translation.widgetColor}") + div input`);
    await expect(colorPickerLocator).toBeVisible();
  });

  test('Check widget animation select visibility', async ({ page }) => {
    const select = await page.getByRole('combobox', { name: `${translation.widgetAnimation}` });
    await expect(select).toBeVisible();
  });

  test('Check save button visibility', async ({ page }) => {
    const saveButton = page.locator(`button:has-text("${translation.save}")`);
    await expect(saveButton).toBeVisible();
  });

  test('Check preview button visibility', async ({ page }) => {
    const previewButton = page.locator(`button:has-text("${translation.preview}")`);
    await expect(previewButton).toBeVisible();
  });
});
