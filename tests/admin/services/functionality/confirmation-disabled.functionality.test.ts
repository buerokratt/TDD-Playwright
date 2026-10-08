import { expect, test } from '@setup/test-setup';
import { URLS } from '@utils/env';
import { getServicePages, registerServiceCleanup } from '@utils/helpers';
import { createServiceName } from '@utils/test-data';

const serviceName = createServiceName('confirmdisabled');

test.describe('[services] [functional] Confirm is gated on the service having a title', () => {
  registerServiceCleanup(test, serviceName);

  test('Confirm stays disabled without a title and becomes enabled once one is typed', async ({ page }) => {
    const { nsp } = getServicePages(page);

    await page.goto(URLS.admin + 'services/newService');
    await nsp.waitForReady();

    await test.step('Confirm is disabled on a draft that has no title', async () => {
      await expect(nsp.confirmServiceBtn).toBeDisabled();
    });

    await test.step('A save rejected for the missing title leaves Confirm disabled', async () => {
      await nsp.saveService({ expectedToast: 'Title is mandatory' });
      await expect(nsp.confirmServiceBtn).toBeDisabled();
    });

    await test.step('A typed title enables Confirm while the draft is still unsaved', async () => {
      await nsp.setTitle(serviceName);

      await expect(page).toHaveURL(/services\/newService/);
      await expect(nsp.confirmServiceBtn).toBeEnabled();
    });
  });
});
