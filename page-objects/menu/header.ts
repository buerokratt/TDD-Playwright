import { Locator, Page, expect } from '@playwright/test';

import { ACTION_TIMEOUT, CSA_ACTIVITY_PATH, CSA_ACTIVITY_URL } from '@utils/constants';
import { URLS } from '@utils/env';
import { CsaActivity } from '@utils/interfaces';

export class Header {
  private readonly page: Page;

  private readonly logo: Locator;
  private readonly toggleSwitchStatus: Locator;
  private readonly inputStatusClarification: Locator;
  private readonly buttonStatusClarificationSave: Locator;
  private readonly buttonStatusClarificationCancel: Locator;
  private readonly buttonLogOut: Locator;

  constructor(page: Page) {
    this.page = page;

    this.logo = this.page.locator('svg').locator('g').first();
    this.toggleSwitchStatus = this.page.getByRole('switch');
    this.inputStatusClarification = this.page.getByLabel('Status clarification');
    this.buttonStatusClarificationSave = this.page.locator('button').getByText('Save');
    this.buttonStatusClarificationCancel = this.page.locator('button').getByText('Cancel');
    this.buttonLogOut = this.page.getByRole('button', { name: 'Logout', exact: true });

    // TODO: CSA menu mapping
  }

  async isCsaPresent(): Promise<boolean> {
    const response = await this.page.request.get(CSA_ACTIVITY_URL);

    expect(response.ok(), `The back office would not report the operator's status (${response.status()})`).toBeTruthy();

    const { response: activity } = (await response.json()) as { response: CsaActivity };

    return activity.active && activity.status === 'online';
  }

  async ensureCsaPresent(): Promise<void> {
    if (await this.isCsaPresent()) {
      return;
    }

    await this.page.goto(URLS.admin + 'chat/landing');

    await expect(
      this.toggleSwitchStatus,
      `The operator is away and the back office renders no status switch to fix that with. ` +
        `Sign in at ${URLS.admin}chat/landing and set the switch to Present.`,
    ).toBeVisible({ timeout: 30000 });

    await this.setCsaStatus('online');

    await expect(async () => {
      expect(await this.isCsaPresent(), 'The operator stayed away after the switch was set to Present').toBeTruthy();
    }).toPass({ timeout: ACTION_TIMEOUT });
  }

  // The switch renders from the account's `active` flag, not from its status, so
  // `data-state` reads `checked` while the account still sits on `idle` and the bot
  // answers an escalation with "Nõustaja on eemal" instead of offering an agent.
  // Flip the switch away from the target state, then flip it back, and take the
  // status POST the admin itself sends as the proof of what the server now holds.
  private async setCsaStatus(status: 'online' | 'offline'): Promise<void> {
    const targetState = status === 'online' ? 'checked' : 'unchecked';
    const oppositeState = status === 'online' ? 'unchecked' : 'checked';

    await expect(this.toggleSwitchStatus).toBeVisible({ timeout: 30000 });

    if ((await this.toggleSwitchStatus.getAttribute('data-state')) !== oppositeState) {
      await this.toggleSwitchStatus.click();
      await expect(this.toggleSwitchStatus).toHaveAttribute('data-state', oppositeState, { timeout: ACTION_TIMEOUT });
    }

    const statusPosted = this.page.waitForResponse(
      (response) =>
        response.url().includes(CSA_ACTIVITY_PATH) &&
        response.request().method() === 'POST' &&
        (response.request().postData() ?? '').includes(`"customerSupportStatus":"${status}"`),
      { timeout: ACTION_TIMEOUT },
    );

    await this.toggleSwitchStatus.click();

    const response = await statusPosted;
    expect(response.ok(), `The admin rejected the switch to "${status}" with ${response.status()}`).toBeTruthy();
    await expect(this.toggleSwitchStatus).toHaveAttribute('data-state', targetState, { timeout: ACTION_TIMEOUT });
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

  async saveCsaStatus(): Promise<void> {
    await this.inputStatusClarification.fill('CSA autotest');
    await this.buttonStatusClarificationSave.click();
  }
}
