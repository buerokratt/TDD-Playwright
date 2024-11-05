import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';

const baseURL = 'https://admin.prod.buerokratt.ee/training/analytics/models';
let translation;

test.describe('Training Module', () => {
  
  test.beforeEach(async ({ page }) => {
    test.info().annotations.push({ type: 'repository', description: 'Training-Module' });
    await page.goto(baseURL);
    translation = await getTranslations(page);
    await page.waitForTimeout(3000); // Ensure all elements load properly
  });

  test.describe('Main Heading', () => {
    test('should display main heading', async ({ page }) => {
      const heading = await page.getByRole('heading', { name: `${translation.models}`, exact: true });
      await expect(heading).toBeVisible();
    });
  });

  test.describe('Selected Model Card', () => {
    test('should display selected model header', async ({ page }) => {
      const selectedModelHeader = await page.getByRole('heading', { name: `${translation.selectedModel}`, exact: true });
      await expect(selectedModelHeader).toBeVisible();
    });

    test('should display paragraphs in selected model card body', async ({ page }) => {
      const cardBody = page.locator('card__body').first();
      const paragraphs = cardBody.locator('p');
      for (let i = 0; i < await paragraphs.count(); i++) {
        await expect(paragraphs.nth(i)).toBeVisible();
      }
      const deleteButton = await page.getByText(`${translation.delete}`, { exact: true });
      await expect(deleteButton).toBeVisible();
    });

    test('should display delete button in selected model card body', async ({ page }) => {
      const deleteButton = await page.getByText(`${translation.delete}`, { exact: true });
      await expect(deleteButton).toBeVisible();
    });
  });

  test.describe('All Models Card', () => {
    test('should display all models header', async ({ page }) => {
      const allModelsHeader = await page.getByRole('heading', { name: `${translation.allModels}`, exact: true });
      await expect(allModelsHeader).toBeVisible();
    });

    test('should verify table headers and data in all models card', async ({ page }) => {
      const versionHeader = await page.getByText(`${translation.version}`, { exact: true });
      const nameHeader = await page.getByText(`${translation.name}`, { exact: true });
      const lastTrainedHeader = await page.getByText(`${translation.lastTrained}`, { exact: true });
      const liveHeader = await page.getByText(`${translation.live}`, { exact: true });
      
      await expect(versionHeader).toBeVisible();
      await expect(nameHeader).toBeVisible();
      await expect(lastTrainedHeader).toBeVisible();
      await expect(liveHeader).toBeVisible();
    });
  });
});
