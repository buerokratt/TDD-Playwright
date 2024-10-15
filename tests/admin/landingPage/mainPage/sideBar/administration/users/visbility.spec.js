const { test, expect } = require('@playwright/test');
const { getTranslations } = require('../../../../../../translations/languageDetector');


test.describe('Full Visibility Test for User Management Page', () => {

    let translation

    // Navigate to the page before each test
    test.beforeEach(async ({ page }) => {
        await page.goto('https://admin.prod.buerokratt.ee/chat/users'); // Replace with your actual URL
        translation = await getTranslations(page)

    });

    // Test 1: Check if the "Kasutajad"// "Users" heading is visible
    test('should display the "Kasutajad" / "Users" heading', async ({ page }) => {
        const heading = await page.locator(`h1:has-text("${translation["users"]}")`);
        await expect(heading).toBeVisible();
    });

    // Test 2: Check if the "Lisa kasutaja"// "Add user" button is visible
    test('should display the "Lisa kasutaja"/ "Add user" button', async ({ page }) => {
        const addButton = await page.locator(`button.btn--primary:has-text("${translation["addUser"]}")`);
        await expect(addButton).toBeVisible();
    });

    // Test 3: Check if the user data table is visible
    test('should display the user data table', async ({ page }) => {
        const table = await page.locator('table.data-table');
        await expect(table).toBeVisible();
    });

    // Test 4: Check if the table headers are visible
    test('should display the table headers', async ({ page }) => {

        const headers = await page.locator('table.data-table thead tr th');
        await expect(headers).toHaveCount(8);

        const headerTexts = [`${translation["name"]}`, `${translation["idCode"]}`, `${translation["role"]}`, `${translation["displayName"]}`, `${translation["userTitle"]}`, `${translation["email"]}`]; // Adjust as needed
        for (let i = 0; i < headerTexts.length; i++) {
            await expect(headers.nth(i)).toHaveText(headerTexts[i]);
            await expect(headers.nth(i)).toBeVisible();
        }
    });




    test('should have one Edit and one Delete button per row', async ({ page }) => {
        // Wait for the table to be visible
        await page.waitForSelector('.data-table'); // Adjust if needed
        const table = page.locator('.data-table');

        // Check for tbody if it's a separate element
        const body = table.locator('tbody'); // Ensure this is the correct selector for tbody
        const rows = body.locator('tr');
        const rowCount = await rows.count();

        // Ensure there are rows in the table
        expect(rowCount).toBeGreaterThan(0);

        // Initialize flags for checking button counts
        let editButtonsCount = 0;
        let deleteButtonsCount = 0;

        // Iterate through each row to count Edit and Delete buttons
        for (let i = 0; i < rowCount; i++) {
            const row = rows.nth(i);

            // Count Edit buttons in the current row
            const editButtons = row.locator(`button.btn--text:has-text("${translation["edit"]}")`);
            const editButtonCount = await editButtons.count();
            expect(editButtonCount).toBe(1); // Ensure exactly one Edit button per row
            editButtonsCount += editButtonCount;

            // Count Delete buttons in the current row
            const deleteButtons = row.locator(`button.btn--text:has-text("${translation["delete"]}")`);
            const deleteButtonCount = await deleteButtons.count();
            expect(deleteButtonCount).toBe(1); // Ensure exactly one Delete button per row
            deleteButtonsCount += deleteButtonCount;
        }

        // Ensure the total count of Edit and Delete buttons matches the row count
        expect(editButtonsCount).toBe(rowCount);
        expect(deleteButtonsCount).toBe(rowCount);
    });

});

test.describe('Edit user dialog visibility', async () => {
    let translation;
    let rowCount;
    let tableRows;
    test.beforeEach(async ({ page }) => {
        await page.goto('https://admin.prod.buerokratt.ee/chat/users'); // Replace with your actual URL
        translation = await getTranslations(page)

        await page.waitForTimeout(2000);
        const dataTable = page.locator('table.data-table');
        // Check if there are any rows with data in the table
        tableRows = dataTable.locator('tbody tr');
        rowCount = await tableRows.count();

    });




    test('Should have all dialog parts', async ({ page }) => {
        // Check if there are any rows with data in the table
        if (rowCount > 0) {
            // Click the details button in the first row
            const editButton = tableRows.first().locator(`td button:has-text("${translation.edit}")`);
            await expect(editButton).toBeVisible();
            await editButton.click();

            const dialog = page.locator('.dialog')
            await expect(dialog).toBeVisible();

            const title = page.locator('.dialog__header')
            await expect(title).toBeVisible();

            const body = page.locator('.dialog__body')
            await expect(body).toBeVisible();

            const footer = page.locator('.dialog__footer')
            await expect(footer).toBeVisible();
        } else {
            test.fail('No rows with data in the table');
        }
    });

    test('Should have all dialog body label + input or label + select fields', async ({ page }) => {
        // Check if there are any rows with data in the table
        if (rowCount > 0) {
            // Click the details button in the first row
            const editButton = tableRows.first().locator(`td button:has-text("${translation.edit}")`);
            await expect(editButton).toBeVisible();
            await editButton.click();

            const label = page.locator(`label:has-text("${translation.firstAndLastName2}")`);
            await expect(label).toBeVisible();
            const inputField = page.locator('input[name="fullName"]');
            await expect(inputField).toBeVisible();


            const label2 = page.locator(`label:has-text("${translation.displayName}")`);
            await expect(label2).toBeVisible();
            const inputField2 = page.locator('input[name="displayName"]');
            await expect(inputField2).toBeVisible();


            const label3 = page.locator(`label:has-text("${translation.userTitle}")`);
            await expect(label3).toBeVisible();
            const inputField3 = page.locator('input[name="csaTitle"]');
            await expect(inputField3).toBeVisible();


            const label4 = page.locator(`label:has-text("${translation.email}")`);
            await expect(label4).toBeVisible();
            const inputField4 = page.locator('input[name="csaEmail"]');
            await expect(inputField4).toBeVisible();

            // Check "User Role(s)" label and dropdown
            const userRoleLabel = page.locator(`label:has-text("${translation.userRoles}")`);
            await expect(userRoleLabel).toBeVisible();
            const multiSelectDropdown = page.locator('.multiSelect__wrapper');
            await expect(multiSelectDropdown).toBeVisible();

        } else {
            test.fail('No rows with data in the table');
        }
    });


    test.only('Should have dialog footer cancel and edit user buttons', async ({ page }) => {
        // Check if there are any rows with data in the table
        if (rowCount > 0) {
            // Click the details button in the first row
            const editButton = tableRows.first().locator(`td button:has-text("${translation.edit}")`);
            await expect(editButton).toBeVisible();
            await editButton.click();

            const cancelButton = page.locator(`button:has-text("${translation.cancel}")`);
            await expect(cancelButton).toBeVisible();

            const editUserButton = page.locator(`button:has-text("${translation.editUser}")`);
            await expect(editUserButton).toBeVisible();

        } else {
            test.fail('No rows with data in the table');
        }
    });
})