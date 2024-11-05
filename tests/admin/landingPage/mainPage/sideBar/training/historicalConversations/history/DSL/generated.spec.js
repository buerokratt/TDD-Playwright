import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';

let translation;

test.describe('Training-Module', () => {
    test.beforeEach(async ({ page }) => {
        test.info().annotations.push({ type: 'repository', description: 'Training-Module' });
        await page.goto('https://admin.prod.buerokratt.ee/training/history/history');
        await page.waitForTimeout(3000);
        translation = await getTranslations(page);
    });

    test.describe('Main Heading', () => {
        test('should display main heading', async ({ page }) => {
            const heading = await page.getByRole('heading', { name: `${translation.history}`, exact: true });
            await expect(heading).toBeVisible();
        });
    });

    test.describe('Card Body - Search and Filter Options', () => {
        test('should display search input, date pickers, and multi-select dropdown', async ({ page }) => {
            const searchInput = await page.getByPlaceholder(`${translation.searchChats}`, { exact: true });
            const fromLabel = await page.locator('.card__body').getByText(`${translation.from}`, { exact: true });
            const toLabel = await page.locator('.card__body').getByText(`${translation.to}`, { exact: true });
            const startDatePicker = await page.locator('.card__body .datepicker').nth(0);
            const endDatePicker = await page.locator('.card__body .datepicker').nth(1);
            const filterDropdown = await page.locator('.card__body .select');

            await expect(searchInput).toBeVisible();
            await expect(fromLabel).toBeVisible();
            await expect(startDatePicker).toBeVisible();
            await expect(toLabel).toBeVisible();
            await expect(endDatePicker).toBeVisible();
            await expect(filterDropdown).toBeVisible();
        });
    });

    test.describe('Card Body - Table Headers and Data', () => {
        test('should display table headers', async ({ page }) => {
            const headers = [
                translation.startTime,
                translation.endTime,
                translation.customerSupportName,
                translation.name,
                translation.idCode,
                translation.contact,
                translation.comment,
                translation.label,
                translation.status,
                translation.id
            ];

            for (const header of headers) {
                const tableHeader = await page.locator('.card__body').getByText(`${header}`, { exact: true });
                await expect(tableHeader).toBeVisible();
            }
        });

        test('should display table data row and View button', async ({ page }) => {
            const dataRow = await page.locator('.data-table tbody tr').first();
            const viewButton = dataRow.getByRole('button', { name: `${translation.view}`, exact: true });

            await expect(dataRow).toBeVisible();
            await expect(viewButton).toBeVisible();
        });
    });

    test.describe('Drawer Component', () => {
        test('should open drawer and display header, title, body, and messages', async ({ page }) => {
            const viewButton = await page.locator('.data-table tbody tr').first().getByRole('button', { name: `${translation.view}`, exact: true });
            await viewButton.click();

            const drawer = page.locator('.drawer');
            const drawerTitle = drawer.locator('.drawer__title');
            const drawerBody = drawer.locator('.drawer__body');
            const messages = drawer.locator('.historical-chat__messages');

            await expect(drawer).toBeVisible();
            await expect(drawerTitle).toBeVisible();
            await expect(drawerBody).toBeVisible();
            await expect(messages).not.toHaveCount(0); // Ensure messages are present
        });
    });

    test.describe('Pagination Controls', () => {
        test('should display pagination label and dropdown with options', async ({ page }) => {
            const resultCountLabel = await page.locator('.card__body').getByText(`${translation.resultCount}`, { exact: true });
            const paginationDropdown = await page.locator('.card__body').getByRole('combobox', { name: `${translation.resultCount}` });
            const options = ['10', '20', '30', '40', '50'];

            await expect(resultCountLabel).toBeVisible();
            await expect(paginationDropdown).toBeVisible();

            for (const option of options) {
                await paginationDropdown.selectOption(option);
                await expect(paginationDropdown).toHaveValue(option);
            }
        });
    });
});
