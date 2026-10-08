import { expect, test } from '@setup/test-setup';
import { URLS } from '@utils/env';
import { getServicePages, registerServiceCleanup } from '@utils/helpers';
import { createServiceName, createValidServiceData } from '@utils/test-data';

const serviceName = createServiceName('confirmservice');

test.describe('[services] [functional] Confirming a service changes its state', () => {
  registerServiceCleanup(test, serviceName);

  test('A saved service stays Draft until it is confirmed, then turns Ready', async ({ page }) => {
    const { nsp, sop } = getServicePages(page);

    await page.goto(URLS.admin + 'services/newService');

    await test.step('A freshly saved service is listed as Draft, not Ready', async () => {
      await nsp.createNewService(createValidServiceData({ title: serviceName }));
      await sop.assertServiceRowVisible(serviceName);

      const statusCell = sop.getRowColumns(serviceName).nth(2);
      await expect(statusCell).toContainText('Draft');
      await expect(statusCell).not.toContainText('Ready');
    });

    await test.step('Confirm the service from its editor', async () => {
      await sop.clickEdit(serviceName);
      await nsp.confirmService();
      await nsp.returnToServicesOverview();
    });

    await test.step('The same service is now listed as Ready and no longer as Draft', async () => {
      await sop.assertStatusReady(serviceName);
      await expect(sop.getRowColumns(serviceName).nth(2)).not.toContainText('Draft');
    });
  });
});
