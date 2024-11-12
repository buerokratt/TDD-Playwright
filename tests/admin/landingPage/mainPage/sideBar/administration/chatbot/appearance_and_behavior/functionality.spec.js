// Buerokratt-Chatbot - Playwright Test File
import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';

let translation;

test.describe.serial('Buerokratt-Chatbot - Appearance and Behaviour', () => {

  test.beforeEach(async ({ page }) => {
    test.info().annotations.push({ type: 'repository', description: 'Buerokratt-Chatbot' });
    await page.goto('https://admin.prod.buerokratt.ee/chat/chatbot/appearance');
    await page.waitForTimeout(3000); // Wait for elements to load
    translation = await getTranslations(page);
  });

  test('Verify appearance and behavior main heading', async ({ page }) => {
    const heading = await page.getByRole('heading', { name: `${translation.appearanceAndBehaviour}`, exact: true });
    await expect(heading).toBeVisible();
  });

  test.describe('Card Body Elements', () => {

    test('Verify and reset "Widget Proactive Seconds" input visibility and functionality', async ({ page }) => {
      const input = await page.getByLabel(`${translation.widgetProactiveSeconds}`, { exact: true });
      const initialValue = await input.inputValue();
      
      await input.fill('5'); // Update to new value
      const saveButton = await page.getByText(`${translation.save}`, { exact: true });
      await saveButton.click();
      await page.waitForTimeout(3000); // Wait to save
      await page.reload();

      // Verify persistence
      await expect(input).toHaveValue('5');
      await input.fill(initialValue); // Reset to initial value
      await saveButton.click();
      await page.waitForTimeout(3000); // Wait to save
    });

    test('Verify "Widget Bubble Message Text" switch functionality', async ({ page }) => {
      const switchButton = await page.getByLabel(`${translation.widgetBubbleMessageText}`, { exact: true }).nth(0);
      await expect(switchButton).toBeVisible();
    });

    test('Verify "Widget Bubble Message Seconds" input visibility and functionality', async ({ page }) => {
      const input = await page.getByLabel(`${translation.widgetBubbleMessageSeconds}`, { exact: true });
      await expect(input).toBeVisible();
    });

    test('Verify and reset "Widget Bubble Message Text" text input visibility and functionality', async ({ page }) => {
      const input = await page.getByLabel(`${translation.widgetBubbleMessageText}`, { exact: true }).nth(1);
      const initialValue = await input.inputValue();

      await input.fill('New Text'); // Update to new value
      const saveButton = await page.getByText(`${translation.save}`, { exact: true });
      await saveButton.click();
      await page.waitForTimeout(3000); // Wait to save
      await page.reload();

      // Verify persistence
      await expect(input).toHaveValue('New Text');
      await input.fill(initialValue); // Reset to initial value
      await saveButton.click();
      await page.waitForTimeout(3000); // Wait to save
    });

    test('Verify and reset "Widget Color" color picker functionality', async ({ page }) => {
      const colorInput = await page.getByLabel(`${translation.widgetColor}`, { exact: true });
      await colorInput.click();
      const colorPickerInput = await page.getByLabel('hex');
      const initialColor = await colorPickerInput.inputValue();

      await colorPickerInput.fill('#FF5733'); // Set to a new color
      const saveButton = await page.getByText(`${translation.save}`, { exact: true });
      await saveButton.click();
      await page.waitForTimeout(3000); // Wait to save
      await page.reload();

      // Verify persistence
      await colorInput.click();
      await expect(colorPickerInput).toHaveValue('#FF5733');
      await colorPickerInput.fill(initialColor); // Reset to original color
      await saveButton.click();
      await page.waitForTimeout(3000); // Wait to save
    });

    test('Verify "Widget Animation" dropdown functionality', async ({ page }) => {
      const dropdown = await page.getByRole('combobox', { name: `${translation.widgetAnimation}`, exact: true });
      await dropdown.click(); // Open the dropdown

      // Locate specific dropdown options more accurately by using their role and exact match
      const optionJump = await page.getByRole('option', { name: 'Jump', exact: true });
      const optionShockwave = await page.getByRole('option', { name: 'Shockwave', exact: true });
      const optionWiggle = await page.getByRole('option', { name: 'Wiggle', exact: true });

      // Assert visibility for each option
      await expect(optionJump).toBeVisible();
      await expect(optionShockwave).toBeVisible();
      await expect(optionWiggle).toBeVisible();
    });
  });

  test.describe('Card Footer Buttons', () => {

    test('Verify Save button functionality', async ({ page }) => {
      const saveButton = await page.getByText(`${translation.save}`, { exact: true });
      await expect(saveButton).toBeVisible();
    });

    test('Verify Preview button functionality', async ({ page }) => {
      const previewButton = await page.getByText(`${translation.preview}`, { exact: true });
      await expect(previewButton).toBeVisible();
    });
  });

});
