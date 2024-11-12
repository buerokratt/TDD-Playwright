const { test, expect } = require('@playwright/test');
const { getTranslations } = require('../../../../../../translations/languageDetector');


test.describe('Complete User Management Functionality Tests', () => {
    test.describe.serial('User Management Functionality Tests', () => {
        let translation;
        const pageUrl = 'https://admin.prod.buerokratt.ee/chat/users';

        test.beforeEach(async ({ page }) => {
            await page.goto(pageUrl);
            translation = await getTranslations(page);
            
        });

        async function testSorting({ page }, translationKey) {
            const columnName = translation[translationKey];

            const headers = await page.locator('//table//thead//th').allTextContents();
            const columnIndex = headers.indexOf(columnName) + 1;

            const columnXpath = `xpath=//table//tr/td[${columnIndex}]`;

            const columnCells = await page.locator(columnXpath);
            const unsortedValues = (await columnCells.allTextContents()).map(val => val.trim());

            await page.getByRole('cell', { name: columnName, exact: true }).getByRole('button').first().click();
            await page.waitForTimeout(2000);

            const sortedValuesAsc = (await columnCells.allTextContents()).map(val => val.trim());
            const manuallySortedValuesAsc = [...unsortedValues].sort((a, b) => a.localeCompare(b));

            expect(sortedValuesAsc).toEqual(manuallySortedValuesAsc);

            await page.getByRole('cell', { name: columnName, exact: true }).getByRole('button').first().click();
            await page.waitForTimeout(2000);

            const sortedValuesDesc = (await columnCells.allTextContents()).map(val => val.trim());
            const manuallySortedValuesDesc = [...unsortedValues].sort((a, b) => b.localeCompare(a));
            expect(sortedValuesDesc).toEqual(manuallySortedValuesDesc);
        }

        async function testSearching({ page }, translationKey) {
            const columnName = translation[translationKey];
            const searchName = translation['dottedSearch'];

            const headers = await page.locator('//table//thead//th').allTextContents();
            const columnIndex = headers.indexOf(columnName) + 1;

            const columnXpath = `xpath=//table//tr/td[${columnIndex}]`;

            const columnCells = await page.locator(columnXpath);
            const unsortedValues = (await columnCells.allTextContents()).map(val => val.trim());

            const randomValue = unsortedValues[Math.floor(Math.random() * unsortedValues.length)];

            await page.getByRole('cell', { name: columnName, exact: true }).getByRole('button').nth(1).click();
            await page.waitForTimeout(500);

            const searchInput = await page.locator(`input[placeholder="${searchName}"]`);
            await searchInput.fill(randomValue);
            await page.waitForTimeout(500);

            const filteredValues = (await columnCells.allTextContents()).map(val => val.trim());

            for (const value of filteredValues) {
                expect(value.toLowerCase()).toContain(randomValue.toLowerCase());
            }
        }

        // Test cases for all columns
        test('Sort and Search by Nimi/Name', async ({ page }) => {
            await testSorting({ page }, 'name');
            await testSearching({ page }, 'name');
        });

        test('Sort and Search by Isikukood/Id code', async ({ page,}) => {
            await testSorting({ page }, 'idCode');
            await testSearching({ page }, 'idCode');
        });

        test('Sort and Search by Roĺl/Role ### CHECK ISSUE INSIDE', async ({ page }) => {
            await testSorting({ page }, 'role');
            await testSearching({ page }, 'role');
        });

        test('Sort and Search by Kuvatav nimi/Display Name', async ({ page }) => {
            await testSorting({ page }, 'displayName');
            await testSearching({ page }, 'displayName');
        });

        test('Sort and Search by Tiitel/Title', async ({ page }) => {
            await testSorting({ page }, 'userTitle');
            await testSearching({ page }, 'userTitle');
        });

        test('Sort and Search by E-post/E-mail', async ({ page }) => {
            await testSorting({ page }, 'email');
            await testSearching({ page }, 'email');
        });


    });

    test.describe.serial('User Management Functionality Tests for user creation, editing and deletion', () => {
        let translation;
        const pageUrl = 'https://admin.prod.buerokratt.ee/chat/users';
        test.beforeEach(async ({ page }) => {
            await page.goto(pageUrl);
            translation = await getTranslations(page);
            await page.waitForLoadState('networkidle');
        });
        test('Add a new user', async ({ page }) => {

            // Click to open 'Add User' form
            await page.locator(`button.btn--primary:has-text("${translation["addUser"]}")`).click();
        
            // Fill in user details
            await page.fill('input[name="fullName"]', 'Test User');
            await page.fill('input[name="idCode"]', 'EE12345678910');
        
            // Choose the role
            await page.locator('div').filter({ hasText: translation["choose"] }).nth(2).click();
            await page.getByRole('option', { name: translation["administrator"] }).click();
        
            // Fill in other fields
            await page.fill('input[name="displayName"]', 'TUser');
            await page.fill('input[name="csaTitle"]', 'Developer');
            await page.fill('input[name="csaEmail"]', 'test.user@example.com');
        
            // Click 'Add User' button to submit the form
            await page.locator(`button.btn.btn--primary.btn--m:has-text("${translation["addUser"]}")`).nth(1).click();
        
            // Wait for the table to update (or detect a new row in the table)
            await page.waitForSelector(`table.data-table tbody tr:has-text("Test User")`, { timeout: 5000 });
        
            // Retrieve and check table headers
            const columnName = translation["name"];
            const headers = await page.locator('//table//thead//th').allTextContents();
            
            const columnIndex = headers.indexOf(columnName) + 1;
            if (columnIndex === 0) throw new Error(`Column "${columnName}" not found`);
        
            // Get column values based on the correct index
            const columnXpath = `xpath=//table//tr/td[${columnIndex}]`;
            const columnCells = await page.locator(columnXpath);
            const allValues = (await columnCells.allTextContents()).map(val => val.trim());
        
            // Assert that the new user "Test User" is found in the table
            expect(allValues).toContain('Test User');
        
            // Assert the row containing "Test User" is visible
            const newUserRow = await page.locator(`table.data-table tbody tr:has-text("Test User")`);
            await expect(newUserRow).toBeVisible();
        });
        

        test('Edit user details', async ({ page }) => {
            // Locate the row for "Test User" in the table
            const userRow = page.locator(`table.data-table tbody tr:has-text("Test User")`);
        
            // Ensure the row for "Test User" is visible
            await expect(userRow).toBeVisible();
        
            // Locate and click the "Edit" button within the row
            await userRow.locator(`button:has-text("${translation["edit"]}")`).click();
    
        
            // Remove administrator role and select service manager
            await page.getByLabel(`Remove ${translation["administrator"]}`).click();
            await page.locator('#react-select-2-input').click();
            await page.getByRole('option', { name: `${translation["serviceManager"]}` }).click();
        
            // Update the user details
            await page.fill('input[name="fullName"]', 'Edited User');
            await page.fill('input[name="displayName"]', 'EUser');
            await page.fill('input[name="csaTitle"]', 'Senior Developer');
            await page.fill('input[name="csaEmail"]', 'edited.user@example.com');
        
            // Click to save the changes
            await page.locator(`button.btn.btn--primary.btn--m:has-text("${translation["editUser"]}")`).click();
        
            // Wait for the form to close and the table to update (indicate the save was successful)
            await page.waitForSelector('form.edit-user-form', { state: 'detached', timeout: 5000 });
        
            // Verify the updates in the table
            await page.waitForSelector(`table.data-table tbody tr:has-text("Edited User")`);
        
            // Retrieve and check table headers
            const columnName = translation["name"];
            const headers = await page.locator('//table//thead//th').allTextContents();
            
            const columnIndex = headers.indexOf(columnName) + 1;
            if (columnIndex === 0) throw new Error(`Column "${columnName}" not found`);
        
            // Get column values based on the correct index
            const columnXpath = `xpath=//table//tr/td[${columnIndex}]`;
            const columnCells = await page.locator(columnXpath);
            const allValues = (await columnCells.allTextContents()).map(val => val.trim());
        
            // Verify the updated user is in the table
            expect(allValues).toContain('Edited User');
        
            // Assert the edited row is visible in the table
            const editedUserRow = page.locator(`table.data-table tbody tr:has-text("Edited User")`);
            await expect(editedUserRow).toBeVisible();
        });
        
        test('Delete user', async ({ page }) => {

            // Locate the row for "Edited User" in the table
            const userRow = page.locator(`table.data-table tbody tr:has-text("Edited User")`);

            // Ensure the row for "Edited User" is visible
            await expect(userRow).toBeVisible();

            // Locate and click the "Delete" button within the row
            await userRow.locator(`button:has-text("${translation["delete"]}")`).click();

            // Confirm the deletion in the modal (if applicable)
            await page.locator(`button.btn.btn--error.btn--m:has-text("${translation["yes"]}")`).click();

            await expect(page.locator('.toast.toast--success')).toBeVisible();

            // Verify that the user is no longer in the table
            await expect(page.locator(`table.data-table tbody tr:has-text("Edited User")`)).not.toBeVisible();
        });
    });
});