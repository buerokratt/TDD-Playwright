import {NewServicePage} from "../../../../page-objects/services/newservice/new-service-page";

const { test, expect } = require('../../../.setup/test-setup');
import { URLS } from '../../../../playwright.config';

test('Client message node visibility', async ({ page }) => {
    await page.goto(URLS.admin + 'services/newService');
    const nsp = new NewServicePage(page);

    await test.step('Client message node elements visibility', async () => {
        await nsp.clickAddNode();
        await nsp.selectNode(nsp.buttonMessageForCustomer);
        await nsp.assertNodeVisible(nsp.buttonMessageForCustomer);
    });

    await test.step('Open client message node', async () => {
        await nsp.editNode('Sõnum kliendile - 1');
        await nsp.assertDialogVisible();
    });

    await test.step('Define elements section visible and has buttons', async () => {
        await nsp.assertDefineElementsVisible();
        await nsp.assertSectionHasButtons(nsp.sectionDefineElements);
    });

    await test.step('Dialog elements visible', async () => {
        await nsp.assertTabsVisible();
        await nsp.assertDialogButtonsVisible();
        await expect(nsp.messageBox).toBeVisible();
    });
})