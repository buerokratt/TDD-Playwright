const { test, expect } = require('@playwright/test');

test.describe('/login functionality', () => {
  test('should log in successfully with valid credentials', async ({ page }) => {
    // Navigate to the login page
    await page.goto('/login');
    
    // Fill in the login form
    await page.fill('input[name="username"]', 'validUsername');
    await page.fill('input[name="password"]', 'validPassword');
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Assert that the status code is 200 (can be done using API interception)
    const response = await page.waitForResponse(response => response.status() === 200);
    expect(response.status()).toBe(200);
    
    // Assert success message or session cookie
    await expect(page).toHaveText('Welcome');
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(cookie => cookie.name === 'session_id');
    expect(sessionCookie).not.toBeNull();
  });
});
