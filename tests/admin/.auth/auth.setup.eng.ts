import { AUTH_FILE, ensureAuthDirectory } from '@auth/auth.helpers';
import { test as setup } from '@setup/test-setup';
import { URLS } from '@utils/env/urls';

setup('authenticate english locale', async ({ page }) => {
  await ensureAuthDirectory(AUTH_FILE);

  await page.goto(`${URLS.admin}en/log-in`);

  await page.getByRole('button', { name: 'enter via TARA' }).click();
  await page.getByRole('link', { name: 'Smart-ID', exact: true }).click();
  await page.getByRole('textbox', { name: 'Isikukood' }).fill('61101012257');
  await page.getByRole('button', { name: 'Jätka' }).click();

  await page.waitForURL(`${URLS.admin}chat/landing`, { timeout: 60000 });
  await page.context().storageState({ path: AUTH_FILE });
});
