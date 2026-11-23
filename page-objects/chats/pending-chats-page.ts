import { Locator, Page, expect } from '@playwright/test';

import { ACTION_TIMEOUT, CHAT_END_URL } from '@utils/constants';
import { URLS } from '@utils/env';

import { ChatsPage } from './chats-page';

export class PendingChatsPage extends ChatsPage {
  private readonly buttonCouldNotReachUser: Locator;

  constructor(page: Page) {
    super(page);

    this.buttonCouldNotReachUser = this.page.getByRole('button', { name: 'Could Not Reach User', exact: true });
  }

  async open(): Promise<void> {
    await this.page.goto(URLS.admin + 'chat/pending');
  }

  async closeAsUserNotReached(chatId: string): Promise<void> {
    const tab = this.tabs.and(this.page.locator(`[id$="-trigger-${chatId}"]`));

    await this.open();
    await tab.click();

    if (await this.buttonTakeOver.isVisible()) {
      await this.buttonTakeOver.click();
    }

    const chatEnded = this.page.waitForResponse(
      (response) => response.url() === CHAT_END_URL && response.request().method() === 'POST',
    );

    await this.buttonCouldNotReachUser.click();
    expect((await chatEnded).ok(), `The pending chat ${chatId} could not be closed`).toBeTruthy();
    await expect(tab, `The pending chat ${chatId} stayed in the queue after it was closed`).toBeHidden({
      timeout: ACTION_TIMEOUT,
    });
  }
}
