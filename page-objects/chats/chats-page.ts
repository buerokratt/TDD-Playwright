import { Locator, Page } from '@playwright/test';

import { RouteReadyOptions } from '@utils/interfaces';
import { waitForChatsReady } from '@utils/waits/admin-page-ready';

export class UnansweredChatsPage {
  private readonly page: Page;

  private readonly list: Locator;
  private readonly tabs: Locator;
  private readonly buttonAccept: Locator;
  private readonly buttonEndChat: Locator;
  private readonly buttonForward: Locator;
  private readonly buttonAskAuth: Locator;
  private readonly buttonAskContact: Locator;
  private readonly buttonAskApproval: Locator;

  constructor(page: Page) {
    this.page = page;

    this.list = this.page.getByRole('tablist');
    this.tabs = this.page.getByRole('tab');
    this.buttonAccept = this.page.locator('button', { hasText: 'Võta üle' });
    this.buttonEndChat = this.page.locator('button', { hasText: 'Lõpeta vestlus' });
    this.buttonForward = this.page.locator('button', { hasText: 'Suuna kolleegile' });
    this.buttonAskAuth = this.page.locator('button', { hasText: 'Küsi autentimist' });
    this.buttonAskContact = this.page.locator('button', { hasText: 'Küsi kontaktandmeid' });
    this.buttonAskApproval = this.page.locator('button', { hasText: 'Küsi nõusolekut' });
  }

  async waitForReady(options: RouteReadyOptions = {}): Promise<void> {
    await waitForChatsReady(this.page, options);
  }

  getLastListItem(): Locator {
    return this.tabs.last();
  }

  async acceptChat(): Promise<void> {
    await this.waitForReady();
    await this.getLastListItem().click();
    await this.buttonAccept.click();
  }
}
