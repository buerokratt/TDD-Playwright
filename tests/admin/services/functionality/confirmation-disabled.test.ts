import { expect, test } from '@setup/test-setup';
import { URLS } from '@utils/env/urls';
import { createServiceName } from '@utils/test-data/service-data';

import { getServicePages, registerServiceCleanup } from '../service-test-helpers';

const serviceName = createServiceName('confirmdisabled');

test.describe('[services] [functional] Confirm service disabled test', () => {
  registerServiceCleanup(test, serviceName);

  test('[services] [functional] Confirm service disabled test', async ({ page }) => {
    const { nsp, sop } = getServicePages(page);

    await page.goto(URLS.admin + 'services/newService');
    await expect(nsp.buttonConfirm).toBeDisabled();
    await nsp.saveService({ expectedToast: 'Pealkiri on kohustuslik' });

    await expect(page.locator('.toast__content')).toHaveText('Pealkiri on kohustuslik');

    await nsp.createNewService(serviceName);
    await sop.assertServiceRowVisible(serviceName);
  });
});
