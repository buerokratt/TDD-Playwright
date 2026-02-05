// tests/admin/services/newservice/base-elements-visibility.spec.js
import { NewServicePage } from "../../../../page-objects/services/newservice/new-service-page";

const { test } = require("../../../.setup/test-setup");
import { URLS } from "../../../../playwright.config";

test("Service canvas base elements visibility", async ({ page }) => {
    await page.goto(URLS.admin + "services/newService");
    await page.waitForLoadState("domcontentloaded");

    const nsp = new NewServicePage(page);

    await test.step("Header elements are visible", async () => {
        await nsp.assertHeaderElementVisible();
    });

    await test.step("Service settings dialog fields are visible", async () => {
        // This helper already opens and closes the settings dialog safely
        await nsp.assertServiceDetailsFieldsVisible();
    });

    await test.step("Canvas is visible", async () => {
        await nsp.assertCanvasVisible();
    });

    await test.step("Canvas header/tools are visible", async () => {
        await nsp.assertCanvasElementsVisible();
    });

    await test.step("Zoom controls are visible", async () => {
        await nsp.assertZoomButtonsVisible();
    });
});
