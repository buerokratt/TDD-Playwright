const { test, expect } = require('../.setup/test-setup');
const { URLS } = require('../../playwright.config');

test('[smoke] Services overview page', async({ page }) => {
    await page.goto(URLS.admin + 'services/overview' );
    await expect(page.getByRole('heading', { name: 'Teenused', exact: true })).toBeVisible();
});

test('[smoke] New service page', async({ page }) => {
    await page.goto(URLS.admin + 'services/newService' );
    await expect(page.getByText('Teenuse seaded')).toBeVisible();
    await expect(page.getByText('...')).toBeVisible();
});

test('[smoke] Faulty services page', async({ page }) => {
    await page.goto(URLS.admin + 'services/faultyServices' );
    await expect(page.getByRole('heading', { name: 'Probleemsed teenused' })).toBeVisible();
});