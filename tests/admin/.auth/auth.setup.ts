import { AUTH_FILE, ensureAuthDirectory } from '@auth/auth.helpers';
import { expect, test as setup } from '@setup/test-setup';
import { seedEnglishLocale } from '@utils/helpers';

setup('authenticate', async ({ page }) => {
  await ensureAuthDirectory(AUTH_FILE);

  await seedEnglishLocale(page);

  await page.goto('/');

  await page.getByRole('button', { name: 'enter via TARA' }).click();

  const mobiilIdLink = page.getByRole('link', { name: 'Mobiil-ID', exact: true });
  await mobiilIdLink.waitFor({ state: 'visible', timeout: 180000 });

  const personalCode = page.getByRole('textbox', { name: 'Isikukood' });

  await expect(async () => {
    await mobiilIdLink.click();
    await expect(personalCode, 'TARA never opened the Mobiil-ID form').toBeVisible({ timeout: 5000 });
  }).toPass({ timeout: 30000 });

  await personalCode.fill('60001017869');
  await page.getByRole('textbox', { name: 'Telefoninumber' }).fill('68000769');
  await page.getByRole('button', { name: 'Jätka' }).click();

  await page.waitForURL('/chat/landing', {
    timeout: 60000,
  });

  await page.context().storageState({ path: AUTH_FILE });
});
