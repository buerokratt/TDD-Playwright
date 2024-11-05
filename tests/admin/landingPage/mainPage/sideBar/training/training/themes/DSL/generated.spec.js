import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';
//import { selectFirstChat } from '../../../../conversations/unanswered/helper';

let translation;

test.describe('Training-Module', () => {
  test.beforeEach(async ({ page }) => {
    // Add repository annotation
    test.info().annotations.push({ type: 'repository', description: 'Training-Module' });
    
    // Go to the page
    await page.goto('https://admin.prod.buerokratt.ee/training/training/intents');
    
    // Fetch translations after navigation
    
    // Check for listing elements in vertical-tabs__list
    const hasElements = await selectFirstChat(page);
    test.skip(!hasElements, 'No listing elements found');
    
    // Wait to ensure elements are loaded
    await page.waitForTimeout(3000);
    translation = await getTranslations(page);
  });

  test('Verify Main Heading', async ({ page }) => {
    const heading = await page.getByRole('heading', { name: `${translation.intents}`, exact: true });
    await expect(heading).toBeVisible();
  });

  test('Check Search Field and Add Button in Vertical Tabs', async ({ page }) => {
    const searchField = await page.getByPlaceholder(`${translation.searchForIntent}`, { exact: true });
    await expect(searchField).toBeVisible();

    const addButton = await page.getByText(`${translation.add}`, { exact: true });
    await expect(addButton).toBeVisible();
    await expect(addButton).toBeDisabled();
  });

  test('Verify Edit and Header in Content Header', async ({ page }) => {
    const editButton = await page.getByText(`${translation.edit}`, { exact: true });
    await expect(editButton).toBeVisible();

    const contentHeader = await page.locator('.vertical-tabs__content-header').getByRole('heading', { level: 3 });
    await expect(contentHeader).toBeVisible();
  });

  test('Verify Buttons in Selected Tab', async ({ page }) => {
    const uploadButton = await page.getByText(`${translation.uploadExamples}`, { exact: true });
    const downloadButton = await page.getByText(`${translation.downloadExamples}`, { exact: true });
    const removeButton = await page.getByText(`${translation.removeFromModel}`, { exact: true });
    const deleteButton = await page.getByText(`${translation.delete}`, { exact: true });

    await expect(uploadButton).toBeVisible();
    await expect(downloadButton).toBeVisible();
    await expect(removeButton).toBeVisible();
    await expect(deleteButton).toBeVisible();
  });

  test('Check Table Headers and Actions in First Row', async ({ page }) => {
    const tableContainer = page.locator('.data-table');

    const examplesHeader = await tableContainer.getByText(`${translation.examples}`);
    await expect(examplesHeader).toBeVisible();

    const editButton = await tableContainer.getByRole('button', { name: `${translation.edit}` }).first();
    const deleteButton = await tableContainer.getByRole('button', { name: `${translation.delete}` }).first();
    const turnIntoIntentButton = await tableContainer.getByRole('button', { name: `${translation.turnIntoAnIntent}` }).first();

    await expect(editButton).toBeVisible();
    await expect(deleteButton).toBeVisible();
    await expect(turnIntoIntentButton).toBeVisible();
  });

  test('Check Add New Textarea and Button in Table', async ({ page }) => {
    const addTextarea = await page.getByPlaceholder(`${translation.addNew}`, { exact: true });
    const addButton = await page.getByText(`${translation.add}`, { exact: true });

    await expect(addTextarea).toBeVisible();
    await expect(addButton).toBeVisible();
  });

  test('Verify Sorting Buttons for Headers in Table', async ({ page }) => {
    const headers = [`${translation.examples}`];

    for (const header of headers) {
      const sortingButton = page.locator('th').filter({ hasText: header }).locator('button');
      await expect(sortingButton).toBeVisible();
    }
  });
});
