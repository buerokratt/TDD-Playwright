// page-objects/services/newservice/new-service-page.js
const { expect } = require('@playwright/test');
const { waitForNewServiceReady } = require('../../../utils/waits/admin-page-ready');
const { normalizeServiceTitle } = require('../../../utils/test-data/service-data');

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

        // backwards-compatible aliases used by older tests
        this.buttonSave = this.saveServiceBtn;
        this.buttonConfirm = this.confirmServiceBtn;

        // =========================
        // Settings dialog
        // =========================
        this.settingsDialog = page.locator('[role="dialog"]').filter({
            has: page.getByRole('heading', { name: 'Teenuse seaded' }),
        });

        this.settingsCloseBtn = this.settingsDialog.locator('button.dialog__close');
        this.serviceTitleInput = this.settingsDialog.locator('input[placeholder="Pealkiri on kohustuslik"]');
        this.serviceDescriptionInput = this.settingsDialog.getByLabel('Kirjeldus :');

        // =========================
        // Canvas / React Flow
        // =========================
        this.canvas = page.getByRole('application');
        this.flowWrapper = page.getByTestId('rf__wrapper').or(page.locator('.react-flow__wrapper')).first();
        this.startNode = page.locator('.react-flow__node-start .start-node');
        this.edgeAddButtons = page.locator('button.edge-button');
        this.flowNodes = page.locator('.react-flow__node');

        this.topLeftPanel = page.locator('.react-flow__panel.top.left');
        this.importBtn = this.topLeftPanel.getByRole('button', { name: 'Impordi', exact: true });
        this.exportBtn = this.topLeftPanel.getByRole('button', { name: 'Ekspordi', exact: true });

        this.zoomInBtn = page.getByTitle('Zoom In');
        this.zoomOutBtn = page.getByTitle('Zoom Out');
        this.fitViewBtn = page.getByTitle('Fit View');

        // =========================
        // Toasts
        // =========================
        this.toastList = page.locator('ol.toast__list');

        // =========================
        // Node Picker
        // =========================
        this.nodePickerDialog = page.locator('.dropdown__content').filter({
            has: page.getByText('Üldelemendid', { exact: true }),
        }).last();
        this.pickerDefineBtn = this.getNodePickerItem('Määra');
        this.pickerMessageBtn = this.getNodePickerItem('Sõnum kliendile');
        this.pickerConditionBtn = this.getNodePickerItem('Tingimus');
        this.pickerMultichoiceBtn = this.getNodePickerItem('Mitmevalikuline küsimus');
        this.pickerDynamicChoiceBtn = this.getNodePickerItem('Dünaamilised valikud');
        this.pickerEndServiceBtn = this.getNodePickerItem('Teenuse lõpetamine');
        this.pickerAddApiBtn = this.nodePickerDialog.locator('button').filter({
            has: page.locator('svg path[d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"]'),
        }).first();

        // backwards-compatible picker aliases
        this.buttonDefine = this.pickerDefineBtn;
        this.buttonMessageForCustomer = this.pickerMessageBtn;
        this.buttonCondition = this.pickerConditionBtn;
        this.buttonDynamicChoice = this.pickerDynamicChoiceBtn;

        // =========================
        // Generic node editor popup
        // =========================
        this.nodeEditorPopup = page.locator('[role="dialog"].popup[data-state="open"]');
        this.nodeEditorTitle = this.nodeEditorPopup.locator('h2.popup__title');
        this.nodeEditorCloseBtn = this.nodeEditorPopup.locator('button.popup__close');
        this.nodeEditorCancelBtn = this.nodeEditorPopup.getByRole('button', { name: 'Tühista', exact: true });
        this.nodeEditorSaveBtn = this.nodeEditorPopup.getByRole('button', { name: 'Salvesta', exact: true });
        this.nodeEditorTabs = this.nodeEditorPopup.getByRole('tablist');
        this.nodeEditorTabSeadistamine = this.nodeEditorPopup.getByRole('tab', { name: 'Seadistamine', exact: true });
        this.nodeEditorTabTestimine = this.nodeEditorPopup.getByRole('tab', { name: 'Testimine', exact: true });

        // ===== Message node =====
        this.messageDialog = this.nodeEditorPopup;
        this.messageTabSeadistamine = this.nodeEditorTabSeadistamine;
        this.messageTabTestimine = this.nodeEditorTabTestimine;
        this.messageCancel = this.nodeEditorCancelBtn;
        this.messageSave = this.nodeEditorSaveBtn;
        this.messageClose = this.nodeEditorCloseBtn;
        this.quillEditor = this.nodeEditorPopup.locator('.ql-editor,[contenteditable="true"]').first();
        this.messageSectionElements = this.nodeEditorPopup.locator('label', { hasText: 'Määra elemendid' }).locator('..').first();
        this.messageChips = this.messageSectionElements.locator('button,[draggable="true"],.chip,.tag,.badge');

        // ===== Define node =====
        this.defineDialog = this.nodeEditorPopup;
        this.defineTabSeadistamine = this.nodeEditorTabSeadistamine;
        this.defineTabTestimine = this.nodeEditorTabTestimine;
        this.defineCancel = this.nodeEditorCancelBtn;
        this.defineSave = this.nodeEditorSaveBtn;
        this.defineClose = this.nodeEditorCloseBtn;
        this.defineAssignContainer = this.nodeEditorPopup.locator('.assign-action-container').first();
        this.defineRows = this.defineAssignContainer.locator('input[name="key"]').locator('xpath=ancestor::*[contains(@class,"_assignElement") or self::div][1]');
        this.defineAddElementBtn = this.nodeEditorPopup.getByRole('button', { name: /^\+\s*Element$/i }).first();
        this.defineSectionElements = this.nodeEditorPopup.locator('label', { hasText: 'Määra elemendid' }).locator('xpath=ancestor::div[contains(@class,"track")][1]').first();
        this.defineSectionEnv = this.nodeEditorPopup.locator('label', { hasText: 'Keskkonnamuutujad' }).locator('xpath=ancestor::div[contains(@class,"track")][1]').first();
        this.defineSectionDates = this.nodeEditorPopup.locator('.collapsible').filter({ has: this.nodeEditorPopup.getByText(/Kuupäev ja kellaaeg/i).first() }).first();
        this.defineSectionTools = this.nodeEditorPopup.locator('label', { hasText: 'Tööriistad' }).locator('xpath=ancestor::div[contains(@class,"track")][1]').first();
        this.defineChips = this.nodeEditorPopup.locator('.box[draggable="true"], .box[draggable="false"], [draggable="true"], .chip, .badge, .tag');
        this.defineNameInputs = this.defineAssignContainer.locator('input[name="key"]');
        this.defineValueInputs = this.defineAssignContainer.locator('input[placeholder="Lohista element siia"], input._dragInput_92s4r_58, input:not([name]):not([type]), input').filter({ hasNot: this.page.locator('[name="key"]') });

        // ===== Dynamic choices node =====
        this.dynamicChoicesDialog = this.nodeEditorPopup;
        this.dynamicChoicesTabSeadistamine = this.nodeEditorTabSeadistamine;
        this.dynamicChoicesTabTestimine = this.nodeEditorTabTestimine;
        this.dynamicChoicesCancel = this.nodeEditorCancelBtn;
        this.dynamicChoicesSave = this.nodeEditorSaveBtn;
        this.dynamicChoicesClose = this.nodeEditorCloseBtn;
        this.dynamicChoicesSectionElements = this.nodeEditorPopup.locator('label', { hasText: 'Määra elemendid' }).locator('..').first();
        this.dynamicChoicesChips = this.dynamicChoicesSectionElements.locator('[draggable="true"],button,.chip,.badge,.tag');
        this.dynamicChoicesRows = this.nodeEditorPopup.locator('input[name="key"]').locator('xpath=ancestor::*[self::tr or self::div][1]');
        this.dynamicChoicesKeyInputs = this.nodeEditorPopup.locator('input[name="key"]');
        this.dynamicChoicesValueInputs = this.nodeEditorPopup.locator('input[name="value"], textarea[name="value"], input:not([name="key"])');

        // ===== Condition node =====
        this.conditionDialog = this.page.locator('[role="dialog"].popup:visible').filter({
            has: this.page.locator('h2.popup__title').filter({ hasText: /^Tingimus/ }),
        }).first();
        this.conditionTitle = this.conditionDialog.locator('h2.popup__title');
        this.conditionClose = this.conditionDialog.locator('button.popup__close').first();
        this.conditionTabSeadistamine = this.conditionDialog.getByRole('tab', { name: 'Seadistamine' });
        this.conditionTabTestimine = this.conditionDialog.getByRole('tab', { name: 'Testimine' });
        this.conditionCancel = this.conditionDialog.getByRole('button', { name: 'Tühista', exact: true });
        this.conditionSave = this.conditionDialog.getByRole('button', { name: 'Salvesta', exact: true });
        this.conditionChipJa = this.conditionDialog.locator('span,div,button').filter({ hasText: /^JA$/ }).first();
        this.conditionChipVoi = this.conditionDialog.locator('span,div,button').filter({ hasText: /^VÕI$/ }).first();
        this.conditionChipMitte = this.conditionDialog.locator('span,div,button').filter({ hasText: /^MITTE$/ }).first();
        this.conditionAddRuleButton = this.conditionDialog.getByRole('button', { name: /\+\s*Reegel/i }).first();
        this.conditionAddGroupButton = this.conditionDialog.getByRole('button', { name: /\+\s*Grupp/i }).first();
        this.conditionSectionDefineElements = this.conditionDialog.locator('label', { hasText: 'Määra Elemendid' }).locator('..');

        // ===== Create endpoint modal =====
        this.createEndpointModal = this.page.locator('[role="dialog"].modal[data-state="open"]').filter({
            has: this.page.locator('h2, h3').filter({ hasText: /Loo uus otspunkt|otspunkt/i }),
        }).first();
        this.createEndpointTitle = this.createEndpointModal.locator('h2, h3').filter({ hasText: /Loo uus otspunkt|otspunkt|endpoint|api/i }).first();
        this.createEndpointTabOtspunkt = this.createEndpointModal.getByRole('tab', { name: /otspunkt|endpoint/i }).first();
        this.createEndpointServiceTypeCombo = this.createEndpointModal.locator('label:has-text("Teenus kasutab")').locator('xpath=following-sibling::*//*[self::select or @role="combobox" or self::input][1]').or(this.createEndpointModal.getByRole('combobox').first());
        this.createEndpointCancel = this.createEndpointModal.getByRole('button', { name: /tühista|cancel/i }).first();
        this.createEndpointCreate = this.createEndpointModal.getByRole('button', { name: /loo|create/i }).first();
        this.createEndpointName = this.createEndpointModal.locator('label:has-text("Otspunkti nimetus")').locator('xpath=following-sibling::*//input[1]').or(this.createEndpointModal.getByPlaceholder(/Sisesta otspunkti nimet/i)).first();
        this.createEndpointUrl = this.createEndpointModal.locator('label:has-text("API otspunkti URL")').locator('xpath=following-sibling::*//input[1]').or(this.createEndpointModal.getByPlaceholder(/Sisesta API otspunkt/i)).first();
        this.createEndpointFetchEndpoints = this.createEndpointModal.getByRole('button', { name: /Küsi otspunkte|otsi|fetch|endpoints?/i }).first();
        this.createEndpointPublicSwitch = this.createEndpointModal.locator('input[type="checkbox"], [role="switch"]').first().or(this.createEndpointModal.getByText(/^Jah$/).first()).or(this.createEndpointModal.getByText(/^Ei$/).first());
        this.createEndpointPublicYes = this.createEndpointModal.getByText(/^Jah$/).first();
        this.createEndpointPublicNo = this.createEndpointModal.getByText(/^Ei$/).first();
        this.apiURL = 'https://petstore3.swagger.io/api/v3/openapi.json';

        // =========================
        // Widget (Buerokratt)
        // =========================
        this.widgetIcon = page.getByAltText('Buerokratt logo');
        this.widget = this.widgetIcon;
        this.widgetDialog = page.locator('div[class*="_chatWrapper_"]', {
            has: page.locator('div[class*="_title_"]', { hasText: 'TEST' }),
        }).first();
        this.widgetInput = this.widgetDialog.getByPlaceholder('Sisestage sisend, eraldatud komadega');
        this.widgetCloseButton = this.widgetDialog.locator('div[class*="_header_"] button').last().or(this.widgetDialog.locator('button:has(img[alt="Close"])').first());
        this.widgetSendButton = this.widgetDialog.locator('div[class*="_keypadContainer_"] button').last().or(this.widgetDialog.locator('button:has(img[alt="Send"])').first());
        this.widgetCloseImg = this.widgetDialog.getByAltText('Close');
        this.widgetSendImg = this.widgetDialog.getByAltText('Send');
        this.widgetMessages = this.widgetDialog.locator('div[class*="_chatContent_"], .os-viewport .os-content').first();
    }

    getNodePickerItem(label) {
        const escapedLabel = String(label).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const exactText = new RegExp(`^\\s*${escapedLabel}\\s*$`);

        return this.nodePickerDialog
            .locator('.box[role="button"], [role="button"]')
            .filter({ hasText: exactText })
            .first();
    }

    async waitForReady(options = {}) {
        await waitForNewServiceReady(this.page, options);
    }

    getFlowNodeByTitle(titleText) {
        return this.flowNodes.filter({ has: this.page.getByText(titleText, { exact: true }) }).first();
    }

    async waitForToast({ timeout = 15000 } = {}) {
        await expect(this.toastList.locator('li').first()).toBeVisible({ timeout });
    }

    async openSettings() {
        await this.waitForReady();
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

    assertValidServiceTitle(title) {
        const normalizedTitle = normalizeServiceTitle(title);
        if (!normalizedTitle) {
            throw new Error('Service title is required but was not provided');
        }
        return normalizedTitle;
    }

    async resolveVisibleTitleInput() {
        const candidates = [
            this.settingsDialog.getByLabel('Pealkiri :').first(),
            this.settingsDialog.locator('label:has-text("Pealkiri")').locator('xpath=following::input[1]').first(),
            this.settingsDialog.locator('input[name="Pealkiri"]').first(),
            this.settingsDialog.locator('input[placeholder*="Pealkiri"]').first(),
            this.serviceTitleInput.first(),
        ];
        for (const candidate of candidates) {
            if (await candidate.count().catch(() => 0)) {
                const visible = await candidate.isVisible().catch(() => false);
                const editable = await candidate.isEditable().catch(() => false);
                if (visible && editable) return candidate;
            }
        }
        throw new Error('Could not resolve a visible editable service title input');
    }

    async fillTitle(title) {
        const normalizedTitle = this.assertValidServiceTitle(title);
        await this.openSettings();
        const titleInput = await this.resolveVisibleTitleInput();
        await expect(titleInput).toBeVisible();
        await titleInput.click({ force: true });
        await titleInput.fill('');
        await titleInput.pressSequentially(normalizedTitle, { delay: 20 });
        let currentValue = await titleInput.inputValue().catch(() => '');
        if (currentValue !== normalizedTitle) {
            await titleInput.evaluate((input, value) => {
                const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
                nativeSetter?.call(input, value);
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
                input.dispatchEvent(new Event('blur', { bubbles: true }));
            }, normalizedTitle);
        }
        await expect(titleInput).toHaveValue(normalizedTitle, { timeout: 10000 });
        return normalizedTitle;
    }

    async setTitle(title) {
        const normalizedTitle = await this.fillTitle(title);
        await this.closeSettingsDialog();
        return normalizedTitle;
    }

    async saveService(options = {}) {
        const { expectedToast = /salvest/i } = options;
        await this.waitForReady();
        await expect(this.saveServiceBtn).toBeVisible();
        await this.saveServiceBtn.click();
        await this.waitForToast();
        if (expectedToast) {
            await expect(this.toastList).toContainText(expectedToast);
        }
    }

    async confirmService() {
        await expect(this.confirmServiceBtn).toBeVisible();
        await this.confirmServiceBtn.click();
    }

    async returnToServicesOverview() {
        await this.waitForReady();
        await this.backToServicesBtn.click();
    }

    async createService(serviceData = {}) {
        const normalizedServiceData = typeof serviceData === 'string' ? { title: serviceData } : { ...serviceData };
        const normalizedTitle = this.assertValidServiceTitle(normalizedServiceData.title);
        await this.fillTitle(normalizedTitle);
        if (normalizedServiceData.description !== undefined && normalizedServiceData.description !== null) {
            await expect(this.serviceDescriptionInput).toBeVisible();
            await this.serviceDescriptionInput.fill(String(normalizedServiceData.description));
        }
        await this.closeSettingsDialog();
        await this.saveService();
        return { ...normalizedServiceData, title: normalizedTitle };
    }

    async createNewService(nameOrData) {
        await this.createService(nameOrData);
        await this.returnToServicesOverview();
        await this.page.waitForLoadState('domcontentloaded');
    }

    async clickAddNodeAtEdgeIndex(index = 0) {
        await this.waitForReady();
        const btn = this.edgeAddButtons.filter({ hasText: '+' }).nth(index);
        await expect(btn).toBeVisible();
        await btn.click();
        await expect(this.nodePickerDialog).toBeVisible({ timeout: 10000 });
    }

    async clickAddNode() {
        await this.waitForReady();
        const btn = this.edgeAddButtons.filter({ hasText: '+' }).first();
        await expect(btn).toBeVisible();
        await btn.click();
        await expect(this.nodePickerDialog).toBeVisible({ timeout: 10000 });
    }

    async clickAddNodeOnLastEdge() {
        await this.waitForReady();
        const btn = this.edgeAddButtons.filter({ hasText: '+' }).last();
        await expect(btn).toBeVisible();
        await btn.click();
        await expect(this.nodePickerDialog).toBeVisible({ timeout: 10000 });
    }

    async assertNodePickerVisible() {
        await expect(this.nodePickerDialog).toBeVisible({ timeout: 10000 });
    }

    async pickNodeTypeAndReturnToCanvas(nodeTypeBtn) {
        await this.assertNodePickerVisible();
        await expect(nodeTypeBtn).toBeVisible();
        await nodeTypeBtn.click({ force: true });
        await expect(this.nodePickerDialog).toBeHidden();
        await expect(this.canvas).toBeVisible();
    }

    async openNodeDialogByTitle(titleText) {
        const node = this.getFlowNodeByTitle(titleText);
        await expect(node).toBeVisible();
        const editBtn = node.locator('button.btn--text').first();
        await expect(editBtn).toBeVisible();
        await editBtn.click();
        await expect(this.nodeEditorPopup).toBeVisible();
        await expect(this.nodeEditorTitle).toBeVisible();
    }

    async editNode(titleText) {
        await this.openNodeDialogByTitle(titleText);
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

    async assertMessageDialogVisible() {
        await this.assertNodeEditorVisible();
        await expect(this.nodeEditorTitle).toContainText(/Sõnum kliendile/i);
    }

    async assertDefineDialogVisible() {
        await this.assertNodeEditorVisible();
        await expect(this.nodeEditorTitle).toContainText(/Määra/i);
    }

    async assertDynamicChoicesDialogVisible() {
        await this.assertNodeEditorVisible();
        await expect(this.nodeEditorTitle).toContainText(/Dünaamilised valikud/i);
    }

    async assertDefineTabsVisible() {
        await expect(this.defineTabSeadistamine).toBeVisible();
        await expect(this.defineTabTestimine).toBeVisible();
    }

    async assertDefineFooterButtonsVisible() {
        await expect(this.defineCancel).toBeVisible();
        await expect(this.defineSave).toBeVisible();
        await expect(this.defineClose).toBeVisible();
    }

    async assertDynamicChoiceFields() {
        await expect(this.dynamicChoicesRows.first()).toBeVisible();
        await expect(this.dynamicChoicesKeyInputs.first()).toBeVisible();
        await expect(this.dynamicChoicesValueInputs.first()).toBeVisible();
    }

    async assignSetVariableAndSave(name, value) {
        await this.assertDefineDialogVisible();
        await expect(this.defineAddElementBtn).toBeVisible();
        await this.defineAddElementBtn.click();
        const nameInput = this.defineNameInputs.last();
        const valueInput = this.defineAssignContainer.locator('input[placeholder="Lohista element siia"], input[class*="_dragInput_"]').last();
        await expect(nameInput).toBeVisible();
        await expect(valueInput).toBeVisible();
        await nameInput.fill(String(name));
        await valueInput.click({ force: true });
        await valueInput.fill('');
        await valueInput.pressSequentially(String(value), { delay: 20 });
        await this.defineSave.click();
        await expect(this.nodeEditorPopup).toBeHidden();
    }

    async messageSetTextAndSave(text) {
        await this.assertMessageDialogVisible();
        await expect(this.quillEditor).toBeVisible();
        await this.quillEditor.click();
        await this.quillEditor.fill('');
        await this.quillEditor.type(String(text));
        await this.messageSave.click();
        await expect(this.nodeEditorPopup).toBeHidden();
    }

    async addMessage(text) {
        await this.messageSetTextAndSave(text);
    }

    async assertSectionHasButtons(sectionLocator) {
        const items = sectionLocator.locator('button,[draggable="true"],.chip,.badge,.tag');
        await expect(items.first()).toBeVisible();
    }

    async openCreateEndpointFromPicker() {
        await this.assertNodePickerVisible();
        await expect(this.pickerAddApiBtn).toBeVisible();
        await this.pickerAddApiBtn.click();
        await expect(this.createEndpointModal).toBeVisible();
    }

    async addNewAPI() {
        await this.clickAddNodeAtEdgeIndex(0);
        await this.openCreateEndpointFromPicker();
    }

    async assertCreateEndpointModalVisible() {
        await expect(this.createEndpointModal).toBeVisible();
    }

    async selectServiceType(label) {
        await expect(this.createEndpointServiceTypeCombo).toBeVisible();
        await this.createEndpointServiceTypeCombo.click();
        const option = this.page.getByRole('option', { name: new RegExp(label, 'i') }).first();
        if (await option.isVisible().catch(() => false)) {
            await option.click();
        } else {
            await this.createEndpointServiceTypeCombo.selectOption({ label }).catch(() => null);
        }
        await expect(this.createEndpointName).toBeVisible({ timeout: 10000 });
        await expect(this.createEndpointUrl).toBeVisible({ timeout: 10000 });
    }

    async setEndpointName(value) {
        await expect(this.createEndpointName).toBeVisible();
        await this.createEndpointName.fill(String(value));
    }

    async setEndpointUrl(value) {
        await expect(this.createEndpointUrl).toBeVisible();
        await this.createEndpointUrl.fill(String(value));
    }

    async createEndpoint() {
        await expect(this.createEndpointCreate).toBeVisible();
        await this.createEndpointCreate.click();
    }

    async openWidget() {
        await expect(this.widgetIcon).toBeVisible();
        await this.widgetIcon.click();
        await expect(this.widgetDialog).toBeVisible();
        await expect(this.widgetInput).toBeVisible();
        await expect(this.widgetCloseButton).toBeVisible();
        await expect(this.widgetSendButton).toBeVisible();
    }

    async widgetSendText(text) {
        await expect(this.widgetInput).toBeVisible();
        await this.widgetInput.fill(String(text));
        await this.widgetSendButton.click();
    }

    async expectWidgetToContainText(text) {
        await expect(this.widgetMessages).toContainText(String(text));
    }

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
        await expect(this.conditionChipJa).toBeVisible();
        await expect(this.conditionChipVoi).toBeVisible();
        await expect(this.conditionChipMitte).toBeVisible();
        await expect(this.conditionAddRuleButton).toBeVisible();
        await expect(this.conditionAddGroupButton).toBeVisible();
    }

    async addNodes() {
        await this.clickAddNodeAtEdgeIndex(0);
        await this.pickNodeTypeAndReturnToCanvas(this.buttonMessageForCustomer);
    }
}

module.exports = { NewServicePage };
