const { test } = require('../../../.setup/test-setup');
const { URLS } = require('../../../../playwright.config');
const { AdminPageFactory: ap } = require('../../../../page-objects/admin-page-factory');
const { createServiceName } = require('../../../../utils/test-data/service-data');
const { expect } = require('@playwright/test');

const serviceName = createServiceName('confirmdisabled');

test.describe('[services] [functional] Confirm service disabled test', () => {
  test('[services] [functional] Confirm service disabled test', async ({ page }) => {
    const apf = new ap(page);
    const nsp = apf.getNewServicePage();
    const sop = apf.getServicesOverview();

    await page.goto(URLS.admin + 'services/newService');
    await expect(nsp.buttonConfirm).toBeDisabled();
    await nsp.saveService({ expectedToast: 'Pealkiri on kohustuslik' });

    await expect(page.locator('.toast__content')).toHaveText('Pealkiri on kohustuslik');

    await nsp.createNewService(serviceName);
    await sop.assertServiceRowVisible(serviceName);
  });
});
