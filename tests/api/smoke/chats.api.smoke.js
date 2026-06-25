// tests/home-page.spec.js
const { test, expect } = require('../api-test-setup');
const {URLS} = require("../../../playwright.config");

test('[api] [smoke] home page loads without API errors', async ({ page }) => {
    await page.goto(URLS.admin + 'chat/landing');

    // Verify all APIs returned 200
    const failingCalls = await page.verifyAPIsReturn200();
    if (failingCalls.length > 0) {
        console.log('Failed APIs:', failingCalls);
    }

    // Your other assertions
    expect(failingCalls.length).toBe(0);
});

test('[api] [smoke] Unanswered chats page loads without API errors', async ({ page }) => {
    await page.goto(URLS.admin + 'chat/unanswered');

    // Verify all APIs returned 200
    const failingCalls = await page.verifyAPIsReturn200();
    if (failingCalls.length > 0) {
        console.log('Failed APIs:', failingCalls);
    }

    // Your other assertions
    expect(failingCalls.length).toBe(0);
});

test('[api] [smoke] Active chats page loads without API errors', async ({ page }) => {
    await page.goto(URLS.admin + 'chat/active');

    // Verify all APIs returned 200
    const failingCalls = await page.verifyAPIsReturn200();
    if (failingCalls.length > 0) {
        console.log('Failed APIs:', failingCalls);
    }

    // Your other assertions
    expect(failingCalls.length).toBe(0);
});

test('[api] [smoke] Pending chats page loads without API errors', async ({ page }) => {
    await page.goto(URLS.admin + 'chat/pending');

    // Verify all APIs returned 200
    const failingCalls = await page.verifyAPIsReturn200();
    if (failingCalls.length > 0) {
        console.log('Failed APIs:', failingCalls);
    }

    // Your other assertions
    expect(failingCalls.length).toBe(0);
});

test('[api] [smoke] Chat history page loads without API errors', async ({ page }) => {
    await page.goto(URLS.admin + 'chat/history');

    // Verify all APIs returned 200
    const failingCalls = await page.verifyAPIsReturn200();
    if (failingCalls.length > 0) {
        console.log('Failed APIs:', failingCalls);
    }

    // Your other assertions
    expect(failingCalls.length).toBe(0);
});