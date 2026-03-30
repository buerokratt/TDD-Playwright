const { test } = require('../../../.setup/test-setup');
const { URLS } = require('../../../../playwright.config');
const { AdminPageFactory: ap } = require('../../../../page-objects/admin-page-factory');
const { createServiceName, createValidServiceData } = require('../../../../utils/test-data/service-data');

const serviceName = createServiceName('newservice');

test.describe('[services] [functional] New service test', () => {
  test.describe.configure({ mode: 'serial' });

  test('[services] [functional] Creating new service test', async ({ page }) => {
    const apf = new ap(page);
    const nsp = apf.getNewServicePage();
    const sop = apf.getServicesOverview();

    await page.goto(URLS.admin + 'services/newService');

    await nsp.createNewService(createValidServiceData({ title: serviceName }));
    await sop.waitForReady();
    await sop.assertServiceRowVisible(serviceName);
  });

  test('[services] [functional] Delete new service test', async ({ page }) => {
    await page.goto(URLS.admin + 'services/overview');

    const sop = new ap(page).getServicesOverview();
    await sop.assertServiceRowVisible(serviceName);
    await sop.deleteService(serviceName);
    await sop.assertRowDeleted(serviceName);
  });
});
