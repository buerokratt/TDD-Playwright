import {NewServicePage} from "../../../../page-objects/services/newservice/new-service-page";

const { test, expect } = require('../../../.setup/test-setup');
import { URLS } from '../../../../playwright.config';

test('Condition node visibility', async ({ page }) => {
    await page.goto(URLS.admin + 'services/newService');
    const nsp = new NewServicePage(page);

    await test.step('Tingimus node elements visibility', async () => {
        await nsp.clickAddNode();
        await nsp.selectNode(nsp.buttonCondition);
        await nsp.assertNodeVisible(nsp.buttonCondition);
    });

    await test.step('Condition buttons visible', async () => {
        await nsp.assertConditionButtonsVisible();
    });

    await test.step('Open condition node', async () => {
        await nsp.editNode('Tingimus - 1');
        await nsp.assertDialogVisible();
    });

    await test.step('Condition element has buttons', async() => {
        await nsp.assertConditionButtons();
    });

    await test.step('Define elements section visible and has buttons', async () => {
        await nsp.assertDefineElementsVisible();
        await nsp.assertSectionHasButtons(nsp.sectionDefineElements);
    });

    // TODO: add rule/group check

    await test.step('Dialog buttons visible', async () => {
        await nsp.assertTabsVisible();
        await nsp.assertDialogButtonsVisible();
    });
})