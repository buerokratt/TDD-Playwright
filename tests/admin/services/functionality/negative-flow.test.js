const { test } = require('../../../.setup/test-setup');
const { URLS } = require('../../../../playwright.config');
const { AdminPageFactory: ap } = require('../../../../page-objects/admin-page-factory');
const { createServiceName } = require('../../../../utils/test-data/service-data');

const serviceName = createServiceName('negativeservice');

test.describe('[services] [functional] Service negative path test', () => {
  test('[services] [functional] Service negative path test', async ({ page }) => {
    const apf = new ap(page);
    apf.getNewServicePage();
    apf.getServicesOverview();

    await page.goto(URLS.admin + 'services/newService');
    void serviceName;
  });
});
