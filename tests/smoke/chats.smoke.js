const { test, expect } = require('../.setup/test-setup');
const { URLS } = require('../../playwright.config');

test('[smoke] Landing Page', async({ page }) => {
    await page.goto(URLS.admin + 'chat/landing' );
    await expect(page.getByText('Tere tulemast Bürokratti')).toBeVisible();
});

test('[smoke] Unanswered chats', async({ page }) => {
    await page.goto(URLS.admin + 'chat/unanswered' );
    await expect(page.getByRole('tablist')).toBeVisible();
});

test('[smoke] Active chats', async({ page }) => {
    await page.goto(URLS.admin + 'chat/active' );
    await expect(page.getByRole('tablist')).toBeVisible();
});

test('[smoke] Pending chats', async({ page }) => {
    await page.goto(URLS.admin + 'chat/pending' );
    await expect(page.getByRole('tablist')).toBeVisible();
});

test('[smoke] Chat history', async({ page }) => {
    await page.goto(URLS.admin + 'chat/history' );
    await expect(page.getByText('Kuvan korraga', { exact: true })).toBeVisible();
});
