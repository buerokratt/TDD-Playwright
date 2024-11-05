// playwright/tests/trainingModule.spec.js

import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';

let translation;

test.describe('Training Module - Overview', () => {
  test.beforeEach(async ({ page }) => {
    test.info().annotations.push({ type: 'repository', description: 'Training-Module' });
    await page.goto('https://admin.prod.buerokratt.ee/training/analytics/overview');
    translation = await getTranslations(page);
    await page.waitForTimeout(3000); // Ensures all elements load properly
  });

  test('should display Intents overview heading', async ({ page }) => {
    const heading = await page.getByRole('heading', { name: `${translation.intentsOverview}`, exact: true });
    await expect(heading).toBeVisible();
  });

  test.describe('Report overview - Card Body', () => {
    test('should display Report overview dropdown', async ({ page }) => {
      const dropdown = await page.getByRole('combobox', { name: `${translation.reportOverview}`, exact: true });
      await expect(dropdown).toBeVisible();
    });

    test('should display paragraph texts for Model in use and Trained', async ({ page }) => {
      const cardBody = page.locator('card__body').first();
      const paragraphs = cardBody.locator('p');
      
      for (let i = 0; i < await paragraphs.count(); i++) {
        await expect(paragraphs.nth(i)).toBeVisible();
      }

      const modelParagraph = await page.getByText(`${translation.modelInUse}`, { exact: true });
      const trainedParagraph = await page.getByText(`${translation.trained}`, { exact: true });
      
      await expect(modelParagraph).toBeVisible();
      await expect(trainedParagraph).toBeVisible();
    });
  });

  test.describe('Card Header and Table', () => {
    test('should display search input in card header', async ({ page }) => {
      const searchInput = await page.getByRole('textbox', { name: `${translation.searchPlaceholder}`, exact: true });
      await expect(searchInput).toBeVisible();
    });

    test('should display table with Intent, Examples, and F1-score headers and Go to example button', async ({ page }) => {
      const intentHeader = await page.getByText(`${translation.intent}`, { exact: true });
      const examplesHeader = await page.getByText(`${translation.examples}`, { exact: true });
      const f1ScoreHeader = await page.getByText(`${translation.f1Score}`, { exact: true });
      const goToExampleButton = page.getByText(`${translation.goToExample}`, { exact: true }).first();

      await expect(intentHeader).toBeVisible();
      await expect(examplesHeader).toBeVisible();
      await expect(f1ScoreHeader).toBeVisible();
      await expect(goToExampleButton).toBeVisible();
    });
  });
});
