import { test } from '@setup/test-setup';
import { URLS } from '@utils/env';

test('seed', async ({ page }) => {
  await page.goto(URLS.admin + 'chat/landing');
});
