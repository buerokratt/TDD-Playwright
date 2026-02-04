import {NewServicePage} from "../../../page-objects/services/newservice/new-service-page";

const { test, expect } = require('../../.setup/test-setup');
import { URLS } from '../../../playwright.config';

test('Multichoice node elements visibility', async ({ page }) => {
    await page.goto(URLS.admin + 'services/newService');
    const nsp = new NewServicePage(page);

    await test.step('Mitmevalikuline küsimus node elements visibility', async () => {
        await nsp.clickAddNode();
        await nsp.selectNode(nsp.buttonMultichoiceQuestion);
        await nsp.assertNodeVisible(nsp.buttonMultichoiceQuestion);
        await nsp.deleteNode(nsp.buttonMultichoiceQuestion);
    });
});