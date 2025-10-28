const { test, expect } = require('../test-setup');
import { URLS } from '../../playwright.config';

test('Users Page', async({ page }) => {
    await page.goto(URLS.admin + 'chat/users' );
    await page.getByRole('button', {name: 'Lisa kasutaja'}).waitFor({ state: 'visible' })
});

test('Settings Page', async({ page }) => {
    await page.goto(URLS.admin + 'chat/chatbot/settings' );
    await page.getByLabel('Vestlusrobot aktiivne').waitFor({ state: 'visible' })
});

test('Welcome message Page', async({ page }) => {
    await page.goto(URLS.admin + 'chat/chatbot/welcome-message' );
    await page.getByLabel('Tervitus aktiivne').waitFor({ state: 'visible' })
});

test('Appearance Page', async({ page }) => {
    await page.goto(URLS.admin + 'chat/chatbot/appearance' );
    await page.getByRole('switch', {name: 'Märguandesõnum'}).waitFor({ state: 'visible' })
});

test('Emergency message Page', async({ page }) => {
    await page.goto(URLS.admin + 'chat/chatbot/emergency-notices' );
    await page.getByLabel('Teade aktiivne').waitFor({ state: 'visible' })
});

test('Feedback Page', async({ page }) => {
    await page.goto(URLS.admin + 'chat/chatbot/feedback' );
    await page.getByLabel('Tagasiside aktiivne').waitFor({ state: 'visible' })
});

test('Working time Page', async({ page }) => {
    await page.goto(URLS.admin + 'chat/working-time' );
    await page.getByLabel('Kasutan klienditeenindust').waitFor({ state: 'visible' })
});

test('Session lenght Page', async({ page }) => {
    await page.goto(URLS.admin + 'chat/session-length' );
    await page.getByLabel('Sessiooni pikkus').waitFor({ state: 'visible' })
});