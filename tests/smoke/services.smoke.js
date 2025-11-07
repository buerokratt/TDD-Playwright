const { test, expect } = require('../test-setup');
import { URLS } from '../../playwright.config';

test('Services overview page', async({ page }) => {
    await page.goto(URLS.admin + 'services/overview' );
    await expect(page.getByRole('heading', { name: 'Teenused', exact: true })).toBeVisible();
});

test('New service page', async({ page }) => {
    await page.goto(URLS.admin + 'services/newService' );
    await expect(page.getByText('Teenusvoo loomine')).toBeVisible();
});

test('Faulty services page', async({ page }) => {
    await page.goto(URLS.admin + 'services/faultyServices' );
    await expect(page.getByRole('heading', { name: 'Probleemsed teenused' })).toBeVisible();
});