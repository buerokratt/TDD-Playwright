import { AdminPageFactory } from '@page-objects/admin-page-factory';

import { test } from '@setup/test-setup';
import { URLS } from '@utils/env/urls';

test('[smoke] Test: has landing page loaded with menu', async ({ page }) => {
  await page.goto(URLS.admin + 'chat/landing');

  const apf = new AdminPageFactory(page);
  const topMenu = apf.getPageHeader();
  const sideMenu = apf.getSideMenu();

  await page.getByRole('heading', { name: 'Tere tulemast Bürokratti' }).waitFor({ state: 'visible' });

  // top menu elements
  await topMenu.assertLogoVisible();
  await topMenu.assertToggleSwitchVisible();
  await topMenu.assertLogoutButtonVisible();
  await sideMenu.assertCollapseButtonVisible();

  // side menu elements - when logged in as admin role
  await test.step('Assert chats module visible in menu', async () => {
    await sideMenu.assertVestlusedButtonVisible();
  });

  await test.step('Assert analytics module visible in menu', async () => {
    await sideMenu.assertAnalyytikaButtonVisible();
  });

  await test.step('Assert services module visible in menu', async () => {
    await sideMenu.assertTeenusedButtonVisible();
  });

  await test.step('Assert management module visible in menu', async () => {
    await sideMenu.assertHaldusButtonVisible();
  });
});
