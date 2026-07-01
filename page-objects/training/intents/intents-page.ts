import { Locator, Page, expect } from '@playwright/test';

export class IntentsPage {
  private readonly page: Page;

  private readonly newIntentNameInput: Locator;
  private readonly buttonAdd: Locator;
  private readonly switchServiceIntent: Locator;
  private readonly buttonUpload: Locator;
  private readonly buttonAddToModel: Locator;
  private readonly buttonRemoveFromModel: Locator;

  constructor(page: Page) {
    this.page = page;

    this.newIntentNameInput = this.page.getByPlaceholder('Uue teema nimetus');
    this.buttonAdd = this.page.getByText('Lisa');
    this.switchServiceIntent = this.page.getByRole('switch', { name: 'Märgi teenuse kasutamiseks' });
    this.buttonUpload = this.page.getByRole('button', { name: 'Laadi ülesse näited' });
    this.buttonAddToModel = this.page.getByText('Lisa mudelisse');
    this.buttonRemoveFromModel = this.page.getByText('Eemalda mudelisse');
  }

  async createNewIntent(intentName: string): Promise<void> {
    await this.newIntentNameInput.fill(intentName);
    await this.buttonAdd.click();
    await this.switchServiceIntent.click();
    await this.buttonAddToModel.click();

    await this.page.waitForTimeout(3000);
    await expect(this.buttonRemoveFromModel).toBeVisible();
  }
}
