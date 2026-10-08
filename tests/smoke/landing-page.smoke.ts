import { AdminPageFactory } from '@page-objects/admin-page-factory';
import { expect, test } from '@setup/test-setup';
import { openAdminPage } from '@utils/helpers';

test('[SMOKE] "Landing" page loads with the modules an admin may open', async ({ page }) => {
  const visit = await openAdminPage(page, 'chat/landing');

  const apf = new AdminPageFactory(page);
  const topMenu = apf.getPageHeader();
  const sideMenu = apf.getSideMenu();

  await expect(page.getByRole('heading', { name: 'Welcome to Bürokratt', exact: true })).toBeVisible();

  await test.step('The header offers the admin session controls', async () => {
    await topMenu.assertLogoVisible();
    await topMenu.assertToggleSwitchVisible();
    await topMenu.assertLogoutButtonVisible();
    await sideMenu.assertCollapseButtonVisible();
  });

  await test.step('The side menu offers every module an admin role has', async () => {
    await sideMenu.assertConversationsButtonVisible();
    await sideMenu.assertAnalyticsButtonVisible();
    await sideMenu.assertServicesButtonVisible();
    await sideMenu.assertAdministrationButtonVisible();
  });

  visit.assertBackendAnswered();
  visit.assertNoFailedApiCalls();
});
