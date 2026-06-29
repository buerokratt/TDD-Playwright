import { test } from '@setup/test-setup';
import { URLS } from '@utils/env/urls';
import { createServiceName, createValidServiceData } from '@utils/test-data/service-data';

import { getServicePages, registerServiceCleanup } from '../service-test-helpers';

const serviceName = createServiceName('newservice');

test.describe('[services] [functional] New service test', () => {
  registerServiceCleanup(test, serviceName);

  test('[services] [functional] Creating new service test', async ({ page }) => {
    const { nsp, sop } = getServicePages(page);

    await page.goto(URLS.admin + 'services/newService');

    await nsp.createNewService(createValidServiceData({ title: serviceName }));
    await sop.waitForReady();
    await sop.assertServiceRowVisible(serviceName);
  });
});
