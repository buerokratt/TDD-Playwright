const { test } = require('../../../.setup/test-setup');
const { URLS } = require('../../../../playwright.config');
const { AdminPageFactory: ap } = require('../../../../page-objects/admin-page-factory');
const { createServiceName, createValidServiceData } = require('../../../../utils/test-data/service-data');

const serviceName = createServiceName('confirmservice');

test.describe('[services] [functional] Confirm service test', () => {
  test.describe.configure({ mode: 'serial' });

  test('[services] [functional] Confirm service test', async ({ page }) => {
    const apf = new ap(page);
    const nsp = apf.getNewServicePage();
    const sop = apf.getServicesOverview();

    await page.goto(URLS.admin + 'services/newService');
    await nsp.createNewService(createValidServiceData({ title: serviceName }));
    await sop.clickEdit(serviceName);
    await nsp.buttonConfirm.click();
    await sop.assertServiceRowVisible(serviceName);
    await sop.assertStatusReady(serviceName);
  });

  test('[services] [functional] Delete new service test', async ({ page }) => {
    await page.goto(URLS.admin + 'services/overview');
    const sop = new ap(page).getServicesOverview();
    await sop.assertServiceRowVisible(serviceName);
    await sop.deleteService(serviceName);
    await sop.assertRowDeleted(serviceName);
  });
});
