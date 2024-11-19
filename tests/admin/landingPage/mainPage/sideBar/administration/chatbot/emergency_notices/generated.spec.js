import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';

let translation;

test.describe('Buerokratt-Chatbot: Emergency Notices', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the page
    await page.goto('https://admin.prod.buerokratt.ee/chat/chatbot/emergency-notices');

    // Fetch translations
    translation = await getTranslations(page);

    // Add annotation
    test.info().annotations.push({ type: 'repository', description: 'Buerokratt-Chatbot' });

    // Wait for elements to load
    await page.waitForTimeout(3000);
  });

  test('Validate heading and switch visibility', async ({ page }) => {
    const heading = await page.getByRole('heading', { name: `${translation.emergencyNotices}`, exact: true });
    const switchButton = await page.locator('.card__body').getByRole('switch', { name: `${translation.noticeActive}`, exact: true });

    await expect(heading).toBeVisible();
    await expect(switchButton).toBeVisible();
  });

  test('Validate textarea and label visibility', async ({ page }) => {
    const noticeTextarea = await page.locator('.card__body').getByLabel(`${translation.notice}`, { exact: true });
    const displayPeriodLabel = await page.locator('.card__body').getByText(`${translation.displayPeriod}`, { exact: true });

    await expect(noticeTextarea).toBeVisible();
    await expect(displayPeriodLabel).toBeVisible();
  });

  test('Validate datepicker visibility', async ({ page }) => {
    const firstDatepicker = await page.locator('.card__body .datepicker').nth(0);
    const secondDatepicker = await page.locator('.card__body .datepicker').nth(1);

    await expect(firstDatepicker).toBeVisible();
    await expect(secondDatepicker).toBeVisible();
  });

  test('Validate Save button visibility', async ({ page }) => {
    const saveButton = await page.locator('.card__footer').getByRole('button', { name: `${translation.save}`, exact: true });

    await expect(saveButton).toBeVisible();
  });
});
