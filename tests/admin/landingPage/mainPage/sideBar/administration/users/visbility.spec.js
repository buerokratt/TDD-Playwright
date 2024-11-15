import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';

let translation;

test.describe('Users', () => {
    test.beforeEach(async ({ page }) => {
        test.info().annotations.push({ type: 'repository', description: 'Buerokratt-Chatbot' });

        // Navigate to the page
        await page.goto('https://admin.prod.buerokratt.ee/chat/users');

        // Fetch translations
        translation = await getTranslations(page);

        // Wait for elements to load
        await page.waitForTimeout(3000);
    });

    test('should display the heading', async ({ page }) => {
        const heading = await page.getByRole('heading', {
            name: `${translation.users}`,
            exact: true,
        });
        await expect(heading).toBeVisible();
    });

    test('should display the Add User button', async ({ page }) => {
        const addButton = await page.getByText(`${translation.addUser}`, { exact: true });
        await expect(addButton).toBeVisible();
    });

    test('should display the table headers', async ({ page }) => {
        const cardBody = page.locator('.card__body');
        const tableHeaders = cardBody.locator('thead th');

        const expectedHeaders = [
            translation.name,
            translation.idCode,
            translation.role,
            translation.displayName,
            translation.userTitle,
            translation.email,
        ];

        for (let i = 0; i < expectedHeaders.length; i++) {
            const header = tableHeaders.nth(i);
            await expect(header).toHaveText(expectedHeaders[i]);
            await expect(header).toBeVisible();
        }
    });

    test('should display the table rows and action buttons', async ({ page }) => {
        const cardBody = page.locator('.card__body');
        const tableBody = cardBody.locator('tbody');
        const firstRow = tableBody.getByRole('row').first();

        await expect(firstRow).toBeVisible();

        const editButton = firstRow.getByRole('button', { name: `${translation.edit}`, exact: true });
        const deleteButton = firstRow.getByRole('button', { name: `${translation.delete}`, exact: true });

        await expect(editButton).toBeVisible();
        await expect(deleteButton).toBeVisible();
    });

    test('should display the pagination result count label and dropdown', async ({ page }) => {
        const cardBody = page.locator('.card__body');
        const resultCountLabel = cardBody.getByText(`${translation.resultCount}`, { exact: true });
        const paginationDropdown = cardBody.getByRole('combobox', { name: `${translation.resultCount}` });

        await expect(resultCountLabel).toBeVisible();
        await expect(paginationDropdown).toBeVisible();
    });
});
