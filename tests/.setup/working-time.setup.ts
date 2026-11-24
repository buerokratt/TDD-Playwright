import { test as setup } from '@setup/test-setup';

setup('the CSA is available for the suite', async ({ officeOpeningHoursPage }) => {
  await officeOpeningHoursPage.enableCsaAllTime();
});
