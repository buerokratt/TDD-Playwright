// test-setup.js
const base = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// Export the page variable
let page;
let testContext;

// Extend the base test with your setup
exports.test = base.test.extend({
    page: async ({ page }, use, testInfo) => {
        // Set up context with auth and video


        // Override the goto method with global waitUntil setting
        const originalGoto = page.goto.bind(page);
        page.goto = async (url, options = {}) => {
            const result = await originalGoto(url, {
                waitUntil: 'domcontentloaded',
                ...options // Allow individual tests to override if needed
            });
            await page.waitForTimeout(3000);
            return result;
        };

        // Set up console error monitoring
        page.on('console', msg => {
            const errorPattern = /error|failed|uncaught|exception|typeerror|referenceerror|syntaxerror|rangeerror|evalerror|urlerror|is not defined|cannot read|undefined|null is not an object/i;

            if (msg.type() === 'error' || errorPattern.test(msg.text())) {
                console.log(`[${msg.type().toUpperCase()}] ${msg.text()}`);
            }
        });

        await use(page);

        await page.close();
    }
});


exports.expect = base.expect;
exports.page = page;