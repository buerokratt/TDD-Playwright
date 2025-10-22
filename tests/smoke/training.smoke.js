import { URLS } from '../../playwright.config';
const { test, expect } = require('../test-setup');

test('Intents page', async ({page}) => {
    await page.goto(URLS.admin + 'training/training/intents' );
    // await page.getById('tabs').isVisible();
    await page.getByText('Teemad').isVisible();
});

test('Responses page', async ({page}) => {
    await page.goto(URLS.admin + 'training/training/responses' );
    await page.getByText('Vastus').isVisible();
});

test('Rules page', async ({page}) => {
    await page.goto(URLS.admin + 'training/training/rules' );
    await page.getByPlaceholder('Otsi...').isVisible();
});

test('Chat history page', async ({page}) => {
    await page.goto(URLS.admin + 'training/history/history');
    await page.getByText('Algusaeg').isVisible();
});

test('Intents overview page', async ({page}) => {
    await page.goto(URLS.admin + 'training/analytics/overview');
    await expect(page.getByText('Teemade ülevaade')).toBeVisible();
});

test('Models comparison page', async ({page}) => {
    await page.goto(URLS.admin + 'training/analytics/models');
    await expect(page.getByText('Mudelid')).toBeVisible();
});

test('Model training page', async ({page}) => {
    await page.goto(URLS.admin + 'training/analytics/overview');
    await page.getByText('Treeni').isVisible();
});