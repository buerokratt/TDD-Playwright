import { URLS } from '../../playwright.config';
const { test, expect } = require('../test-setup');
const {AdminPageFactory: ap} = require("../../page-objects/admin-page-factory");

test('Test: has landing page loaded with menu', async ({page}) => {
    await page.goto(URLS.admin + 'chat/landing');

    const apf = new ap(page);
    const topMenu = apf.getPageHeader();
    const sideMenu = apf.getSideMenu();

    await page.getByRole('heading', {name: 'Tere tulemast Bürokratti'}).waitFor({ state: 'visible' });

    // top menu elements
    await topMenu.assertLogoVisible();
    await topMenu.assertToggleSwitchVisible();
    await topMenu.assertLogoutButtonVisible();

    // side menu elements - when logged in as admin role
    await sideMenu.assertCollapseButtonVisible();
    await sideMenu.assertVestlusedButtonVisible();
    await sideMenu.assertTreeningButtonVisible();
    await sideMenu.assertAnalyytikaButtonVisible();
    await sideMenu.assertTeenusedButtonVisible();
    await sideMenu.assertHaldusButtonVisible();
});