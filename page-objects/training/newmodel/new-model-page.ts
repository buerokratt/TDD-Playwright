import { Locator, Page, expect } from '@playwright/test';

export class NewModelPage {
  private readonly page: Page;

  private readonly buttonTrain: Locator;
  private readonly pageHeader: Locator;

  constructor(page: Page) {
    this.page = page;

    this.buttonTrain = this.page.getByText('Treeni', { exact: true });
    this.pageHeader = this.page.getByRole('heading', { name: 'Treeni ja testi', level: 1 });
  }

  async clickTrainButton(): Promise<void> {
    await this.buttonTrain.click();
  }

  async isPageHeaderVisible(): Promise<void> {
    return expect(this.pageHeader).toBeVisible();
  }
}
