import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';
let translation;

test.describe('Buerokratt-Chatbot', () => {
  test.beforeEach(async ({ page }) => {
    test.info().annotations.push({ type: 'repository', description: 'Buerokratt-Chatbot' });
    await page.goto('https://admin.prod.buerokratt.ee/chat/chatbot/emergency-notices');
    translation = await getTranslations(page);
    await page.waitForTimeout(3000);
  });

  test('should display heading', async ({ page }) => {
    const heading = await page.getByRole('heading', { name: `${translation.emergencyNotices}`, exact: true });
    await expect(heading).toBeVisible();
  });

  test.describe('Card Body - Notice Active Switch', () => {
    test('should display and toggle Notice Active switch', async ({ page }) => {
      const cardBody = page.locator('.card__body').first();
      const switchLabel = await cardBody.getByText(`${translation.noticeActive}`, { exact: true });
      const switchButton = await cardBody.getByLabel(`${translation.noticeActive}`, { exact: true });

      await expect(switchLabel).toBeVisible();
      await expect(switchButton).toBeVisible();

      const initialState = await switchButton.isChecked();
      await switchButton.click();
      await expect(switchButton.isChecked()).not.toBe(initialState);

      // Revert to original state
      await switchButton.click();
    });
  });

  test.describe('Card Body - Notice Textarea', () => {
    test('should display and update Notice textarea', async ({ page }) => {
      const cardBody = page.locator('.card__body').first();
      const textareaLabel = await cardBody.getByText(`${translation.notice}`, { exact: true });
      const textarea = await cardBody.getByLabel(`${translation.notice}`, { exact: true });

      await expect(textareaLabel).toBeVisible();
      await expect(textarea).toBeVisible();

      const initialText = await textarea.inputValue();
      await textarea.fill('Updated Notice Message');
      const saveButton = await page.getByText(`${translation.save}`, { exact: true });
      await saveButton.click();
      await page.waitForTimeout(3000); 

      // Refresh page and verify persistence
      await page.reload();
      await expect(textarea).toHaveValue('Updated Notice Message');

      // Revert to original text
      await textarea.fill(initialText);
      await saveButton.click();
      await page.waitForTimeout(3000);
    });
  });

  test.describe('Card Body - Display Period Datepickers', () => {
    test('should display and update Display Period datepickers', async ({ page }) => {
      const cardBody = page.locator('.card__body').first();
      const displayPeriodLabel = await cardBody.getByText(`${translation.displayPeriod}`, { exact: true });
      await expect(displayPeriodLabel).toBeVisible();

      const datepickerStart = await page.locator('.datepicker', { exact: true }).nth(0);
      const datepickerEnd = await page.locator('.datepicker', { exact: true }).nth(1);
      const datepickerStartInput = await datepickerStart.locator('input').first();
      const datepickerEndInput = await datepickerEnd.locator('input').first();

      const initialStartDate = await datepickerStartInput.getAttribute('value');
      const initialEndDate = await datepickerEndInput.getAttribute('value');

      await datepickerStartInput.fill('01.01.2024');
      await datepickerEndInput.fill('31.12.2024');
      const saveButton = await page.getByText(`${translation.save}`, { exact: true });
      await saveButton.click();
      await page.waitForTimeout(3000); 

      // Refresh page and verify persistence
      await page.reload();
      await page.waitForTimeout(3000);
      await expect(datepickerStartInput).toHaveValue('01.01.2024');
      await expect(datepickerEndInput).toHaveValue('31.12.2024');

      // Revert to original dates
      await datepickerStartInput.fill(initialStartDate);
      await datepickerEndInput.fill(initialEndDate);
      await saveButton.click();
      await page.waitForTimeout(3000);
    });
  });
});
