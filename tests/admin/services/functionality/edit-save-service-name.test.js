// tests/admin/services/newservice/edit-and-save-service.spec.js
const { test, expect } = require("../../../.setup/test-setup");
const { URLS } = require("../../../../playwright.config");
const { AdminPageFactory: ap } = require("../../../../page-objects/admin-page-factory");

test.describe("Edit and save service test", () => {
    // scoped to this file only (won't carry to other files)
    const serviceName = Math.random().toString(36).substring(2, 10);
    const updatedName = `${serviceName}-update`;

    test("Edit and save service test", async ({ page }) => {
        const apf = new ap(page);
        const nsp = apf.getNewServicePage();
        const sop = apf.getServicesOverview();

        await page.goto(URLS.admin + "services/newService");
        await page.waitForLoadState("domcontentloaded");

        await test.step("Create new service and return to overview", async () => {
            // createNewService() sets title, saves, and goes back
            await nsp.createNewService(serviceName);
            await sop.assertServiceRowVisible(serviceName);
        });

        await test.step("Open service in edit mode", async () => {
            await sop.clickEdit(serviceName);
            await page.waitForLoadState("domcontentloaded");
            await nsp.assertCanvasVisible();
        });

        await test.step("Update title via settings and save", async () => {
            await nsp.setTitle(updatedName);   // uses settings dialog internally
            await nsp.saveService();           // toast-based save assertion
        });

        await test.step("Open widget (sanity)", async () => {
            await expect(nsp.widget).toBeVisible();
            await nsp.openWidget();
            // optional: close widget if it blocks navigation (depends on your UI)
            // await page.keyboard.press('Escape');
        });

        await test.step("Return to overview and verify updated row", async () => {
            await nsp.returnToServicesOverview();
            await sop.assertServiceRowVisible(updatedName);
            await expect(sop.getServiceRow(updatedName)).toBeVisible();
        });
    });

    test("Delete new service test", async ({ page }) => {
        const sop = new ap(page).getServicesOverview();

        await page.goto(URLS.admin + "services/overview");
        await page.waitForLoadState("domcontentloaded");

        await sop.assertServiceRowVisible(updatedName);
        await sop.deleteService(updatedName);
        await sop.assertRowDeleted(updatedName);
    });
});
