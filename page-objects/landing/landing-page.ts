import { Page } from '@playwright/test';

import { URLS } from '@utils/env';
import { RouteReadyOptions } from '@utils/interfaces';
import { waitForLandingReady } from '@utils/waits';

export class LandingPage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async open(): Promise<void> {
    await this.page.goto(URLS.admin + 'chat/landing');
    await this.waitForReady();
  }

  async waitForReady(options: RouteReadyOptions = {}): Promise<void> {
    await waitForLandingReady(this.page, options);
  }
}
