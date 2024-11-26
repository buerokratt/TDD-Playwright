import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';

let translation;

test.describe('Training-Module Intents', () => {
    test.beforeEach(async ({ page }) => {
        test.info().annotations.push({ type: 'repository', description: 'Training-Module' });

        await page.goto('https://admin.prod.buerokratt.ee/training/training/intents');

        translation = await getTranslations(page);

        await page.waitForTimeout(3000);

        const tabs = page.locator('.vertical-tabs__list-scrollable');
        await tabs.getByRole('tab').first().click();
    });

    test('Verify Heading and Vertical Tabs', async ({ page }) => {
        // Verify heading
        const heading = await page.getByRole('heading', { name: `${translation.intents}`, exact: true });
        await expect(heading).toBeVisible();

        // Verify search input and Add button
        const searchInput = await page.getByPlaceholder(`${translation.searchForIntent}`);
        const addButton = await page.getByRole('button', { name: `${translation.add}`, exact: true }).first();
        await expect(searchInput).toBeVisible();
        await expect(addButton).toBeVisible();
        await expect(addButton).toBeDisabled();
    });

    test('Verify Selected Tab Content', async ({ page }) => {
        const contentHeader = page.locator('.vertical-tabs__content-header');

        // Verify header elements
        const contentHeading = contentHeader.getByRole('heading', { level: 3 });
        const editButton = contentHeader.getByRole('button', { name: `${translation.edit}`, exact: true });
        const uploadExamplesButton = contentHeader.getByRole('button', { name: `${translation.uploadExamples}`, exact: true });
        const downloadExamplesButton = contentHeader.getByRole('button', { name: `${translation.downloadExamples}`, exact: true });
        const removeFromModelButton = contentHeader.getByRole('button', { name: `${translation.removeFromModel}`, exact: true });
        const deleteButton = contentHeader.getByRole('button', { name: `${translation.delete}`, exact: true });

        await expect(contentHeading).toBeVisible();
        await expect(editButton).toBeVisible();
        await expect(uploadExamplesButton).toBeVisible();
        await expect(downloadExamplesButton).toBeVisible();
        await expect(removeFromModelButton).toBeVisible();
        await expect(deleteButton).toBeVisible();

        // Verify paragraphs
        const paragraphs = contentHeader.locator('p');
        for (let i = 0; i < await paragraphs.count(); i++) {
            await expect(paragraphs.nth(i)).toBeVisible();
        }
    });

    test('Verify Table Headers and First Row', async ({ page }) => {
        const table = page.getByRole('table');

        // Verify table headers
        const headerExamples = table.locator('thead').getByRole('cell', { name: `${translation.examples}`, exact: true });
        await expect(headerExamples).toBeVisible();

        // Verify first row
        const tableBody = table.locator('tbody');
        const firstRow = tableBody.locator('tr').first();
        await expect(firstRow).toBeVisible();

        const addTextArea = firstRow.locator('textarea', { placeholder: `${translation.addNew}` });
        const addButton = firstRow.getByRole('button', { name: `${translation.add}`, exact: true });
        await expect(addTextArea).toBeVisible();
        await expect(addButton).toBeVisible();

        // Verify buttons in rows
        const turnIntoIntentButtons = tableBody.locator(`button:has-text("${translation.turnIntoAnIntent}")`);
        const editButtons = tableBody.locator(`button:has-text("${translation.edit}")`);
        const deleteButtons = tableBody.locator(`button:has-text("${translation.delete}")`);

        for (let i = 0; i < await turnIntoIntentButtons.count(); i++) {
            await expect(turnIntoIntentButtons.nth(i)).toBeVisible();
            await expect(editButtons.nth(i)).toBeVisible();
            await expect(deleteButtons.nth(i)).toBeVisible();
        }
    });
});
