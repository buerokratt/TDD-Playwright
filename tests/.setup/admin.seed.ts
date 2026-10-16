// the playwright test planner and generator start from this page, it is not a product test
import { test } from '@setup/test-setup';
import { URLS } from '@utils/env';

test('the admin landing page is open', async ({ page }) => {
  await page.goto(URLS.admin + 'chat/landing');
});
