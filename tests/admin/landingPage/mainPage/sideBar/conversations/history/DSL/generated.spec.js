import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';
import { getColumnValues } from '../../unanswered/helper.js';
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

    test.only('should validate dropdown selection and table rendering', async ({ page }) => {
        const dropdown = page.getByText(new RegExp(translation.choose), { exact: true });
        await dropdown.click();
        const option = page.getByText(new RegExp(translation.startTime), { exact: true });
        await option.click();

        const tableHeaders = page.locator('table thead tr th');
        const headerText = await tableHeaders.nth(0).textContent();
        expect(headerText.trim()).toBe(translation.startTime);
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



    test('should validate pagination functionality', async ({ page }) => {
        const paginationDropdown = page.getByLabel(`${translation.resultCount}`);
        await paginationDropdown.selectOption({ label: '20' });
        const selectedOption = await paginationDropdown.inputValue();
        expect(selectedOption).toBe('20');
    });


    test.describe('Sorting Tests', () => {
        test('Ascending sort', async ({ page }) => {
            const tableHeaders = page.locator('table thead tr th');
            const headerCount = await tableHeaders.count();
            const rows = page.locator('table tbody tr');

            for (let i = 0; i < headerCount - 1; i++) {
                const header = await tableHeaders.nth(i);
                const button = await header.locator('button');
                await button.click();
                await page.waitForTimeout(1000);

                const orderAfterClick = await getColumnValues(rows, i);
                const sortedAscending = [...orderAfterClick].sort((a, b) => a.localeCompare(b));
                await expect(orderAfterClick).toEqual(sortedAscending);
            }
        });

        test('Descending sort', async ({ page }) => {
            const tableHeaders = page.locator('table thead tr th');
            const headerCount = await tableHeaders.count();
            const rows = page.locator('table tbody tr');

            for (let i = 0; i < headerCount - 1; i++) {
                const header = await tableHeaders.nth(i);
                const button = await header.locator('button');
                await button.click();
                await button.click();
                await page.waitForTimeout(1000);

                const orderAfterClick = await getColumnValues(rows, i);
                const sortedDescending = [...orderAfterClick].sort((a, b) => b.localeCompare(a));
                await expect(orderAfterClick).toEqual(sortedDescending);
            }
        });
    });


});
