const { test, expect } = require('@playwright/test');
const { getTranslations } = require('../../../../../../translations/languageDetector');


test.describe('Full Visibility Test for User Management Page', () => {

    let translation

    // Navigate to the page before each test
    test.beforeEach(async ({ page }) => {
        test.info().annotations.push({ type: 'repository', description: 'Buerokratt-Chatbot' });
        await page.goto('https://admin.prod.buerokratt.ee/chat/users');
        translation = await getTranslations(page)

    });

    test('Check main heading and Add User button', async ({ page }) => {
        const heading = await page.getByRole('heading', { name: `${translation.users}`, exact: true });
        await expect(heading).toBeVisible();

        const addUserButton = await page.getByText(`${translation.addUser}`, { exact: true });
        await expect(addUserButton).toBeVisible();
    });


    test('Verify table headers', async ({ page }) => {
        const tableContainer = page.locator('.card__body');

        const nameHeader = await tableContainer.getByText(`${translation.name}`, { exact: true });
        await expect(nameHeader).toBeVisible();

        const idCodeHeader = await tableContainer.getByText(`${translation.idCode}`);
        await expect(idCodeHeader).toBeVisible();

        const roleHeader = await tableContainer.getByText(`${translation.role}`);
        await expect(roleHeader).toBeVisible();

        const displayNameHeader = await tableContainer.getByText(`${translation.displayName}`, { exact: true });
        await expect(displayNameHeader).toBeVisible();

        const titleHeader = await tableContainer.getByText(`${translation.userTitle}`);
        await expect(titleHeader).toBeVisible();

        const emailHeader = await tableContainer.getByText(`${translation.email}`);
        await expect(emailHeader).toBeVisible();
    });


    test('Check row actions (Edit and Delete)', async ({ page }) => {
        const dataRow = page.locator('.data-table');

        const editButton = dataRow.getByRole('button', { name: `${translation.edit}` }).first();
        await expect(editButton).toBeVisible();

        const deleteButton = dataRow.getByRole('button', { name: `${translation.delete}` }).first();
        await expect(deleteButton).toBeVisible();
    });

    test('Verify pagination controls', async ({ page }) => {
        const resultCountLabel = await page.getByText(`${translation.resultCount}`);
        const resultCountDropdown = await page.getByRole('combobox', { name: `${translation.resultCount}` });

        await expect(resultCountLabel).toBeVisible();
        await expect(resultCountDropdown).toBeVisible();
    });

});

test.describe('Edit user dialog visibility', async () => {
    let translation;
    let rowCount;
    let tableRows;
    test.beforeEach(async ({ page }) => {
        test.info().annotations.push({ type: 'repository', description: 'Buerokratt-Chatbot' });

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


    test('Should have dialog footer cancel and edit user buttons', async ({ page }) => {
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