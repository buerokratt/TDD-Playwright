import { Locator, Page } from '@playwright/test';

import { RouteReadyOptions } from '@utils/interfaces';
import { isEventuallyVisible, waitForConversationsReady } from '@utils/waits';

/**
 * What every chat list under "Conversations" shares: the tabs down the side, and taking a chat
 * over from that list. What only one list can do belongs in its own page object.
 */
export abstract class ChatsPage {
  protected readonly page: Page;

  protected readonly tabs: Locator;
  protected readonly buttonTakeOver: Locator;

  constructor(page: Page) {
    this.page = page;

    this.tabs = this.page.getByRole('tab');
    this.buttonTakeOver = this.page.locator('button', { hasText: 'Take Over' });
  }

  async waitForReady(options: RouteReadyOptions = {}): Promise<void> {
    await waitForConversationsReady(this.page, options);
  }

  getLastListItem(): Locator {
    return this.tabs.last();
  }

  async takeOverLastChat(): Promise<void> {
    await this.waitForReady();
    await this.getLastListItem().click();
    await this.buttonTakeOver.click();
  }

  async takeOverChat(chatId: string): Promise<void> {
    await this.waitForReady();

    const deadline = Date.now() + 60000;

    while (Date.now() < deadline) {
      if (await this.openChat(chatId)) {
        await this.buttonTakeOver.click();
        return;
      }
    }

    throw new Error(`The queue never offered the chat ${chatId}`);
  }

  private async openChat(chatId: string): Promise<boolean> {
    const openChatId = this.page.getByText(chatId, { exact: false });

    for (let index = (await this.tabs.count()) - 1; index >= 0; index--) {
      await this.tabs.nth(index).click();

      if (await isEventuallyVisible(openChatId, 4000)) {
        return true;
      }
    }

    return false;
  }
}
