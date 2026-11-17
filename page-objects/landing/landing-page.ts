import { Page } from '@playwright/test';

import { URLS } from '@utils/env';
import { waitForAppSettled } from '@utils/waits';

export class LandingPage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async open(): Promise<void> {
    await this.page.goto(URLS.admin + 'chat/landing');
    await waitForAppSettled(this.page);
  }
}
