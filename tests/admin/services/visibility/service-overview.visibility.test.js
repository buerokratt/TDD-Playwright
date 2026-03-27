// tests/admin/services/overview/services-overview-visibility.spec.js
const { ServicesOverviewPage } = require('../../../../page-objects/services/overview/services-overview-page');

const { test } = require("../../../.setup/test-setup");
const { URLS } = require('../../../../playwright.config');

test("[services] [visibility] Service overview page elements visibility", async ({ page }) => {
    await page.goto(URLS.admin + "services/overview");
    await page.waitForLoadState("domcontentloaded");

    const sop = new ServicesOverviewPage(page);

    await test.step("Service name column/values visible", async () => {
        await sop.assertServiceNameExists();
    });

    await test.step("Service status column/values visible", async () => {
        await sop.assertStatusExists();
    });

    await test.step("Edit button visible", async () => {
        await sop.assertEditButtonExists();
    });

    await test.step("Delete button visible", async () => {
        await sop.assertDeleteButtonExists();
    });

    await test.step("Pagination / page size control visible", async () => {
        await sop.assertPageSizeVisibleServices();
    });
});
