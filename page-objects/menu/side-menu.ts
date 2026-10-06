import { Locator, Page, expect } from '@playwright/test';

export class SideMenu {
  private readonly page: Page;

  private readonly buttonConversations: Locator;
  private readonly buttonAnalytics: Locator;
  private readonly buttonServices: Locator;
  private readonly buttonAdministration: Locator;
  private readonly buttonCollapseAll: Locator;
  private readonly linkHistory: Locator;

  constructor(page: Page) {
    this.page = page;

    this.buttonConversations = this.page.getByRole('button', { name: 'Conversations' });
    this.buttonAnalytics = this.page.getByRole('button', { name: 'Analytics' });
    this.buttonServices = this.page.getByRole('button', { name: 'Services' });
    this.buttonAdministration = this.page.getByRole('button', { name: 'Administration' });
    this.buttonCollapseAll = this.page.getByRole('button', { name: 'Close menu' });
    this.linkHistory = this.page.getByRole('link', { name: 'History', exact: true });
  }

  async openHistory(): Promise<void> {
    if ((await this.buttonConversations.getAttribute('aria-expanded')) !== 'true') {
      await this.buttonConversations.click();
    }

    await this.linkHistory.click();
  }

  async assertConversationsButtonVisible(): Promise<void> {
    await expect(this.buttonConversations).toBeVisible();
  }

  async assertAnalyticsButtonVisible(): Promise<void> {
    await expect(this.buttonAnalytics).toBeVisible();
  }

  async assertServicesButtonVisible(): Promise<void> {
    await expect(this.buttonServices).toBeVisible();
  }

  async assertAdministrationButtonVisible(): Promise<void> {
    await expect(this.buttonAdministration).toBeVisible();
  }

  async assertCollapseButtonVisible(): Promise<void> {
    await expect(this.buttonCollapseAll).toBeVisible();
  }
}
