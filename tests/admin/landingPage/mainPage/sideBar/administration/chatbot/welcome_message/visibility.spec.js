import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';

let translation;

test.describe('Settings - Welcome Message', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://admin.prod.buerokratt.ee/chat/chatbot/welcome-message');
    translation = await getTranslations(page);
    await page.waitForTimeout(3000);
  });

  test('Heading verification', async ({ page }) => {
    const heading = await page.getByRole('heading', { name: `${translation.welcomeMessage}` });
    await expect(heading).toBeVisible();
  });

  test.describe('Card Body', () => {
    test('Greeting Active switch visibility', async ({ page }) => {
      const container = page.locator('.card');
      const label = container.getByText(`${translation.greetingActive}`);
      const switchButton = container.locator(`label:has-text("${translation.greetingActive}") + button.switch__button`);
      await expect(label).toBeVisible();
      await expect(switchButton).toBeVisible();
    });

    test('Welcome Message textarea visibility', async ({ page }) => {
      const container = page.locator('.card');
      const label = container.getByText(`${translation.welcomeMessage}`);
      const textarea = container.getByLabel(`${translation.welcomeMessage}`);
      await expect(label).toBeVisible();
      await expect(textarea).toBeVisible();
    });
  });

  test.describe('Card Footer', () => {
    test('Save button visibility', async ({ page }) => {
      const container = page.locator('.card__footer');
      const saveButton = container.getByRole('button', { name: `${translation.save}` });
      await expect(saveButton).toBeVisible();
    });
  });
});
