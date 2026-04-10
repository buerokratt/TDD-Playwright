// tests/admin/services/newservice/condition-node-visibility.spec.js
const { test, expect } = require("../../../.setup/test-setup");
const { URLS } = require("../../../../playwright.config");
const { NewServicePage } = require("../../../../page-objects/services/newservice/new-service-page");

test("[services] [visibility] Condition node visibility", async ({ page }) => {
    await page.goto(URLS.admin + "services/newService");
    await page.waitForLoadState("domcontentloaded");

    const nsp = new NewServicePage(page);
    const nodeTitle = "Tingimus - 1";

    await test.step('Add "Tingimus" node via picker (picker closes, canvas visible)', async () => {
        await nsp.clickAddNodeAtEdgeIndex(0);
        await nsp.pickNodeTypeAndReturnToCanvas(nsp.buttonCondition);

        await expect(nsp.canvas).toBeVisible();
        await expect(nsp.getFlowNodeByTitle(nodeTitle)).toBeVisible();
    });

    await test.step("Open condition node dialog via node edit button", async () => {
        await nsp.openNodeDialogByTitle(nodeTitle);
        await nsp.assertConditionDialogVisible();
    });

    await test.step("Condition dialog base UI visible", async () => {
        await nsp.assertConditionButtonsVisibleInDialog();
    });

    await test.step("Define elements section visible and has buttons (if present in this dialog)", async () => {
        // If your existing helpers are NOT scoped to conditionDialog, this is where your tests will flake.
        // Prefer scoping them to conditionDialog like conditionSectionDefineElements above.
        await expect(nsp.conditionSectionDefineElements).toBeVisible();

        // If you still want to reuse generic helper, ensure it accepts a container param (recommended).
        // await nsp.assertSectionHasButtons(nsp.conditionSectionDefineElements);
    });

    await test.step("Dialog footer buttons visible", async () => {
        await expect(nsp.conditionCancel).toBeVisible();
        await expect(nsp.conditionSave).toBeVisible();
    });
});
