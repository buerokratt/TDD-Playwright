import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';

let translation;

test.describe('Buerokratt-Chatbot', () => {

    test.beforeEach(async ({ page }) => {
        test.info().annotations.push({ type: 'repository', description: 'Buerokratt-Chatbot' });

        // Navigate to page and load translations
        await page.goto('https://admin.prod.buerokratt.ee/chat/history');
        await page.waitForTimeout(3000); // Wait for all elements to load properly
        translation = await getTranslations(page);
    });

    test('Verify main heading', async ({ page }) => {
        const heading = await page.getByRole('heading', { name: `${translation.history}`, exact: true });
        await expect(heading).toBeVisible();
    });

    test.describe('Card Body Elements', () => {

        test('Verify search input field', async ({ page }) => {
            const searchInput = await page.getByPlaceholder(`${translation.searchChats}`, { exact: true });
            await expect(searchInput).toBeVisible();
        });

        test('Verify From and To datepickers', async ({ page }) => {
            const fromDatepicker = await page.locator('.datepicker').nth(0);
            const toDatepicker = await page.locator('.datepicker').nth(1);
            await expect(fromDatepicker).toBeVisible();
            await expect(toDatepicker).toBeVisible();
        });

        test('Verify dropdown selection options', async ({ page }) => {
            const select = await page.locator('.select');
            await expect(select).toBeVisible();
            select.click()

            const options = [
                translation.startTime, translation.endTime, translation.customerSupportName,
                translation.name, translation.idCode, translation.contact, translation.comment,
                translation.rating, translation.feedback, translation.status, translation.id
            ];

            for (let i = 0; i < options.length; i++) {
                await expect(select).toContainText(options[i]);
            }
        });
    });

    test.describe('Table Content Verification', () => {

        test('Verify table headers', async ({ page }) => {
            const headers = [
                translation.startTime, translation.endTime, translation.customerSupportName,
                translation.name, translation.idCode, translation.contact, translation.comment,
                translation.rating, translation.feedback, translation.status, translation.id
            ];

            for (let i = 0; i < headers.length; i++) {
                const header = await page.getByRole('cell', { name: headers[i], exact: true });
                await expect(header).toBeVisible();
            }
        });

        test('Verify row data and action buttons', async ({ page }) => {
            const tableBody = page.getByRole('table').locator('tbody');
            const firstRow = tableBody.getByRole('row').first();
            await expect(firstRow).toBeVisible();

            const viewButton = firstRow.getByRole('button', { name: `${translation.view}`, exact: true });
            await expect(viewButton).toBeVisible();
        });
    });

    test.describe('Pagination Verification', () => {
        test('Verify pagination result count label and dropdown', async ({ page }) => {
            const resultCountLabel = await page.getByText(`${translation.resultCount}`, { exact: true });
            await expect(resultCountLabel).toBeVisible();

            const paginationSelect = await page.getByRole('combobox', { name: `${translation.resultCount}`, exact: true });
            await expect(paginationSelect).toBeVisible();

            const paginationOptions = ["10", "20", "30", "40", "50"];
            for (let i = 0; i < paginationOptions.length; i++) {
                await expect(paginationSelect).toContainText(paginationOptions[i]);
            }
        });
    });
});
