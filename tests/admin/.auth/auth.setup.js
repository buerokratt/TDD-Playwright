const fs = require('fs'); // Import Node.js file system module
const path = require('path'); // Import Node.js path module
const { test: setup } = require('../../test-setup');


const authFile = 'tests/admin/.auth/user.json';

setup('authenticate', async ({ page }) => {
    // Ensure the .auth directory exists
    if (!fs.existsSync(path.dirname(authFile))) {
        fs.mkdirSync(path.dirname(authFile), { recursive: true });
    }

    // Navigate to the login page
    await page.goto('/');

    // Perform login steps
    await page.getByRole('button', { name: 'sisene TARA kaudu' }).click();
    await page.getByRole('link', { name: 'Smart-ID', exact: true }).click();
    await page.locator('.c-tab-login__nav-item').nth(2).click()
    await page.getByRole('textbox', { name: 'Isikukood' }).click();
    await page.getByRole('textbox', { name: 'Isikukood' }).fill('61101012257');
    await page.getByRole('button', { name: 'Jätka' }).click();

    // Wait for the navigation to the authenticated page
    await page.waitForURL('/chat/landing', {
        timeout: 45000
    });

    // Save the authentication state
    await page.context().storageState({ path: authFile });
});
