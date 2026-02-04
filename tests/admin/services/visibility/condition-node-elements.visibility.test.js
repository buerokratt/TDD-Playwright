import {NewServicePage} from "../../../page-objects/services/newservice/new-service-page";

const { test, expect } = require('../../.setup/test-setup');
import { URLS } from '../../../playwright.config';

test('Service canvas nodes visibility', async ({ page }) => {
    await page.goto(URLS.admin + 'services/newService');
    const nsp = new NewServicePage(page);



    await test.step('Sõnum kliendile node elements visibility', async () => {
        await nsp.clickAddNode();
        await nsp.selectNode(nsp.buttonMessageForCustomer);
        await nsp.assertNodeVisible(nsp.buttonMessageForCustomer);
        await nsp.deleteNode(nsp.buttonMessageForCustomer);
    });

    await test.step('Tingimus node elements visibility', async () => {
        await nsp.clickAddNode();
        await nsp.selectNode(nsp.buttonCondition);
        await nsp.assertNodeVisible(nsp.buttonCondition);
        await nsp.deleteNode(nsp.buttonCondition);
    });

    await test.step('Dünaamilised valikud node elements visibility', async () => {
        await nsp.clickAddNode();
        await nsp.selectNode(nsp.buttonDynamicChoice);
        await nsp.assertNodeVisible(nsp.buttonDynamicChoice);
        await nsp.deleteNode(nsp.buttonDynamicChoice);
    });

    await test.step('End service node elements visibility', async () => {
        await nsp.clickAddNode();
        await nsp.selectNode(nsp.buttonEndService);
        await nsp.assertNodeVisible(nsp.buttonEndService);
        await nsp.deleteNode(nsp.buttonEndService);
    });
})