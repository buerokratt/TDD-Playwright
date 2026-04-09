// tests/admin/services/newservice/define-node-visibility.spec.js
const { test, expect } = require("../../../.setup/test-setup");
const { URLS } = require("../../../../playwright.config");
const { NewServicePage } = require("../../../../page-objects/services/newservice/new-service-page");

test("[services] [visibility] Service canvas define node visibility", async ({ page }) => {
    await page.goto(URLS.admin + "services/newService");
    await page.waitForLoadState("domcontentloaded");

    const nsp = new NewServicePage(page);
    const nodeTitle = "Määra - 1";

    await test.step("Add define node from picker (picker closes, node appears on canvas)", async () => {
        // open picker from first edge +
        await nsp.clickAddNodeAtEdgeIndex(0);
        await nsp.assertNodePickerVisible();

        // pick node type -> picker closes -> canvas visible
        await nsp.pickNodeTypeAndReturnToCanvas(nsp.pickerDefineBtn);

        await expect(nsp.canvas).toBeVisible();
        await expect(nsp.getFlowNodeByTitle(nodeTitle)).toBeVisible();
    });

    await test.step("Open define node dialog via node edit button", async () => {
        await nsp.openNodeDialogByTitle(nodeTitle);

        // this must be the DEFINE editor popup, not the picker dialog
        await nsp.assertDefineDialogVisible();
    });

    await test.step("Define dialog base UI visible", async () => {
        await nsp.assertDefineTabsVisible();
        await nsp.assertDefineFooterButtonsVisible();
    });

    await test.step("Add element row works", async () => {
        const rowsBefore = await nsp.defineRows.count();
        await nsp.defineAddElementBtn.click();
        await expect(nsp.defineRows).toHaveCount(rowsBefore + 1);

        const { row: newRow, nameInput, valueInput } = await nsp.resolveDefineRowInputs(rowsBefore);
        await expect(newRow).toBeVisible();
        await expect(nameInput).toBeEditable();
        await expect(valueInput).toBeEditable();
    });

    await test.step("Sections visible + chips exist", async () => {
        await expect(nsp.defineSectionElements).toBeVisible();
        await expect(nsp.defineSectionEnv).toBeVisible();
        await expect(nsp.defineSectionDates).toBeVisible();
        await expect(nsp.defineSectionTools).toBeVisible();

        // at least one chip in elements section (e.g. "input", "Empty Content Type")
        await expect(nsp.defineChips.first()).toBeVisible();
    });
});
