import { Locator, Page, expect } from '@playwright/test';

export class PageHeader {
  private readonly page: Page;

  private readonly logo: Locator;
  private readonly toggleSwitch: Locator;
  private readonly statusInput: Locator;
  private readonly buttonSave: Locator;
  private readonly buttonCancel: Locator;
  private readonly buttonLogOut: Locator;

  constructor(page: Page) {
    this.page = page;

    this.logo = this.page.locator('svg').locator('g').first();
    this.toggleSwitch = this.page.getByRole('switch');
    this.statusInput = this.page.getByLabel('Staatuse täpsustus');
    this.buttonSave = this.page.locator('button').getByText('Salvesta');
    this.buttonCancel = this.page.locator('button').getByText('Tühista');
    this.buttonLogOut = this.page.getByRole('button', { name: 'Logi välja', exact: true });

    // TODO: CSA menu mapping
  }

  async markCSAPresent(): Promise<void> {
    if ((await this.toggleSwitch.getAttribute('data-state')) === 'unchecked') {
      await this.toggleSwitch.click();
    }
  }

  async markCSAAway(): Promise<void> {
    if ((await this.toggleSwitch.getAttribute('data-state')) === 'checked') {
      await this.toggleSwitch.click();
    }
  }

  async assertLogoVisible(): Promise<void> {
    await expect(this.logo).toBeVisible();
  }

  async assertToggleSwitchVisible(): Promise<void> {
    await expect(this.toggleSwitch).toBeVisible();
  }

  async assertLogoutButtonVisible(): Promise<void> {
    await expect(this.buttonLogOut).toBeVisible();
  }

  async saveCSAStatus(): Promise<void> {
    await this.statusInput.fill('CSA autotest');
    await this.buttonSave.click();
  }
}
