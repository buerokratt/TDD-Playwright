import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';

let translation;

test.describe('Appearance and Behaviour', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://admin.prod.buerokratt.ee/chat/chatbot/appearance');
    translation = await getTranslations(page);
    await page.waitForTimeout(3000);
  });

  test.describe('Heading', () => {
    test('should display heading with correct text', async ({ page }) => {
      const heading = await page.getByRole('heading', { name: `${translation.appearanceAndBehaviour}`, exact: true });
      await expect(heading).toBeVisible();
    });
  });

  test.describe('Card Body', () => {
    test('should display proactive seconds input and bubble message text switch', async ({ page }) => {
      const proactiveSecondsInput = await page.getByLabel(`${translation.widgetProactiveSeconds}`, { exact: true });
      const bubbleMessageSwitch = await page.getByText(`${translation.widgetBubbleMessageText}`).nth(0);
      await expect(proactiveSecondsInput).toBeVisible();
      await expect(bubbleMessageSwitch).toBeVisible();
    });

    test('should display bubble message seconds input', async ({ page }) => {
      const bubbleMessageSecondsInput = await page.getByLabel(`${translation.widgetBubbleMessageSeconds}`, { exact: true });
      await expect(bubbleMessageSecondsInput).toBeVisible();
    });

    test('should display widget bubble message text input', async ({ page }) => {
      const bubbleMessageTextInput = await page.getByText(`${translation.widgetBubbleMessageText}`).nth(1);
      await expect(bubbleMessageTextInput).toBeVisible();
    });

    test('should display widget color input with color picker button', async ({ page }) => {
      const widgetColorInput = await page.getByLabel(`${translation.widgetColor}`, { exact: true });
      await expect(widgetColorInput).toBeVisible();
    });

    test('should display animation dropdown with correct options', async ({ page }) => {
      const animationSelect = await page.getByRole('combobox', { name: `${translation.widgetAnimation}`, exact: true });
      await expect(animationSelect).toBeVisible();
    });
  });

  test.describe('Card Footer', () => {
    test('should display Save and Preview buttons', async ({ page }) => {
      const saveButton = await page.getByText(`${translation.save}`, { exact: true });
      const previewButton = await page.getByText(`${translation.preview}`, { exact: true });
      await expect(saveButton).toBeVisible();
      await expect(previewButton).toBeVisible();
    });
  });
});
