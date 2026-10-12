import { expect, test } from '@setup/test-setup';
import { URLS } from '@utils/env';
import { registerServiceCleanup } from '@utils/helpers';
import { createServiceName, createValidServiceData } from '@utils/test-data';

const serviceName = createServiceName('newservice');
const neverCreatedName = createServiceName('nevercreated');
const description = `Description marker ${serviceName}`;

test.describe('[services] [functional] A created service persists the data it was authored with', () => {
  registerServiceCleanup(test, serviceName);

  test('Title and description survive saving and reopening the service', async ({
    page,
    newServicePage,
    servicesOverviewPage,
  }) => {
    await page.goto(URLS.admin + 'services/newService');
    await newServicePage.waitForReady();

    await test.step('Create the service with an authored title and description', async () => {
      await newServicePage.createNewService(createValidServiceData({ description, title: serviceName }));
    });

    await test.step('The overview lists the service by its authored name and description', async () => {
      await servicesOverviewPage.assertServiceRowVisible(serviceName);
      await expect(servicesOverviewPage.getRowColumns(serviceName).nth(1)).toContainText(description);
    });

    await test.step('A service that was never created is not listed', async () => {
      await servicesOverviewPage.assertRowDeleted(neverCreatedName);
    });

    await test.step('Reopening the service returns the authored values, not defaults', async () => {
      await servicesOverviewPage.clickEdit(serviceName);
      await newServicePage.waitForReady();
      await newServicePage.openSettings();

      await expect(await newServicePage.resolveVisibleTitleInput()).toHaveValue(serviceName);
      await expect(newServicePage.serviceDescriptionInput).toHaveValue(description);

      await newServicePage.closeSettingsDialog();
    });
  });
});
