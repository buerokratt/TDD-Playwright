import { Locator, Page, expect } from '@playwright/test';

import { ACTION_TIMEOUT, CHAT_MEASUREMENTS_PATH } from '@utils/constants';
import { URLS } from '@utils/env';
import { ConversationAnalysis, RouteReadyOptions } from '@utils/interfaces';
import { waitForHistoryReady } from '@utils/waits';

const THEME = 0;
const RESPONSE_QUALITY = 1;
const FOLLOW_UP_ACTION = 2;

export class HistoryPage {
  private readonly page: Page;

  private readonly headingHistory: Locator;
  private readonly table: Locator;

  private readonly drawer: Locator;
  private readonly buttonCloseDrawer: Locator;

  private readonly metadataSection: Locator;
  private readonly analysisSection: Locator;

  private readonly toastList: Locator;

  constructor(page: Page) {
    this.page = page;

    this.headingHistory = this.page.getByRole('heading', { name: /^History/ });
    this.table = this.page.locator('table.data-table').first();

    this.drawer = this.page.locator('.drawer').first();
    this.buttonCloseDrawer = this.drawer.locator('.drawer__close');

    this.metadataSection = this.page.locator('.side-meta');
    this.analysisSection = this.page.locator('.quality-settings');

    this.toastList = this.page.locator('ol.toast__list');
  }

  async waitForReady(options: RouteReadyOptions = {}): Promise<void> {
    await waitForHistoryReady(this.page, options);
  }

  async open(): Promise<void> {
    await this.page.goto(URLS.admin + 'chat/history');
    await this.waitForReady();
  }

  async assertPageIsShown(): Promise<void> {
    await expect(this.headingHistory, 'History never rendered its heading').toBeVisible();
    await expect(this.table, 'History never rendered its conversations table').toBeVisible();
  }

  async findConversationIdByWebpage(webpage: string): Promise<string> {
    const webpageColumnIndex = await this.columnIndex('Webpage');
    const idColumnIndex = await this.columnIndex('ID');
    const rowCount = await this.rows().count();

    for (let index = 0; index < rowCount; index++) {
      const cells = this.rows().nth(index).locator('td');

      if ((await cells.nth(webpageColumnIndex).innerText()).trim() === webpage) {
        return (await cells.nth(idColumnIndex).innerText()).trim();
      }
    }

    throw new Error(`History contains no conversation for "${webpage}" under the filters applied on load`);
  }

  async openConversation(conversationId: string, { timeout = ACTION_TIMEOUT }: RouteReadyOptions = {}): Promise<void> {
    const measurementsLoaded = this.page.waitForResponse(
      (response) => response.url().includes(CHAT_MEASUREMENTS_PATH) && response.request().method() === 'GET',
      { timeout },
    );

    await this.conversationRow(conversationId).getByRole('button', { name: 'View', exact: true }).click();

    await expect(
      this.analysisSection,
      `Conversation "${conversationId}" opened without its analysis section`,
    ).toBeVisible({
      timeout,
    });

    await measurementsLoaded;
  }

  async closeConversation({ timeout = ACTION_TIMEOUT }: RouteReadyOptions = {}): Promise<void> {
    await this.buttonCloseDrawer.click();
    await expect(this.drawer, 'The conversation stayed open after it was closed').toBeHidden({ timeout });
  }

  async selectTheme(value: string): Promise<void> {
    await this.chooseAnalysisValue(THEME, value);
  }

  async selectResponseQuality(value: string): Promise<void> {
    await this.chooseAnalysisValue(RESPONSE_QUALITY, value);
  }

  async selectFollowUpAction(value: string): Promise<void> {
    await this.chooseAnalysisValue(FOLLOW_UP_ACTION, value);
  }

  async assertThemeWasSaved(options: RouteReadyOptions = {}): Promise<void> {
    await this.assertToastReads('Theme selection has been saved.', options);
  }

  async assertResponseQualityWasSaved(options: RouteReadyOptions = {}): Promise<void> {
    await this.assertToastReads('Response quality selection has been saved.', options);
  }

  async assertFollowUpActionWasSaved(options: RouteReadyOptions = {}): Promise<void> {
    await this.assertToastReads('Follow-up action selection has been saved.', options);
  }

  async readAnalysisSelections(): Promise<ConversationAnalysis> {
    return {
      theme: await this.analysisSelectionText(THEME),
      responseQuality: await this.analysisSelectionText(RESPONSE_QUALITY),
      followUpAction: await this.analysisSelectionText(FOLLOW_UP_ACTION),
    };
  }

  async assertAnalysisWasRecorded(label: string, value: string, author: string): Promise<void> {
    const recorded = this.metadataValue(label);

    await expect(recorded, `The conversation metadata holds no "${label}"`).toHaveText(value);
    await expect(
      recorded.locator('xpath=following-sibling::p[1]'),
      `"${label}" was recorded without saying when and by whom`,
    ).toContainText(author);
  }

  async readRowAnalysis(conversationId: string): Promise<ConversationAnalysis> {
    const cells = this.conversationRow(conversationId).locator('td');

    return {
      theme: (await cells.nth(await this.columnIndex('Theme')).innerText()).trim(),
      responseQuality: (await cells.nth(await this.columnIndex('Bürokratt Response Quality')).innerText()).trim(),
      followUpAction: (await cells.nth(await this.columnIndex('Follow-up Status')).innerText()).trim(),
    };
  }

  async clearAnalysisSelections({ theme, responseQuality, followUpAction }: ConversationAnalysis): Promise<void> {
    await this.clearAnalysisValue(THEME, theme);
    await this.clearAnalysisValue(RESPONSE_QUALITY, responseQuality);
    await this.clearAnalysisValue(FOLLOW_UP_ACTION, followUpAction);
  }

  private conversationRow(conversationId: string): Locator {
    return this.rows().filter({ hasText: conversationId }).first();
  }

  private rows(): Locator {
    return this.table.locator('tbody tr');
  }

  private async columnIndex(name: string): Promise<number> {
    const headers = await this.table.locator('thead th').allInnerTexts();
    const index = headers.findIndex((header) => header.split('\n')[0].trim() === name);

    expect(index, `The conversations table has no "${name}" column`).toBeGreaterThan(-1);

    return index;
  }

  private analysisSelect(index: number): Locator {
    return this.analysisSection.locator('.select').nth(index);
  }

  private async analysisSelectionText(index: number): Promise<string> {
    return (await this.analysisSelect(index).locator('.select__trigger-text').innerText()).trim();
  }

  private metadataValue(label: string): Locator {
    return this.metadataSection.locator(`p:has(strong:text-is("${label}")) + p.metadata-item__value`);
  }

  private async chooseAnalysisValue(
    index: number,
    value: string,
    { timeout = ACTION_TIMEOUT }: RouteReadyOptions = {},
  ): Promise<void> {
    const select = this.analysisSelect(index);

    await select.locator('.select__trigger').click();

    const saved = this.page.waitForResponse(
      (response) => response.url().includes(CHAT_MEASUREMENTS_PATH) && response.request().method() === 'POST',
      { timeout },
    );

    await select
      .locator('.select__options li')
      .filter({ has: this.page.getByText(value, { exact: true }) })
      .first()
      .click();

    const response = await saved;

    expect(response.ok(), `The admin rejected saving "${value}" (${response.status()})`).toBeTruthy();

    await this.closeAnalysisMenu(select, { timeout });
  }

  private async clearAnalysisValue(index: number, value: string): Promise<void> {
    if (!(await this.analysisSelectionText(index)).includes(value)) {
      return;
    }

    await this.chooseAnalysisValue(index, value);
  }

  private async closeAnalysisMenu(select: Locator, { timeout = ACTION_TIMEOUT }: RouteReadyOptions): Promise<void> {
    const options = select.locator('.select__options');

    if (await options.isVisible().catch(() => false)) {
      await select.locator('.select__trigger').click();
    }

    await expect(options, 'The list of values stayed open over the pickers under it').toHaveCount(0, { timeout });
  }

  private async assertToastReads(message: string, { timeout = ACTION_TIMEOUT }: RouteReadyOptions): Promise<void> {
    await expect(this.toastList, `The conversation raised no "${message}" notification`).toContainText(message, {
      timeout,
    });
  }
}
