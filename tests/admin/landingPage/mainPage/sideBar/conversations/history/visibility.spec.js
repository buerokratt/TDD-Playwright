import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';

let translation;

test.describe('Conversations-Module', () => {
  test.beforeEach(async ({ page }) => {
    test.info().annotations.push({ type: 'repository', description: 'Training-Module' });
    await page.goto('https://admin.prod.buerokratt.ee/chat/history');
    translation = await getTranslations(page);
    await page.waitForTimeout(3000);
  });

  test('should display the heading correctly', async ({ page }) => {
    const heading = await page.getByRole('heading', { name: `${translation.history}`, exact: true });
    await expect(heading).toBeVisible();
  });

  test.describe('Search card', () => {
    test('should display search input and date pickers', async ({ page }) => {
      const searchInput = await page.getByPlaceholder(`${translation.searchChats}`, { exact: true });
      const datepickerStart = await page.locator(`.datepicker`, { exact: true }).nth(0);
      const datepickerEnd = await page.locator(`.datepicker`, { exact: true }).nth(1);

      await expect(searchInput).toBeVisible();
      await expect(datepickerStart).toBeVisible();
      await expect(datepickerEnd).toBeVisible();
    });

    test('should display dropdown with correct options', async ({ page }) => {
      const dropdown = await page.getByText(new RegExp(translation.choose));
      await expect(dropdown).toBeVisible();
      await dropdown.click();

      // Array of option labels from translation
      const optionLabels = [
        translation.startTime,
        translation.endTime,
        translation.customerSupportName,
        translation.name,
        translation.idCode,
        translation.contact,
        translation.comment,
        translation.rating,
        translation.feedback,
        translation.status,
        translation.id
      ];

      // Loop through each label to verify visibility of the option with exact match
      for (const label of optionLabels) {
        await expect(page.getByRole('option', { name: `${label}`, exact: true })).toBeVisible();
      }
    });
  });

  test.describe('Table display', () => {
    test('should display table headers correctly', async ({ page }) => {
      const headers = [
        `${translation.startTime}`,
        `${translation.endTime}`,
        `${translation.customerSupportName}`,
        `${translation.name}`,
        `${translation.idCode}`,
        `${translation.contact}`,
        `${translation.comment}`,
        `${translation.rating}`,
        `${translation.feedback}`,
        `${translation.status}`,
        `${translation.id}`,
      ];

      const table = page.locator('.card__body table thead tr');
      for (const header of headers) {
        const headerLocator = await table.getByText(header, { exact: true });
        await expect(headerLocator).toBeVisible();
      }
    });

    test('should display data row with view button', async ({ page }) => {
      const tableRow = page.locator('.card__body table tbody tr').first();
      const viewButton = tableRow.getByRole('button', { name: `${translation.view}`, exact: true });
      await expect(viewButton).toBeVisible();
    });

    test('should display pagination label and select options', async ({ page }) => {
      const resultCountLabel = await page.getByText(`${translation.resultCount}`, { exact: true });
      const paginationSelect = await page.getByRole('combobox', { name: `${translation.resultCount}`, exact: true });

      await expect(resultCountLabel).toBeVisible();
      await expect(paginationSelect).toBeVisible();

      await paginationSelect.selectOption([
        { label: '10' },
        { label: '20' },
        { label: '30' },
        { label: '40' },
        { label: '50' },
      ]);
    });
  });
});
