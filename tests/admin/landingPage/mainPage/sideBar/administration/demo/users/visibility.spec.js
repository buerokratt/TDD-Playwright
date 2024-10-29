import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';

let translation;

test.describe('Users Page Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('https://admin.prod.buerokratt.ee/chat/users');
        await page.waitForTimeout(3000); // Ensure all elements load properly
        translation = await getTranslations(page);
    });

    test.describe('Page Heading', () => {
        test('should display the heading', async ({ page }) => {
            const heading = await page.getByRole('heading', { name: `${translation.users}` });
            await expect(heading).toBeVisible();
        });
    });

    test.describe('Add User Button', () => {
        test('should display the "Add User" button', async ({ page }) => {
            const addUserButton = await page.getByText(`${translation.addUser}`);
            await expect(addUserButton).toBeVisible();
        });
    });

    test.describe('User Data Table', () => {
        test('should display table headers', async ({ page }) => {
            const container = page.locator('.card__body');
            const nameHeader = container.getByText(`${translation.name}`);
            const idCodeHeader = container.getByText(`${translation.idCode}`);
            const roleHeader = container.getByText(`${translation.role}`);
            const displayNameHeader = container.getByText(`${translation.displayName}`);
            const userTitleHeader = container.getByText(`${translation.userTitle}`);
            const emailHeader = container.getByText(`${translation.email}`);
            await expect(nameHeader).toBeVisible();
            await expect(idCodeHeader).toBeVisible();
            await expect(roleHeader).toBeVisible();
            await expect(displayNameHeader).toBeVisible();
            await expect(userTitleHeader).toBeVisible();
            await expect(emailHeader).toBeVisible();
        });

        test('should display edit and delete buttons for first row', async ({ page }) => {
            const container = page.locator('.card__body');
            const editButton = container.getByRole('button', { name: `${translation.edit}` }).first();
            const deleteButton = container.getByRole('button', { name: `${translation.delete}` }).first();
            await expect(editButton).toBeVisible();
            await expect(deleteButton).toBeVisible();
        });
    });

    test.describe('Pagination Controls', () => {
        test('should display result count label and dropdown', async ({ page }) => {
            const resultCountLabel = await page.getByText(`${translation.resultCount}`);
            const resultCountDropdown = await page.getByRole('combobox', { name: `${translation.resultCount}` });
            await expect(resultCountLabel).toBeVisible();
            await expect(resultCountDropdown).toBeVisible();
        });
    });
});
