const { test, expect } = require('../../../.setup/test-setup');
const { URLS } = require('../../../../playwright.config');
const { AdminPageFactory: ap } = require('../../../../page-objects/admin-page-factory');

test.describe('[services] [functional] Service title validation', () => {
    test('[services] [functional] Service title is required before save succeeds', async ({ page }) => {
        const nsp = new ap(page).getNewServicePage();

        await page.goto(URLS.admin + 'services/newService');
        await nsp.waitForReady();

        await nsp.saveService({ expectedToast: 'Pealkiri on kohustuslik' });
        await expect(page.locator('.toast__content')).toHaveText('Pealkiri on kohustuslik');
    });
});
