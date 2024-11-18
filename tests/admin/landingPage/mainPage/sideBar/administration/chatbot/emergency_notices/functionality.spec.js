import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';

let translation;

test.describe('Buerokratt-Chatbot Emergency Notices Tests', () => {
  test.beforeEach(async ({ page }) => {
    test.info().annotations.push({ type: 'repository', description: 'Emergency notices' });
    await page.goto('https://admin.prod.buerokratt.ee/chat/chatbot/emergency-notices');
    translation = await getTranslations(page);
    await page.waitForTimeout(3000); // Ensures all elements load properly
  });

  test.describe('Heading', () => {
    test('should display the heading', async ({ page }) => {
      const heading = await page.getByRole('heading', { name: `${translation.emergencyNotices}`, exact: true });
      await expect(heading).toBeVisible();
    });
  });

  test.describe('Card Body', () => {
    let cardBody;

    test.beforeEach(async ({ page }) => {
      cardBody = page.locator('.card__body');
    });

    test('should display and toggle notice active switch', async ({ page }) => {
      const label = cardBody.getByText(`${translation.noticeActive}`, { exact: true });
      const switchButton = cardBody.getByLabel(`${translation.noticeActive}`, { exact: true });
      await expect(label).toBeVisible();
      await expect(switchButton).toBeVisible();

      const initialValue = await switchButton.isChecked();
      await switchButton.click();
      await page.waitForTimeout(3000);
      await switchButton.click(); // Reset to initial value
      const finalValue = await switchButton.isChecked();
      expect(finalValue).toBe(initialValue);
    });

    test('should display and edit notice textarea', async ({ page }) => {
      const label = cardBody.getByText(`${translation.notice}`, { exact: true });
      const textarea = cardBody.getByLabel(`${translation.notice}`, { exact: true });
      await expect(label).toBeVisible();
      await expect(textarea).toBeVisible();

      const initialValue = await textarea.inputValue();
      await textarea.fill('Updated emergency notice text');
      const saveButton = page.getByText(`${translation.save}`, { exact: true });
      await saveButton.click();
      await page.waitForTimeout(3000);
      await page.reload();
      await page.waitForTimeout(3000);

      const updatedValue = await textarea.inputValue();
      expect(updatedValue).toBe('Updated emergency notice text');

      // Reset to initial value
      await textarea.fill(initialValue);
      await saveButton.click();
      await page.waitForTimeout(3000);
    });

    test('should display and edit display period date pickers', async ({ page }) => {
      const label = cardBody.getByText(`${translation.displayPeriod}`, { exact: true });
      const startDatePicker = cardBody.locator('.datepicker').nth(0);
      const endDatePicker = cardBody.locator('.datepicker').nth(1);

      await expect(label).toBeVisible();
      await expect(startDatePicker).toBeVisible();
      await expect(endDatePicker).toBeVisible();

      const startInput = startDatePicker.locator('input').first();
      const endInput = endDatePicker.locator('input').first();

      const initialStartValue = await startInput.getAttribute('value');
      const initialEndValue = await endInput.getAttribute('value');

      await startInput.fill('01.01.2024');
      await endInput.fill('31.12.2024');

      const saveButton = page.getByText(`${translation.save}`, { exact: true });
      await saveButton.click();
      await page.waitForTimeout(3000);
      await page.reload();
      await page.waitForTimeout(3000);

      const updatedStartValue = await startInput.getAttribute('value');
      const updatedEndValue = await endInput.getAttribute('value');

      expect(updatedStartValue).toBe('01.01.2024');
      expect(updatedEndValue).toBe('31.12.2024');

      // Reset to initial values
      await startInput.fill(initialStartValue);
      await endInput.fill(initialEndValue);
      await saveButton.click();
      await page.waitForTimeout(3000);
    });
  });

  test.describe('Card Footer', () => {
    let cardFooter;

    test.beforeEach(async ({ page }) => {
      cardFooter = page.locator('.card__footer');
    });

    test('should display save button', async ({ page }) => {
      const saveButton = cardFooter.getByText(`${translation.save}`, { exact: true });
      await expect(saveButton).toBeVisible();
    });
  });
});
