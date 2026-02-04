const {test} = require("../../.setup/test-setup");
const {URLS} = require("../../../playwright.config");
const {NewServicePage} = require("../../../page-objects/services/newservice/new-service-page");

test('Service canvas nodes visibility', async ({ page }) => {
    await page.goto(URLS.admin + 'services/newService');
    const nsp = new NewServicePage(page);

    await test.step('Määra node elements visibility', async () => {
        await nsp.clickAddNode();
        await nsp.selectNode(nsp.buttonDefine);
        await nsp.assertNodeVisible(nsp.buttonDefine);
        await nsp.deleteNode(nsp.buttonDefine);
    });
});