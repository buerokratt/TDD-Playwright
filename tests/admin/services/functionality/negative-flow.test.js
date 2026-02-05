const {test} = require("../../../.setup/test-setup");
const {URLS} = require("../../../../playwright.config");
const {AdminPageFactory: ap} = require("../../../../page-objects/admin-page-factory");
const {expect} = require("@playwright/test");

// Use environment variable, set it if not already set
if (!process.env.SHARED_RANDOM_STRING) {
    process.env.SHARED_RANDOM_STRING = Math.random().toString(36).substring(2, 10);
}

const randomString = process.env.SHARED_RANDOM_STRING;

test.describe('Service negative path test', () => {

    test('Service negative path test', async ({page}) => {
        const apf = new ap(page);
        const nsp = apf.getNewServicePage();
        const sop = apf.getServicesOverview();

        // Is this even possible?
    });
});