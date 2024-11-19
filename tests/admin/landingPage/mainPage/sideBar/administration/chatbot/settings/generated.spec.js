import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';

let translation;

test.describe('Buerokratt-Chatbot Settings', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the page
    await page.goto('https://admin.prod.buerokratt.ee/chat/chatbot/settings');

    // Fetch translations
    translation = await getTranslations(page);

    // Add annotation
    test.info().annotations.push({ type: 'repository', description: 'Buerokratt-Chatbot' });

    // Wait for elements to load
    await page.waitForTimeout(3000);
  });

  test('Validate main heading visibility', async ({ page }) => {
    const heading = await page.getByRole('heading', { name: `${translation.settings}`, exact: true });
    await expect(heading).toBeVisible();
  });

  test('Validate visibility of switches in card header', async ({ page }) => {
    const cardHeader = page.locator('.card__header');
    const chatbotActiveSwitch = await cardHeader.getByRole('switch', { name: `${translation.chatbotActive}`, exact: true });
    await expect(chatbotActiveSwitch).toBeVisible();
  });

  test('Validate visibility of switches in card body', async ({ page }) => {
    const cardBody = page.locator('.card__body');
    const showSupportNameSwitch = await cardBody.getByRole('switch', { name: `${translation.showSupportName}`, exact: true });
    const showSupportTitleSwitch = await cardBody.getByRole('switch', { name: `${translation.showSupportTitle}`, exact: true });

    await expect(showSupportNameSwitch).toBeVisible();
    await expect(showSupportTitleSwitch).toBeVisible();
  });

  test('Validate visibility of Save button in card footer', async ({ page }) => {
    const cardFooter = page.locator('.card__footer');
    const saveButton = await cardFooter.getByRole('button', { name: `${translation.save}`, exact: true });

    await expect(saveButton).toBeVisible();
  });
});
