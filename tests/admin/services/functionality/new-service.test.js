const { test } = require('../../../.setup/test-setup');
const { URLS } = require('../../../../playwright.config');
const { createServiceName, createValidServiceData } = require('../../../../utils/test-data/service-data');
const { getServicePages, registerServiceCleanup } = require('../service-test-helpers');

const serviceName = createServiceName('newservice');

test.describe('[services] [functional] New service test', () => {
  registerServiceCleanup(test, serviceName);

  test('[services] [functional] Creating new service test', async ({ page }) => {
    const { nsp, sop } = getServicePages(page);

    await page.goto(URLS.admin + 'services/newService');

    await nsp.createNewService(createValidServiceData({ title: serviceName }));
    await sop.waitForReady();
    await sop.assertServiceRowVisible(serviceName);
  });

});
