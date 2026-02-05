const {test} = require("../../../.setup/test-setup");
const {URLS} = require("../../../../playwright.config");
const {AdminPageFactory: ap} = require("../../../../page-objects/admin-page-factory");

// Use environment variable, set it if not already set
if (!process.env.SHARED_RANDOM_STRING) {
    process.env.SHARED_RANDOM_STRING = Math.random().toString(36).substring(2, 10);
}

const randomString = process.env.SHARED_RANDOM_STRING;

test.describe('New service test', () => {

    test('Creating new service test', async ({page} ) => {
        const apf = new ap(page);
        const nsp = apf.getNewServicePage();
        const sop = apf.getServicesOverview();

        await page.goto(URLS.admin + 'services/newService');

        await nsp.createNewService(randomString);
        await page.waitForLoadState('domcontentloaded');
        await sop.assertServiceRowVisible(randomString);
    });

    test('Delete new service test', async ({page}) => {
        await page.goto(URLS.admin + 'services/overview');

        const sop = new ap(page).getServicesOverview();
        await sop.assertServiceRowVisible(randomString);
        await sop.deleteService(randomString);
        await sop.assertRowDeleted(randomString);
    });

})