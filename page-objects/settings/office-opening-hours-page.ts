import { APIResponse, Page, expect, test } from '@playwright/test';

import {
  CSA_ACTIVITY_URL,
  CSA_AVAILABLE_ALL_TIME,
  CSA_UNAVAILABLE,
  ORGANIZATION_WORKING_TIME_URL,
  WIDGET_DATA_URL,
} from '@utils/constants';
import { URLS } from '@utils/env';
import { CsaActivity, WorkingTimeSettings } from '@utils/interfaces';

/** Administration -> Office opening hours, where the texts the bot falls back on are edited. */
export class OfficeOpeningHoursPage {
  private readonly page: Page;

  private widgetIdOfThisRun?: string;

  constructor(page: Page) {
    this.page = page;
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
}
