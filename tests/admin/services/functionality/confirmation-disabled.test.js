const { test } = require('../../../.setup/test-setup');
const { URLS } = require('../../../../playwright.config');
const { createServiceName } = require('../../../../utils/test-data/service-data');
const { expect } = require('@playwright/test');
const { getServicePages, registerServiceCleanup } = require('../service-test-helpers');

const serviceName = createServiceName('confirmdisabled');

test.describe('[services] [functional] Confirm service disabled test', () => {
  registerServiceCleanup(test, serviceName);

  test('[services] [functional] Confirm service disabled test', async ({ page }) => {
    const { nsp, sop } = getServicePages(page);

    await page.goto(URLS.admin + 'services/newService');
    await expect(nsp.buttonConfirm).toBeDisabled();
    await nsp.saveService({ expectedToast: 'Pealkiri on kohustuslik' });

    await expect(page.locator('.toast__content')).toHaveText('Pealkiri on kohustuslik');

    await nsp.createNewService(serviceName);
    await sop.assertServiceRowVisible(serviceName);
  });
});
