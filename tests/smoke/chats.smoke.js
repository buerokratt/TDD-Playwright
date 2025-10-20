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

test('Landing Page', async () => {
    await page.goto(URLS.admin + 'chat/landing');
    await page.getByText('Tere tulemast Bürokratti').isVisible();
});

test('Unanswered chats', async () => {
    await page.goto(URLS.admin + 'chat/unanswered');
    await page.getByRole('tablist').isVisible();
});

test('Active chats', async () => {
    await page.goto(URLS.admin + 'chat/active');
    await page.getByRole('tablist').isVisible();
});

test('Pending chats', async () => {
    await page.goto(URLS.admin + 'chat/pending');
    await page.getByRole('tablist').isVisible();
});

test('Chat history', async () => {
    await page.goto(URLS.admin + 'chat/pending');
    await page.getByText('Algusaeg').isVisible();
});
