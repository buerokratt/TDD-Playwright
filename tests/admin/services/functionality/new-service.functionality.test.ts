import { expect, test } from '@setup/test-setup';
import { URLS } from '@utils/env';
import { getServicePages, registerServiceCleanup } from '@utils/helpers';
import { createServiceName, createValidServiceData } from '@utils/test-data';

const serviceName = createServiceName('newservice');
const neverCreatedName = createServiceName('nevercreated');
const description = `Description marker ${serviceName}`;

test.describe('[services] [functional] A created service persists the data it was authored with', () => {
  registerServiceCleanup(test, serviceName);

  test('Title and description survive saving and reopening the service', async ({ page }) => {
    const { nsp, sop } = getServicePages(page);

    await page.goto(URLS.admin + 'services/newService');
    await nsp.waitForReady();

    await test.step('Create the service with an authored title and description', async () => {
      await nsp.createNewService(createValidServiceData({ description, title: serviceName }));
    });

    await test.step('The overview lists the service by its authored name and description', async () => {
      await sop.assertServiceRowVisible(serviceName);
      await expect(sop.getRowColumns(serviceName).nth(1)).toContainText(description);
    });

    await test.step('A service that was never created is not listed', async () => {
      await sop.assertRowDeleted(neverCreatedName);
    });

    await test.step('Reopening the service returns the authored values, not defaults', async () => {
      await sop.clickEdit(serviceName);
      await nsp.waitForReady();
      await nsp.openSettings();

      await expect(await nsp.resolveVisibleTitleInput()).toHaveValue(serviceName);
      await expect(nsp.serviceDescriptionInput).toHaveValue(description);

      await nsp.closeSettingsDialog();
    });
  });
});
