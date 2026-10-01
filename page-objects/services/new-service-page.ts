import { Locator, Page, expect } from '@playwright/test';

import { ACTION_TIMEOUT } from '@utils/constants';
import { RouteReadyOptions, SaveServiceOptions, ServiceData } from '@utils/interfaces';
import { normalizeServiceTitle } from '@utils/test-data';
import { isEventuallyVisible, waitForNewServiceReady } from '@utils/waits';

type ServiceInput = string | Partial<ServiceData>;

export class NewServicePage {
  private readonly page: Page;

  readonly header: Locator;
  readonly backToServicesBtn: Locator;
  readonly serviceSettingsBtn: Locator;
  readonly stepName: Locator;
  readonly deleteServiceBtn: Locator;
  readonly saveServiceBtn: Locator;
  readonly confirmServiceBtn: Locator;

  readonly settingsDialog: Locator;
  readonly settingsCloseBtn: Locator;
  readonly serviceTitleInput: Locator;
  readonly serviceDescriptionInput: Locator;

  readonly canvas: Locator;
  readonly flowWrapper: Locator;
  readonly startNode: Locator;
  readonly edgeAddButtons: Locator;
  readonly flowNodes: Locator;

  readonly topLeftPanel: Locator;
  readonly importBtn: Locator;
  readonly exportBtn: Locator;

  readonly zoomInBtn: Locator;
  readonly zoomOutBtn: Locator;
  readonly fitViewBtn: Locator;

  readonly toastList: Locator;

  private nodePickerDialog: Locator;
  readonly pickerDefineBtn: Locator;
  readonly pickerMessageBtn: Locator;
  readonly pickerConditionBtn: Locator;
  readonly pickerMultichoiceBtn: Locator;
  readonly pickerDynamicChoiceBtn: Locator;
  readonly pickerEndServiceBtn: Locator;
  private pickerAddApiBtn: Locator;

  readonly nodeEditorPopup: Locator;
  readonly nodeEditorTitle: Locator;
  readonly nodeEditorCloseBtn: Locator;
  readonly nodeEditorCancelBtn: Locator;
  readonly nodeEditorSaveBtn: Locator;
  readonly nodeEditorTabs: Locator;
  readonly nodeEditorTabSetup: Locator;
  readonly nodeEditorTabTest: Locator;

  readonly messageDialog: Locator;
  readonly messageTabSetup: Locator;
  readonly messageTabTest: Locator;
  readonly messageCancel: Locator;
  readonly messageSave: Locator;
  readonly messageClose: Locator;
  readonly quillEditor: Locator;
  readonly messageSectionElements: Locator;
  readonly messageChips: Locator;

  readonly defineDialog: Locator;
  readonly defineTabSetup: Locator;
  readonly defineTabTest: Locator;
  readonly defineCancel: Locator;
  readonly defineSave: Locator;
  readonly defineClose: Locator;
  readonly defineAssignContainer: Locator;
  readonly defineRows: Locator;
  readonly defineAddElementBtn: Locator;
  readonly defineSectionElements: Locator;
  readonly defineSectionEnv: Locator;
  readonly defineSectionDates: Locator;
  readonly defineSectionTools: Locator;
  readonly defineChips: Locator;
  readonly defineNameInputs: Locator;
  readonly defineValueInputs: Locator;

  readonly dynamicChoicesDialog: Locator;
  readonly dynamicChoicesTabSetup: Locator;
  readonly dynamicChoicesTabTest: Locator;
  readonly dynamicChoicesCancel: Locator;
  readonly dynamicChoicesSave: Locator;
  readonly dynamicChoicesClose: Locator;
  readonly dynamicChoicesSectionElements: Locator;
  readonly dynamicChoicesChips: Locator;
  readonly dynamicChoicesRows: Locator;
  readonly dynamicChoicesKeyInputs: Locator;
  readonly dynamicChoicesValueInputs: Locator;

  readonly conditionDialog: Locator;
  readonly conditionTitle: Locator;
  readonly conditionClose: Locator;
  readonly conditionTabSetup: Locator;
  readonly conditionTabTest: Locator;
  readonly conditionCancel: Locator;
  readonly conditionSave: Locator;
  readonly conditionChipAnd: Locator;
  readonly conditionChipOr: Locator;
  readonly conditionChipNot: Locator;
  readonly conditionAddRuleButton: Locator;
  readonly conditionAddGroupButton: Locator;
  readonly conditionSectionDefineElements: Locator;

  readonly createEndpointModal: Locator;
  readonly createEndpointTitle: Locator;
  readonly createEndpointTabEndpoint: Locator;
  readonly createEndpointServiceTypeCombo: Locator;
  readonly createEndpointCancel: Locator;
  readonly createEndpointCreate: Locator;
  readonly createEndpointName: Locator;
  readonly createEndpointUrl: Locator;
  readonly createEndpointFetchEndpoints: Locator;
  readonly createEndpointPublicSwitch: Locator;
  readonly createEndpointPublicYes: Locator;
  readonly createEndpointPublicNo: Locator;
  readonly apiURL: string;

  readonly widgetIcon: Locator;
  readonly widget: Locator;
  readonly widgetDialog: Locator;
  readonly widgetInput: Locator;
  readonly widgetCloseButton: Locator;
  readonly widgetSendButton: Locator;
  readonly widgetCloseImg: Locator;
  readonly widgetSendImg: Locator;
  readonly widgetMessages: Locator;

  constructor(page: Page) {
    this.page = page;

    this.header = page.locator('header.header').or(page.locator('header').first()).first();

    this.backToServicesBtn = page.getByRole('button', { name: 'Back to service listing', exact: true }).first();
    this.serviceSettingsBtn = page.getByRole('button', { name: 'Settings', exact: true }).first();
    this.stepName = this.header.locator('.naming');

    this.deleteServiceBtn = page.getByRole('button', { name: 'Delete', exact: true }).first();
    this.saveServiceBtn = page.getByRole('button', { name: 'Save', exact: true }).first();
    this.confirmServiceBtn = page.getByRole('button', { name: 'Confirm', exact: true }).first();

    this.settingsDialog = page.locator('[role="dialog"]').filter({
      has: page.getByRole('heading', { name: 'Settings' }),
    });

    this.settingsCloseBtn = this.settingsDialog
      .locator(
        [
          'button.dialog__close',
          'button.popup__close',
          'button[aria-label="Close"]',
          'button[title="Close"]',
          'header button',
          '.dialog__header button',
          '.popup__header button',
        ].join(', '),
      )
      .first();

    this.serviceTitleInput = this.settingsDialog.locator('input[placeholder="Title is mandatory"]');
    this.serviceDescriptionInput = this.settingsDialog.getByLabel('Description :');

    this.canvas = page
      .getByRole('application')
      .first()
      .or(page.locator('.react-flow, .react-flow__renderer, .react-flow__viewport').first())
      .or(page.locator('main').first());
    this.flowWrapper = page
      .getByTestId('rf__wrapper')
      .or(page.locator('.react-flow__wrapper'))
      .or(page.locator('.react-flow'))
      .first();
    this.startNode = page.locator('.react-flow__node-start .start-node');
    this.edgeAddButtons = page.locator('button.edge-button, .edge-button, button, [role="button"]').filter({
      hasText: /^\+$/,
    });
    this.flowNodes = page.locator('.react-flow__node');

    this.topLeftPanel = page.locator('.react-flow__panel.top.left');
    this.importBtn = this.topLeftPanel.getByRole('button', { name: 'Import', exact: true });
    this.exportBtn = this.topLeftPanel.getByRole('button', { name: 'Export', exact: true });

    this.zoomInBtn = page.getByTitle('Zoom In');
    this.zoomOutBtn = page.getByTitle('Zoom Out');
    this.fitViewBtn = page.getByTitle('Fit View');

    this.toastList = page.locator('ol.toast__list');

    this.nodePickerDialog = page
      .locator('.dropdown__content')
      .filter({
        has: page.getByText('All elements', { exact: true }),
      })
      .last();
    this.pickerDefineBtn = this.getNodePickerItem('Assign');
    this.pickerMessageBtn = this.getNodePickerItem('Send message to client');
    this.pickerConditionBtn = this.getNodePickerItem('Condition');
    this.pickerMultichoiceBtn = this.getNodePickerItem('Multi-choice question');
    this.pickerDynamicChoiceBtn = this.getNodePickerItem('Dynamic Choices');
    this.pickerEndServiceBtn = this.getNodePickerItem('End service');
    this.pickerAddApiBtn = this.nodePickerDialog
      .locator('button')
      .filter({
        has: page.locator('svg path[d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"]'),
      })
      .first();

    this.nodePickerDialog = page
      .locator('.dropdown__content, [role="dialog"], .modal, .popup')
      .filter({
        has: page.getByText(/All elements|Elements|API elements|Assign|Send message to client/i),
      })
      .last();
    this.pickerAddApiBtn = this.nodePickerDialog
      .locator(
        'xpath=.//*[contains(normalize-space(),"API elements")]/ancestor::*[self::div or self::section][1]//button[1]',
      )
      .first()
      .or(
        this.nodePickerDialog
          .locator('button')
          .filter({
            has: page.locator('svg path[d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"]'),
          })
          .first(),
      );

    this.nodeEditorPopup = page.locator('[role="dialog"].popup[data-state="open"]');
    this.nodeEditorTitle = this.nodeEditorPopup.locator('h2.popup__title');
    this.nodeEditorCloseBtn = this.nodeEditorPopup.locator('button.popup__close');
    this.nodeEditorCancelBtn = this.nodeEditorPopup.getByRole('button', { name: 'Cancel', exact: true });
    this.nodeEditorSaveBtn = this.nodeEditorPopup.getByRole('button', { name: 'Save', exact: true });
    this.nodeEditorTabs = this.nodeEditorPopup.getByRole('tablist');
    this.nodeEditorTabSetup = this.nodeEditorPopup.getByRole('tab', { name: 'Setup', exact: true });
    this.nodeEditorTabTest = this.nodeEditorPopup.getByRole('tab', { name: 'Test', exact: true });

    this.messageDialog = this.nodeEditorPopup;
    this.messageTabSetup = this.nodeEditorTabSetup;
    this.messageTabTest = this.nodeEditorTabTest;
    this.messageCancel = this.nodeEditorCancelBtn;
    this.messageSave = this.nodeEditorSaveBtn;
    this.messageClose = this.nodeEditorCloseBtn;
    this.quillEditor = this.nodeEditorPopup.locator('.ql-editor,[contenteditable="true"]').first();
    this.messageSectionElements = this.nodeEditorPopup.getByText(/Assigned\s+Variables/i).first();
    this.messageChips = this.nodeEditorPopup.locator(
      '.box[draggable="true"], .box[draggable="false"], [draggable="true"], .chip, .tag, .badge',
    );

    this.defineDialog = this.nodeEditorPopup;
    this.defineTabSetup = this.nodeEditorTabSetup;
    this.defineTabTest = this.nodeEditorTabTest;
    this.defineCancel = this.nodeEditorCancelBtn;
    this.defineSave = this.nodeEditorSaveBtn;
    this.defineClose = this.nodeEditorCloseBtn;
    this.defineAssignContainer = this.nodeEditorPopup.locator('.assign-action-container').first();
    this.defineRows = this.defineAssignContainer.locator(':scope > div').filter({
      has: this.page.locator('input, textarea'),
    });
    this.defineAddElementBtn = this.nodeEditorPopup
      .getByRole('button', { name: /\+\s*(New variable|Element)/i })
      .first();
    this.defineSectionElements = this.nodeEditorPopup.getByText(/Assigned\s+Variables/i).first();
    this.defineSectionEnv = this.nodeEditorPopup.getByText(/Environment Variables/i).first();
    this.defineSectionDates = this.nodeEditorPopup.getByText(/Date and time/i).first();
    this.defineSectionTools = this.nodeEditorPopup.getByText(/Tools/i).first();
    this.defineChips = this.nodeEditorPopup.locator(
      '.box[draggable="true"], .box[draggable="false"], [draggable="true"], .chip, .badge, .tag',
    );
    this.defineNameInputs = this.defineAssignContainer.locator('input[name="key"]');
    this.defineValueInputs = this.defineAssignContainer.locator('input[name="value"]');

    this.dynamicChoicesDialog = this.nodeEditorPopup;
    this.dynamicChoicesTabSetup = this.nodeEditorTabSetup;
    this.dynamicChoicesTabTest = this.nodeEditorTabTest;
    this.dynamicChoicesCancel = this.nodeEditorCancelBtn;
    this.dynamicChoicesSave = this.nodeEditorSaveBtn;
    this.dynamicChoicesClose = this.nodeEditorCloseBtn;
    this.dynamicChoicesSectionElements = this.nodeEditorPopup.getByText(/Assigned\s+Variables/i).first();
    this.dynamicChoicesChips = this.nodeEditorPopup.locator(
      '.box[draggable="true"], .box[draggable="false"], [draggable="true"], .chip, .badge, .tag',
    );
    this.dynamicChoicesRows = this.nodeEditorPopup
      .locator('input[name="key"]')
      .locator('xpath=ancestor::*[self::tr or self::div][1]');
    this.dynamicChoicesKeyInputs = this.nodeEditorPopup.locator('input[name="key"]');
    this.dynamicChoicesValueInputs = this.nodeEditorPopup.locator(
      'input[name="value"], textarea[name="value"], input:not([name="key"])',
    );

    this.conditionDialog = this.page
      .locator('[role="dialog"].popup:visible')
      .filter({
        has: this.page.locator('h2.popup__title').filter({ hasText: /^Condition/ }),
      })
      .first();
    this.conditionTitle = this.conditionDialog.locator('h2.popup__title');
    this.conditionClose = this.conditionDialog.locator('button.popup__close').first();
    this.conditionTabSetup = this.conditionDialog.getByRole('tab', { name: 'Setup' });
    this.conditionTabTest = this.conditionDialog.getByRole('tab', { name: 'Test' });
    this.conditionCancel = this.conditionDialog.getByRole('button', { name: 'Cancel', exact: true });
    this.conditionSave = this.conditionDialog.getByRole('button', { name: 'Save', exact: true });
    this.conditionChipAnd = this.conditionDialog.locator('span,div,button').filter({ hasText: /^AND$/ }).first();
    this.conditionChipOr = this.conditionDialog.locator('span,div,button').filter({ hasText: /^OR$/ }).first();
    this.conditionChipNot = this.conditionDialog.locator('span,div,button').filter({ hasText: /^NOT$/ }).first();
    this.conditionAddRuleButton = this.conditionDialog.getByRole('button', { name: /\+\s*Rule/i }).first();
    this.conditionAddGroupButton = this.conditionDialog.getByRole('button', { name: /\+\s*Group/i }).first();
    this.conditionSectionDefineElements = this.conditionDialog.getByText(/Assigned\s+Variables/i).first();

    this.createEndpointModal = this.page
      .locator('[role="dialog"].modal[data-state="open"]')
      .filter({
        has: this.page.locator('h2, h3').filter({ hasText: /Create endpoint|endpoint/i }),
      })
      .first();
    this.createEndpointTitle = this.createEndpointModal
      .locator('h2, h3')
      .filter({ hasText: /Create endpoint|endpoint|api/i })
      .first();
    this.createEndpointTabEndpoint = this.createEndpointModal.getByRole('tab', { name: /endpoint/i }).first();
    this.createEndpointServiceTypeCombo = this.createEndpointModal
      .locator('label:has-text("Service uses")')
      .locator('xpath=following-sibling::*//*[self::select or @role="combobox" or self::input][1]')
      .or(this.createEndpointModal.getByRole('combobox').first());
    this.createEndpointCancel = this.createEndpointModal.getByRole('button', { name: /cancel/i }).first();
    this.createEndpointCreate = this.createEndpointModal.getByRole('button', { name: /save|create/i }).first();
    this.createEndpointName = this.createEndpointModal
      .locator('label:has-text("Endpoint name")')
      .locator('xpath=following-sibling::*//input[1]')
      .or(this.createEndpointModal.getByPlaceholder(/Insert endpoint name/i))
      .first();
    this.createEndpointUrl = this.createEndpointModal
      .locator('label:has-text("API endpoint URL")')
      .locator('xpath=following-sibling::*//input[1]')
      .or(this.createEndpointModal.getByPlaceholder(/Insert API endpoint/i))
      .first();
    this.createEndpointFetchEndpoints = this.createEndpointModal
      .getByRole('button', { name: /Ask for endpoints|fetch|endpoints?/i })
      .first();
    this.createEndpointPublicSwitch = this.createEndpointModal.getByRole('switch').first();
    this.createEndpointPublicYes = this.createEndpointModal.getByText(/^Yes$/).first();
    this.createEndpointPublicNo = this.createEndpointModal.getByText(/^No$/).first();
    this.apiURL = 'https://petstore3.swagger.io/api/v3/openapi.json';

    this.widgetIcon = page.getByAltText('Buerokratt logo');
    this.widget = this.widgetIcon;
    this.widgetDialog = page
      .locator('div[class*="_chatWrapper_"]', {
        has: page.locator('div[class*="_title_"]', { hasText: 'TEST' }),
      })
      .first();
    this.widgetInput = this.widgetDialog
      .getByPlaceholder('Enter input, separated by commas')
      .or(this.widgetDialog.locator('textarea, input[type="text"]').last())
      .first();
    this.widgetCloseButton = this.widgetDialog
      .locator('div[class*="_header_"] button')
      .last()
      .or(this.widgetDialog.locator('button:has(img[alt="Close"])').first());
    this.widgetSendButton = this.widgetDialog
      .locator('div[class*="_keypadContainer_"] button')
      .last()
      .or(this.widgetDialog.locator('button:has(img[alt="Send"])').first());
    this.widgetCloseImg = this.widgetDialog.getByAltText('Close');
    this.widgetSendImg = this.widgetDialog.getByAltText('Send');
    this.widgetMessages = this.widgetDialog.locator('div[class*="_chatContent_"], .os-viewport .os-content').first();
  }

  getNodePickerItem(label: string): Locator {
    const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const exactText = new RegExp(`^\\s*${escapedLabel}\\s*$`);

    return this.nodePickerDialog.locator('.box[role="button"], [role="button"]').filter({ hasText: exactText }).first();
  }

  async waitForReady(options: RouteReadyOptions = {}): Promise<void> {
    await waitForNewServiceReady(this.page, options);
  }

  getFlowNodeByTitle(titleText: string): Locator {
    return this.flowNodes.filter({ has: this.page.getByText(titleText, { exact: true }) }).first();
  }

  async waitForToast({ timeout = ACTION_TIMEOUT }: RouteReadyOptions = {}): Promise<void> {
    await expect(this.toastList.locator('li').first()).toBeVisible({ timeout });
  }

  async openSettings(): Promise<void> {
    await this.waitForReady();
    await this.serviceSettingsBtn.click();
    await expect(this.settingsDialog).toBeVisible();
  }

  async closeSettingsDialog(): Promise<void> {
    if (!(await this.settingsDialog.isVisible().catch(() => false))) {
      return;
    }

    const closeCandidates = [
      this.settingsDialog.locator('button.dialog__close').first(),
      this.settingsDialog.locator('button.popup__close').first(),
      this.settingsDialog.locator('button[aria-label="Close"]').first(),
      this.settingsDialog.locator('button[title="Close"]').first(),
      this.settingsDialog.locator('header button, .dialog__header button, .popup__header button').last(),
    ];

    for (const candidate of closeCandidates) {
      if (!(await candidate.count().catch(() => 0))) continue;
      if (!(await candidate.isVisible().catch(() => false))) continue;

      await candidate.scrollIntoViewIfNeeded().catch(() => {});
      await candidate.click({ force: true }).catch(() => {});

      if (await this.settingsDialog.isHidden().catch(() => false)) {
        return;
      }

      await this.page.waitForTimeout(200);
    }

    await this.page.keyboard.press('Escape').catch(() => {});
    if (await this.settingsDialog.isHidden().catch(() => false)) return;

    await this.page
      .locator('body')
      .click({ position: { x: 20, y: 20 } })
      .catch(() => {});
    await expect(this.settingsDialog).toBeHidden({ timeout: 5000 });
  }

  assertValidServiceTitle(title?: string): string {
    const normalizedTitle = normalizeServiceTitle(title);
    if (!normalizedTitle) {
      throw new Error('Service title is required but was not provided');
    }
    return normalizedTitle;
  }

  async resolveVisibleTitleInput(): Promise<Locator> {
    const candidates = [
      this.settingsDialog.getByLabel('Title :').first(),
      this.settingsDialog.locator('label:has-text("Title")').locator('xpath=following::input[1]').first(),
      this.settingsDialog.locator('input[placeholder*="Title"]').first(),
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

  async fillTitle(title: string): Promise<string> {
    const normalizedTitle = this.assertValidServiceTitle(title);
    await this.openSettings();
    const titleInput = await this.resolveVisibleTitleInput();
    await expect(titleInput).toBeVisible();
    await titleInput.click({ force: true });
    await titleInput.fill('');
    await titleInput.pressSequentially(normalizedTitle, { delay: 20 });
    const currentValue = await titleInput.inputValue().catch(() => '');

    if (currentValue !== normalizedTitle) {
      await titleInput.evaluate((input: HTMLInputElement, value: string) => {
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

  async setTitle(title: string): Promise<string> {
    const normalizedTitle = await this.fillTitle(title);
    await this.closeSettingsDialog();
    return normalizedTitle;
  }

  async saveService(options: SaveServiceOptions = {}): Promise<void> {
    const { expectedToast = /saved/i } = options;
    await this.waitForReady();
    await expect(this.saveServiceBtn).toBeVisible();

    const wasUnsavedDraft = /services\/newService/i.test(this.page.url());

    // Clicked once on purpose. The button posts a service, so a blind retry could
    // create a second one whenever the first save landed but its toast was slow.
    const savePosted = wasUnsavedDraft
      ? this.page
          .waitForRequest((request) => request.method() === 'POST' && /\/services\/services\/add/.test(request.url()), {
            timeout: 2000,
          })
          .then(
            () => true,
            () => false,
          )
      : Promise.resolve(false);

    await this.saveServiceBtn.click({ force: true });

    await expect(this.toastList, `Saving the service showed no toast matching ${expectedToast}`).toContainText(
      expectedToast,
      { timeout: ACTION_TIMEOUT },
    );

    if (await savePosted) {
      await expect(this.page, 'The saved draft never opened as an editable service').toHaveURL(/services\/edit\//i, {
        timeout: ACTION_TIMEOUT,
      });
    }
  }

  async confirmService(options: SaveServiceOptions = {}): Promise<void> {
    const { expectedToast = /saved|confirm|ready/i } = options;
    await this.waitForReady();
    await expect(this.confirmServiceBtn).toBeVisible();

    await this.confirmServiceBtn.click({ force: true });

    await expect(this.toastList, `Confirming the service showed no toast matching ${expectedToast}`).toContainText(
      expectedToast,
      { timeout: ACTION_TIMEOUT },
    );
  }

  async returnToServicesOverview(): Promise<void> {
    if (/services\/overview/i.test(this.page.url())) {
      await this.page.waitForLoadState('domcontentloaded');
      return;
    }

    await this.waitForReady();
    await expect(this.backToServicesBtn).toBeVisible();
    await this.backToServicesBtn.click({ force: true });

    const navigated = await this.page
      .waitForURL(/services\/overview/i, { timeout: 10000 })
      .then(() => true)
      .catch(() => false);

    if (!navigated) {
      await this.page.goto('services/overview');
      await expect(this.page).toHaveURL(/services\/overview/i, { timeout: ACTION_TIMEOUT });
    }

    await this.page.waitForLoadState('domcontentloaded');
  }

  async createService(serviceData: ServiceInput = {}): Promise<Partial<ServiceData> & { title: string }> {
    const normalizedServiceData: Partial<ServiceData> =
      typeof serviceData === 'string' ? { title: serviceData } : { ...serviceData };
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

  async createNewService(nameOrData: ServiceInput): Promise<void> {
    await this.createService(nameOrData);
    await this.returnToServicesOverview();
  }

  async clickAddNodeAtEdgeIndex(index = 0): Promise<void> {
    await this.waitForReady();
    await expect(async () => {
      await this.edgeAddButtons.nth(index).click({ timeout: 2000 });
      await expect(this.nodePickerDialog).toBeVisible({ timeout: 2000 });
    }).toPass({ timeout: ACTION_TIMEOUT });
  }

  async clickAddNode(): Promise<void> {
    await this.waitForReady();
    const btn = this.edgeAddButtons.filter({ hasText: '+' }).first();
    await expect(btn).toBeVisible();
    await btn.scrollIntoViewIfNeeded().catch(() => {});
    await btn.click({ force: true });
    await expect(this.nodePickerDialog).toBeVisible({ timeout: 10000 });
  }

  async clickAddNodeOnLastEdge(): Promise<void> {
    await this.waitForReady();
    const btn = this.edgeAddButtons.filter({ hasText: '+' }).last();
    await expect(btn).toBeVisible();
    await btn.scrollIntoViewIfNeeded().catch(() => {});
    await btn.click({ force: true });
    await expect(this.nodePickerDialog).toBeVisible({ timeout: 10000 });
  }

  async assertNodePickerVisible(): Promise<void> {
    await expect(this.nodePickerDialog).toBeVisible({ timeout: 10000 });
  }

  async pickNodeTypeAndReturnToCanvas(nodeTypeBtn: Locator): Promise<void> {
    await this.assertNodePickerVisible();
    await expect(nodeTypeBtn).toBeVisible();
    await nodeTypeBtn.scrollIntoViewIfNeeded().catch(() => {});
    await nodeTypeBtn.click({ force: true });
    await expect(this.nodePickerDialog).toBeHidden();
    await expect(this.canvas).toBeVisible();
  }

  async openNodeDialogByTitle(titleText: string): Promise<void> {
    const node = this.getFlowNodeByTitle(titleText);
    await expect(node).toBeVisible();
    await isEventuallyVisible(node.locator('button').first(), ACTION_TIMEOUT);

    const buttonCandidates = [
      node.getByRole('button', { name: /edit/i }).first(),
      node.locator('button[title*="Edit"], button[aria-label*="Edit"]').first(),
      node
        .locator('button')
        .filter({ hasNotText: /delete/i })
        .first(),
      node.locator('button').first(),
    ];

    for (const candidate of buttonCandidates) {
      if (!(await candidate.count().catch(() => 0))) continue;
      if (!(await candidate.isVisible().catch(() => false))) continue;
      await candidate.scrollIntoViewIfNeeded().catch(() => {});
      await candidate.click({ force: true }).catch(() => {});
      if (await this.nodeEditorPopup.isVisible().catch(() => false)) {
        await expect(this.nodeEditorTitle).toBeVisible();
        await expect(this.nodeEditorSaveBtn).toBeVisible();
        return;
      }
      await this.page.waitForTimeout(250);
    }

    await node.dblclick({ force: true }).catch(() => {});
    await expect(this.nodeEditorPopup).toBeVisible({ timeout: 5000 });
    await expect(this.nodeEditorTitle).toBeVisible();
    await expect(this.nodeEditorSaveBtn).toBeVisible();
  }

  async editNode(titleText: string): Promise<void> {
    await this.openNodeDialogByTitle(titleText);
  }

  nodeDeleteButton(titleText: string): Locator {
    return this.getFlowNodeByTitle(titleText).locator('button').nth(1);
  }

  async deleteNodeByTitle(titleText: string): Promise<void> {
    await expect(this.getFlowNodeByTitle(titleText)).toBeVisible();
    await this.nodeDeleteButton(titleText).click();
    await expect(this.getFlowNodeByTitle(titleText)).toHaveCount(0);
  }

  async assertNodeEditorVisible(): Promise<void> {
    await expect(this.nodeEditorPopup).toBeVisible();
    await expect(this.nodeEditorTitle).toBeVisible();
  }

  async assertNodeEditorButtonsVisible(): Promise<void> {
    await this.assertNodeEditorVisible();
    await expect(this.nodeEditorCancelBtn).toBeVisible();
    await expect(this.nodeEditorSaveBtn).toBeVisible();
    await expect(this.nodeEditorCloseBtn).toBeVisible();
  }

  async assertTabsVisible(): Promise<void> {
    await this.assertNodeEditorVisible();
    await expect(this.nodeEditorTabs).toBeVisible();
    await expect(this.nodeEditorTabSetup).toBeVisible();
  }

  async assertMessageDialogVisible(): Promise<void> {
    await this.assertNodeEditorVisible();
    await expect(this.nodeEditorTitle).toContainText(/Send message to client/i);
  }

  async assertDefineDialogVisible(): Promise<void> {
    await this.assertNodeEditorVisible();
    await expect(this.nodeEditorTitle).toContainText(/Assign/i);
  }

  async assertDynamicChoicesDialogVisible(): Promise<void> {
    await this.assertNodeEditorVisible();
    await expect(this.nodeEditorTitle).toContainText(/Dynamic Choices/i);
  }

  async assertDefineTabsVisible(): Promise<void> {
    await expect(this.defineTabSetup).toBeVisible();
  }

  async assertDefineFooterButtonsVisible(): Promise<void> {
    await expect(this.defineCancel).toBeVisible();
    await expect(this.defineSave).toBeVisible();
    await expect(this.defineClose).toBeVisible();
  }

  async assertDynamicChoiceFields(): Promise<void> {
    await expect(this.dynamicChoicesRows.first()).toBeVisible();
    await expect(this.dynamicChoicesKeyInputs.first()).toBeVisible();
    await expect(this.dynamicChoicesValueInputs.first()).toBeVisible();
  }

  getDefineRow(rowIndex: number): Locator {
    const explicitRows = this.defineRows;
    return explicitRows.nth(rowIndex);
  }

  getAssignNameInput(row: Locator): Locator {
    return row.locator('input[name="key"]').first();
  }

  getAssignValueInput(row: Locator): Locator {
    return row.locator('input[name="value"]').first();
  }

  getAssignValueModeToggle(row: Locator): Locator {
    return row.locator('.small-assign-button.assign-blue').first();
  }

  async switchAssignRowToLiteralValue(row: Locator): Promise<void> {
    await this.getAssignValueModeToggle(row).click();
    await expect(this.getAssignValueInput(row)).toBeEditable();
  }

  async robustFillInput(input: Locator, value: string): Promise<void> {
    const normalizedValue = String(value);
    await expect(input).toBeEditable();

    for (let attempt = 0; attempt < 3; attempt += 1) {
      await input.click();
      await input.fill(normalizedValue);

      if ((await input.inputValue()) === normalizedValue) {
        break;
      }
    }

    await expect(input).toHaveValue(normalizedValue, { timeout: 10000 });
  }

  async assignSetVariableAndSave(name: string, value: string): Promise<void> {
    await this.assertDefineDialogVisible();
    await expect(this.defineAddElementBtn).toBeVisible();

    const rowsBefore = await this.defineRows.count();
    await this.defineAddElementBtn.scrollIntoViewIfNeeded();
    await this.defineAddElementBtn.click();
    await expect(this.defineRows).toHaveCount(rowsBefore + 1);

    const row = this.getDefineRow(rowsBefore);
    await expect(row).toBeVisible();

    await this.robustFillInput(this.getAssignNameInput(row), name);
    await this.switchAssignRowToLiteralValue(row);
    await this.robustFillInput(this.getAssignValueInput(row), value);

    await this.defineSave.click();
    await expect(this.nodeEditorPopup).toBeHidden({ timeout: ACTION_TIMEOUT });
  }

  persistedAssignValue(value: string): string {
    return `\${"${value}"}`;
  }

  async assertAssignVariableRow(rowIndex: number, name: string, value: string): Promise<void> {
    const row = this.getDefineRow(rowIndex);
    await expect(row).toBeVisible();

    await expect(this.getAssignNameInput(row)).toHaveValue(name);
    await expect(this.getAssignValueInput(row)).toHaveValue(this.persistedAssignValue(value));
  }

  async closeNodeDialogWithoutSaving(): Promise<void> {
    await this.defineCancel.click();
    await expect(this.nodeEditorPopup).toBeHidden({ timeout: ACTION_TIMEOUT });
  }

  async messageSetTextAndSave(text: string): Promise<void> {
    await this.assertMessageDialogVisible();
    await expect(this.quillEditor).toBeVisible();
    await this.quillEditor.click();
    await this.quillEditor.fill(String(text));
    await expect(this.quillEditor).toContainText(String(text), { timeout: 10000 });
    await this.messageSave.click();
    await expect(this.nodeEditorPopup).toBeHidden({ timeout: ACTION_TIMEOUT });
    await expect(this.canvas).toBeVisible();
  }

  async addMessage(text: string): Promise<void> {
    await this.messageSetTextAndSave(text);
  }

  async messageClearTextAndSave(): Promise<void> {
    await this.assertMessageDialogVisible();
    await expect(this.quillEditor).toBeVisible();
    await this.quillEditor.click();
    await this.quillEditor.fill('');
    await expect(this.quillEditor).toHaveText('', { timeout: 10000 });
    await this.messageSave.click();
    await expect(this.nodeEditorPopup).toBeHidden({ timeout: ACTION_TIMEOUT });
    await expect(this.canvas).toBeVisible();
  }

  async multichoiceSetQuestionAndRenameOption(question: string, optionIndex: number, newLabel: string): Promise<void> {
    await expect(this.nodeEditorTitle).toContainText('Multi-choice question');

    await expect(this.quillEditor).toBeVisible();
    await this.quillEditor.click();
    await this.quillEditor.fill(String(question));
    await expect(this.quillEditor).toContainText(String(question), { timeout: 10000 });

    const previewButton = this.nodeEditorPopup.locator('.multiple-choice-question-button').nth(optionIndex);
    const previewRow = previewButton.locator('xpath=ancestor::div[contains(@class,"track")][1]');
    await previewRow.getByRole('button', { name: 'Edit', exact: true }).click();

    const labelInput = this.nodeEditorPopup.locator(`input[name="button-title-${optionIndex}"]`);
    await expect(labelInput).toBeEditable();
    await labelInput.fill(newLabel);
    await expect(labelInput).toHaveValue(newLabel);

    const editRow = labelInput.locator('xpath=ancestor::div[contains(@class,"track")][1]');
    await editRow.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(
      this.nodeEditorPopup.locator('.multiple-choice-question-button__text', { hasText: newLabel }),
    ).toBeVisible();

    await this.nodeEditorSaveBtn.click();
    await expect(this.nodeEditorPopup).toBeHidden({ timeout: ACTION_TIMEOUT });
    await expect(this.canvas).toBeVisible();
  }

  async assertSectionHasButtons(sectionLocator: Locator): Promise<void> {
    const items = sectionLocator.locator('button,[draggable="true"],.chip,.badge,.tag');
    await expect(items.first()).toBeVisible();
  }

  async conditionAddLiteralRule(leftValue: string, operator: string, rightValue: string): Promise<void> {
    await this.conditionAddRuleButton.click();

    const bluePencils = this.conditionDialog.locator('.small-assign-button.assign-blue');
    await bluePencils.first().click();
    await bluePencils.first().click();

    const leftInput = this.conditionDialog.locator('input[name="field"]');
    const rightInput = this.conditionDialog.locator('input[name="value"]');

    await leftInput.fill(leftValue);
    await expect(leftInput).toHaveValue(leftValue);
    await rightInput.fill(rightValue);
    await expect(rightInput).toHaveValue(rightValue);

    await this.conditionDialog.locator('[name="operator"]').click();
    await this.conditionDialog.getByRole('option', { name: operator, exact: true }).click();
  }

  async conditionSaveNode(): Promise<void> {
    await this.conditionSave.click();
    await expect(this.conditionDialog).toBeHidden({ timeout: ACTION_TIMEOUT });
    await expect(this.canvas).toBeVisible();
  }

  async addMessageOnConditionBranch(
    branchLabel: 'Success' | 'Failure',
    expectedNodeTitle: string,
    text: string,
  ): Promise<void> {
    await this.canvas.getByRole('button', { name: branchLabel, exact: true }).click();
    await this.pickNodeTypeAndReturnToCanvas(this.pickerMessageBtn);
    await expect(this.getFlowNodeByTitle(expectedNodeTitle)).toBeVisible();

    await this.openNodeDialogByTitle(expectedNodeTitle);
    await this.messageSetTextAndSave(text);
  }

  getDynamicChoiceValueInputByKey(key: string): Locator {
    return this.nodeEditorPopup
      .locator('._assignElement_umtte_1')
      .filter({ has: this.page.locator(`input[name="key"][value="${key}"]`) })
      .locator('input[name="value"]');
  }

  async dynamicChoicesSetValuesAndSave(values: Record<string, string>): Promise<void> {
    for (const [key, value] of Object.entries(values)) {
      const input = this.getDynamicChoiceValueInputByKey(key);
      await input.fill(value);
      await expect(input).toHaveValue(value);
    }

    await this.dynamicChoicesSave.click();
    await expect(this.nodeEditorPopup).toBeHidden({ timeout: ACTION_TIMEOUT });
    await expect(this.canvas).toBeVisible();
  }

  async assertDynamicChoicesValues(values: Record<string, string>): Promise<void> {
    for (const [key, value] of Object.entries(values)) {
      await expect(this.getDynamicChoiceValueInputByKey(key)).toHaveValue(value);
    }
  }

  async openCreateEndpointFromPicker(): Promise<void> {
    await this.assertNodePickerVisible();

    const addApiButtonCandidates = [
      this.nodePickerDialog.locator('.collapsible__trigger > button').last(),
      this.nodePickerDialog
        .locator(
          'xpath=.//*[contains(normalize-space(),"API elements")]/ancestor::*[self::div or self::section][1]//button[last()]',
        )
        .first(),
      this.pickerAddApiBtn,
    ];

    let clicked = false;
    for (const candidate of addApiButtonCandidates) {
      if (!(await candidate.count().catch(() => 0))) continue;
      if (!(await candidate.isVisible().catch(() => false))) continue;
      await candidate.click({ force: true }).catch(() => {});
      clicked = await this.createEndpointModal
        .waitFor({ state: 'visible', timeout: 3000 })
        .then(() => true)
        .catch(() => false);
      if (clicked) break;
    }

    if (!clicked) {
      throw new Error('Could not open the create endpoint modal from the node picker');
    }

    await expect(this.createEndpointModal).toBeVisible();
  }

  async addNewAPI(): Promise<void> {
    await this.clickAddNodeAtEdgeIndex(0);
    await this.openCreateEndpointFromPicker();
  }

  async openCreateEndpointFromRegistry(): Promise<void> {
    const createBtn = this.page.getByRole('button', { name: 'Create endpoint', exact: true }).first();
    await expect(createBtn).toBeVisible({ timeout: ACTION_TIMEOUT });
    await createBtn.scrollIntoViewIfNeeded().catch(() => {});
    await createBtn.click({ force: true });
    await expect(this.createEndpointModal).toBeVisible({ timeout: 10000 });
  }

  async assertCreateEndpointModalVisible(): Promise<void> {
    await expect(this.createEndpointModal).toBeVisible();
  }

  async selectServiceType(label: string): Promise<void> {
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
    await expect(this.createEndpointCreate).toBeVisible();
  }

  async setEndpointName(value: string): Promise<void> {
    await expect(this.createEndpointName).toBeVisible();
    await this.robustFillInput(this.createEndpointName, value);
  }

  async setEndpointUrl(value: string): Promise<void> {
    await expect(this.createEndpointUrl).toBeVisible();
    await this.robustFillInput(this.createEndpointUrl, value);
  }

  get createEndpointEndpointsCombo(): Locator {
    return this.createEndpointModal.locator('[role="combobox"][name="select-endpoint"]');
  }

  async fetchEndpointsFromUrl(url: string): Promise<string[]> {
    await this.robustFillInput(this.createEndpointUrl, url);
    await this.createEndpointFetchEndpoints.click();

    await expect(async () => {
      await this.createEndpointEndpointsCombo.click({ force: true });
      await expect(this.page.locator('li[role="option"]').first()).toBeVisible({ timeout: 5000 });
    }).toPass({ timeout: 60000 });

    return this.page.locator('li[role="option"]').allInnerTexts();
  }

  async selectFetchedEndpoint(label: string): Promise<void> {
    if (
      !(await this.page
        .locator('li[role="option"]')
        .first()
        .isVisible()
        .catch(() => false))
    ) {
      await this.createEndpointEndpointsCombo.click({ force: true });
      await expect(this.page.locator('li[role="option"]').first()).toBeVisible({ timeout: 10000 });
    }

    await this.page.getByRole('option', { name: label, exact: true }).first().click();
    await expect(this.createEndpointEndpointsCombo).toContainText(label);
  }

  async createEndpoint(): Promise<void> {
    await expect(this.createEndpointCreate).toBeVisible();
    await expect(this.createEndpointCreate).toBeEnabled();
    await this.createEndpointCreate.click();

    await this.waitForToast({ timeout: ACTION_TIMEOUT });
    await expect(this.toastList).toContainText(/created|saved|success|endpoint/i);

    await Promise.race([
      this.createEndpointModal.waitFor({ state: 'hidden', timeout: ACTION_TIMEOUT }).catch(() => null),
      this.toastList
        .locator('li')
        .first()
        .waitFor({ state: 'visible', timeout: ACTION_TIMEOUT })
        .catch(() => null),
    ]);

    if (await this.createEndpointModal.isVisible().catch(() => false)) {
      const closeCandidates = [
        this.createEndpointModal.locator('button.popup__close, button.dialog__close').first(),
        this.createEndpointModal.getByRole('button', { name: /close/i }).first(),
        this.createEndpointCancel,
      ];

      for (const candidate of closeCandidates) {
        if (!(await candidate.count().catch(() => 0))) continue;
        if (!(await candidate.isVisible().catch(() => false))) continue;

        await candidate.click({ force: true }).catch(() => {});
        if (await this.createEndpointModal.isHidden().catch(() => false)) break;
      }
    }
  }

  async openWidget(): Promise<void> {
    await expect(this.widgetIcon).toBeVisible();

    for (let attempt = 0; attempt < 2; attempt++) {
      await this.widgetIcon.click({ force: true }).catch(() => {});
      const opened = await this.widgetDialog
        .waitFor({ state: 'visible', timeout: 6000 })
        .then(() => true)
        .catch(() => false);

      if (opened) break;
    }

    await expect(this.widgetDialog).toBeVisible({ timeout: ACTION_TIMEOUT });
    await expect(this.widgetInput).toBeVisible({ timeout: ACTION_TIMEOUT });
  }

  async widgetSendText(text: string): Promise<void> {
    await expect(this.widgetInput).toBeVisible();
    await this.widgetInput.fill(String(text));
    await this.widgetSendButton.click();
  }

  async expectWidgetToContainText(text: string | RegExp): Promise<void> {
    await expect(this.widgetMessages).toContainText(text);
  }

  async expectWidgetNotToContainText(text: string | RegExp): Promise<void> {
    await expect(this.widgetMessages).not.toContainText(text);
  }

  async assertHeaderElementVisible(): Promise<void> {
    await expect(this.backToServicesBtn).toBeVisible();
    await expect(this.stepName).toBeVisible();
    await expect(this.deleteServiceBtn).toBeVisible();
    await expect(this.saveServiceBtn).toBeVisible();
    await expect(this.confirmServiceBtn).toBeVisible();
  }

  async assertServiceDetailsFieldsVisible(): Promise<void> {
    await this.openSettings();
    await expect(this.serviceTitleInput).toBeVisible();
    await expect(this.serviceDescriptionInput).toBeVisible();
    await this.closeSettingsDialog();
  }

  async assertCanvasVisible(): Promise<void> {
    await expect(this.canvas).toBeVisible();
  }

  async assertCanvasElementsVisible(): Promise<void> {
    await expect(this.importBtn).toBeVisible();
    await expect(this.exportBtn).toBeVisible();
    await expect(this.startNode).toBeVisible();
    await expect(this.edgeAddButtons.first()).toBeVisible();
  }

  async assertZoomButtonsVisible(): Promise<void> {
    await expect(this.zoomOutBtn).toBeVisible();
    await expect(this.zoomInBtn).toBeVisible();
    await expect(this.fitViewBtn).toBeVisible();
  }

  async assertConditionDialogVisible(): Promise<void> {
    await expect(this.conditionDialog).toBeVisible();
    await expect(this.conditionTitle).toBeVisible();
    await expect(this.conditionTabSetup).toBeVisible();
    await expect(this.conditionSave).toBeVisible();
    await expect(this.conditionCancel).toBeVisible();
    await expect(this.conditionClose).toBeVisible();
  }

  async assertConditionButtonsVisibleInDialog(): Promise<void> {
    await expect(this.conditionChipAnd).toBeVisible();
    await expect(this.conditionChipOr).toBeVisible();
    await expect(this.conditionChipNot).toBeVisible();
    await expect(this.conditionAddRuleButton).toBeVisible();
    await expect(this.conditionAddGroupButton).toBeVisible();
  }

  async addNodes(): Promise<void> {
    await this.clickAddNodeAtEdgeIndex(0);
    await this.pickNodeTypeAndReturnToCanvas(this.pickerMessageBtn);
  }
}
