const { test, expect } = require('../test-setup');
import { URLS } from '../../playwright.config';

test('Users Page', async({ page }) => {
    await page.goto(URLS.admin + 'chat/users' );
    await expect(page.getByRole('button', {name: 'Lisa kasutaja'})).toBeVisible();
});

test('Settings Page', async({ page }) => {
    await page.goto(URLS.admin + 'chat/chatbot/settings' );
    await expect(page.getByLabel('Vestlusrobot aktiivne')).toBeVisible();
});

test('Welcome message Page', async({ page }) => {
    await page.goto(URLS.admin + 'chat/chatbot/welcome-message' );
    await expect(page.getByLabel('Tervitus aktiivne')).toBeVisible();
});

test('Appearance Page', async({ page }) => {
    await page.goto(URLS.admin + 'chat/chatbot/appearance' );
    await expect(page.getByRole('switch', {name: 'Märguandesõnum'})).toBeVisible();
});

test('Emergency message Page', async({ page }) => {
    await page.goto(URLS.admin + 'chat/chatbot/emergency-notices' );
    await expect(page.getByLabel('Teade aktiivne')).toBeVisible();
});

test('Feedback Page', async({ page }) => {
    await page.goto(URLS.admin + 'chat/chatbot/feedback' );
    await expect(page.getByLabel('Tagasiside aktiivne')).toBeVisible();
});

test('Working time Page', async({ page }) => {
    await page.goto(URLS.admin + 'chat/working-time' );
    await expect(page.getByLabel('Kasutan klienditeenindust')).toBeVisible();
});

test('Session lenght Page', async({ page }) => {
    await page.goto(URLS.admin + 'chat/session-length' );
    await expect(page.getByLabel('Sessiooni pikkus')).toBeVisible();
});