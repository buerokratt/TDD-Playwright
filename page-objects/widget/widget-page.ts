import { Locator, Page, expect } from '@playwright/test';

export class WidgetPage {
  private readonly page: Page;

  private readonly widget: Locator;
  private readonly bykTitle: Locator;
  private readonly inputField: Locator;
  private readonly sendButton: Locator;
  private readonly buttonHamburger: Locator;
  private readonly buttonTC: Locator;
  private readonly buttonMinimize: Locator;
  private readonly buttonClose: Locator;

  private readonly buttonConfirmWithAnswer: Locator;
  private readonly buttonConfirmNoAnswer: Locator;
  private readonly buttonDeclineClose: Locator;

  private readonly imgFlagsEUSI: Locator;
  private readonly imgFlagsEUTV: Locator;

  private readonly buttonConfirm: Locator;
  private readonly buttonDownload: Locator;
  private readonly inputFeedback: Locator;

  constructor(page: Page) {
    this.page = page;

    this.widget = this.page.getByTitle('Ava vestlus');
    this.bykTitle = this.page.getByText('Bürokratt');
    this.inputField = this.page.getByPlaceholder('Kirjutage oma sõnum...');
    this.sendButton = this.page.getByTitle('Saada');
    this.buttonHamburger = this.page.getByTitle('Detailid');
    this.buttonTC = this.page.getByText('Tutvuge teenuse tingimustega', { exact: true });
    this.buttonMinimize = this.page.getByTitle('Minimeeri');
    this.buttonClose = this.page.getByTitle('Sulge');

    this.buttonConfirmWithAnswer = this.page.getByRole('button', { name: 'Jah, sain vastuse' });
    this.buttonConfirmNoAnswer = this.page.getByRole('button', { name: 'Jah, vastuseta' });
    this.buttonDeclineClose = this.page.getByTitle('Kinnitusnupp ei');

    this.imgFlagsEUSI = this.page.getByAltText('Euroopa Liidu Struktuuri- ja Investeerimisfondid');
    this.imgFlagsEUTV = this.page.getByAltText('Euroopa Liidu taaste- ja vastupidavusrahastu');

    this.buttonConfirm = this.page.getByRole('button', { name: 'Kinnita' });
    this.buttonDownload = this.page.getByRole('button', { name: 'Laadi vestlus alla' });
    this.inputFeedback = this.page.getByPlaceholder('Sisestage oma tagasiside...');
  }

  async openChat(): Promise<void> {
    await this.widget.click();
    await this.bykTitle.waitFor({ state: 'visible' });
  }

  async getCSAChat(): Promise<void> {
    await this.inputField.fill('Tere');
    await this.sendButton.click();

    await this.page.waitForTimeout(3000);

    if (await this.page.getByText('Kuidas saan abiks olla?').isVisible()) {
      await this.inputField.fill('Suuna mind');
    } else if (await this.page.getByText('Kas suunan teid klienditeenindajale? (Jah/Ei)').isVisible()) {
      await this.inputField.fill('Jah');
    }
    await this.sendButton.click();

    await this.page.waitForTimeout(3000);
    await expect(this.page.getByText('Suunan teid klienditeenindajale. Varuge natukene kannatust.')).toBeVisible();
  }

  async openDetails(): Promise<void> {
    await this.buttonHamburger.click();
  }

  async giveFeedback(score: string, feedback: string): Promise<void> {
    await this.page.getByRole('button', { name: score }).click();
    await this.inputFeedback.fill(feedback);
    await this.buttonConfirm.click();
  }
}
