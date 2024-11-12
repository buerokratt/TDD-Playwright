import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';

let translation;

test.describe('Buerokratt-Chatbot Welcome Message Visibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Annotation for repository
    test.info().annotations.push({ type: 'repository', description: 'Buerokratt-Chatbot' });

    // Navigate to the specified resource
    await page.goto('https://admin.prod.buerokratt.ee/chat/chatbot/welcome-message');

    // Fetch translations after page navigation
    translation = await getTranslations(page);

    // Allow time for elements to load
    await page.waitForTimeout(3000);
  });

  test('Main heading visibility', async ({ page }) => {
    const heading = await page.getByRole('heading', { name: `${translation.welcomeMessage}`, exact: true });
    await expect(heading).toBeVisible();
  });

  test.describe('Card body visibility tests', () => {
    test('Greeting Active switch visibility', async ({ page }) => {
      const cardBody = page.locator('.card__body');
      const greetingSwitchLabel = await cardBody.getByText(`${translation.greetingActive}`, { exact: true });
      const greetingSwitchButton = await cardBody.getByLabel(`${translation.greetingActive}`, { exact: true });

      await expect(greetingSwitchLabel).toBeVisible();
      await expect(greetingSwitchButton).toBeVisible();
    });

    test('Welcome Message textarea visibility', async ({ page }) => {
      const cardBody = page.locator('.card__body');
      const welcomeMessageLabel = await cardBody.getByText(`${translation.welcomeMessage}`, { exact: true });
      const welcomeMessageTextarea = await cardBody.getByLabel(`${translation.welcomeMessage}`, { exact: true });

      await expect(welcomeMessageLabel).toBeVisible();
      await expect(welcomeMessageTextarea).toBeVisible();
    });
  });

  test.describe('Card footer visibility tests', () => {
    test('Save button visibility', async ({ page }) => {
      const cardFooter = page.locator('.card__footer');
      const saveButton = await cardFooter.getByText(`${translation.save}`, { exact: true });
      await expect(saveButton).toBeVisible();
    });
  });
});
