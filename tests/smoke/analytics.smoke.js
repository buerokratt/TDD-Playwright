const { test, expect } = require('../test-setup');
import { URLS } from '../../playwright.config';

test('Analytics overview Page', async({ page }) => {
    await page.goto(URLS.admin + 'analytics/overview' );
    await page.getByText('Vestluste koguarv').isVisible();
});

test('Chats analytics page', async({ page }) => {
    await page.goto(URLS.admin + 'analytics/chats' );
    await page.getByText('Vestlused').isVisible();
});

test('Feedback analytics page', async({ page }) => {
    await page.goto(URLS.admin + 'analytics/feedback' );
    await page.getByRole('Tagasiside').isVisible();
});

test('Advisors analytics page', async({ page }) => {
    await page.goto(URLS.admin + 'analytics/advisors' );
    await page.getByRole('Nõustajad').isVisible();
});