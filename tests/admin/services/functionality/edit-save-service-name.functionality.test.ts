import { expect, test } from '@setup/test-setup';
import { URLS } from '@utils/env';
import { getServicePages, registerServiceCleanup } from '@utils/helpers';
import { createServiceName, createUpdatedServiceName, createValidServiceData } from '@utils/test-data';

const serviceName = createServiceName('editservice');
const updatedName = createUpdatedServiceName(serviceName);

test.describe('[services] [functional] Renaming a service replaces its old name everywhere', () => {
  registerServiceCleanup(test, () => [updatedName, serviceName]);

  test('A renamed service is listed under the new name only, and reopens with it', async ({ page }) => {
    const { nsp, sop } = getServicePages(page);

    await page.goto(URLS.admin + 'services/newService');
    await nsp.waitForReady();

    await test.step('Create the service under its original name', async () => {
      await nsp.createNewService(createValidServiceData({ title: serviceName }));
      await sop.assertServiceRowVisible(serviceName);
    });

    await test.step('Rename the service in its editor and save', async () => {
      await sop.clickEdit(serviceName);
      await nsp.waitForReady();
      await nsp.setTitle(updatedName);
      await nsp.saveService();
    });

    await test.step('The overview lists the new name and no longer the old one', async () => {
      await nsp.returnToServicesOverview();
      await sop.assertServiceRowVisible(updatedName);
      await sop.assertRowDeleted(serviceName);
    });

    await test.step('Reopening the service returns the new name, not the old one', async () => {
      await sop.clickEdit(updatedName);
      await nsp.waitForReady();
      await nsp.openSettings();

      await expect(await nsp.resolveVisibleTitleInput()).toHaveValue(updatedName);

      await nsp.closeSettingsDialog();
    });
  });
});
