import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';

let translation;

test.describe('Buerokratt Chatbot - History Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('https://admin.prod.buerokratt.ee/chat/history');
        translation = await getTranslations(page);
        test.info().annotations.push({ type: 'repository', description: 'Buerokratt Chatbot History Page' });
        await page.waitForTimeout(3000);
    });

    test('Validate heading and search input visibility', async ({ page }) => {
        const heading = await page.getByRole('heading', { name: `${translation.history}`, exact: true });
        const searchInput = await page.getByPlaceholder(`${translation.searchChats}`);
        await expect(heading).toBeVisible();
        await expect(searchInput).toBeVisible();
    });

    test('Validate datepicker and dropdown selection', async ({ page }) => {
        const startDatepicker = await page.locator('.datepicker').nth(0);
        const endDatepicker = await page.locator('.datepicker').nth(1);
        const dropdown = await page.getByText(new RegExp(`${translation.choose}`));
        await expect(startDatepicker).toBeVisible();
        await expect(endDatepicker).toBeVisible();
        await expect(dropdown).toBeVisible();
    });

    test('Validate table headers and actions visibility', async ({ page }) => {
        const dataTable = page.locator('.data-table');
        const headers = [
            translation.startTime,
            translation.endTime,
            translation.customerSupportName,
            translation.name,
            translation.idCode,
            translation.contact,
            translation.comment,
            translation.rating,
            translation.feedback,
            translation.status,
            translation.id,
        ];
        for (const header of headers) {
            const headerLocator = dataTable.getByText(`${header}`, { exact: true });
            await expect(headerLocator).toBeVisible();
        }
        const viewButton = dataTable.getByRole('button', { name: `${translation.view}`, exact: true }).first();
        await expect(viewButton).toBeVisible();
    });

    test('Validate pagination visibility and options', async ({ page }) => {
        const resultCountLabel = await page.getByText(`${translation.resultCount}`);
        const resultCountDropdown = await page.getByText(new RegExp(`${translation.resultCount}`));
        await expect(resultCountLabel).toBeVisible();
        await expect(resultCountDropdown).toBeVisible();
    });
});
