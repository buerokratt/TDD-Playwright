const { test, expect } = require('../api-test-setup');
const {URLS} = require("../../../playwright.config");

test('Users page loads without API errors', async ({ page }) => {
    await page.goto(URLS.admin + 'chat/users');

    // Verify all APIs returned 200
    const failingCalls = await page.verifyAPIsReturn200();
    if (failingCalls.length > 0) {
        console.log('Failed APIs:', failingCalls);
    }

    // Your other assertions
    expect(failingCalls.length).toBe(0);
});

test('Chatbot settings page loads without API errors', async ({ page }) => {
    await page.goto(URLS.admin + 'chat/chatbot/settings');

    // Verify all APIs returned 200
    const failingCalls = await page.verifyAPIsReturn200();
    if (failingCalls.length > 0) {
        console.log('Failed APIs:', failingCalls);
    }

    // Your other assertions
    expect(failingCalls.length).toBe(0);
});

test('Chatbot welcome message page loads without API errors', async ({ page }) => {
    await page.goto(URLS.admin + 'chat/chatbot/welcome-message');

    // Verify all APIs returned 200
    const failingCalls = await page.verifyAPIsReturn200();
    if (failingCalls.length > 0) {
        console.log('Failed APIs:', failingCalls);
    }

    // Your other assertions
    expect(failingCalls.length).toBe(0);
});

test('Chatbot appearance page loads without API errors', async ({ page }) => {
    await page.goto(URLS.admin + 'chat/chatbot/appearance');

    // Verify all APIs returned 200
    const failingCalls = await page.verifyAPIsReturn200();
    if (failingCalls.length > 0) {
        console.log('Failed APIs:', failingCalls);
    }

    // Your other assertions
    expect(failingCalls.length).toBe(0);
});

test('Emergency notices page loads without API errors', async ({ page }) => {
    await page.goto(URLS.admin + 'chat/chatbot/emergency-notices');

    // Verify all APIs returned 200
    const failingCalls = await page.verifyAPIsReturn200();
    if (failingCalls.length > 0) {
        console.log('Failed APIs:', failingCalls);
    }

    // Your other assertions
    expect(failingCalls.length).toBe(0);
});

test('Feedback settings page loads without API errors', async ({ page }) => {
    await page.goto(URLS.admin + 'chat/chatbot/feedback');

    // Verify all APIs returned 200
    const failingCalls = await page.verifyAPIsReturn200();
    if (failingCalls.length > 0) {
        console.log('Failed APIs:', failingCalls);
    }

    // Your other assertions
    expect(failingCalls.length).toBe(0);
});

test('Working time page loads without API errors', async ({ page }) => {
    await page.goto(URLS.admin + 'chat/working-time');

    // Verify all APIs returned 200
    const failingCalls = await page.verifyAPIsReturn200();
    if (failingCalls.length > 0) {
        console.log('Failed APIs:', failingCalls);
    }

    // Your other assertions
    expect(failingCalls.length).toBe(0);
});

test('Session length page loads without API errors', async ({ page }) => {
    await page.goto(URLS.admin + 'chat/session-length');

    // Verify all APIs returned 200
    const failingCalls = await page.verifyAPIsReturn200();
    if (failingCalls.length > 0) {
        console.log('Failed APIs:', failingCalls);
    }

    // Your other assertions
    expect(failingCalls.length).toBe(0);
});