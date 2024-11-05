import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';

let translation;

test.describe('Training Module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://admin.prod.buerokratt.ee/training/analytics/models');
    test.info().annotations.push({ type: 'repository', description: 'Training-Module' });
    translation = await getTranslations(page);
    await new Promise(resolve => setTimeout(resolve, 3000)); // Ensure all elements load
  });

  test('Heading and Selected Model Card', async ({ page }) => {
    const heading = await page.getByRole('heading', { name: `${translation.models}`, exact: true });
    await expect(heading).toBeVisible();

    const selectedModelHeader = await page.getByText(`${translation.selectedModel}`, { exact: true });
    await expect(selectedModelHeader).toBeVisible();

    const cardBody = page.locator('.card__body').first();
    const paragraphs = cardBody.locator('p');

    for (let i = 0; i < await paragraphs.count(); i++) {
      await expect(paragraphs.nth(i)).toBeVisible();
    }

    const deleteButton = await cardBody.getByRole('button', { name: `${translation.delete}`, exact: true });
    await expect(deleteButton).toBeVisible();
  });

  test('All Models Card', async ({ page }) => {
    const allModelsHeader = await page.getByText(`${translation.allModels}`, { exact: true });
    await expect(allModelsHeader).toBeVisible();

    const table = page.getByRole('table').first();
    await expect(table).toBeVisible();

    const firstRow = table.locator('tr').first();
    await expect(firstRow).toBeVisible();

    // Get all cells in the first row
    const cells = firstRow.getByRole('cell');
    await expect(cells).toHaveCount(4); // Ensure there are at least 4 cells

    const versionCell = cells.nth(0);
    const nameCell = cells.nth(1);
    const lastTrainedCell = cells.nth(2);
    const liveCell = cells.nth(3);

    await expect(versionCell).toBeVisible();
    await expect(nameCell).toBeVisible();
    await expect(lastTrainedCell).toBeVisible();
    await expect(liveCell).toBeVisible();


  });

});
