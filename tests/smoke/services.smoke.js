const { test, expect } = require('../test-setup');
import { URLS } from '../../playwright.config';

test('Services overview page', async({ page }) => {
    await page.goto(URLS.admin + 'services/overview' );
    await page.getByRole('heading', { name: 'Teenused', exact: true }).waitFor({ state: 'visible' })
});

test('New service page', async({ page }) => {
    await page.goto(URLS.admin + 'services/newService' );
    await page.getByText('Teenusvoo loomine').waitFor({ state: 'visible' })
});

test('Automatic services page', async({ page }) => {
    await page.goto(URLS.admin + 'services/auto-services' );
    await page.getByText('Ühendamistaotlused').waitFor({ state: 'visible' })
});

test('Faulty services page', async({ page }) => {
    await page.goto(URLS.admin + 'services/faultyServices' );
    await page.getByRole('heading', { name: 'Probleemsed teenused' }).waitFor({ state: 'visible' })
});