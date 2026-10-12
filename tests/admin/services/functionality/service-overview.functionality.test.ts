import { expect, test } from '@setup/test-setup';
import { URLS } from '@utils/env';
import { registerServiceCleanup } from '@utils/helpers';
import { createServiceName, createValidServiceData } from '@utils/test-data';

const serviceName = createServiceName('overview');

test.describe('[services] [functional] The services overview lists a created service and drops it on delete', () => {
  registerServiceCleanup(test, serviceName);

  test('A created service appears as its own row and is gone after delete', async ({
    page,
    newServicePage,
    servicesOverviewPage,
  }) => {
    await test.step('Create a uniquely-named service', async () => {
      await page.goto(URLS.admin + 'services/newService');
      await newServicePage.waitForReady();
      await newServicePage.setTitle(createValidServiceData({ title: serviceName }).title);
      await newServicePage.saveService();
    });

    await test.step('The service appears in the overview with a status and a delete control', async () => {
      await page.goto(URLS.admin + 'services/overview');
      await servicesOverviewPage.waitForReady();

      const row = await servicesOverviewPage.findServiceRow(serviceName);
      await expect(row).toBeVisible();

      const columns = servicesOverviewPage.getRowColumns(row);
      await expect(columns.nth(0)).toContainText(serviceName);
      await expect(columns.nth(2)).toContainText(/Draft|Ready|Active/);
      await expect(columns.nth(4).getByRole('button', { name: 'Delete' })).toBeVisible();
    });

    await test.step('Deleting the service removes exactly that row from the overview', async () => {
      await servicesOverviewPage.deleteService(serviceName);
      await servicesOverviewPage.assertRowDeleted(serviceName);
    });
  });
});
