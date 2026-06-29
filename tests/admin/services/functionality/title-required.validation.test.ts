import { expect, test } from '@setup/test-setup';
import { URLS } from '@utils/env/urls';

import { AdminPageFactory } from '../../../../page-objects/admin-page-factory';

test.describe('[services] [functional] Service title validation', () => {
  test('[services] [functional] Service title is required before save succeeds', async ({ page }) => {
    const nsp = new AdminPageFactory(page).getNewServicePage();

    await page.goto(URLS.admin + 'services/newService');
    await nsp.waitForReady();

    await nsp.saveService({ expectedToast: 'Pealkiri on kohustuslik' });
    await expect(page.locator('.toast__content')).toHaveText('Pealkiri on kohustuslik');
  });
});
