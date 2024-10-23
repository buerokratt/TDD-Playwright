import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';

let translation;

test.describe('User Management Visibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://admin.prod.buerokratt.ee/chat/users');
    translation = await getTranslations(page);
    await page.waitForTimeout(3000); // Ensure all elements load properly
  });

  test('should display the heading', async ({ page }) => {
    const heading = await page.getByText(`${translation.users}`);
    await expect(heading).toBeVisible();
  });

  test('should display the Add User button', async ({ page }) => {
    const button = await page.getByText(`${translation.addUser}`);
    await expect(button).toBeVisible();
  });

  test('should display the user table headers', async ({ page }) => {
    const nameHeader = await page.getByText(`${translation.name}`);
    const idCodeHeader = await page.getByText(`${translation.idCode}`);
    const roleHeader = await page.getByText(`${translation.role}`);
    const displayNameHeader = await page.getByText(`${translation.displayName}`);
    const titleHeader = await page.getByText(`${translation.title}`);
    const emailHeader = await page.getByText(`${translation.email}`);

    await expect(nameHeader).toBeVisible();
    await expect(idCodeHeader).toBeVisible();
    await expect(roleHeader).toBeVisible();
    await expect(displayNameHeader).toBeVisible();
    await expect(titleHeader).toBeVisible();
    await expect(emailHeader).toBeVisible();
  });

  test('should display Edit and Delete buttons for each user', async ({ page }) => {
    const editButton = await page.getByText(`${translation.edit}`).nth(0);
    const deleteButton = await page.getByText(`${translation.delete}`).nth(0);

    await expect(editButton).toBeVisible();
    await expect(deleteButton).toBeVisible();
  });

  test('should display Result count label', async ({ page }) => {
    const paginationLabel = await page.getByText(`${translation.resultCount}`);
    await expect(paginationLabel).toBeVisible();
  });

  test('should display dropdown for selecting options', async ({ page }) => {
    const select = await page.getByRole('combobox', { name: `${translation.widgetAnimation}` });
    await expect(select).toBeVisible();
  });
});
