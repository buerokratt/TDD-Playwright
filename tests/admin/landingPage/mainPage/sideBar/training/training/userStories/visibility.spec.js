import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';

let translation;

test.describe('Training-Module', () => {

    test.beforeEach(async ({ page }) => {
        test.info().annotations.push({ type: 'repository', description: 'Training-Module' });
        await page.goto('https://admin.prod.buerokratt.ee/training/training/stories');
        translation = await getTranslations(page);
        await page.waitForTimeout(3000);
    });

    test('Verify main heading is visible', async ({ page }) => {
        const heading = await page.getByRole('heading', { name: `${translation.rules}`, exact: true });
        await expect(heading).toBeVisible();
    });

    test('Verify vertical tabs visibility', async ({ page }) => {
        const verticalTabs = page.locator('.vertical-tabs');
        await expect(verticalTabs).toBeVisible();

        const verticalTabsList = verticalTabs.locator('.vertical-tabs__list');
        await expect(verticalTabsList).toBeVisible();
    });

    test('Verify selected tab functionality', async ({ page }) => {
        const selectedTabHeader = page.locator('.vertical-tabs__content-header');

        const searchInput = await selectedTabHeader.getByPlaceholder(`${translation.search}`, { exact: true });
        await expect(searchInput).toBeVisible();

        const addButton = await selectedTabHeader.getByText(`${translation.add}`, { exact: true });
        await expect(addButton).toBeVisible();
    });

    test('Verify table headers and buttons in the first row', async ({ page }) => {
        const tableBody = page.getByRole('table').locator('tbody');
        const firstRow = tableBody.locator('tr').first();
        await expect(firstRow).toBeVisible();

        const ruleHeader = await page.getByRole('cell', { name: `${translation.rule}`, exact: true });
        await expect(ruleHeader).toBeVisible();

        const editButton = firstRow.locator(`button:has-text("${translation.edit}")`);
        await expect(editButton).toBeVisible();

        const deleteButton = firstRow.locator(`button:has-text("${translation.delete}")`);
        await expect(deleteButton).toBeVisible();
    });

});