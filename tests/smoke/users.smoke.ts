import { test, expect } from '@setup/test-setup';
import { URLS } from '@utils/env/urls';

test('[smoke] Users page loads with add-user button', async ({ page }) => {
  await page.goto(URLS.admin + 'chat/users');

  await expect(page.getByRole('button', { name: 'Lisa kasutaja' })).toBeVisible();
});
