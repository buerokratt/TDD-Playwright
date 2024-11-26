// tests/trainingAnalytics.spec.js

import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';

let translation;

test.describe('Training Analytics Module Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://admin.prod.buerokratt.ee/training/analytics/overview');
    translation = await getTranslations(page);
    test.info().annotations.push({ type: 'repository', description: 'Training-Module Functionality Testing' });
    await page.waitForTimeout(3000);
  });

  test('should display Intents overview heading', async ({ page }) => {
    const heading = page.getByRole('heading', { name: `${translation.intentsOverview}`, exact: true });
    await expect(heading).toBeVisible();
  });

  test('should validate dropdown functionality for Report overview', async ({ page }) => {
    const dropdown = page.getByLabel(`${translation.reportOverview}`);
    await dropdown.click();
    const options = ['Option 1', 'Option 2', 'Option 3'];

    for (const option of options) {
      const dropdownOption = await page.getByRole('option', { name: option });
      await dropdownOption.click();
      const selectedOption = await dropdown.getAttribute('value');
      expect(selectedOption).toBe(option);
    }
  });

  test('should display Model in use and Trained paragraphs', async ({ page }) => {
    const modelParagraph = page.getByText(`${translation.modelInUse}`, { exact: true });
    const trainedParagraph = page.getByText(`${translation.trained}`, { exact: false });

    await expect(modelParagraph).toBeVisible();
    await expect(trainedParagraph).toBeVisible();
  });

  test('should validate search input in card header', async ({ page }) => {
    const searchInput = page.getByPlaceholder(`${translation.search}`);
    await expect(searchInput).toBeVisible();
    await searchInput.fill('test query');
    const searchValue = await searchInput.inputValue();
    expect(searchValue).toBe('test query');
  });

  test.describe('Table Functionality Tests', () => {
    test('should validate table headers visibility', async ({ page }) => {
      const headers = [
        `${translation.intent}`,
        `${translation.examples}`,
        `${translation.f1Score}`
      ];

      for (const header of headers) {
        const headerElement = page.getByText(header, { exact: true });
        await expect(headerElement).toBeVisible();
      }
    });

    test('should validate Go to example button functionality', async ({ page }) => {
      const goToExampleButton = page.getByRole('button', { name: `${translation.goToExample}`, exact: true }).first();
      await expect(goToExampleButton).toBeVisible();
      await goToExampleButton.click();
      // Add further checks for the navigation if required
    });
  });
});
