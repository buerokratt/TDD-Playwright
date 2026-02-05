// tests/admin/services/newservice/test-widget-variable-resolution.spec.js
const { test, expect } = require("../../../.setup/test-setup");
const { URLS } = require("../../../../playwright.config");
const { AdminPageFactory: ap } = require("../../../../page-objects/admin-page-factory");


test.describe("New service test (TEST widget variable resolution)", () => {
    let randomString = Math.random().toString(36).substring(2, 10);

    test("Create service + add nodes + configure via node edit + verify widget resolves variables", async ({ page }) => {
        const apf = new ap(page);
        const nsp = apf.getNewServicePage();

        console.log(randomString);

        await page.goto(URLS.admin + "services/newService");
        await page.waitForLoadState("domcontentloaded");

        // Create service title (but do NOT leave page)
        await nsp.setTitle(randomString);

        // -----------------------------
        // 1) Add node: Määra (picker closes after click)
        // -----------------------------
        await nsp.clickAddNodeAtEdgeIndex(0); // first edge after Start
        await nsp.pickNodeTypeAndReturnToCanvas(nsp.buttonDefine);

        // Node title should now exist on canvas (usually "Määra - 1")
        // If numbering can vary, use prefix match; but we'll use "- 1" based on your sample.
        const assignNodeTitle = "Määra - 1";
        await expect(nsp.getFlowNodeByTitle(assignNodeTitle)).toBeVisible();

        // Open node dialog via edit button
        await nsp.openNodeDialogByTitle(assignNodeTitle);

        // Configure: greeting = Tere and save
        await nsp.assignSetVariableAndSave("greeting", "Tere");

        // -----------------------------
        // 2) Add node: Sõnum kliendile (picker closes after click)
        // -----------------------------
        // Now there are multiple '+' buttons; safest is "last edge" when building downwards
        await nsp.clickAddNodeOnLastEdge?.()
            ? await nsp.clickAddNodeOnLastEdge()
            : await nsp.clickAddNodeAtEdgeIndex(1); // fallback if you didn't add clickAddNodeOnLastEdge

        await nsp.pickNodeTypeAndReturnToCanvas(nsp.buttonMessageForCustomer);

        const msgNodeTitle = "Sõnum kliendile - 1";
        await expect(nsp.getFlowNodeByTitle(msgNodeTitle)).toBeVisible();

        // Open message node dialog via edit
        await nsp.openNodeDialogByTitle(msgNodeTitle);

        // Set message content and save
        await nsp.messageSetTextAndSave("${greeting}, maailm!");

        // Save service (recommended before testing widget)
        await nsp.saveService();

        // -----------------------------
        // Widget test
        // -----------------------------
        await expect(nsp.widget).toBeVisible();
        await nsp.openWidget();

        const chat = page.locator("div").filter({ has: page.getByText("TEST") }).first();
        const input = chat.getByPlaceholder("Sisestage sisend, eraldatud komadega");

        await input.fill("test");
        await chat.getByAltText("Send").click();

        // user input visible
        await expect(chat.getByText("test", { exact: true })).toBeVisible();

        // resolved output visible + raw template not visible
        await expect(
            chat.locator('.os-viewport .os-content')
        ).toContainText("Tere, maailm!");

        //await expect(chat).not.toContainText("${greeting}");
    });

    test("Delete new service test", async ({ page }) => {
        await page.goto(URLS.admin + "services/overview");

        const sop = new ap(page).getServicesOverview();
        await sop.assertServiceRowVisible(randomString);
        await sop.deleteService(randomString);
        await sop.assertRowDeleted(randomString);
    });

});
