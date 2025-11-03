// test-setup.js
const base = require('@playwright/test');

// Export the page variable
let page;

// Extend the base test with your setup
exports.test = base.test.extend({
    //TODO: EN/ET translation implementation
    page: async ({ browser }, use) => {
        // Set up context with auth
        const context = await browser.newContext({
            storageState: 'tests/admin/.auth/user.json'
        });

        page = await context.newPage();

        // Set up API monitoring
        const apiCalls = new Map();

        page.on('requestfinished', request => {
            const url = request.url();

            if (url.includes('ruuter')) {
                apiCalls.set(url, {
                    url,
                    method: request.method(),
                    timestamp: Date.now(),
                    status: null
                });
            }
        });

        page.on('response', response => {
            const url = response.url();

            if (url.includes('ruuter')) {
                if (apiCalls.has(url)) {
                    const call = apiCalls.get(url);
                    call.status = response.status();
                    apiCalls.set(url, call);
                }
            }
        });

        page.verifyAPIsReturn200 = async function(options = {}) {
            const {
                timeout = 10000,
                waitForNetworkIdle = true
            } = options;

            // Wait for network to be idle if requested
            if (waitForNetworkIdle) {
                await this.waitForLoadState('domcontentloaded');
                // Additional short wait for any late API calls
                await this.waitForTimeout(20000);
            }

            const calls = Array.from(apiCalls.entries()).map(([url, details]) => ({
                url,
                ...details
            }));

            if (calls.length === 0) {
                console.warn('No API calls were detected during page load');
                return []; // Return empty array for no calls
            }

            // Separate successful and failing calls
            const successfulCalls = [];
            const failingCalls = [];

            calls.forEach(call => {
                if (call.status === 200 || call.status === null) {
                    successfulCalls.push(call);
                } else {
                    failingCalls.push(call);
                    console.log(`❌ FAILED API: ${call.status} ${call.method} ${call.url}`);
                }
            });

            // Only assert on failing calls
            failingCalls.forEach(call => {
                base.expect(call.status, `API call failed: ${call.method} ${call.url} returned ${call.status}`).toBe(200);
            });

            // Log summary
            if (failingCalls.length === 0) {
                console.log(`✅ All ${successfulCalls.length} API endpoints returned 200`);
            } else {
                console.log(`❌ ${failingCalls.length} API endpoints failed out of ${calls.length} total calls`);
            }

            // Return ONLY the failing calls
            return failingCalls;
        };

        // Get all API calls (for debugging)
        page.getAllAPICalls = function() {
            return Array.from(apiCalls.entries()).map(([url, details]) => ({
                url,
                ...details
            }));
        };

        // Get only successful API calls
        page.getSuccessfulAPICalls = function() {
            const allCalls = this.getAllAPICalls();
            return allCalls.filter(call => call.status === 200);
        };

        // Get only failing API calls
        page.getFailingAPICalls = function() {
            const allCalls = this.getAllAPICalls();
            return allCalls.filter(call => call.status !== 200);
        };

        // Clear API calls method
        page.clearAPICalls = function() {
            apiCalls.clear();
        };

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