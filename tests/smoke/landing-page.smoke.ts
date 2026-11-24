import { expect, test } from '@setup/test-setup';
import { openAdminPage } from '@utils/helpers';

test('[SMOKE] "Landing" page loads with the modules an admin may open', async ({ page, header, sideMenu }) => {
  const visit = await openAdminPage(page, 'chat/landing');

  await expect(page.getByRole('heading', { name: 'Welcome to Bürokratt', exact: true })).toBeVisible();

  await test.step('The header offers the admin session controls', async () => {
    await header.assertLogoVisible();
    await header.assertToggleSwitchVisible();
    await header.assertLogoutButtonVisible();
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
