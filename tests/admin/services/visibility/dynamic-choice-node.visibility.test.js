import {NewServicePage} from "../../../../page-objects/services/newservice/new-service-page";

const { test, expect } = require('../../../.setup/test-setup');
import { URLS } from '../../../../playwright.config';

test('Dynamic choice node visibility', async ({ page }) => {
    await page.goto(URLS.admin + 'services/newService');
    const nsp = new NewServicePage(page);

    //TODO: redo test

    await test.step('Dynamic choice node elements visibility', async () => {
        await nsp.clickAddNode();
        await nsp.selectNode(nsp.buttonDynamicChoice);
        await nsp.assertNodeVisible(nsp.buttonDynamicChoice);
    });

    await test.step('Open define node', async () => {
        await nsp.editNode('Dünaamilised valikud - 1');
        await nsp.assertDialogVisible();

    });
    await test.step('Define elements section visible and has buttons', async () => {
        await nsp.assertDefineElementsVisible();
        await nsp.assertSectionHasButtons(nsp.sectionDefineElements);
    });

    await test.step('Dialog buttons visible', async () => {
        await nsp.assertTabsVisible();
        await nsp.assertDialogButtonsVisible();
    });

    await test.step('Assert elements visible', async () => {
       await nsp.assertDynamicChoiceFields();
    });
})