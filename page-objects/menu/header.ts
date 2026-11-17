import { Locator, Page, expect, test } from '@playwright/test';

import { LandingPage } from '@page-objects/landing';
import { ACTION_TIMEOUT, CSA_ACTIVITY_URL, CSA_STATUS_SWITCH_TIMEOUT } from '@utils/constants';
import { URLS } from '@utils/env';
import { CsaActivity } from '@utils/interfaces';

export class Header {
  private readonly page: Page;
  private readonly landingPage: LandingPage;

  private readonly logo: Locator;
  private readonly toggleSwitchStatus: Locator;
  private readonly buttonLogOut: Locator;

  constructor(page: Page) {
    this.page = page;
    this.landingPage = new LandingPage(page);

    this.logo = this.page.locator('svg').locator('g').first();
    this.toggleSwitchStatus = this.page.getByRole('switch', { name: 'Present Busy', exact: true });
    this.buttonLogOut = this.page.getByRole('button', { name: 'Logout', exact: true });
  }

  private async isCsaPresent(): Promise<boolean> {
    const response = await this.page.request.get(CSA_ACTIVITY_URL);

    expect(response.ok(), `The back office would not report the operator's status (${response.status()})`).toBeTruthy();

    const { response: activity } = (await response.json()) as { response: CsaActivity };

    return activity.active && activity.status === 'online';
  }

  async ensureCsaPresent(): Promise<void> {
    if (await this.isCsaPresent()) {
      return;
    }

    await this.landingPage.open();

    await expect(
      this.toggleSwitchStatus,
      `The operator is away and the back office renders no status switch to fix that with. ` +
        `Sign in at ${URLS.admin}chat/landing and set the switch to Present.`,
    ).toBeVisible({ timeout: CSA_STATUS_SWITCH_TIMEOUT });

    await this.setCsaStatus('online');
  }

  async whileCsaAway(body: () => Promise<void>): Promise<void> {
    await this.landingPage.open();

    try {
      await this.setCsaStatus('offline');
      await body();
    } catch (error) {
      await this.setCsaStatus('online').catch((restoreError: unknown) => {
        test.info().annotations.push({
          type: 'operator left away',
          description: restoreError instanceof Error ? restoreError.message.split('\n')[0] : String(restoreError),
        });
      });
      throw error;
    }

    await this.setCsaStatus('online');
  }

  private async setCsaStatus(status: 'online' | 'offline'): Promise<void> {
    const present = status === 'online';

    await this.setStatusSwitch(!present);
    await this.setStatusSwitch(present);

    await expect(async () => {
      expect(await this.isCsaPresent(), `The back office did not hold "${status}" after the switch`).toBe(present);
    }).toPass({ timeout: ACTION_TIMEOUT });
  }

  private async setStatusSwitch(on: boolean): Promise<void> {
    await expect(this.toggleSwitchStatus).toBeVisible({ timeout: CSA_STATUS_SWITCH_TIMEOUT });

    await expect(async () => {
      if (((await this.toggleSwitchStatus.getAttribute('aria-checked')) === 'true') !== on) {
        await this.toggleSwitchStatus.click();
      }

      expect(
        (await this.toggleSwitchStatus.getAttribute('aria-checked')) === 'true',
        'The status switch kept the state it was clicked out of',
      ).toBe(on);
    }).toPass({ timeout: ACTION_TIMEOUT });
  }

  async assertLogoVisible(): Promise<void> {
    await expect(this.logo).toBeVisible();
  }

  async assertToggleSwitchVisible(): Promise<void> {
    await expect(this.toggleSwitchStatus).toBeVisible();
  }

  async assertLogoutButtonVisible(): Promise<void> {
    await expect(this.buttonLogOut).toBeVisible();
  }
}
