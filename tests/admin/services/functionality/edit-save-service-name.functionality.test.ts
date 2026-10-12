import { expect, test } from '@setup/test-setup';
import { URLS } from '@utils/env';
import { registerServiceCleanup } from '@utils/helpers';
import { createServiceName, createUpdatedServiceName, createValidServiceData } from '@utils/test-data';

const serviceName = createServiceName('editservice');
const updatedName = createUpdatedServiceName(serviceName);

test.describe('[services] [functional] Renaming a service replaces its old name everywhere', () => {
  registerServiceCleanup(test, () => [updatedName, serviceName]);

  test('A renamed service is listed under the new name only, and reopens with it', async ({
    page,
    newServicePage,
    servicesOverviewPage,
  }) => {
    await page.goto(URLS.admin + 'services/newService');
    await newServicePage.waitForReady();

    await test.step('Create the service under its original name', async () => {
      await newServicePage.createNewService(createValidServiceData({ title: serviceName }));
      await servicesOverviewPage.assertServiceRowVisible(serviceName);
    });

    await test.step('Rename the service in its editor and save', async () => {
      await servicesOverviewPage.clickEdit(serviceName);
      await newServicePage.waitForReady();
      await newServicePage.setTitle(updatedName);
      await newServicePage.saveService();
    });

    await test.step('The overview lists the new name and no longer the old one', async () => {
      await newServicePage.returnToServicesOverview();
      await servicesOverviewPage.assertServiceRowVisible(updatedName);
      await servicesOverviewPage.assertRowDeleted(serviceName);
    });

    await test.step('Reopening the service returns the new name, not the old one', async () => {
      await servicesOverviewPage.clickEdit(updatedName);
      await newServicePage.waitForReady();
      await newServicePage.openSettings();

      await expect(await newServicePage.resolveVisibleTitleInput()).toHaveValue(updatedName);

      await newServicePage.closeSettingsDialog();
    });
  });
});
