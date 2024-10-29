import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';

let translation;

test.describe('Emergency Notices', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://admin.prod.buerokratt.ee/chat/chatbot/emergency-notices');
    translation = await getTranslations(page);
    await page.waitForTimeout(3000);
  });

  test.describe('Main Heading', () => {
    test('should display main heading', async ({ page }) => {
      const heading = await page.getByRole('heading', { name: `${translation.emergencyNotices}`, exact: true });
      await expect(heading).toBeVisible();
    });
  });

  test.describe('Card Body', () => {
    test('should display and interact with notice active switch', async ({ page }) => {
      const switchLabel = await page.getByText(`${translation.noticeActive}`, { exact: true });
      await expect(switchLabel).toBeVisible();
    });

    test('should display and interact with notice textarea', async ({ page }) => {
      const label = await page.getByText(`${translation.notice}`, { exact: true });
      const textarea = await page.getByLabel(`${translation.notice}`, { exact: true });
      await expect(label).toBeVisible();
      await expect(textarea).toBeVisible();
    });

    test('should display and interact with display period input', async ({ page }) => {
      const label = await page.getByText(`${translation.displayPeriod}`, { exact: true });
      const input = await page.getByLabel(`${translation.displayPeriod}`, { exact: true });
      await expect(label).toBeVisible();
      await expect(input).toBeVisible();
    });

    test('should display and interact with display period to input', async ({ page }) => {
      const label = await page.getByText(`${translation.to}`, { exact: true });
      const input = await page.getByLabel(`${translation.to}`, { exact: true });
      await expect(label).toBeVisible();
      await expect(input).toBeVisible();
    });
  });

  test.describe('Card Footer', () => {
    test('should display Save button', async ({ page }) => {
      const saveButton = await page.getByRole('button', { name: `${translation.save}`, exact: true });
      await expect(saveButton).toBeVisible();
    });
  });
});
