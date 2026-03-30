const { URLS } = require('../../playwright.config');
const { test, expect } = require('../.setup/test-setup');
const {AdminPageFactory: ap} = require("../../page-objects/admin-page-factory");

test('[smoke] Test: has landing page loaded with menu', async ({page}) => {
    await page.goto(URLS.admin + 'chat/landing');

    const apf = new ap(page);
    const topMenu = apf.getPageHeader();
    const sideMenu = apf.getSideMenu();

    await page.getByRole('heading', {name: 'Tere tulemast Bürokratti'}).waitFor({ state: 'visible' });

    // top menu elements
    await topMenu.assertLogoVisible();
    await topMenu.assertToggleSwitchVisible();
    await topMenu.assertLogoutButtonVisible();
    await sideMenu.assertCollapseButtonVisible();

    // side menu elements - when logged in as admin role
    await test.step('Assert chats module visible in menu', async () => {
        await sideMenu.assertVestlusedButtonVisible();
    });

    await test.step('Assert training module visible in menu', async () => {
        await sideMenu.assertTreeningButtonVisible();
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