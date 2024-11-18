// test/users.spec.js
import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';

let translation;

test.describe.serial('Buerokratt-Chatbot User Management', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the resource
        await page.goto('https://admin.prod.buerokratt.ee/chat/users');

        // Add annotation for test repository description
        test.info().annotations.push({ type: 'repository', description: 'Buerokratt-Chatbot' });

        // Fetch translations
        translation = await getTranslations(page);

        // Wait to ensure elements are loaded
        await page.waitForTimeout(3000);
    });

    test('Add, verify, and delete a user', async ({ page }) => {
        // Add User
        await page.getByText(`${translation.addUser}`, { exact: true }).click();
        await page.getByLabel(`${translation.addUserFirstAndLastName}`, { exact: true }).fill('John Doe');
        await page.getByLabel(`${translation.idCode}`, { exact: true }).fill('EE1234567890');
        await page.getByLabel(`${translation.displayName}`, { exact: true }).fill('JDoe');
        await page.getByLabel(`${translation.userTitle}`, { exact: true }).fill('Developer');
        await page.getByLabel(`${translation.email}`, { exact: true }).fill('johndoe@example.com');

        const roleInput = page.locator('input[role="combobox"][aria-expanded="false"]');
        await roleInput.click();
        const firstOption = await page.locator('#react-select-2-option-0');
        await firstOption.click();

        const saveButton = await page.getByRole('button', { name: `${translation.addUser}`, exact: true });
        await saveButton.click();

        // Wait to ensure values are saved
        await page.waitForTimeout(3000);

        // Verify User
        const tableBody = page.locator('tbody');
        const rows = tableBody.locator('tr');

        let userRow = null;
        for (let i = 0; i < await rows.count(); i++) {
            const row = rows.nth(i);
            const nameVisible = await row.getByRole('cell', { name: 'John Doe', exact: true }).isVisible();
            const idVisible = await row.getByRole('cell', { name: 'EE1234567890', exact: true }).isVisible();

            if (nameVisible && idVisible) {
                userRow = row;
                break;
            }
        }
        expect(userRow).not.toBeNull();

        // Delete User
        const deleteButton = await userRow.getByRole('button', { name: `${translation.delete}`, exact: true });
        await deleteButton.click();

        const confirmDeleteButton = await page.getByText('Yes', { exact: true });
        await confirmDeleteButton.click();

        // Wait for the table to refresh
        await page.waitForTimeout(3000);

        // Verify deletion
        userRow = null;
        for (let i = 0; i < await rows.count(); i++) {
            const row = rows.nth(i);
            const nameVisible = await row.getByRole('cell', { name: 'John Doe', exact: true }).isVisible();
            const idVisible = await row.getByRole('cell', { name: 'EE1234567890', exact: true }).isVisible();

            if (nameVisible && idVisible) {
                userRow = row;
                break;
            }
        }
        expect(userRow).toBeNull();
    });

    test('Sort and search table headers', async ({ page }) => {
        const tableHeaders = page.locator('thead tr th');
        const rows = page.locator('tbody tr');
        const headerCount = await tableHeaders.count();

        for (let i = 0; i < headerCount; i++) {
            const header = await tableHeaders.nth(i);
            const button = await header.locator('button').first();
            await button.click();
            await page.waitForTimeout(1000);

            const ascendingValues = await getColumnValues(rows, i);
            const sortedAscending = [...ascendingValues].sort((a, b) => a.localeCompare(b));
            expect(ascendingValues).toEqual(sortedAscending);

            await button.click();
            await page.waitForTimeout(1000);

            const descendingValues = await getColumnValues(rows, i);
            const sortedDescending = [...ascendingValues].sort((a, b) => b.localeCompare(a));
            expect(descendingValues).toEqual(sortedDescending);
        }
    });

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
