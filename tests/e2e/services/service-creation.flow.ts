// SERVICE CREATION STEPS
// 1. Create a service
// 2. Add nodes
// 3. Save + assert service is listed

import { AdminPageFactory } from '@page-objects/admin-page-factory';

import { test } from '@setup/test-setup';
import { URLS } from '@utils/env/urls';
import { createServiceName, createValidServiceData } from '@utils/test-data/service-data';

const randomString = createServiceName('e2e-service');

test.afterEach(async ({ page }) => {
  const sop = new AdminPageFactory(page).getServicesOverview();
  await page.goto(URLS.admin + 'services/overview');
  await sop.deleteServiceIfExists(randomString);
});

test.skip('Service creation flow', async ({ page }) => {
  const apf = new AdminPageFactory(page);
  const nsp = apf.getNewServicePage();
  const sop = apf.getServicesOverview();

  await page.goto(URLS.admin + 'services/newService');

  await nsp.createNewService(createValidServiceData({ title: randomString }));
  await sop.clickEdit(randomString);

  await nsp.addNodes();

  await nsp.editNode('Sõnum kliendile - 1');
  await page.waitForTimeout(3000);
  await nsp.addMessage('test');
  await nsp.buttonSave.last().click();

  await nsp.buttonSave.click();

  await nsp.returnToServicesOverview();
  await sop.assertServiceRowVisible(randomString);

  // TODO: confirm service
});
