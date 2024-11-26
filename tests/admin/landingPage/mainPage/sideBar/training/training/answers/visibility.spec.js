import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';

let translation;

test.describe('Training-Module - Visibility Tests', () => {

    test.beforeEach(async ({ page }) => {
        test.info().annotations.push({ type: 'repository', description: 'Training-Module' });
        await page.goto('https://admin.prod.buerokratt.ee/training/training/responses');
        await page.waitForTimeout(3000); // Ensure all elements are loaded
        translation = await getTranslations(page);
    });

    test('Heading visibility - Responses', async ({ page }) => {
        const heading = await page.getByRole('heading', { name: `${translation.responses}`, exact: true });
        await expect(heading).toBeVisible();
    });

    test('Search input visibility', async ({ page }) => {
        const searchInput = await page.getByPlaceholder(`${translation.searchResponse}`);
        await expect(searchInput).toBeVisible();
    });

    test('Button visibility - Add', async ({ page }) => {
        const addButton = await page.getByText(`${translation.add}`, { exact: true });
        await expect(addButton).toBeVisible();
    });

    test('Table headers visibility', async ({ page }) => {
        const tableHeaders = page.getByRole('table').locator('thead');
        const responseHeader = tableHeaders.getByRole('cell', { name: `${translation.response}`, exact: true });
        await expect(responseHeader).toBeVisible();
    });

    test('Table first row visibility', async ({ page }) => {
        const tableBody = page.getByRole('table').locator('tbody');
        const firstRow = tableBody.getByRole('row').first();
        await expect(firstRow).toBeVisible();
    });

    test.only('Buttons visibility - Edit and Delete', async ({ page }) => {
    const tableBody = page.getByRole('table').locator('tbody');
    const firstRow = tableBody.locator('tr').first();

    // Check if the first row is visible
    await expect(firstRow).toBeVisible();

    // Debug: Log the row HTML
    const rowHTML = await firstRow.innerHTML();
    console.log('First row HTML:', rowHTML);

    // Locate buttons using refined locators
    const editButton = firstRow.locator('button:has-text("Edit")');
    const deleteButton = firstRow.locator('button:has-text("Delete")');

    // Wait for buttons if dynamically loaded
    await editButton.waitFor();
    await deleteButton.waitFor();

    // Check button visibility
    await expect(editButton).toBeVisible();
    await expect(deleteButton).toBeVisible();
});
});
