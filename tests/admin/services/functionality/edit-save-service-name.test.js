const { test, expect } = require('../../../.setup/test-setup');
const { URLS } = require('../../../../playwright.config');
const { createServiceName, createUpdatedServiceName, createValidServiceData } = require('../../../../utils/test-data/service-data');
const { getServicePages, registerServiceCleanup } = require('../service-test-helpers');

const serviceName = createServiceName('editservice');
const updatedName = createUpdatedServiceName(serviceName);

test.describe('[services] [functional] Edit and save service test', () => {
  registerServiceCleanup(test, () => [updatedName, serviceName]);

  test('[services] [functional] Edit and save service test', async ({ page }) => {
    const { nsp, sop } = getServicePages(page);

    await page.goto(URLS.admin + 'services/newService');
    await nsp.waitForReady();

    await test.step('Create new service and return to overview', async () => {
      await nsp.createNewService(createValidServiceData({ title: serviceName }));
      await sop.assertServiceRowVisible(serviceName);
    });

    await test.step('Open service in edit mode', async () => {
      await sop.clickEdit(serviceName);
      await nsp.waitForReady();
      await nsp.assertCanvasVisible();
    });

    await test.step('Update title via settings and save', async () => {
      await nsp.setTitle(updatedName);
      await nsp.saveService();
    });

    await test.step('Open widget (sanity)', async () => {
      await expect(nsp.widget).toBeVisible();
      await nsp.openWidget();
    });

    await test.step('Return to overview and verify updated row', async () => {
      await nsp.returnToServicesOverview();
      await sop.assertServiceRowVisible(updatedName);
      await expect(sop.getServiceRow(updatedName)).toBeVisible();
    });
  });

});
