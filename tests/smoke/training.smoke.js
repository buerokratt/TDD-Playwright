import { URLS } from '../../playwright.config';
const { test, expect } = require('../test-setup');

test('Intents page', async ({page}) => {
    await page.goto(URLS.admin + 'training/training/intents'  );
    await expect(page.getByRole('switch', {name: 'Üldised teemad'})).toBeVisible();;
});

test('Responses page', async ({page}) => {
    await page.goto(URLS.admin + 'training/training/responses'  );
    await expect(page.getByRole('button', {name: 'Lisa'})).toBeVisible();;
});

test('Rules page', async ({page}) => {
    await page.goto(URLS.admin + 'training/training/rules' );
    await expect(page.getByPlaceholder('Otsi...')).toBeVisible();;
});

test('Chat history page', async ({page}) => {
    await page.goto(URLS.admin + 'training/history/history' );
    await expect(page.getByText('Algusaeg')).toBeVisible();;
});

test('Intents overview page', async ({page}) => {
    await page.goto(URLS.admin + 'training/analytics/overview' );
    await expect(page.getByText('Mudeli ülevaade', { expect: true })).toBeVisible();;
});

test('Models comparison page', async ({page}) => {
    await page.goto(URLS.admin + 'training/analytics/models' );
    await expect(page.getByRole('heading', { name: 'Mudelid', exact: true })).toBeVisible();;
});

test('Model training page', async ({page}) => {
    await page.goto(URLS.admin + 'training/train-new-model' );
    await expect(page.getByRole('button', { name: 'Treeni', exact: true})).toBeVisible();;
});