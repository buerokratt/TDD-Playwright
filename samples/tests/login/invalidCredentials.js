const { test, expect } = require('@playwright/test');

test.describe('/login functionality', () => {
  test('should fail to log in with invalid credentials', async ({ page }) => {
    // Navigate to the login page
    await page.goto('/login');
    
    // Fill in the login form with incorrect credentials
    await page.fill('input[name="username"]', 'invalidUsername');
    await page.fill('input[name="password"]', 'invalidPassword');
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Assert that the status code is 401 (can be done using API interception)
    const response = await page.waitForResponse(response => response.status() === 401);
    expect(response.status()).toBe(401);
    
    // Assert error message is displayed
    await expect(page).toHaveText('Invalid username or password');
  });
});
