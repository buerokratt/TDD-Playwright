import { test } from '@playwright/test';
import { URLS } from '../../playwright.config';

let page;

test.beforeAll( async ({ browser }) => {
    const context = await browser.newContext({
        storageState: 'tests/admin/.auth/user.json'
    });
    page = await context.newPage();
});

test.afterAll(async () => {
    page.close();
});

test('Analytics overview Page', async () => {
    await page.goto(URLS.admin + 'analytics/overview');
    await page.getByText('Vestluste koguarv').isVisible();
});

test('Chats analytics page', async () => {
    await page.goto(URLS.admin + 'analytics/chats');
    await page.getByText('Vestlused').isVisible();
});

test('Feedback analytics page', async () => {
    await page.goto(URLS.admin + 'analytics/feedback');
    await page.getByRole('Tagasiside').isVisible();
});

test('Advisors analytics page', async () => {
    await page.goto(URLS.admin + 'analytics/advisors');
    await page.getByRole('Nõustajad').isVisible();
});