const { test, expect } = require('../test-setup');
import { URLS } from '../../playwright.config';

test('Users Page', async({ page }) => {
    await page.goto(URLS.admin + 'chat/users' );
    await page.getByText('Kasutajad').isVisible();
});

test('Settings Page', async({ page }) => {
    await page.goto(URLS.admin + 'chat/chatbot/settings' );
    await page.getByText('Seaded').isVisible();
});

test('Welcome message Page', async({ page }) => {
    await page.goto(URLS.admin + 'chat/chatbot/welcome-message' );
    await page.getByText('Tervitussõnum').isVisible();
});

test('Appearance Page', async({ page }) => {
    await page.goto(URLS.admin + 'chat/chatbot/appearance' );
    await page.getByText('Välimus ja käitumine').isVisible();
});

test('Emergency message Page', async({ page }) => {
    await page.goto(URLS.admin + 'chat/chatbot/emergency-notices' );
    await page.getByText('Erakorralised teated').isVisible();
});

test('Feedback Page', async({ page }) => {
    await page.goto(URLS.admin + 'chat/chatbot/feedback' );
    await page.getByText('Tagasiside').isVisible();
});

test('Working time Page', async({ page }) => {
    await page.goto(URLS.admin + 'chat/working-time' );
    await page.getByText('Asutuse tööaeg').isVisible();
});

test('Session lenght Page', async({ page }) => {
    await page.goto(URLS.admin + 'chat/session-length' );
    await page.getByText('Sessiooni pikkus').isVisible();
});