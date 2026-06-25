const { test, expect } = require('../../../.setup/test-setup');
const { URLS } = require('../../../../playwright.config');
const { createServiceName } = require('../../../../utils/test-data/service-data');
const { getServicePages, registerServiceCleanup } = require('../service-test-helpers');

const serviceName = createServiceName('negativeservice');

test.describe('[services] [functional] Service negative path test', () => {
  registerServiceCleanup(test, serviceName);

  test('[services] [functional] Service negative path test', async ({ page }) => {
    const { nsp, sop } = getServicePages(page);

    await page.goto(URLS.admin + 'services/newService');
    await nsp.waitForReady();

    await test.step('Saving without required title shows validation error', async () => {
      await nsp.saveService({ expectedToast: 'Pealkiri on kohustuslik' });
      await expect(page.locator('.toast__content')).toHaveText('Pealkiri on kohustuslik');
      await expect(nsp.confirmServiceBtn).toBeDisabled();
    });

    await test.step('No service row is created in overview', async () => {
      await nsp.returnToServicesOverview();
      await expect(await sop.findServiceRow(serviceName, { pageSize: '50' })).toHaveCount(0);
    });
  });
});
