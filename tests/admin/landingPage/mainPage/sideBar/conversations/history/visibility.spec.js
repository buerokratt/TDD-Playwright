// test/history.spec.js
import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';

let translation;

test.describe('Buerokratt-Chatbot', () => {
  test.beforeEach(async ({ page }) => {
    test.info().annotations.push({ type: 'repository', description: 'Buerokratt-Chatbot' });
    await page.goto('https://admin.prod.buerokratt.ee/chat/history');
    translation = await getTranslations(page);
    await page.waitForTimeout(3000);
  });

  test('Verify heading is visible', async ({ page }) => {
    const heading = await page.getByRole('heading', { name: `${translation.history}`, exact: true });
    await expect(heading).toBeVisible();
  });

  test.describe('Card body - Search and datepicker inputs', () => {
    test('Verify search input visibility', async ({ page }) => {
      const searchInput = await page.getByPlaceholder(`${translation.searchChats}`, { exact: true });
      await expect(searchInput).toBeVisible();
    });

    test('Verify datepicker inputs visibility', async ({ page }) => {
      const datepickerStart = await page.locator('.datepicker').nth(0);
      const datepickerEnd = await page.locator('.datepicker').nth(1);
      await expect(datepickerStart).toBeVisible();
      await expect(datepickerEnd).toBeVisible();
    });
  });

  test.describe('Card body - Dropdown verification', () => {
    test('Verify dropdown element visibility', async ({ page }) => {
      const select = await page.locator('.select', { exact: true });
      await expect(select).toBeVisible();
    });
  });

  test.describe('Card body - Table verification', () => {
    test('Verify table headers and first row visibility', async ({ page }) => {
      const tableBody = page.getByRole('table').locator('tbody');
      const firstRow = tableBody.getByRole('row').first();
      await expect(firstRow).toBeVisible();
    });

    test('Verify "View" button in table row is visible', async ({ page }) => {
      const tableBody = page.getByRole('table').locator('tbody');
      const firstRow = tableBody.getByRole('row').first();
      const viewButton = firstRow.getByRole('button', { name: `${translation.view}`, exact: true });
      await expect(viewButton).toBeVisible();
    });
  });

  test('Verify pagination result count label and dropdown', async ({ page }) => {
    const resultCountLabel = await page.getByText(`${translation.resultCount}`, { exact: true });
    const paginationSelect = await page.getByRole('combobox', { name: `${translation.resultCount}`, exact: true });
    await expect(resultCountLabel).toBeVisible();
    await expect(paginationSelect).toBeVisible();
  });
});
