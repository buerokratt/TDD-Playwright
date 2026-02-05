const {test} = require("../../../.setup/test-setup");
const {URLS} = require("../../../../playwright.config");
const {AdminPageFactory: ap} = require("../../../../page-objects/admin-page-factory");
const {expect} = require("@playwright/test");

// Use environment variable, set it if not already set
if (!process.env.SHARED_RANDOM_STRING) {
    process.env.SHARED_RANDOM_STRING = Math.random().toString(36).substring(2, 10);
}

const randomString = process.env.SHARED_RANDOM_STRING;

test.describe('Confirm service disabled test', () => {

    test('Confirm service disabled test', async ({page}) => {
        const apf = new ap(page);
        const nsp = apf.getNewServicePage();
        const sop = apf.getServicesOverview();

        await page.goto(URLS.admin + 'services/newService');
        await expect(nsp.buttonConfirm).toBeDisabled();
        await nsp.saveService();

        await expect(page.locator('.toast__content')).toHaveText('Pealkiri on kohustuslik');

        await nsp.createNewService('PW-INVALID-FIXED-' + randomString);
        await sop.assertServiceRowVisible('PW-INVALID-FIXED-' + randomString);
    });

})