import { APIResponse, Locator, Page, expect, test } from '@playwright/test';

import { CopyToDomainModal } from '@page-objects/common';
import {
  ACTION_TIMEOUT,
  CSA_ACTIVITY_URL,
  CSA_AVAILABLE_ALL_TIME,
  CSA_UNAVAILABLE,
  ORGANIZATION_WORKING_TIME_URL,
  WEEK_DAYS,
  WIDGET_DATA_URL,
  WORKDAYS,
} from '@utils/constants';
import { URLS } from '@utils/env';
import { CsaActivity, RouteReadyOptions, WorkingTimeSettings } from '@utils/interfaces';
import { waitForOfficeOpeningHoursReady } from '@utils/waits';

/** Administration -> Office opening hours, where the texts the bot falls back on are edited. */
export class OfficeOpeningHoursPage {
  private readonly page: Page;

  private widgetIdOfThisRun?: string;

  private readonly headingWorkingTime: Locator;
  private readonly textAfterWorkingHours: Locator;

  private readonly domainTabs: Locator;
  private readonly domainTabActive: Locator;
  private readonly buttonCopyToDomain: Locator;
  private readonly copyToDomain: CopyToDomainModal;

  private readonly switchUseCustomerService: Locator;
  private readonly switchWorkingAllTime: Locator;
  private readonly switchNationalHolidays: Locator;
  private readonly switchClosedOnWeekends: Locator;
  private readonly switchSameOnAllWorkingDays: Locator;
  private readonly switchOutsideHoursNotification: Locator;
  private readonly switchAbsenceNotification: Locator;
  private readonly switchesDayOpen: Locator;
  private readonly switchesDayOpenChecked: Locator;

  private readonly inputsTime: Locator;

  private readonly textareaOutsideHoursMessage: Locator;
  private readonly textareaAbsenceMessage: Locator;
  private readonly textareaRedirectMessage: Locator;
  private readonly textareaBotCannotAnswerMessage: Locator;

  private readonly buttonSave: Locator;

  constructor(page: Page) {
    this.page = page;

    this.headingWorkingTime = this.page.getByRole('heading', { name: 'Organization working time', exact: true });
    this.textAfterWorkingHours = this.page.getByText(
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
    this.switchNationalHolidays = this.page.getByRole('switch', {
      name: 'Available on national holidays',
      exact: true,
    });
    this.switchClosedOnWeekends = this.page.getByRole('switch', { name: 'Closed on weekends', exact: true });
    this.switchSameOnAllWorkingDays = this.page.getByRole('switch', {
      name: 'The same on all working days',
      exact: true,
    });
    this.switchOutsideHoursNotification = this.page.getByRole('switch', {
      name: 'Send a notification of outside office hours to the client. Will we ask the clients contact information?',
      exact: true,
    });
    this.switchAbsenceNotification = this.page.getByRole('switch', {
      name: 'Send a notification of absence to the client. Will we ask the clients contact information?',
      exact: true,
    });
    this.switchesDayOpen = this.page.getByRole('switch', { name: 'Open Closed', exact: true });
    this.switchesDayOpenChecked = this.page.getByRole('switch', { name: 'Open Closed', exact: true, checked: true });

    this.inputsTime = this.page.locator('main .react-datepicker__input-container input');

    this.textareaOutsideHoursMessage = this.page.getByLabel('Outside working hours message', { exact: true });
    this.textareaAbsenceMessage = this.page.getByLabel(
      'Notification of the absence of a customer service representative',
      { exact: true },
    );
    this.textareaRedirectMessage = this.page.getByLabel('Notification before redirecting, if Bürokratt cannot answer', {
      exact: true,
    });
    this.textareaBotCannotAnswerMessage = this.page.getByLabel('Notification if Bürokratt cannot answer', {
      exact: true,
    });

    this.buttonSave = this.page.locator('main').getByRole('button', { name: 'Save', exact: true });
  }

  async waitForReady(options: RouteReadyOptions = {}): Promise<void> {
    await waitForOfficeOpeningHoursReady(this.page, options);
  }

  async open(): Promise<void> {
    await this.page.goto(URLS.admin + 'chat/working-time');
    await this.waitForReady();
  }

  async assertPageIsShown(): Promise<void> {
    await expect(this.headingWorkingTime, 'Office opening hours never rendered its heading').toBeVisible();
    await expect(
      this.textAfterWorkingHours,
      'The page never explained what happens after the working hours end',
    ).toBeVisible();
    await expect(this.buttonSave, 'The page offers no way to save the opening hours').toBeVisible();
  }

  async assertDomainControlsAreShown({ timeout = ACTION_TIMEOUT }: RouteReadyOptions = {}): Promise<void> {
    await expect(this.domainTabs.first(), 'The page rendered no domain tab').toBeVisible({ timeout });
    await expect(this.domainTabActive, 'The domain tabs left no domain selected').toHaveCount(1);
    await this.copyToDomain.assertIsOffered();
  }

  async assertScheduleTogglesAreShown(): Promise<void> {
    await this.setSwitch(this.switchUseCustomerService, true);
    await this.assertToggleIsShown(this.switchUseCustomerService, '"Use customer service" toggle');
    await this.assertToggleIsShown(this.switchWorkingAllTime, '"Working hours are 24/7" toggle');

    await this.setSwitch(this.switchWorkingAllTime, false);
    await this.assertToggleIsShown(this.switchNationalHolidays, '"Available on national holidays" toggle');
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
    await this.assertDailyHoursAreShown(WORKDAYS);
    await expect(
      this.page.locator('main').getByText('Saturday', { exact: true }),
      'Saturday stayed in the schedule while the office is closed on weekends',
    ).toBeHidden();

    await this.setSwitch(this.switchClosedOnWeekends, false);
    await this.assertDailyHoursAreShown(WEEK_DAYS);
  }

  async assertOutsideHoursNotificationIsShown(): Promise<void> {
    await this.setSwitch(this.switchUseCustomerService, true);
    await this.setSwitch(this.switchWorkingAllTime, false);

    await this.assertToggleIsShown(this.switchOutsideHoursNotification, 'outside office hours notification toggle');
    await this.assertMessageFieldIsShown(this.textareaOutsideHoursMessage, 'outside working hours message');
  }

  async assertCustomerServiceNotificationsAreShown(): Promise<void> {
    await this.setSwitch(this.switchUseCustomerService, true);

    await this.assertToggleIsShown(this.switchAbsenceNotification, 'absence notification toggle');
    await this.assertMessageFieldIsShown(this.textareaAbsenceMessage, 'absence notification');
    await this.assertMessageFieldIsShown(this.textareaRedirectMessage, 'notification before redirecting');
  }

  async assertBotCannotAnswerNotificationIsShown(): Promise<void> {
    await this.setSwitch(this.switchUseCustomerService, false);

    await this.assertMessageFieldIsShown(this.textareaBotCannotAnswerMessage, '"Bürokratt cannot answer" notification');
    await expect(
      this.textareaAbsenceMessage,
      'The absence notification stayed on the page with customer service switched off',
    ).toBeHidden();
  }

  private async settings(): Promise<WorkingTimeSettings> {
    const response = await this.read(`${ORGANIZATION_WORKING_TIME_URL}?domain=${await this.widgetId()}`);
    const { response: settings } = (await response.json()) as { response: WorkingTimeSettings };

    return settings;
  }

  /** The notice the widget shows instead of offering an operator. */
  async noCsaAvailableMessage(): Promise<string> {
    return this.notice('organizationNoCsaAvailableMessage', 'for the case where no operator is available');
  }

  /** The notice the bot answers with where it offers no operator at all. */
  async botCannotAnswerMessage(): Promise<string> {
    return this.notice('organizationBotCannotAnswerMessage', 'for the case where the bot cannot answer');
  }

  /**
   * These notices are free-text fields an administrator may rewrite in any language, so tests
   * have to read them rather than assume them — and an empty one has to stop the test rather
   * than reach it, because a caller matching on "" finds every text node on the page.
   */
  private async notice(setting: string, describedAs: string): Promise<string> {
    const notice = (await this.settings())[setting];

    expect(notice, `The back office holds no notice ${describedAs}`).toBeTruthy();

    return notice;
  }

  async enableCsaAllTime(): Promise<void> {
    await this.write(CSA_AVAILABLE_ALL_TIME);
  }

  async whileCsaUnavailable(body: () => Promise<void>): Promise<void> {
    const settingsBefore = await this.settings();

    try {
      await this.write(CSA_UNAVAILABLE);
      await body();
    } finally {
      await this.write(settingsBefore).catch((error: unknown) => {
        test.info().annotations.push({
          type: 'customer service left switched off',
          description: error instanceof Error ? error.message.split('\n')[0] : String(error),
        });
      });
    }
  }

  private async write(changes: Partial<WorkingTimeSettings>): Promise<void> {
    const response = await this.page.request.post(ORGANIZATION_WORKING_TIME_URL, {
      data: { ...(await this.settings()), ...changes, domainUUID: [await this.widgetId()] },
    });

    expect(response.ok(), `The back office refused to save the opening hours (${response.status()})`).toBeTruthy();
  }

  /** Every widget carries its own texts, and the settings endpoint asks for one of them by id. */
  private async widgetId(): Promise<string> {
    if (this.widgetIdOfThisRun) {
      return this.widgetIdOfThisRun;
    }

    const response = await this.read(`${WIDGET_DATA_URL}?user_id=${await this.idCode()}`);
    const widgets = (await response.json()) as { id: string; url: string }[];
    const widget = widgets.find((candidate) => candidate.url === URLS.customer);

    expect(widget, `The back office configures no widget for ${URLS.customer}`).toBeTruthy();

    this.widgetIdOfThisRun = (widget as { id: string }).id;

    return this.widgetIdOfThisRun;
  }

  private async idCode(): Promise<string> {
    const response = await this.read(CSA_ACTIVITY_URL);
    const { response: activity } = (await response.json()) as { response: CsaActivity };

    return activity.idCode;
  }

  private async read(url: string): Promise<APIResponse> {
    const response = await this.page.request.get(url);

    expect(response.ok(), `The back office would not answer ${url} (${response.status()})`).toBeTruthy();

    return response;
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
    await expect(this.inputsTime, `The "${label}" hours carry no from-until pair`).toHaveCount(2);
  }

  private async assertDailyHoursAreShown(days: string[]): Promise<void> {
    for (const day of days) {
      await expect(
        this.page.locator('main').getByText(day, { exact: true }),
        `${day} is missing from the schedule`,
      ).toBeVisible();
    }

    await expect(this.switchesDayOpen, 'Not every day in the schedule has an open-closed toggle').toHaveCount(
      days.length,
    );
    await expect(this.inputsTime, 'Not every open day carries a from-until pair').toHaveCount(
      2 * (await this.switchesDayOpenChecked.count()),
    );
  }

  private async assertToggleIsShown(toggle: Locator, describedAs: string): Promise<void> {
    await expect(toggle, `The page offers no ${describedAs}`).toBeVisible();
    await this.assertTooltipIsOffered(toggle, describedAs);
  }

  private async assertMessageFieldIsShown(field: Locator, describedAs: string): Promise<void> {
    await expect(field, `The ${describedAs} field is missing`).toBeVisible();
    await expect(field, `The ${describedAs} takes more than the 250 characters allowed`).toHaveAttribute(
      'maxlength',
      '250',
    );
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
