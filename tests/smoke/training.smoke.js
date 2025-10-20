import { test } from '@playwright/test';
import { URLS } from '../../playwright.config';

let page;

test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext({
        storageState: 'tests/admin/.auth/user.json'
    });
    page = await context.newPage();
});

test.afterAll(async () => {
   page.close();
});

test('Intents page', async () => {
    await page.goto(URLS.admin + 'training/training/intents');
    // await page.getById('tabs').isVisible();
    await page.getByText('Teemad').isVisible();
});

test('Responses page', async () => {
    await page.goto(URLS.admin + 'training/training/responses');
    await page.getByText('Vastus').isVisible();
});

test('Rules page', async () => {
    await page.goto(URLS.admin + 'training/training/rules');
    await page.getByPlaceholder('Otsi...').isVisible();
});

test('Chat history page', async () => {
    await page.goto(URLS.admin + 'training/history/history');
    await page.getByText('Algusaeg').isVisible();
});

test('Intents overview page', async () => {
    await page.goto(URLS.admin + 'training/analytics/overview');
    await page.getByText('Teemade ülevaade').isVisible();
});

test('Models comparison page', async () => {
    await page.goto(URLS.admin + 'training/analytics/models');
    await page.getByText('Teemade ülevaade').isVisible();
});

test('Model training page', async () => {
    await page.goto(URLS.admin + 'training/analytics/overview');
    await page.getByText('Treeni').isVisible();
});