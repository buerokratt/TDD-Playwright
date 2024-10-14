const fs = require('fs'); // Import Node.js file system module
const path = require('path'); // Import Node.js path module
const { chromium } = require('playwright'); // Import Playwright
const { execSync } = require('child_process'); // Import child_process for Git commands

const authFile = 'tests/admin/.auth/user.json';

async function generateCookie() {
    // Ensure the .auth directory exists
    if (!fs.existsSync(path.dirname(authFile))) {
        fs.mkdirSync(path.dirname(authFile), { recursive: true });
    }

    // Launch the browser and create a new context
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    // Navigate to the login page
    await page.goto('https://admin.prod.buerokratt.ee/en/log-in');

    // Perform login steps
    await page.getByRole('button', { name: 'enter via TARA' }).click();
    await page.getByRole('link', { name: 'Smart-ID', exact: true }).click();
    await page.locator('.c-tab-login__nav-item').nth(2).click();
    await page.getByRole('textbox', { name: 'Isikukood' }).click();
    await page.getByRole('textbox', { name: 'Isikukood' }).fill('30303039914');
    await page.getByRole('button', { name: 'Jätka' }).click();

    // Wait for the navigation to the authenticated page
    await page.waitForURL('https://admin.prod.buerokratt.ee/chat/active');

    // Save the authentication state (cookies)
    await context.storageState({ path: authFile });
    
    console.log('New cookie generated and saved to', authFile);

    // Close the browser
    await browser.close();
}

async function commitAndPushChanges() {
    const message = 'Update user.json with new cookie';
    try {
        execSync('git add ' + authFile);
        execSync(`git commit -m "${message}"`);
        execSync('git push origin main'); // Change 'main' to your branch name if different
        console.log('Successfully committed and pushed the new cookie.');
    } catch (error) {
        console.error('Error committing or pushing changes:', error.message);
    }
}

// Execute the functions
(async () => {
    await generateCookie();
    await commitAndPushChanges();
})().catch(console.error);
