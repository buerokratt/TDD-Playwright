// tests/admin/services/newservice/dynamic-choice-node-visibility.spec.js

const { test, expect } = require('../../../.setup/test-setup');
const { URLS } = require('../../../../playwright.config');
const { NewServicePage } = require('../../../../page-objects/services/newservice/new-service-page');

test('[services] [visibility] Dynamic choice node visibility (refactored: picker closes, edit opens dialog)', async ({ page }) => {
    await page.goto(URLS.admin + 'services/newService');
    const nsp = new NewServicePage(page);

    await test.step('Add "Dünaamilised valikud" node via picker (returns to canvas)', async () => {
        // new logic: choose a deterministic "+" button
        if (typeof nsp.clickAddNodeAtEdgeIndex === 'function') {
            await nsp.clickAddNodeAtEdgeIndex(0);
        } else if (typeof nsp.clickAddNodeOnLastEdge === 'function') {
            await nsp.clickAddNodeOnLastEdge();
        } else {
            // fallback if helper not yet present
            await nsp.clickAddNode();
        }

        // selecting node type closes picker and returns to canvas
        await nsp.pickNodeTypeAndReturnToCanvas(nsp.buttonDynamicChoice);

        // Assert node appears on canvas
        const node = nsp.getFlowNodeByTitle('Dünaamilised valikud - 1');
        await expect(node).toBeVisible();
    });

    await test.step('Open "Dünaamilised valikud" node dialog via node edit button', async () => {
        await nsp.openNodeDialogByTitle('Dünaamilised valikud - 1');
        await nsp.assertDynamicChoicesDialogVisible();
    });

    await test.step('Define elements section visible and contains chips', async () => {
        await expect(nsp.dynamicChoicesSectionElements).toBeVisible();
        await expect(nsp.dynamicChoicesChips.first()).toBeVisible();
    });

    await test.step('Dialog tabs + footer buttons visible', async () => {
        await expect(nsp.dynamicChoicesTabSeadistamine).toBeVisible();
        await expect(nsp.dynamicChoicesTabTestimine).toBeVisible();

        await expect(nsp.dynamicChoicesCancel).toBeVisible();
        await expect(nsp.dynamicChoicesSave).toBeVisible();
        await expect(nsp.dynamicChoicesClose).toBeVisible();
    });

    await test.step('Assert dynamic choice fields (rows + key/value inputs)', async () => {
        // This replaces the old nsp.assertDynamicChoiceFields() with the new mapped locators
        await expect(nsp.dynamicChoicesRows.first()).toBeVisible();

        // keys should exist and be disabled, values should be editable
        await expect(nsp.dynamicChoicesKeyInputs.first()).toBeVisible();
        await expect(nsp.dynamicChoicesValueInputs.first()).toBeVisible();

        // Optional: assert specific keys exist (based on your DOM)
        await expect(nsp.dynamicChoicesDialog.locator('input[name="key"][value="Nimekiri"]')).toBeVisible();
        await expect(nsp.dynamicChoicesDialog.locator('input[name="key"][value="Teenuse nimi"]')).toBeVisible();
        await expect(nsp.dynamicChoicesDialog.locator('input[name="key"][value="Võti"]')).toBeVisible();
        await expect(nsp.dynamicChoicesDialog.locator('input[name="key"][value="Andmete võtmed"]')).toBeVisible();
    });
});
