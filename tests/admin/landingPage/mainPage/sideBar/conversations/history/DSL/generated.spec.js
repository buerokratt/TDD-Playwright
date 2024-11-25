import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';

let translation;

test.describe('Functionality Testing Suite', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('https://admin.prod.buerokratt.ee/chat/history');
        translation = await getTranslations(page);
        test.info().annotations.push({ type: 'repository', description: 'Buerokratt-Chatbot History' });
        await page.waitForTimeout(3000);
    });

    test('should display and interact with date pickers', async ({ page }) => {
        const startDatePicker = page.locator('.datepicker').nth(0);
        const endDatePicker = page.locator('.datepicker').nth(1);

        await expect(startDatePicker).toBeVisible();
        await expect(endDatePicker).toBeVisible();

        const startInput = startDatePicker.locator('input').first();
        const endInput = endDatePicker.locator('input').first();

        await startInput.fill('01.01.2024');
        await endInput.fill('31.12.2024');

        const updatedStartValue = await startInput.getAttribute('value');
        const updatedEndValue = await endInput.getAttribute('value');

        expect(updatedStartValue).toBe('01.01.2024');
        expect(updatedEndValue).toBe('31.12.2024');
    });

    test('should validate dropdown options', async ({ page }) => {
        const dropdown = page.getByText(new RegExp(translation.choose));
        await dropdown.click();
        const options = page.locator("select__menu")
        for (const option of [
            'Start time', 'End time', 'Customer support name', 'Name', 'ID code',
            'Contact', 'Comment', 'Rating', 'Feedback', 'Status', 'ID'
        ]) {
            await expect(options.getByText(option, { exact: true })).toBeVisible();
        }
    });

    test('should validate table data and actions', async ({ page }) => {
        const dataTable = page.locator('.card__body .data-table');
        const headers = ['Start time', 'End time', 'Customer support name', 'Name', 'ID code', 'Contact', 'Comment', 'Rating', 'Feedback', 'Status', 'ID'];

        for (let i = 0; i < headers.length; i++) {
            const header = dataTable.locator('thead').locator('th').nth(i);
            await expect(header).toContainText(headers[i]);
        }

        const firstRow = dataTable.locator('tbody tr').first();
        const viewButton = firstRow.getByRole('button', { name: `${translation.view}`, exact: true });

        await expect(viewButton).toBeVisible();
        await viewButton.click();
    });

    test('should validate pagination controls', async ({ page }) => {
        const resultCountLabel = await page.getByText(`${translation.resultCount}`, { exact: true });
        const paginationDropdown = page.getByText(new RegExp(translation.resultCount));

        await expect(resultCountLabel).toBeVisible();
        await paginationDropdown.click();

        for (const option of ['10', '20', '30', '40', '50']) {
            await expect(page.getByText(option, { exact: true })).toBeVisible();
        }
    });

    test('should validate table sorting', async ({ page }) => {
        const tableHeaders = page.locator('table thead tr th');
        const headerCount = await tableHeaders.count();
        const rows = page.locator('table tbody tr');

        for (let i = 0; i < headerCount - 1; i++) {
            const header = await tableHeaders.nth(i);
            const button = await header.locator('button').nth(1);
            await button.click();
            await page.waitForTimeout(1000);

            const ascendingOrder = await getColumnValues(rows, i);
            const sortedAscending = [...ascendingOrder].sort((a, b) => a.localeCompare(b));
            expect(ascendingOrder).toEqual(sortedAscending);

            await button.click();
            await page.waitForTimeout(1000);

            const descendingOrder = await getColumnValues(rows, i);
            const sortedDescending = [...ascendingOrder].sort((a, b) => b.localeCompare(a));
            expect(descendingOrder).toEqual(sortedDescending);
        }

        async function getColumnValues(rows, columnIndex) {
            const values = [];
            for (let i = 0; i < await rows.count(); i++) {
                const row = rows.nth(i);
                const cell = row.locator('td').nth(columnIndex);
                const cellText = await cell.innerText();
                values.push(cellText.trim());
            }
            return values;
        }
    });
});
