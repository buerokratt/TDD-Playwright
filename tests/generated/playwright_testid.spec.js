const { test, expect } = require('@playwright/test');

test.describe('Login Endpoint', () => {
  
  test('POST /login - Success login', async ({ request }) => {
    const response = await request.post('/login', {
      data: {
        username: 'testuser',
        password: 'correctpassword',
      },
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
    });

    expect(response.status()).toBe(200);
    const responseBody = await response.text();
    expect(responseBody).toContain('Welcome');

    const cookies = await context.cookies();
    const sessionCookie = cookies.find(cookie => cookie.name === 'session_id');
    expect(sessionCookie).toBeDefined();
  });

  test('POST /login - Invalid credentials', async ({ request }) => {
    const response = await request.post('/login', {
      data: {
        username: 'wronguser',
        password: 'wrongpassword',
      },
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
    });

    expect(response.status()).toBe(401);
    const responseBody = await response.text();
    expect(responseBody).toContain('Invalid username or password');
  });

  test('GET /login - Page loads successfully', async ({ page }) => {
    await page.goto('/login');

    const usernameInput = await page.$("input[name='username']");
    const passwordInput = await page.$("input[name='password']");
    const submitButton = await page.$("button[type='submit']");

    expect(usernameInput).toBeTruthy();
    expect(passwordInput).toBeTruthy();
    expect(submitButton).toBeTruthy();
  });

});