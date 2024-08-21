import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('https://prod.buerokratt.ee/');
});

test('should display the correct page title', async ({ page }) => {
  await expect(page).toHaveTitle("Title");
});

test('should have the correct URL', async ({ page }) => {
  await expect(page).toHaveURL('https://prod.buerokratt.ee/');
});

test('should display the "Ava vestlus" button', async ({ page }) => {
  await expect(page.getByLabel('Ava vestlus')).toBeVisible({ timeout: 10000 });
});

test('should display the image inside the "Ava vestlus" button', async ({ page }) => {
  const button = page.getByRole('button', { name: 'Ava vestlus' });
  const buttonImage = button.locator('img');
  await expect(buttonImage).toBeVisible({ timeout: 10000 });
});

test('should display the "Küsi minult!" text', async ({ page }) => {
  const askMeText = page.locator('text=Küsi minult!');
  await expect(askMeText).toBeVisible();
});
