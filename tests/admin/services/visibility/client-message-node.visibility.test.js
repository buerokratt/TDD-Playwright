// tests/admin/services/newservice/client-message-node-visibility.spec.js

const { test, expect } = require('../../../.setup/test-setup');
const { URLS } = require('../../../../playwright.config');
const { NewServicePage } = require('../../../../page-objects/services/newservice/new-service-page');

test('Client message node visibility (refactored: picker closes, edit opens dialog)', async ({ page }) => {
    await page.goto(URLS.admin + 'services/newService');
    const nsp = new NewServicePage(page);

    await test.step('Add "Sõnum kliendile" node via picker (returns to canvas)', async () => {
        // new logic: there can be many "+" buttons; choose a deterministic one
        // if you added clickAddNodeAtEdgeIndex in the page object, use it.
        if (typeof nsp.clickAddNodeAtEdgeIndex === 'function') {
            await nsp.clickAddNodeAtEdgeIndex(0);
        } else if (typeof nsp.clickAddNodeOnLastEdge === 'function') {
            await nsp.clickAddNodeOnLastEdge();
        } else {
            // fallback to old behavior if not yet present
            await nsp.clickAddNode();
        }

        // new logic: selecting a node closes the picker and returns to canvas
        await nsp.pickNodeTypeAndReturnToCanvas(nsp.buttonMessageForCustomer);

        // Assert node appears on canvas (by title)
        const node = nsp.getFlowNodeByTitle('Sõnum kliendile - 1');
        await expect(node).toBeVisible();
    });

    await test.step('Open client message node dialog via node edit button', async () => {
        await nsp.openNodeDialogByTitle('Sõnum kliendile - 1');

        // New node-specific dialog assertion
        await nsp.assertMessageDialogVisible();
    });

    await test.step('Define elements section visible and has buttons (inside message node dialog)', async () => {
        // In the new page object we added:
        // - messageSectionElements (label "Määra elemendid" section)
        // - messageChips (the green draggable boxes)
        await expect(nsp.messageSectionElements).toBeVisible();

        // "has buttons" in this dialog section is actually "has chips" in the provided DOM.
        // If you truly mean buttons, adjust to your real DOM. For now we assert at least 1 chip exists.
        await expect(nsp.messageChips.first()).toBeVisible();
    });

    await test.step('Dialog elements visible (tabs, buttons, editor)', async () => {
        await expect(nsp.messageTabSeadistamine).toBeVisible();
        await expect(nsp.messageTabTestimine).toBeVisible();

        await expect(nsp.messageCancel).toBeVisible();
        await expect(nsp.messageSave).toBeVisible();
        await expect(nsp.messageClose).toBeVisible();

        // Quill editor is the message box now (not generic messageBox)
        await expect(nsp.quillEditor).toBeVisible();
    });
});
