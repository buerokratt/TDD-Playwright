import { APIResponse, Locator, Page, Response, expect, test } from '@playwright/test';

import { CopyToDomainModal } from '@page-objects/common';
import {
  ACTION_TIMEOUT,
  CSA_ACTIVITY_URL,
  CSA_AVAILABLE_ALL_TIME,
  MON_FRI,
  MON_SUN,
  ORGANIZATION_WORKING_TIME_URL,
  WIDGET_DATA_URL,
} from '@utils/constants';
import { URLS } from '@utils/env';
import {
  CsaActivity,
  RouteReadyOptions,
  WidgetData,
  WorkingTimeDomainSnapshot,
  WorkingTimeFormSettings,
  WorkingTimeSettings,
} from '@utils/interfaces';
import { waitForOfficeOpeningHoursReady } from '@utils/waits';

export class OfficeOpeningHoursPage {
  private readonly page: Page;

  private readonly headingOrganizationWorkingTime: Locator;
  private readonly textDescription: Locator;

  private readonly domainTabs: Locator;
  private readonly domainTabActive: Locator;
  private readonly buttonCopyToDomain: Locator;
  private readonly copyToDomain: CopyToDomainModal;

  private readonly switchUseCustomerService: Locator;
  private readonly switchWorkingAllTime: Locator;
  private readonly switchAvailableOnNationalHolidays: Locator;
  private readonly switchClosedOnWeekends: Locator;
  private readonly switchSameOnAllWorkingDays: Locator;
  private readonly switchesDayOpenClosed: Locator;
  private readonly switchesDayOpen: Locator;
  private readonly switchOutsideOfficeHoursContactForm: Locator;
  private readonly switchCsaAbsenceContactForm: Locator;

  private readonly inputsFromUntilTime: Locator;

  private readonly textareaOutsideWorkingHoursMessage: Locator;
  private readonly textareaAbsenceOfCsaMessage: Locator;
  private readonly textareaRedirectIfBotCannotAnswerMessage: Locator;
  private readonly textareaBotCannotAnswerMessage: Locator;

  private readonly buttonSave: Locator;
  private readonly toastItems: Locator;

  constructor(page: Page) {
    this.page = page;

    this.headingOrganizationWorkingTime = this.page.getByRole('heading', {
      name: 'Organization working time',
      exact: true,
    });
    this.textDescription = this.page.getByText(
      "After the end of the working hours, if the chatbot cannot answer the customer's questions by itself, it will ask for the customer's contact details.",
      { exact: true },
    );

    this.domainTabs = this.page.locator('main .domain-tab-selector__tab');
    this.domainTabActive = this.page.locator('main .domain-tab-selector__tab--active');
    this.buttonCopyToDomain = this.page.locator('main').getByRole('button', { name: 'Copy to domain' });
    this.copyToDomain = new CopyToDomainModal(this.page, {
      button: this.buttonCopyToDomain,
      transferPath: 'configs/transfer/organization-working-time',
    });

    this.switchUseCustomerService = this.page.getByRole('switch', { name: 'Use customer service', exact: true });
    this.switchWorkingAllTime = this.page.getByRole('switch', { name: 'Working hours are 24/7', exact: true });
    this.switchAvailableOnNationalHolidays = this.page.getByRole('switch', {
      name: 'Available on national holidays',
      exact: true,
    });
    this.switchClosedOnWeekends = this.page.getByRole('switch', { name: 'Closed on weekends', exact: true });
    this.switchSameOnAllWorkingDays = this.page.getByRole('switch', {
      name: 'The same on all working days',
      exact: true,
    });
    this.switchesDayOpenClosed = this.page.getByRole('switch', { name: 'Open Closed', exact: true });
    this.switchesDayOpen = this.page.getByRole('switch', { name: 'Open Closed', exact: true, checked: true });
    this.switchOutsideOfficeHoursContactForm = this.page.getByRole('switch', {
      name: 'Send a notification of outside office hours to the client. Will we ask the clients contact information?',
      exact: true,
    });
    this.switchCsaAbsenceContactForm = this.page.getByRole('switch', {
      name: 'Send a notification of absence to the client. Will we ask the clients contact information?',
      exact: true,
    });

    this.inputsFromUntilTime = this.page.locator('main .react-datepicker__input-container input');

    this.textareaOutsideWorkingHoursMessage = this.page.getByLabel('Outside working hours message', { exact: true });
    this.textareaAbsenceOfCsaMessage = this.page.getByLabel(
      'Notification of the absence of a customer service representative',
      { exact: true },
    );
    this.textareaRedirectIfBotCannotAnswerMessage = this.page.getByLabel(
      'Notification before redirecting, if Bürokratt cannot answer',
      {
        exact: true,
      },
    );
    this.textareaBotCannotAnswerMessage = this.page.getByLabel('Notification if Bürokratt cannot answer', {
      exact: true,
    });

    this.buttonSave = this.page.locator('main').getByRole('button', { name: 'Save', exact: true });
    this.toastItems = this.page.locator('ol.toast__list li');
  }

  async waitForReady(options: RouteReadyOptions = {}): Promise<void> {
    await waitForOfficeOpeningHoursReady(this.page, options);
  }

  async open(): Promise<void> {
    const settingsLoaded = this.settingsLoaded();

    await this.page.goto(URLS.admin + 'chat/working-time');
    await this.waitForReady();
    await settingsLoaded;
  }

  async assertPageIsShown(): Promise<void> {
    await expect(this.headingOrganizationWorkingTime, 'Office opening hours never rendered its heading').toBeVisible();
    await expect(
      this.textDescription,
      'The page never explained what happens after the working hours end',
    ).toBeVisible();
    await expect(this.buttonSave, 'The page offers no way to save the opening hours').toBeVisible();
  }

  async assertDomainTabsAreShown({ timeout = ACTION_TIMEOUT }: RouteReadyOptions = {}): Promise<void> {
    await expect(this.domainTabs.first(), 'The page rendered no domain tab').toBeVisible({ timeout });
    await expect(this.domainTabActive, 'The domain tabs left no domain selected').toHaveCount(1);
  }

  async assertCopyToDomainIsOffered(): Promise<void> {
    await this.copyToDomain.assertIsOffered();
  }

  async assertScheduleTogglesAreShown(): Promise<void> {
    await this.assertToggleIsShown(this.switchUseCustomerService, '"Use customer service" toggle');
    await this.setSwitch(this.switchUseCustomerService, true);
    await this.assertToggleIsShown(this.switchWorkingAllTime, '"Working hours are 24/7" toggle');

    await this.setSwitch(this.switchWorkingAllTime, false);
    await this.assertToggleIsShown(this.switchAvailableOnNationalHolidays, '"Available on national holidays" toggle');
    await this.assertToggleIsShown(this.switchClosedOnWeekends, '"Closed on weekends" toggle');
    await this.assertToggleIsShown(this.switchSameOnAllWorkingDays, '"The same on all working days" toggle');
  }

  async assertCommonHoursFollowWeekends(): Promise<void> {
    await this.showSchedule({ sameOnAllWorkingDays: true });

    await this.setSwitch(this.switchClosedOnWeekends, true);
    await this.assertCommonHoursAreShown('M-F');

    await this.setSwitch(this.switchClosedOnWeekends, false);
    await this.assertCommonHoursAreShown('M-S');
  }

  async assertDailyHoursFollowWeekends(): Promise<void> {
    await this.showSchedule({ sameOnAllWorkingDays: false });

    await this.setSwitch(this.switchClosedOnWeekends, true);
    await this.assertDailyHoursAreShown(MON_FRI);

    await this.setSwitch(this.switchClosedOnWeekends, false);
    await this.assertDailyHoursAreShown(MON_SUN);
  }

  async assertOutsideWorkingHoursFieldsAreShown(): Promise<void> {
    await this.setSwitch(this.switchUseCustomerService, true);
    await this.setSwitch(this.switchWorkingAllTime, false);

    await this.assertToggleIsShown(
      this.switchOutsideOfficeHoursContactForm,
      'outside office hours notification toggle',
    );
    await this.assertMessageFieldIsShown(this.textareaOutsideWorkingHoursMessage, 'outside working hours message');
  }

  async assertCsaFieldsAreShown(): Promise<void> {
    await this.setSwitch(this.switchUseCustomerService, true);

    await this.assertToggleIsShown(this.switchCsaAbsenceContactForm, 'absence notification toggle');
    await this.assertMessageFieldIsShown(this.textareaAbsenceOfCsaMessage, 'absence notification');
    await this.assertMessageFieldIsShown(
      this.textareaRedirectIfBotCannotAnswerMessage,
      'notification before redirecting',
    );
  }

  async assertBotCannotAnswerFieldIsShown(): Promise<void> {
    await this.setSwitch(this.switchUseCustomerService, false);

    await this.assertMessageFieldIsShown(this.textareaBotCannotAnswerMessage, '"Bürokratt cannot answer" notification');
    await expect(
      this.textareaRedirectIfBotCannotAnswerMessage,
      'The notification before redirecting stayed on the page with customer service switched off',
    ).toBeHidden();
  }

  async domainNamesBesidesSuiteWidget(): Promise<string[]> {
    return (await this.widgets()).filter((widget) => widget.url !== URLS.customer).map((widget) => widget.name);
  }

  async selectDomain(domain: string, { timeout = ACTION_TIMEOUT }: RouteReadyOptions = {}): Promise<void> {
    const tab = this.domainTab(domain);

    await expect(tab, `The opening hours are offered for no domain named "${domain}"`).toBeVisible({ timeout });

    if (((await tab.getAttribute('class')) ?? '').includes('domain-tab-selector__tab--active')) {
      return;
    }

    const domainId = await this.domainId(domain);
    const settingsLoaded = this.settingsLoaded(domainId, { timeout });

    await tab.click();
    await expect(tab, `The domain tabs never moved to "${domain}"`).toHaveClass(/domain-tab-selector__tab--active/);
    await settingsLoaded;
    await expect(this.switchUseCustomerService, `"${domain}" never rendered its opening hours`).toBeVisible({
      timeout,
    });
  }

  async saveSettings(): Promise<void> {
    await this.markShownToasts();
    await this.buttonSave.click();
  }

  async copySettingsTo(domain: string): Promise<void> {
    await this.markShownToasts();
    await this.copyToDomain.copyTo(domain);
  }

  async readSettings(): Promise<WorkingTimeFormSettings> {
    await this.setSwitch(this.switchUseCustomerService, true);

    return {
      workingAllTime: await this.isSwitchOn(this.switchWorkingAllTime),
      noCsaAvailableMessage: await this.textareaAbsenceOfCsaMessage.inputValue(),
    };
  }

  async applySettings(settings: WorkingTimeFormSettings): Promise<void> {
    await this.setSwitch(this.switchUseCustomerService, true);
    await this.setSwitch(this.switchWorkingAllTime, settings.workingAllTime);
    await this.fillAbsenceMessage(settings.noCsaAvailableMessage);
  }

  async assertSettingsStored(expected: WorkingTimeFormSettings): Promise<void> {
    await expect(async () => {
      expect(await this.readSettings(), 'The page came back holding settings other than the ones saved').toEqual(
        expected,
      );
    }).toPass({ timeout: ACTION_TIMEOUT });
  }

  async assertSaveWasConfirmed({ timeout = ACTION_TIMEOUT }: RouteReadyOptions = {}): Promise<void> {
    await expect(
      this.newToast('Updated Successfully'),
      'Updating the opening hours raised no new notification',
    ).toBeVisible({ timeout });
  }

  private async settingsLoaded(
    domainId?: string,
    { timeout = ACTION_TIMEOUT }: RouteReadyOptions = {},
  ): Promise<Response> {
    const response = await this.page.waitForResponse(
      (response) =>
        response.url().startsWith(ORGANIZATION_WORKING_TIME_URL) &&
        (!domainId || new URL(response.url()).searchParams.get('domain') === domainId) &&
        response.request().method() === 'GET',
      { timeout },
    );

    expect(response.ok(), `The opening hours never loaded (${response.status()})`).toBeTruthy();

    return response;
  }

  private async markShownToasts(): Promise<void> {
    await this.toastItems.evaluateAll((toasts) => toasts.forEach((toast) => toast.setAttribute('data-seen', '')));
  }

  private newToast(text: string): Locator {
    return this.toastItems.and(this.page.locator(':not([data-seen])')).filter({ hasText: text }).first();
  }

  async withSettingsRestoredForDomains(domains: string[], body: () => Promise<void>): Promise<void> {
    const settingsBefore: Record<string, WorkingTimeDomainSnapshot> = {};

    for (const domain of domains) {
      const domainId = await this.domainId(domain);
      settingsBefore[domain] = { domainId, settings: await this.settingsFor(domainId) };
    }

    try {
      await body();
    } catch (error) {
      await this.restoreSettingsForDomains(settingsBefore);
      throw error;
    }

    expect(
      await this.restoreSettingsForDomains(settingsBefore),
      'The opening hours could not be put back on every domain',
    ).toEqual([]);
  }

  private async settings(): Promise<WorkingTimeSettings> {
    return this.settingsFor(await this.widgetId());
  }

  async noCsaAvailableMessage(): Promise<string> {
    return this.notice('organizationNoCsaAvailableMessage', 'for the case where no operator is available');
  }

  async botCannotAnswerMessage(): Promise<string> {
    return this.notice('organizationBotCannotAnswerMessage', 'for the case where the bot cannot answer');
  }

  async redirectIfBotCannotAnswerMessage(): Promise<string> {
    return this.notice('organizationRedirectIfBotCannotAnswerMessage', 'for redirecting the chat to an operator');
  }

  async outsideWorkingHoursMessage(): Promise<string> {
    return this.notice('organizationOutsideWorkingHoursMessage', 'for the hours the office is closed');
  }

  private async notice(setting: keyof WorkingTimeSettings, describedAs: string): Promise<string> {
    const notice = (await this.settings())[setting];

    expect(notice, `The back office holds no notice ${describedAs}`).toBeTruthy();

    return notice;
  }

  async enableCsaAllTime(): Promise<void> {
    await this.write(CSA_AVAILABLE_ALL_TIME);
  }

  async whileSettingsAre(changes: Partial<WorkingTimeSettings>, body: () => Promise<void>): Promise<void> {
    const settingsBefore = await this.settings();

    try {
      await this.write(changes);
      await body();
    } catch (error) {
      await this.write(settingsBefore).catch((restoreError: unknown) => {
        test.info().annotations.push({
          type: 'opening hours settings left changed',
          description: restoreError instanceof Error ? restoreError.message.split('\n')[0] : String(restoreError),
        });
      });
      throw error;
    }

    await this.write(settingsBefore);
  }

  private async write(changes: Partial<WorkingTimeSettings>): Promise<void> {
    await this.writeFor(await this.widgetId(), { ...(await this.settings()), ...changes });
  }

  private async widgetId(): Promise<string> {
    const widget = (await this.widgets()).find((candidate) => candidate.url === URLS.customer);

    if (!widget) {
      throw new Error(`The back office configures no widget for ${URLS.customer}`);
    }

    return widget.id;
  }

  private async idCode(): Promise<string> {
    const response = await this.read(CSA_ACTIVITY_URL);
    const { response: activity } = (await response.json()) as { response: CsaActivity };

    return activity.idCode;
  }

  private async read(url: string, params?: Record<string, string>): Promise<APIResponse> {
    const response = await this.page.request.get(url, { params });

    expect(response.ok(), `The back office would not answer ${url} (${response.status()})`).toBeTruthy();

    return response;
  }

  private domainTab(domain: string): Locator {
    return this.domainTabs.and(this.page.getByRole('button', { name: domain, exact: true }));
  }

  private async widgets(): Promise<WidgetData[]> {
    const response = await this.read(WIDGET_DATA_URL, { user_id: await this.idCode() });

    return (await response.json()) as WidgetData[];
  }

  private async domainId(domain: string): Promise<string> {
    const widget = (await this.widgets()).find((candidate) => candidate.name === domain);

    if (!widget) {
      throw new Error(`The back office configures no widget named "${domain}"`);
    }

    return widget.id;
  }

  private async settingsFor(domainId: string): Promise<WorkingTimeSettings> {
    const response = await this.read(ORGANIZATION_WORKING_TIME_URL, { domain: domainId });
    const { response: settings } = (await response.json()) as { response: WorkingTimeSettings };

    return settings;
  }

  private async writeFor(domainId: string, settings: Partial<WorkingTimeSettings>): Promise<void> {
    const response = await this.page.request.post(ORGANIZATION_WORKING_TIME_URL, {
      data: { ...settings, domainUUID: [domainId] },
    });

    expect(response.ok(), `The back office refused to save the opening hours (${response.status()})`).toBeTruthy();
  }

  private async restoreSettingsForDomains(snapshots: Record<string, WorkingTimeDomainSnapshot>): Promise<string[]> {
    const leftChanged: string[] = [];

    for (const [domain, snapshot] of Object.entries(snapshots)) {
      await this.writeFor(snapshot.domainId, snapshot.settings).catch((error: unknown) => {
        test.info().annotations.push({
          type: `opening hours left changed on "${domain}"`,
          description: error instanceof Error ? error.message.split('\n')[0] : String(error),
        });
        leftChanged.push(domain);
      });
    }

    return leftChanged;
  }

  private async fillAbsenceMessage(message: string): Promise<void> {
    await this.setSwitch(this.switchUseCustomerService, true);

    await this.textareaAbsenceOfCsaMessage.clear();
    await this.textareaAbsenceOfCsaMessage.fill(message);
    await expect(
      this.textareaAbsenceOfCsaMessage,
      'The absence notification kept the text it held instead of the one entered',
    ).toHaveValue(message);
  }

  private async showSchedule({ sameOnAllWorkingDays }: { sameOnAllWorkingDays: boolean }): Promise<void> {
    await this.setSwitch(this.switchUseCustomerService, true);
    await this.setSwitch(this.switchWorkingAllTime, false);
    await this.setSwitch(this.switchSameOnAllWorkingDays, sameOnAllWorkingDays);
  }

  private async assertCommonHoursAreShown(label: string): Promise<void> {
    await expect(
      this.page.locator('main').getByText(label, { exact: true }),
      `The common hours are not labelled "${label}"`,
    ).toBeVisible();
    await expect(this.inputsFromUntilTime, `The "${label}" hours carry no from-until pair`).toHaveCount(2);
  }

  private async assertDailyHoursAreShown(days: string[]): Promise<void> {
    for (const day of days) {
      await expect(
        this.page.locator('main').getByText(day, { exact: true }),
        `${day} is missing from the schedule`,
      ).toBeVisible();
    }

    await expect(this.switchesDayOpenClosed, 'Not every day in the schedule has an open-closed toggle').toHaveCount(
      days.length,
    );
    await expect(this.inputsFromUntilTime, 'Not every open day carries a from-until pair').toHaveCount(
      2 * (await this.switchesDayOpen.count()),
    );
  }

  private async assertToggleIsShown(toggle: Locator, describedAs: string): Promise<void> {
    await expect(toggle, `The page offers no ${describedAs}`).toBeVisible();
    await this.assertTooltipIsOffered(toggle, describedAs);
  }

  private async assertMessageFieldIsShown(field: Locator, describedAs: string): Promise<void> {
    await expect(field, `The ${describedAs} field is missing`).toBeVisible();
    await this.assertTooltipIsOffered(field, describedAs);
  }

  private async isSwitchOn(toggle: Locator): Promise<boolean> {
    return (await toggle.getAttribute('aria-checked')) === 'true';
  }

  private async setSwitch(toggle: Locator, on: boolean): Promise<void> {
    await expect(async () => {
      if ((await this.isSwitchOn(toggle)) !== on) {
        await toggle.click();
      }

      expect(await this.isSwitchOn(toggle), 'The toggle kept the state it was clicked out of').toBe(on);
    }).toPass({ timeout: ACTION_TIMEOUT });
  }

  private async assertTooltipIsOffered(control: Locator, describedAs: string): Promise<void> {
    const trigger = this.page
      .locator('main .switch, main .track')
      .filter({ has: control })
      .last()
      .locator('span[data-state="closed"]')
      .first();

    await trigger.hover();
    await expect(this.page.getByRole('tooltip'), `The ${describedAs} carries no tooltip`).toBeVisible();
  }
}
