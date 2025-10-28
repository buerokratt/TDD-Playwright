// test-setup.js
const base = require('@playwright/test');

// Export the page variable
let page;

// Extend the base test with your setup
exports.test = base.test.extend({
    page: async ({ browser }, use) => {
        // Set up context with auth
        const context = await browser.newContext({
            storageState: 'tests/admin/.auth/user.json'
        });

        page = await context.newPage();

        // Override the goto method with global waitUntil setting
        const originalGoto = page.goto.bind(page);
        page.goto = async (url, options = {}) => {
            return originalGoto(url, {
                waitUntil: 'domcontentloaded',
                ...options // Allow individual tests to override if needed
            });
        };

        // Set up console error monitoring
        page.on('console', msg => {
            const errorPattern = /error|failed|uncaught|exception|typeerror|referenceerror|syntaxerror|rangeerror|evalerror|urlerror|is not defined|cannot read|undefined|null is not an object/i;

            if (msg.type() === 'error' || errorPattern.test(msg.text())) {
                console.log(`[${msg.type().toUpperCase()}] ${msg.text()}`);
            }
        });

        await use(page);

        // Cleanup
        await page.close();
        await context.close();
    }
});

exports.expect = base.expect;
exports.page = page;