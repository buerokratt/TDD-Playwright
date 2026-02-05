// page-objects/services/newservice/new-service-page.js
const { expect } = require('@playwright/test');

class NewServicePage {
    constructor(page) {
        this.page = page;

        // =========================
        // Header
        // =========================
        this.header = page.locator('header.header');

        this.backToServicesBtn = this.header.getByRole('button', { name: 'Tagasi teenuste lehele', exact: true });
        this.serviceSettingsBtn = this.header.getByRole('button', { name: 'Teenuse seaded', exact: true });
        this.stepName = this.header.locator('.naming');

        this.deleteServiceBtn = this.header.getByRole('button', { name: 'Kustuta', exact: true });
        this.saveServiceBtn = this.header.getByRole('button', { name: 'Salvesta', exact: true });
        this.confirmServiceBtn = this.header.getByRole('button', { name: 'Kinnita', exact: true });

        // =========================
        // Settings dialog
        // =========================
        this.settingsDialog = page.locator('[role="dialog"]').filter({
            has: page.getByRole('heading', { name: 'Teenuse seaded' }),
        });

        this.settingsCloseBtn = this.settingsDialog.locator('button.dialog__close');

        // title input is inside settings dialog; use placeholder OR label if available
        this.serviceTitleInput = this.settingsDialog.locator('input[placeholder="Pealkiri on kohustuslik"]');
        this.serviceDescriptionInput = this.settingsDialog.getByLabel('Kirjeldus :');

        // =========================
        // Canvas / React Flow
        // =========================
        this.canvas = page.getByRole('application'); // react-flow sets role="application"
        this.flowWrapper = page.getByTestId('rf__wrapper').or(page.locator('.react-flow__wrapper')).first();

        this.startNode = page.locator('.react-flow__node-start .start-node');

        this.edgeAddButtons = page.locator('button.edge-button'); // multiple "+"
        this.flowNodes = page.locator('.react-flow__node'); // node containers

        // panels
        this.topLeftPanel = page.locator('.react-flow__panel.top.left');
        this.importBtn = this.topLeftPanel.getByRole('button', { name: 'Impordi', exact: true });
        this.exportBtn = this.topLeftPanel.getByRole('button', { name: 'Ekspordi', exact: true });

        // zoom controls
        this.zoomInBtn = page.getByTitle('Zoom In');
        this.zoomOutBtn = page.getByTitle('Zoom Out');
        this.fitViewBtn = page.getByTitle('Fit View');

        // =========================
        // Toasts
        // =========================
        this.toastList = page.locator('ol.toast__list');

        // =========================
        // Node Picker (dropdown after clicking "+")
        // =========================
        this.nodePickerDialog = page.locator('[role="dialog"].dropdown[data-state="open"]');

        // Buttons inside picker (scoped)
        this.pickerDefineBtn = this.nodePickerDialog.getByRole('button', { name: 'Määra', exact: true });
        this.pickerMessageBtn = this.nodePickerDialog.getByRole('button', { name: 'Sõnum kliendile', exact: true });
        this.pickerConditionBtn = this.nodePickerDialog.getByRole('button', { name: 'Tingimus', exact: true });
        this.pickerMultichoiceBtn = this.nodePickerDialog.getByRole('button', { name: 'Mitmevalikuline küsimus', exact: true });
        this.pickerDynamicChoiceBtn = this.nodePickerDialog.getByRole('button', { name: 'Dünaamilised valikud', exact: true });
        this.pickerEndServiceBtn = this.nodePickerDialog.getByRole('button', { name: 'Teenuse lõpetamine', exact: true });

        // "Create API endpoint" plus button inside picker (your svg path locator kept, but scoped)
        this.pickerAddApiBtn = this.nodePickerDialog.locator(
            'button:has(svg path[d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"])'
        );

        // =========================
        // Node Editor Popup (opened by clicking node pencil)
        // =========================
        this.nodeEditorPopup = page.locator('[role="dialog"].popup[data-state="open"]');
        this.nodeEditorTitle = this.nodeEditorPopup.locator('h2.popup__title');

        this.nodeEditorCloseBtn = this.nodeEditorPopup.locator('button.popup__close');
        this.nodeEditorCancelBtn = this.nodeEditorPopup.getByRole('button', { name: 'Tühista', exact: true });
        this.nodeEditorSaveBtn = this.nodeEditorPopup.getByRole('button', { name: 'Salvesta', exact: true });

        this.nodeEditorTabs = this.nodeEditorPopup.getByRole('tablist');
        this.nodeEditorTabSeadistamine = this.nodeEditorPopup.getByRole('tab', { name: 'Seadistamine', exact: true });
        this.nodeEditorTabTestimine = this.nodeEditorPopup.getByRole('tab', { name: 'Testimine', exact: true });

        // =========================
        // Widget (Buerokratt)
        // =========================
        this.widgetIcon = page.getByAltText('Buerokratt logo');

        // widget dialog: scope by input label text (unique) instead of "TEST" text
        this.widgetDialog = page.locator('[role="dialog"]').filter({
            has: page.getByText('Teenuse sisend:', { exact: true }),
        }).first();

        this.widgetInput = this.widgetDialog.getByPlaceholder('Sisestage sisend, eraldatud komadega');
        this.widgetCloseImg = this.widgetDialog.getByAltText('Close');
        this.widgetSendImg = this.widgetDialog.getByAltText('Send');

        // The message stream container (the IMPORTANT bit for your “reads whole page” problem)
        // Your markup has .os-viewport > .os-content that contains the messages.
        this.widgetMessages = this.widgetDialog.locator('.os-viewport .os-content');

        // ---------- "Tingimus" node popup ----------
        this.conditionDialog = this.page.locator('[role="dialog"].popup:visible').filter({
            has: this.page.locator('h2.popup__title').filter({ hasText: /^Tingimus/ }),
        }).first();

        this.conditionTitle = this.conditionDialog.locator('h2.popup__title');
        this.conditionClose = this.conditionDialog.locator('button.popup__close').first();

        this.conditionTabSeadistamine = this.conditionDialog.getByRole('tab', { name: 'Seadistamine' });
        this.conditionTabTestimine = this.conditionDialog.getByRole('tab', { name: 'Testimine' });

        this.conditionCancel = this.conditionDialog.getByRole('button', { name: 'Tühista', exact: true });
        this.conditionSave = this.conditionDialog.getByRole('button', { name: 'Salvesta', exact: true });

        // Buttons inside condition dialog
        this.conditionBtnSuccess = this.conditionDialog.getByRole('button', { name: 'Success', exact: true });
        this.conditionBtnFailure = this.conditionDialog.getByRole('button', { name: 'Failure', exact: true });

        // Optional: sections inside condition dialog (if your app has same sections)
        this.conditionSectionDefineElements = this.conditionDialog.locator('label', { hasText: 'Määra elemendid' }).locator('..');

    }

    // ==========================================================
    // Generic helpers
    // ==========================================================
    getFlowNodeByTitle(titleText) {
        return this.flowNodes
            .filter({ has: this.page.getByText(titleText, { exact: true }) })
            .first();
    }

    async waitForToast({ timeout = 15000 } = {}) {
        await expect(this.toastList.locator('li').first()).toBeVisible({ timeout });
    }

    // ==========================================================
    // Settings
    // ==========================================================
    async openSettings() {
        await this.serviceSettingsBtn.click();
        await expect(this.settingsDialog).toBeVisible();
    }

    async closeSettingsDialog() {
        if (await this.settingsCloseBtn.isVisible().catch(() => false)) {
            await this.settingsCloseBtn.click();
        } else {
            await this.page.keyboard.press('Escape');
        }
        await expect(this.settingsDialog).toBeHidden();
    }

    async setTitle(title) {
        await this.openSettings();
        await expect(this.serviceTitleInput).toBeVisible();
        await this.serviceTitleInput.fill(String(title));
        await this.closeSettingsDialog();
    }

    // ==========================================================
    // Service actions
    // ==========================================================
    async saveService() {
        await expect(this.saveServiceBtn).toBeVisible();
        await this.saveServiceBtn.click();
        await this.waitForToast();
        await expect(this.toastList).toContainText(/salvest/i);
    }

    async confirmService() {
        await expect(this.confirmServiceBtn).toBeVisible();
        await this.confirmServiceBtn.click();
    }

    async returnToServicesOverview() {
        await this.backToServicesBtn.click();
    }

    async createNewService(name) {
        await this.setTitle(name);
        await this.saveService();
        await this.returnToServicesOverview();
        await this.page.waitForLoadState('domcontentloaded');
    }

    // ==========================================================
    // Node picker / adding nodes
    // ==========================================================
    async clickAddNodeAtEdgeIndex(index = 0) {
        const btn = this.edgeAddButtons.filter({ hasText: '+' }).nth(index);
        await expect(btn).toBeVisible();
        await btn.click();
        await expect(this.nodePickerDialog).toBeVisible();
    }

    async clickAddNode() {
        // legacy convenience = first visible edge
        const btn = this.edgeAddButtons.filter({ hasText: '+' }).first();
        await expect(btn).toBeVisible();
        await btn.click();
        await expect(this.nodePickerDialog).toBeVisible();
    }

    async assertNodePickerVisible() {
        await expect(this.nodePickerDialog).toBeVisible();
    }

    async pickNodeTypeAndReturnToCanvas(nodeTypeBtn) {
        await this.assertNodePickerVisible();
        await expect(nodeTypeBtn).toBeVisible();
        await nodeTypeBtn.click();

        // picker closes after selection
        await expect(this.nodePickerDialog).toBeHidden();

        // back to canvas
        await expect(this.canvas).toBeVisible();
    }

    // ==========================================================
    // Open node editor (pencil on node)
    // ==========================================================
    async openNodeDialogByTitle(titleText) {
        const node = this.getFlowNodeByTitle(titleText);
        await expect(node).toBeVisible();

        // In your node HTML: two buttons in top-right; first is pencil/edit.
        const editBtn = node.locator('button.btn--text').first();
        await expect(editBtn).toBeVisible();
        await editBtn.click();

        await expect(this.nodeEditorPopup).toBeVisible();
        await expect(this.nodeEditorTitle).toBeVisible();
    }

    async assertNodeEditorVisible() {
        await expect(this.nodeEditorPopup).toBeVisible();
        await expect(this.nodeEditorTitle).toBeVisible();
    }

    async assertNodeEditorButtonsVisible() {
        await this.assertNodeEditorVisible();
        await expect(this.nodeEditorCancelBtn).toBeVisible();
        await expect(this.nodeEditorSaveBtn).toBeVisible();
        await expect(this.nodeEditorCloseBtn).toBeVisible();
    }

    async assertTabsVisible() {
        await this.assertNodeEditorVisible();
        await expect(this.nodeEditorTabs).toBeVisible();
        await expect(this.nodeEditorTabSeadistamine).toBeVisible();
        await expect(this.nodeEditorTabTestimine).toBeVisible();
    }

    // ==========================================================
    // API endpoint creation modal
    // ==========================================================
    get createEndpointModal() {
        return this.page.locator('[role="dialog"].modal[data-state="open"]');
    }

    async openCreateEndpointFromPicker() {
        await this.assertNodePickerVisible();
        await expect(this.pickerAddApiBtn).toBeVisible();
        await this.pickerAddApiBtn.click();
        await expect(this.createEndpointModal).toBeVisible();
    }

    // ==========================================================
    // Widget
    // ==========================================================
    async openWidget() {
        await expect(this.widgetIcon).toBeVisible();
        await this.widgetIcon.click();

        await expect(this.widgetDialog).toBeVisible();
        await expect(this.widgetInput).toBeVisible();
        await expect(this.widgetCloseImg).toBeVisible();
        await expect(this.widgetSendImg).toBeVisible();
    }

    async widgetSendText(text) {
        await expect(this.widgetInput).toBeVisible();
        await this.widgetInput.fill(String(text));
        await this.widgetSendImg.click();
    }

    async expectWidgetToContainText(text) {
        // IMPORTANT: assert only inside messages container
        await expect(this.widgetMessages).toContainText(String(text));
    }

    // ==========================================================
    // Visibility assertions (base)
    // ==========================================================
    async assertHeaderElementVisible() {
        await expect(this.backToServicesBtn).toBeVisible();
        await expect(this.stepName).toBeVisible();
        await expect(this.deleteServiceBtn).toBeVisible();
        await expect(this.saveServiceBtn).toBeVisible();
        await expect(this.confirmServiceBtn).toBeVisible();
    }

    async assertServiceDetailsFieldsVisible() {
        await this.openSettings();
        await expect(this.serviceTitleInput).toBeVisible();
        await expect(this.serviceDescriptionInput).toBeVisible();
        await this.closeSettingsDialog();
    }

    async assertCanvasVisible() {
        await expect(this.canvas).toBeVisible();
    }

    async assertCanvasElementsVisible() {
        await expect(this.importBtn).toBeVisible();
        await expect(this.exportBtn).toBeVisible();
        await expect(this.startNode).toBeVisible();
        // ensure at least one add button exists
        await expect(this.edgeAddButtons.first()).toBeVisible();
    }

    async assertZoomButtonsVisible() {
        await expect(this.zoomOutBtn).toBeVisible();
        await expect(this.zoomInBtn).toBeVisible();
        await expect(this.fitViewBtn).toBeVisible();
    }

    async assertConditionDialogVisible() {
        await expect(this.conditionDialog).toBeVisible();
        await expect(this.conditionTitle).toBeVisible();
        await expect(this.conditionTabSeadistamine).toBeVisible();
        await expect(this.conditionTabTestimine).toBeVisible();
        await expect(this.conditionSave).toBeVisible();
        await expect(this.conditionCancel).toBeVisible();
        await expect(this.conditionClose).toBeVisible();
    }

    async assertConditionButtonsVisibleInDialog() {
        await expect(this.conditionBtnSuccess).toBeVisible();
        await expect(this.conditionBtnFailure).toBeVisible();
    }

}

module.exports = { NewServicePage };
