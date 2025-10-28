const { test, expect } = require('../test-setup');
import { URLS } from '../../playwright.config';

test('Analytics overview Page', async({ page }) => {
    await page.goto(URLS.admin + 'analytics/overview' );
    await page.getByText('Vestluste koguarv').waitFor({ state: 'visible' })
});

test('Chats analytics page', async({ page }) => {
    await page.goto(URLS.admin + 'analytics/chats' );
    await page.getByRole('heading', { name: 'Vestlused' }).waitFor({ state: 'visible' })
});

test('Feedback analytics page', async({ page }) => {
    await page.goto(URLS.admin + 'analytics/feedback' );
    await page.getByRole('heading', {name: 'Tagasiside'}).waitFor({ state: 'visible' })
});

test('Advisors analytics page', async({ page }) => {
    await page.goto(URLS.admin + 'analytics/advisors' );
    await page.getByRole('heading', {name: 'Nõustajad'}).waitFor({ state: 'visible' })
});