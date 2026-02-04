const {test} = require("../../../.setup/test-setup");
const {URLS} = require("../../../../playwright.config");
const {NewServicePage} = require("../../../../page-objects/services/newservice/new-service-page");

test('Service canvas define node visibility', async ({ page }) => {
    await page.goto(URLS.admin + 'services/newService');
    const nsp = new NewServicePage(page);

    await test.step('Add define node', async () => {
        await nsp.clickAddNode();
        await nsp.selectNode(nsp.buttonDefine);
        await nsp.assertNodeVisible(nsp.buttonDefine);
    });

    await test.step('Open define node', async () => {
        await nsp.editNode('Määra - 1');
        await nsp.assertDialogVisible();
    });

    await test.step('Define node elements', async () => {
        await nsp.assertElementRowAdded();

        //TODO: disabled until fix is found
        //await nsp.assertElementButtons();
    });

    await test.step('Define elements section visible and has buttons', async () => {
        await nsp.assertDefineElementsVisible();
        await nsp.assertSectionHasButtons(nsp.sectionDefineElements);
    });

    await test.step('Env variables section visible and has buttons', async () => {
        await nsp.assertDefineEnvVariablesVisible();
        await nsp.assertSectionHasButtons(nsp.sectionEnvVariables);
    });

    await test.step('Dates section visible and has buttons', async () => {
        await nsp.assertDatesVisible();
        await nsp.assertSectionHasButtons(nsp.sectionDates);
    });

    await test.step('Tools section visible and has buttons', async () => {
        await nsp.assertToolsVisible();
        await nsp.assertSectionHasButtons(nsp.sectionTools);
    });

    await test.step('Dialog buttons visible', async () => {
        await nsp.assertTabsVisible();
        await nsp.assertDialogButtonsVisible();
    });
});