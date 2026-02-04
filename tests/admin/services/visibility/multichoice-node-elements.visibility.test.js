import {NewServicePage} from "../../../../page-objects/services/newservice/new-service-page";

const { test, expect } = require('../../../.setup/test-setup');
import { URLS } from '../../../../playwright.config';

test('Multichoice node elements visibility', async ({ page }) => {
    await page.goto(URLS.admin + 'services/newService');
    const nsp = new NewServicePage(page);

    await test.step('Multichoice question node elements visibility', async () => {
        await nsp.clickAddNode();
        await nsp.selectNode(nsp.buttonMultichoiceQuestion);
        await nsp.assertNodeVisible(nsp.buttonMultichoiceQuestion);
        await expect(nsp.buttonYes).toBeVisible();
        await expect(nsp.buttonNo).toBeVisible();
    });

    await test.step('Open multichoice node', async () => {
        await nsp.editNode('Mitmevalikuline küsimus - 1');
        await nsp.assertDialogVisible();
        await expect(nsp.textArea).toBeVisible();
    });

    await test.step('Multichoice buttons visibility', async () => {
        await expect(nsp.buttonYes).toBeVisible();
        await expect(nsp.buttonNo).toBeVisible();
        await expect(nsp.addButton).toBeVisible();
    });

    await test.step('Multichoice question input visible', async () => {
        await expect(nsp.textArea).toBeVisible();
    });

});