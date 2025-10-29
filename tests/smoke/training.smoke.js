import { URLS } from '../../playwright.config';
const { test, expect } = require('../test-setup');

test('Intents page', async ({page}) => {
    await page.goto(URLS.admin + 'training/training/intents'  );
    await page.getByRole('switch', {id: 'show-common-toggle'}).waitFor({ state: 'visible' });
});

test('Responses page', async ({page}) => {
    await page.goto(URLS.admin + 'training/training/responses'  );
    await page.getByRole('button', {name: 'Lisa'}).waitFor({ state: 'visible' });
});

test('Rules page', async ({page}) => {
    await page.goto(URLS.admin + 'training/training/rules' );
    await page.getByPlaceholder('Otsi...').waitFor({ state: 'visible' });
});

test('Chat history page', async ({page}) => {
    await page.goto(URLS.admin + 'training/history/history' );
    await page.getByText('Algusaeg').waitFor({ state: 'visible' });
});

test('Intents overview page', async ({page}) => {
    await page.goto(URLS.admin + 'training/analytics/overview' );
    await page.getByText('Mudeli ülevaade', { expect: true }).waitFor({ state: 'visible' });
});

test('Models comparison page', async ({page}) => {
    await page.goto(URLS.admin + 'training/analytics/models' );
    await page.getByRole('heading', { name: 'Mudelid', exact: true }).waitFor({ state: 'visible' });
});

test('Model training page', async ({page}) => {
    await page.goto(URLS.admin + 'training/train-new-model' );
    await page.getByRole('button', { name: 'Treeni', exact: true}).waitFor({ state: 'visible' });
});