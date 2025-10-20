import { test } from '@playwright/test';
import { URLS } from '../../playwright.config';
import { WidgetPage } from "../../page-objects/widget/widget-page";
const { AdminPageFactory: ap} = require('../../page-objects/admin-page-factory');

test('Chat flow test', async ({ browser })=>{
    // Setup
    const customerContext = await browser.newContext();
    const csaContext = await browser.newContext({
        storageState: 'tests/admin/.auth/user.json'
    });

    const cPage = await customerContext.newPage();
    const page = await csaContext.newPage();

    await Promise.all([
        cPage.goto(URLS.customer),
        page.goto(URLS.admin + 'chat/unanswered')
    ]);

    const csaPage = new ap(page);
    const customerPage = new WidgetPage(cPage);
    // End Setup

    await csaPage.getPageHeader().markCSAPresent();

    await cPage.bringToFront();
    await customerPage.openChat();
    await customerPage.getCSAChat();


    await page.bringToFront();
    await csaPage.getChats().acceptChat();

    await page.goto(URLS.admin + 'chat/active');
    await page.getByRole('tablist').getByRole('tab').isVisible();

    await cPage.close();
    await customerContext.close();

    await page.close();
    await csaContext.close();
});