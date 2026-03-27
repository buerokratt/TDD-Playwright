// tests/admin/services/newservice/create-openapi-endpoint-visibility.spec.js

const { test, expect } = require("../../../.setup/test-setup");
const { URLS } = require("../../../../playwright.config");
const { AdminPageFactory: ap } = require("../../../../page-objects/admin-page-factory");
const { createServiceName, createValidServiceData } = require('../../../../utils/test-data/service-data');
const { NewServicePage } = require("../../../../page-objects/services/newservice/new-service-page");

// IMPORTANT: ensure create runs before delete + same worker context
test.describe.serial("[services] [visibility] Create new OpenAPI endpoint (visibility)", () => {
    let serviceName;

    test("[services] [visibility] Create new openAPI endpoint test (visibility)", async ({ page }) => {
        serviceName = createServiceName('openapi-service');

        const nsp = new NewServicePage(page);

        await page.goto(URLS.admin + "services/newService");
        await nsp.waitForReady();

        await test.step("New service: set title", async () => {
            await nsp.setTitle(createValidServiceData({ title: serviceName }).title);
        });

        await test.step("Save service", async () => {
            await nsp.saveService();
        });

        await test.step("Add node → open API creation modal", async () => {
            // should open picker -> click +API (inside picker) -> modal opens
            await nsp.addNewAPI();
            await nsp.assertCreateEndpointModalVisible();
        });

        await test.step("Assert modal base UI visible", async () => {
            await expect(nsp.createEndpointTitle).toBeVisible();
            await expect(nsp.createEndpointTabOtspunkt).toBeVisible();

            await expect(nsp.createEndpointServiceTypeCombo).toBeVisible();
            await expect(nsp.createEndpointCancel).toBeVisible();
            await expect(nsp.createEndpointCreate).toBeVisible();

            await expect(nsp.createEndpointCreate).toBeDisabled();
        });

        await test.step("Select Open API and assert fields become visible", async () => {
            await nsp.selectServiceType("Open API");

            await expect(nsp.createEndpointName).toBeVisible();
            await expect(nsp.createEndpointUrl).toBeVisible();
            await expect(nsp.createEndpointFetchEndpoints).toBeVisible();
            await expect(nsp.createEndpointPublicSwitch).toBeVisible();
        });

        await test.step('Fill required fields and verify "Loo" becomes enabled', async () => {
            await nsp.setEndpointName(`keskmineBrutopalkAPI-${serviceName}`);
            await nsp.setEndpointUrl(nsp.apiURL);

            // some UIs enable after blur/change
            await page.keyboard.press("Tab");

            await expect(nsp.createEndpointCreate).toBeEnabled();
        });

        await test.step("Create endpoint (modal closes)", async () => {
            await nsp.createEndpoint();
            await expect(nsp.createEndpointModal).toBeHidden();
        });

        await test.step("Save service (post-endpoint creation)", async () => {
            await nsp.saveService();
        });
    });

    test("[services] [visibility] Delete service created in OpenAPI endpoint test", async ({ page }) => {
        if (!serviceName) {
            throw new Error("serviceName was not set. Create test likely failed before assigning it.");
        }

        await page.goto(URLS.admin + "services/overview");

        const sop = new ap(page).getServicesOverview();

        await sop.assertServiceRowVisible(serviceName);
        await sop.deleteService(serviceName);
        await sop.assertRowDeleted(serviceName);
    });
});
