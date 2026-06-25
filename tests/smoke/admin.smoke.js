const { test, expect } = require('../.setup/test-setup');
const { URLS } = require('../../playwright.config');

test('[smoke] Users Page', async({ page }) => {
    await page.goto(URLS.admin + 'chat/users' );
    await expect(page.getByRole('button', {name: 'Lisa kasutaja'})).toBeVisible();
});

test('[smoke] Settings Page', async({ page }) => {
    await page.goto(URLS.admin + 'chat/chatbot/settings' );
    await expect(page.getByLabel('Vestlusrobot aktiivne')).toBeVisible();
});

test('[smoke] Welcome message Page', async({ page }) => {
    await page.goto(URLS.admin + 'chat/chatbot/welcome-message' );
    await expect(page.getByLabel('Tervitus aktiivne')).toBeVisible();
});

test('[smoke] Appearance Page', async({ page }) => {
    await page.goto(URLS.admin + 'chat/chatbot/appearance' );
    await expect(page.getByRole('switch', {name: 'Märguandesõnum'})).toBeVisible();
});

test('[smoke] Emergency message Page', async({ page }) => {
    await page.goto(URLS.admin + 'chat/chatbot/emergency-notices' );
    await expect(page.getByLabel('Teade aktiivne')).toBeVisible();
});

test('[smoke] Feedback Page', async({ page }) => {
    await page.goto(URLS.admin + 'chat/chatbot/feedback' );
    await expect(page.getByLabel('Tagasiside aktiivne')).toBeVisible();
});

test('[smoke] Working time Page', async({ page }) => {
    await page.goto(URLS.admin + 'chat/working-time' );
    await expect(page.getByLabel('Kasutan klienditeenindust')).toBeVisible();
});

test('[smoke] Session lenght Page', async({ page }) => {
    await page.goto(URLS.admin + 'chat/session-length' );
    await expect(page.getByLabel('Sessiooni pikkus')).toBeVisible();
});