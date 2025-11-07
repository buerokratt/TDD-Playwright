const { test, expect } = require('../test-setup');
import { URLS } from '../../playwright.config';

test('Analytics overview Page', async({ page }) => {
    await page.goto(URLS.admin + 'analytics/overview' );
    await expect(page.getByText('Vestluste koguarv')).toBeVisible();
});

test('Chats analytics page', async({ page }) => {
    await page.goto(URLS.admin + 'analytics/chats' );
    await expect(page.getByRole('heading', { name: 'Vestlused' })).toBeVisible();
});

test('Feedback analytics page', async({ page }) => {
    await page.goto(URLS.admin + 'analytics/feedback' );
    await expect(page.getByRole('heading', {name: 'Tagasiside'})).toBeVisible();
});

test('Advisors analytics page', async({ page }) => {
    await page.goto(URLS.admin + 'analytics/advisors' );
    await expect(page.getByRole('heading', {name: 'Nõustajad'})).toBeVisible();
});