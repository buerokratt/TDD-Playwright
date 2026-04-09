const { URLS } = require('../../playwright.config');
const { test, expect } = require('../.setup/test-setup');

test('[smoke] Intents page', async ({page}) => {
    await page.goto(URLS.admin + 'training/training/intents'  );
    await expect(page.getByRole('switch', {name: 'Üldised teemad'})).toBeVisible();
});

test('[smoke] Responses page', async ({page}) => {
    await page.goto(URLS.admin + 'training/training/responses'  );
    await expect(page.getByRole('button', {name: 'Lisa'})).toBeVisible();
});

test('[smoke] Rules page', async ({page}) => {
    await page.goto(URLS.admin + 'training/training/rules' );
    await expect(page.getByPlaceholder('Otsi...')).toBeVisible();
});

test('[smoke] Chat history page', async ({page}) => {
    await page.goto(URLS.admin + 'training/history/history' );
    await expect(page.getByText('Algusaeg')).toBeVisible();
});

test('[smoke] Intents overview page', async ({page}) => {
    await page.goto(URLS.admin + 'training/analytics/overview' );
    await expect(page.getByText('Mudeli ülevaade', { expect: true })).toBeVisible();
});

test('[smoke] Models comparison page', async ({page}) => {
    await page.goto(URLS.admin + 'training/analytics/models' );
    await expect(page.getByRole('heading', { name: 'Mudelid', exact: true })).toBeVisible();
});

test('[smoke] Model training page', async ({page}) => {
    await page.goto(URLS.admin + 'training/train-new-model' );
    await expect(page.getByRole('button', { name: 'Treeni', exact: true})).toBeVisible();
});