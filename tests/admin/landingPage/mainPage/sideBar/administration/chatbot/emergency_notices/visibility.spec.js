const { test, expect } = require('@playwright/test');
import { getTranslations } from '@translation/languageDetector.js';


test.describe('Erakorralised Teated/Emergency notices Page Visibility', () => {
  let translation

  test.beforeEach(async ({ page }) => {
    test.info().annotations.push({ type: 'repository', description: 'Buerokratt-Chatbot' });
    await page.goto('https://admin.prod.buerokratt.ee/chat/chatbot/emergency-notices');
    translation = await getTranslations(page)
  });

  test('Check if "Erakorralised teated" header is present', async ({ page }) => {
    const header = await page.locator(`h1:has-text("${translation["emergencyNotices"]}")`);
    await expect(header).toBeVisible();
  });

  test('Check if "Teade aktiivne" switch button is present', async ({ page }) => {
    const switchButton = await page.locator(`.switch:has(.switch__label:has-text("${translation["noticeActive"]}")) button[role="switch"]`);
    await expect(switchButton).toBeVisible();
  });

  test('Check if "Teade" input field is present', async ({ page }) => {
    const teadeInput = await page.locator(`.textarea:has(.textarea__label:has-text("${translation["notice"]}")) textarea`);
    await expect(teadeInput).toBeVisible();
  });


  test('Check if "Kuvamisperiood" date inputs are present', async ({ page }) => {

    const displayPeriodLabel = page.locator(`p:has-text("${translation.displayPeriod}")`);
    await expect(displayPeriodLabel).toBeVisible();

    const startDateInput = page.locator('.datepicker input[type="text"]').nth(0);
    await expect(startDateInput).toBeVisible();

    const dateUntilLabel = page.locator(`.track span:has-text("${translation.dateUntil}")`);
    await expect(dateUntilLabel).toBeVisible();

    const endDateInput = page.locator('.datepicker input[type="text"]').nth(1);
    await expect(endDateInput).toBeVisible();
  });

  test('Check if "Salvesta" button is present', async ({ page }) => {
    const saveButton = await page.locator(`button.btn--primary:has-text("${translation["save"]}")`);
    await expect(saveButton).toBeVisible();
  });
});
