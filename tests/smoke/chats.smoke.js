const { test, expect } = require('../test-setup');
import { URLS } from '../../playwright.config';

test('Landing Page', async({ page }) => {
    await page.goto(URLS.admin + 'chat/landing' );
    await page.getByText('Tere tulemast Bürokratti').waitFor({ state: 'visible' })
});

test('Unanswered chats', async({ page }) => {
    await page.goto(URLS.admin + 'chat/unanswered' );
    await page.getByRole('tablist').waitFor({ state: 'visible' })
});

test('Active chats', async({ page }) => {
    await page.goto(URLS.admin + 'chat/active' );
    await page.getByRole('tablist').waitFor({ state: 'visible' })
});

test('Pending chats', async({ page }) => {
    await page.goto(URLS.admin + 'chat/pending' );
    await page.getByRole('tablist').waitFor({ state: 'visible' })
});

test('Chat history', async({ page }) => {
    await page.goto(URLS.admin + 'chat/history' );
    await page.getByText('Algusaeg').waitFor({ state: 'visible' })
});
