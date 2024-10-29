import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';

let translation;

test.describe('Users Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('https://admin.prod.buerokratt.ee/chat/users');
        translation = await getTranslations(page);
        await page.waitForTimeout(3000);
    });

    test('Heading and Add User button visibility', async ({ page }) => {
        const heading = await page.getByRole('heading', { name: `${translation.users}` });
        const addUserButton = await page.getByRole('button', { name: `${translation.addUser}` });
        await expect(heading).toBeVisible();
        await expect(addUserButton).toBeVisible();
    });

    test.describe('Card Body', () => {
        test('Table headers visibility', async ({ page }) => {
            const container = page.locator('.card');
            const nameHeader = container.getByText(`${translation.name}`, { exact: true });
            const idCodeHeader = container.getByText(`${translation.idCode}`);
            const roleHeader = container.getByText(`${translation.role}`);
            const displayNameHeader = container.getByText(`${translation.displayName}`, { exact: true });
            const userTitleHeader = container.getByText(`${translation.userTitle}`);
            const emailHeader = container.getByText(`${translation.email}`);

            await expect(nameHeader).toBeVisible();
            await expect(idCodeHeader).toBeVisible();
            await expect(roleHeader).toBeVisible();
            await expect(displayNameHeader).toBeVisible();
            await expect(userTitleHeader).toBeVisible();
            await expect(emailHeader).toBeVisible();
        });

        test('Edit and Delete buttons visibility for table rows', async ({ page }) => {
            const container = page.locator('.card');
            const editButton = container.getByRole('button', { name: `${translation.edit}` }).first();
            const deleteButton = container.getByRole('button', { name: `${translation.delete}` }).first();

            await expect(editButton).toBeVisible();
            await expect(deleteButton).toBeVisible();
        });
    });

    test.describe('Pagination', () => {
        test('Result count label and select visibility', async ({ page }) => {
            const container = page.locator('.card');
            const resultCountLabel = container.getByText(`${translation.resultCount}`);
            const select = container.getByRole('combobox', { name: `${translation.resultCount}` });

            await expect(resultCountLabel).toBeVisible();
            await expect(select).toBeVisible();
        });
    });
});
