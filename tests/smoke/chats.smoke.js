const { test, expect } = require('../test-setup');
import { URLS } from '../../playwright.config';

test('Landing Page', async({ page }) => {
    await page.goto(URLS.admin + 'chat/landing' );
    await page.getByText('Tere tulemast Bürokratti').isVisible();
});

test('Unanswered chats', async({ page }) => {
    await page.goto(URLS.admin + 'chat/unanswered' );
    await page.getByRole('tablist').isVisible();
});

test('Active chats', async({ page }) => {
    await page.goto(URLS.admin + 'chat/active' );
    await page.getByRole('tablist').isVisible();
});

test('Pending chats', async({ page }) => {
    await page.goto(URLS.admin + 'chat/pending' );
    await page.getByRole('tablist').isVisible();
});

test('Chat history', async({ page }) => {
    await page.goto(URLS.admin + 'chat/pending' );
    await page.getByText('Algusaeg').isVisible();
});
