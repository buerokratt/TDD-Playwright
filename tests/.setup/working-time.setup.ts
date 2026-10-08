import { AdminPageFactory } from '@page-objects/admin-page-factory';
import { test as setup } from '@setup/test-setup';

setup('the CSA is available for the suite', async ({ page }) => {
  await new AdminPageFactory(page).getOfficeOpeningHoursPage().enableCsaAllTime();
});
