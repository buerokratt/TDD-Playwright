const { test, expect } = require('../.setup/test-setup');
import { URLS } from '../../playwright.config';

test('Landing Page', async({ page }) => {
    await page.goto(URLS.admin + 'chat/landing' );
    await expect(page.getByText('Tere tulemast Bürokratti')).toBeVisible();
});

test('Unanswered chats', async({ page }) => {
    await page.goto(URLS.admin + 'chat/unanswered' );
    await expect(page.getByRole('tablist')).toBeVisible();
});

test('Active chats', async({ page }) => {
    await page.goto(URLS.admin + 'chat/active' );
    await expect(page.getByRole('tablist')).toBeVisible();
});

test('Pending chats', async({ page }) => {
    await page.goto(URLS.admin + 'chat/pending' );
    await expect(page.getByRole('tablist')).toBeVisible();
});

test('Chat history', async({ page }) => {
    await page.goto(URLS.admin + 'chat/history' );
    await expect(page.getByText('Kuvan korraga', { exact: true })).toBeVisible();
});
