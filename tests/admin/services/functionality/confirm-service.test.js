const { test } = require('../../../.setup/test-setup');
const { URLS } = require('../../../../playwright.config');
const { createServiceName, createValidServiceData } = require('../../../../utils/test-data/service-data');
const { getServicePages, registerServiceCleanup } = require('../service-test-helpers');

const serviceName = createServiceName('confirmservice');

test.describe('[services] [functional] Confirm service test', () => {
  registerServiceCleanup(test, serviceName);

  test('[services] [functional] Confirm service test', async ({ page }) => {
    const { nsp, sop } = getServicePages(page);

    await page.goto(URLS.admin + 'services/newService');
    await nsp.createService(createValidServiceData({ title: serviceName }));
    await nsp.confirmService();
    await nsp.returnToServicesOverview();
    await sop.assertServiceRowVisible(serviceName);
    await sop.assertStatusReady(serviceName);
  });

});
