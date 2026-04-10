const { test, expect } = require('../.setup/test-setup');
const { URLS } = require('../../playwright.config');

test('[smoke] Analytics overview Page', async({ page }) => {
    await page.goto(URLS.admin + 'analytics/overview' );
    await expect(page.getByText('Vestluste koguarv')).toBeVisible();
});

test('[smoke] Chats analytics page', async({ page }) => {
    await page.goto(URLS.admin + 'analytics/chats' );
    await expect(page.getByRole('heading', { name: 'Vestlused' })).toBeVisible();
});

test('[smoke] Feedback analytics page', async({ page }) => {
    await page.goto(URLS.admin + 'analytics/feedback' );
    await expect(page.getByRole('heading', {name: 'Tagasiside'})).toBeVisible();
});

test('[smoke] Advisors analytics page', async({ page }) => {
    await page.goto(URLS.admin + 'analytics/advisors' );
    await expect(page.getByRole('heading', {name: 'Nõustajad'})).toBeVisible();
});