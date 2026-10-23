import { Locator, Page, expect, test } from '@playwright/test';

import { ACTION_TIMEOUT, AWAY_STATUS_TIME_CAP } from '@utils/constants';
import { URLS } from '@utils/env';
import { RouteReadyOptions, SessionLengthSettings } from '@utils/interfaces';
import { waitForSessionLengthReady } from '@utils/waits';

export class SessionLengthPage {
  private readonly page: Page;

  private readonly headingSessionLength: Locator;
  private readonly textInactiveUsersLoggedOut: Locator;
  private readonly textConversationEndsAutomatically: Locator;
  private readonly textAwayStatusAfterInactivity: Locator;

  private readonly inputSessionLength: Locator;
  private readonly inputResponseTime: Locator;
  private readonly inputAwayStatusTime: Locator;

  private readonly labelSessionLengthUnit: Locator;
  private readonly labelResponseTimeUnit: Locator;
  private readonly labelAwayStatusTimeUnit: Locator;

  private readonly noteSessionLengthRange: Locator;
  private readonly noteResponseTimeRange: Locator;
  private readonly noteAwayStatusTimeRange: Locator;

  private readonly switchDisplayMessage: Locator;
  private readonly switchShowEndMessage: Locator;
  private readonly switchAwayStatus: Locator;

  private readonly textareaIdleWarningMessage: Locator;
  private readonly textareaEndMessage: Locator;

  private readonly buttonSave: Locator;
  private readonly toastList: Locator;

  constructor(page: Page) {
    this.page = page;

    this.headingSessionLength = this.page.getByRole('heading', { name: 'Session length', exact: true });
    this.textInactiveUsersLoggedOut = this.page.getByText(
      'User session length, after which inactive users are logged out.',
      { exact: true },
    );
    this.textConversationEndsAutomatically = this.page.getByText(
      'When the time expires, the conversation will end automatically.',
      { exact: true },
    );
    this.textAwayStatusAfterInactivity = this.page.getByText(
      'When active, users will automatically be set to away status after the selected period of inactivity.',
      { exact: true },
    );

    this.inputSessionLength = this.page.locator('input[name="session-length"]');
    this.inputResponseTime = this.page.locator('input[name="chatActiveDuration"]');
    this.inputAwayStatusTime = this.page.locator('input[name="awayStatusTimeout"]');

    this.labelSessionLengthUnit = this.unitLabelOf(this.inputSessionLength);
    this.labelResponseTimeUnit = this.unitLabelOf(this.inputResponseTime);
    this.labelAwayStatusTimeUnit = this.unitLabelOf(this.inputAwayStatusTime);

    this.noteSessionLengthRange = this.page.getByText('Session length is allowed between 30 min - 480 min (8h)', {
      exact: true,
    });
    this.noteResponseTimeRange = this.page.getByText('Session length is allowed between 5 min - 480 min (8h)', {
      exact: true,
    });
    this.noteAwayStatusTimeRange = this.page.getByText(/^Away status time is allowed between/);

    this.switchDisplayMessage = this.page.getByRole('switch', { name: 'Display message' });
    this.switchShowEndMessage = this.page.getByRole('switch', { name: 'Show end message' });
    this.switchAwayStatus = this.page.getByRole('switch', { name: 'Away status' });

    this.textareaIdleWarningMessage = this.page.getByLabel('Idle warning message', { exact: true });
    this.textareaEndMessage = this.page.getByLabel('End message', { exact: true });

    this.buttonSave = this.page.getByRole('button', { name: 'Save', exact: true });
    this.toastList = this.page.locator('ol.toast__list');
  }

  async waitForReady(options: RouteReadyOptions = {}): Promise<void> {
    await waitForSessionLengthReady(this.page, options);
  }

  async open(): Promise<void> {
    await this.page.goto(URLS.admin + 'chat/session-length');
    await this.waitForReady();
  }

  async assertPageIsShown(): Promise<void> {
    await expect(this.headingSessionLength, 'Session length never rendered its heading').toBeVisible();
    await expect(
      this.textInactiveUsersLoggedOut,
      'The page never explained what the session length applies to',
    ).toBeVisible();
    await expect(
      this.textConversationEndsAutomatically,
      'The page never explained what happens once the time expires',
    ).toBeVisible();
    await expect(this.buttonSave, 'The page offers no way to save the session length').toBeVisible();
  }

  async assertSessionLengthFieldIsShown(): Promise<void> {
    await expect(this.inputSessionLength, 'The page holds no session length field').toBeVisible();
    await expect(this.labelSessionLengthUnit, 'The session length field states no unit').toBeVisible();
    await expect(this.noteSessionLengthRange, 'The session length field states no allowed range').toBeVisible();
    await this.assertTooltipIsOffered(this.inputSessionLength, 'session length field');
  }

  async assertResponseTimeFieldIsShown(): Promise<void> {
    await expect(this.inputResponseTime, 'The page holds no field for the time a user has to respond').toBeVisible();
    await expect(this.labelResponseTimeUnit, 'The response time field states no unit').toBeVisible();
    await expect(this.noteResponseTimeRange, 'The response time field states no allowed range').toBeVisible();
    await this.assertTooltipIsOffered(this.inputResponseTime, 'response time field');
  }

  async assertMessageTogglesAreShown(): Promise<void> {
    await expect(this.switchDisplayMessage, 'The page offers no toggle for the idle warning message').toBeVisible();
    await expect(this.switchShowEndMessage, 'The page offers no toggle for the end message').toBeVisible();

    await this.assertTooltipIsOffered(this.switchDisplayMessage, '"Display message" toggle');
    await this.assertTooltipIsOffered(this.switchShowEndMessage, '"Show end message" toggle');
  }

  async assertAwayStatusToggleIsShown(): Promise<void> {
    await expect(this.switchAwayStatus, 'The page offers no toggle for the away status').toBeVisible();
    await this.assertTooltipIsOffered(this.switchAwayStatus, '"Away status" toggle');
  }

  async assertIdleWarningMessageFollowsItsToggle(): Promise<void> {
    await this.assertMessageFieldFollowsItsToggle(
      this.switchDisplayMessage,
      this.textareaIdleWarningMessage,
      'idle warning message',
    );
  }

  async assertEndMessageFollowsItsToggle(): Promise<void> {
    await this.assertMessageFieldFollowsItsToggle(this.switchShowEndMessage, this.textareaEndMessage, 'end message');
  }

  async assertAwayStatusTimeFollowsItsToggle(): Promise<void> {
    const sessionLength = Number(await this.inputSessionLength.inputValue());
    const maxAwayStatusTime = sessionLength > AWAY_STATUS_TIME_CAP ? AWAY_STATUS_TIME_CAP : sessionLength - 1;

    await this.setSwitch(this.switchAwayStatus, true);

    await expect(
      this.textAwayStatusAfterInactivity,
      'The page never explained what the away status does while its toggle says Yes',
    ).toBeVisible();
    await expect(this.inputAwayStatusTime, 'The away status time is missing while its toggle says Yes').toBeVisible();
    await expect(this.labelAwayStatusTimeUnit, 'The away status time field states no unit').toBeVisible();
    await expect(
      this.noteAwayStatusTimeRange,
      'The away status time field states a range other than the session length allows',
    ).toHaveText(`Away status time is allowed between 5 min - ${maxAwayStatusTime} min`);
    await this.assertTooltipIsOffered(this.inputAwayStatusTime, 'away status time field');

    await this.setSwitch(this.switchAwayStatus, false);
    await expect(
      this.inputAwayStatusTime,
      'The away status time stayed on the page while its toggle says No',
    ).toBeHidden();
    await expect(
      this.textAwayStatusAfterInactivity,
      'The away status explanation stayed on the page while its toggle says No',
    ).toBeHidden();
  }

  async readSettings(): Promise<SessionLengthSettings> {
    const displayMessage = await this.isSwitchOn(this.switchDisplayMessage);
    const showEndMessage = await this.isSwitchOn(this.switchShowEndMessage);
    const awayStatus = await this.isSwitchOn(this.switchAwayStatus);

    return {
      sessionLength: await this.inputSessionLength.inputValue(),
      responseTime: await this.inputResponseTime.inputValue(),
      displayMessage,
      idleWarningMessage: await this.readValueBehindToggle(
        this.switchDisplayMessage,
        this.textareaIdleWarningMessage,
        displayMessage,
      ),
      showEndMessage,
      endMessage: await this.readValueBehindToggle(this.switchShowEndMessage, this.textareaEndMessage, showEndMessage),
      awayStatus,
      awayStatusTime: await this.readValueBehindToggle(this.switchAwayStatus, this.inputAwayStatusTime, awayStatus),
    };
  }

  async applySettings(settings: SessionLengthSettings): Promise<void> {
    await this.inputSessionLength.fill(settings.sessionLength);
    await this.inputResponseTime.fill(settings.responseTime);

    await this.writeValueBehindToggle(
      this.switchDisplayMessage,
      this.textareaIdleWarningMessage,
      settings.displayMessage,
      settings.idleWarningMessage,
    );
    await this.writeValueBehindToggle(
      this.switchShowEndMessage,
      this.textareaEndMessage,
      settings.showEndMessage,
      settings.endMessage,
    );
    await this.writeValueBehindToggle(
      this.switchAwayStatus,
      this.inputAwayStatusTime,
      settings.awayStatus,
      settings.awayStatusTime,
    );
  }

  async fillSessionLength(value: string): Promise<void> {
    await this.inputSessionLength.fill(value);
  }

  async fillResponseTime(value: string): Promise<void> {
    await this.inputResponseTime.fill(value);
  }

  async setAwayStatus(on: boolean): Promise<void> {
    await this.setSwitch(this.switchAwayStatus, on);
  }

  async fillAwayStatusTime(value: string): Promise<void> {
    await this.inputAwayStatusTime.fill(value);
  }

  async saveSettings(): Promise<void> {
    await this.buttonSave.click();
  }

  async assertSaveWasConfirmed({ timeout = ACTION_TIMEOUT }: RouteReadyOptions = {}): Promise<void> {
    await expect(this.toastList, 'Saving the session length raised no notification').toContainText(
      'Session length changed successfully',
      { timeout },
    );
  }

  async assertSaveWasRejected(message: string, { timeout = ACTION_TIMEOUT }: RouteReadyOptions = {}): Promise<void> {
    await expect(this.toastList, `Saving raised no notification reading "${message}"`).toContainText(message, {
      timeout,
    });
  }

  async whileSettingsAre(changes: Partial<SessionLengthSettings>, body: () => Promise<void>): Promise<void> {
    await this.open();
    const settingsBefore = await this.readSettings();

    try {
      await this.write({ ...settingsBefore, ...changes });
      await body();
    } catch (error) {
      await this.write(settingsBefore).catch((restoreError: unknown) => {
        test.info().annotations.push({
          type: 'session length left changed',
          description: restoreError instanceof Error ? restoreError.message.split('\n')[0] : String(restoreError),
        });
      });
      throw error;
    }

    await this.write(settingsBefore);
  }

  async assertSettingsStored(expected: SessionLengthSettings): Promise<void> {
    expect(await this.readSettings(), 'The page came back holding settings other than the ones saved').toEqual(
      expected,
    );
  }

  private async write(settings: SessionLengthSettings): Promise<void> {
    await this.open();
    await this.applySettings(settings);
    await this.saveSettings();
    await this.assertSaveWasConfirmed();
  }

  private async readValueBehindToggle(toggle: Locator, field: Locator, shown: boolean): Promise<string> {
    if (shown) {
      return field.inputValue();
    }

    await this.setSwitch(toggle, true);
    const value = await field.inputValue();
    await this.setSwitch(toggle, false);

    return value;
  }

  private async writeValueBehindToggle(toggle: Locator, field: Locator, shown: boolean, value: string): Promise<void> {
    await this.setSwitch(toggle, true);

    await field.clear();
    await field.fill(value);
    await expect(field, 'The field behind the toggle kept the value it held instead of the one entered').toHaveValue(
      value,
    );

    await this.setSwitch(toggle, shown);
  }

  private async assertMessageFieldFollowsItsToggle(
    toggle: Locator,
    field: Locator,
    describedAs: string,
  ): Promise<void> {
    await this.setSwitch(toggle, true);

    await expect(field, `The ${describedAs} is missing while its toggle says Yes`).toBeVisible();
    await expect(field, `The ${describedAs} takes more than the 500 characters allowed`).toHaveAttribute(
      'maxlength',
      '500',
    );
    await this.assertTooltipIsOffered(field, describedAs);

    await this.setSwitch(toggle, false);
    await expect(field, `The ${describedAs} stayed on the page while its toggle says No`).toBeHidden();
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

  private unitLabelOf(field: Locator): Locator {
    return this.page.locator('main .track').filter({ has: field }).last().locator('label.minute');
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
