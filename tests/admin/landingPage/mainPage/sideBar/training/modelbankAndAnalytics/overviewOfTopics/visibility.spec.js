import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';

let translation;

test.describe('Training-Module - Visibility Tests', () => {

  test.beforeEach(async ({ page }) => {
    test.info().annotations.push({ type: 'repository', description: 'Training-Module' });
    await page.goto('https://admin.prod.buerokratt.ee/training/analytics/overview');
    await page.waitForTimeout(3000); // Ensure all elements are loaded
    translation = await getTranslations(page);
  });

  test('Heading visibility - Intents Overview', async ({ page }) => {
    const heading = await page.getByRole('heading', { name: `${translation.intentsOverview}`, exact: true });
    await expect(heading).toBeVisible();
  });

  test('Dropdown visibility - Report Overview', async ({ page }) => {
    const dropdown = await page.getByLabel(`${translation.reportOverview}`, { exact: true }).first();
    await expect(dropdown).toBeVisible();
  });

  test('Paragraphs visibility in card body', async ({ page }) => {
    const cardBody = page.locator('.card__body').first();
    const paragraphs = cardBody.locator('p');

    for (let i = 0; i < await paragraphs.count(); i++) {
      await expect(paragraphs.nth(i)).toBeVisible();
    }
  });

  test('Search input visibility', async ({ page }) => {
    const searchInput = await page.getByPlaceholder(`${translation.search}`);
    await expect(searchInput).toBeVisible();
  });

  test('Table headers visibility', async ({ page }) => {
    const tableHeaders = page.getByRole('table').locator('thead');

    const intentHeader = tableHeaders.getByRole('cell', { name: `${translation.intent}`, exact: true });
    const examplesHeader = tableHeaders.getByRole('cell', { name: `${translation.examples}`, exact: true });
    const f1ScoreHeader = tableHeaders.getByRole('cell', { name: `${translation.f1Score}`, exact: true });

    await expect(intentHeader).toBeVisible();
    await expect(examplesHeader).toBeVisible();
    await expect(f1ScoreHeader).toBeVisible();
  });

  test('Table first row visibility', async ({ page }) => {
    const tableBody = page.getByRole('table').locator('tbody');
    const firstRow = tableBody.getByRole('row').first();
    await expect(firstRow).toBeVisible();
  });

  test('Button visibility - Go to example', async ({ page }) => {
    const tableBody = page.getByRole('table').locator('tbody');
    const rows = tableBody.locator('tr');

    for (let i = 0; i < await rows.count(); i++) {
      const button = rows.nth(i).getByText(`${translation.goToExample}`, { exact: true });
      await expect(button).toBeVisible();
    }
  });
});
