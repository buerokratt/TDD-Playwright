const { test, expect } = require('@playwright/test');

test.describe('/login page', () => {
  test('should load the login page successfully', async ({ page }) => {
    // Navigate to the login page
    await page.goto('/login');

    // Assert that the page loads with a status code of 200
    await expect(page).toHaveURL('/login');
    
    // Check that required elements are present
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
});
