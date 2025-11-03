import { test } from '@playwright/test';
import { URLS } from '../../../playwright.config';
import { WidgetPage } from "../../../page-objects/widget/widget-page";
const { AdminPageFactory: ap} = require('../../../page-objects/admin-page-factory');

test.afterEach(async () => {
    await page.on('console', msg => {
        const errorPattern = /error|failed|uncaught|exception|typeerror|referenceerror|syntaxerror|rangeerror|evalerror|urlerror|is not defined|cannot read|undefined|null is not an object/i;

        if (msg.type() === 'error' || errorPattern.test(msg.text())) {
            console.log(`[${msg.type().toUpperCase()}] ${msg.text()}`);
        }
    });
});

test('Chat flow test', async ({ browser })=>{

    // TODO: rewrite test to use test-setup.js

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

    const str = randomString3();
    const csaPage = new ap(page);
    const customerPage = new WidgetPage(cPage);
    // End Setup

    await csaPage.getPageHeader().markCSAPresent();

    await cPage.bringToFront();
    await customerPage.openChat();
    await customerPage.getCSAChat();


    await page.bringToFront();
    await csaPage.getChats().acceptChat();

    await page.getByRole('tablist', {name: 'Aktiivsed vestlused'}).isVisible();
    await page.getByText('Lõpeta vestlus').isVisible();

    await customerContext.clearCookies();
});