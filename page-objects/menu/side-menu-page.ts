import { Locator, Page, expect } from '@playwright/test';

export class SideMenuPage {
  private readonly page: Page;

  private readonly buttonVestlused: Locator;
  private readonly buttonAnalyytika: Locator;
  private readonly buttonTeenused: Locator;
  private readonly buttonHaldus: Locator;
  private readonly buttonCollapseAll: Locator;

  constructor(page: Page) {
    this.page = page;

    this.buttonVestlused = this.page.getByRole('button', { name: 'Vestlused' });
    this.buttonAnalyytika = this.page.getByRole('button', { name: 'Analüütika' });
    this.buttonTeenused = this.page.getByRole('button', { name: 'Teenused' });
    this.buttonHaldus = this.page.getByRole('button', { name: 'Haldus' });
    this.buttonCollapseAll = this.page.getByRole('button', { name: 'Kitsenda menüü' });
  }

  async isChatMenuVisible(): Promise<void> {
    await expect(this.buttonVestlused).toBeVisible();
  }

  async assertVestlusedButtonVisible(): Promise<void> {
    await expect(this.buttonVestlused).toBeVisible();
  }

  async assertAnalyytikaButtonVisible(): Promise<void> {
    await expect(this.buttonAnalyytika).toBeVisible();
  }

  async assertTeenusedButtonVisible(): Promise<void> {
    await expect(this.buttonTeenused).toBeVisible();
  }

  async assertHaldusButtonVisible(): Promise<void> {
    await expect(this.buttonHaldus).toBeVisible();
  }

  async assertCollapseButtonVisible(): Promise<void> {
    await expect(this.buttonCollapseAll).toBeVisible();
  }
}
