import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';

let translation;

test.describe('Buerokratt-Chatbot Tests', () => {
    test.beforeEach(async ({ page }) => {
        test.info().annotations.push({
            type: 'repository',
            description: 'Buerokratt-Chatbot',
        });

        await page.goto('https://admin.prod.buerokratt.ee/chat/users');
        translation = await getTranslations(page);
        await page.waitForTimeout(3000); // Ensure all elements load properly
    });

    test('Validate heading and add user functionality', async ({ page }) => {
        // Heading check
        const heading = await page.getByRole('heading', {
            name: `${translation.users}`,
            exact: true,
        });
        await expect(heading).toBeVisible();

        // Add User button check
        const addUserButton = await page.getByRole('button', {
            name: `${translation.addUser}`,
            exact: true,
        });
        await expect(addUserButton).toBeVisible();
    });

    test('Add, Verify, and Delete User', async ({ page }) => {
        // Click "Add User" button
        const addUserButton = await page.getByRole('button', {
            name: `${translation.addUser}`,
            exact: true,
        });
        await addUserButton.click();

        // Fill the form fields
        await page.getByLabel(`${translation.addUserFirstAndLastName}`).fill('John Doe');
        await page.getByLabel(`${translation.idCode}`).fill('EE1234567890');
        await page.getByLabel(`${translation.displayName}`).fill('John');
        await page.getByLabel(`${translation.userTitle}`).fill('Developer');
        await page.getByLabel(`${translation.email}`).fill('john.doe@example.com');

        // Select role
        const roleDropdown = await page.locator('input[role="combobox"][aria-expanded="false"]');
        await roleDropdown.click();
        const firstOption = await page.locator('#react-select-2-option-0');
        await firstOption.click();

        // Save the user
        const saveButton = await page.getByRole('button', {
            name: `${translation.addUser}`,
            exact: true,
        });
        await saveButton.click();
        await page.waitForTimeout(3000); // Wait for the user to be saved

        // Verify user exists
        const cardBody = page.locator('.card__body');
        const tableBody = cardBody.locator('tbody');
        const rows = tableBody.getByRole('row');

        let userRow = null;
        for (let i = 0; i < (await rows.count()); i++) {
            const row = rows.nth(i);
            const nameCellVisible = await row.getByRole('cell', {
                name: 'John Doe',
                exact: true,
            }).isVisible();
            const idCodeCellVisible = await row.getByRole('cell', {
                name: 'EE1234567890',
                exact: true,
            }).isVisible();

            if (nameCellVisible && idCodeCellVisible) {
                userRow = row;
                break;
            }
        }

        expect(userRow).not.toBeNull();

        // Delete the user
        const deleteButton = await userRow.getByRole('button', {
            name: `${translation.delete}`,
            exact: true,
        });
        await deleteButton.click();

        const confirmDeleteButton = await page.getByRole('button', {
            name: 'Yes',
            exact: true,
        });
        await confirmDeleteButton.click();
        await page.waitForTimeout(3000); // Wait for the table to refresh

        // Verify user no longer exists
        let userStillExists = false;
        for (let i = 0; i < (await rows.count()); i++) {
            const row = rows.nth(i);
            const nameCellVisible = await row.getByRole('cell', {
                name: 'John Doe',
                exact: true,
            }).isVisible();
            const idCodeCellVisible = await row.getByRole('cell', {
                name: 'EE1234567890',
                exact: true,
            }).isVisible();

            if (nameCellVisible && idCodeCellVisible) {
                userStillExists = true;
                break;
            }
        }

        expect(userStillExists).toBe(false);
    });

    test('Validate table sorting', async ({ page }) => {
        const cardBody = page.locator('.card__body');
        const headers = cardBody.locator('thead').locator('th');

        for (let i = 0; i < (await headers.count()) - 2; i++) {
            const header = headers.nth(i);
            const sortButton = await header.locator('button').first();

            // Ascending sort
            await sortButton.click();
            // Add assertions to verify ascending order here

            // Descending sort
            await sortButton.click();
            // Add assertions to verify descending order here
        }
    });

    test('Validate table search functionality', async ({ page }) => {
        const cardBody = page.locator('.card__body');
        const tableBody = cardBody.locator('tbody');
        const firstRow = tableBody.getByRole('row').first();

        const columnValues = [];
        const cells = firstRow.getByRole('cell');
        for (let i = 0; i < (await cells.count()); i++) {
            columnValues.push(await cells.nth(i).innerText());
        }

        const headers = cardBody.locator('thead').locator('th');
        for (let i = 0; i < columnValues.length-2; i++) {
            const header = headers.nth(i);
            const searchButton = await header.locator('button').nth(1);
            await searchButton.click();

            const searchInput = await page.getByPlaceholder(`${translation.search}`).nth(i);
            await searchInput.fill(columnValues[i]);

            // Validate the first row matches the searched value
            const firstCell = tableBody.getByRole('row').first().getByRole('cell', {
                name: columnValues[i],
                exact: true,
            });
            await expect(firstCell).toBeVisible();

            // Clear search input
            await searchInput.fill('');
            await page.waitForTimeout(1000); // Wait for the table to refresh
        }
    });
});
