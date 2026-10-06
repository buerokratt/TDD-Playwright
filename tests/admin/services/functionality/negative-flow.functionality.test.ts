import { expect, test } from '@setup/test-setup';
import { URLS } from '@utils/env';
import { registerServiceCleanup } from '@utils/helpers';
import { createServiceName } from '@utils/test-data';

const serviceName = createServiceName('negativeservice');

test.describe('[services] [functional] A service without a title is rejected', () => {
  registerServiceCleanup(test, serviceName);

  test('A titleless save creates no service, and the same draft saves once the title is supplied', async ({
    page,
    newServicePage,
    servicesOverviewPage,
  }) => {
    await page.goto(URLS.admin + 'services/newService');
    await newServicePage.waitForReady();

    await test.step('Saving a titleless draft is refused and creates no service', async () => {
      await newServicePage.saveService({ expectedToast: 'Title is mandatory' });

      await expect(page).toHaveURL(/services\/newService/i);
      await expect(newServicePage.confirmServiceBtn).toBeDisabled();
    });

    await test.step('Supplying a title lets the same draft save and create the service', async () => {
      await newServicePage.setTitle(serviceName);
      await newServicePage.saveService();

      await expect(page).toHaveURL(/services\/edit\//i);
    });

    await test.step('Only the titled service reaches the overview', async () => {
      await newServicePage.returnToServicesOverview();
      await servicesOverviewPage.assertServiceRowVisible(serviceName);
    });
  });
});
