import { Locator, Page, expect } from '@playwright/test';

import { ACTION_TIMEOUT } from '@utils/constants';
import { chatMarkerPhrase } from '@utils/test-data';

import { ChatsPage } from './chats-page';

/**
 * "Conversations" → "Active": the chats this operator has taken over, and the transcript they
 * talk to the customer through.
 */
export class ActiveChatsPage extends ChatsPage {
  private readonly listActiveChats: Locator;
  private readonly buttonEndChat: Locator;
  private readonly inputMessage: Locator;
  private readonly buttonSendMessage: Locator;
  private readonly transcript: Locator;
  private readonly customerMessages: Locator;

  constructor(page: Page) {
    super(page);

    this.listActiveChats = this.page.getByRole('tablist', { name: 'Active chat list' });
    this.buttonEndChat = this.page.locator('button', { hasText: 'End chat' });
    this.inputMessage = this.page.getByPlaceholder(/reply|message/i);
    this.buttonSendMessage = this.page.locator('button.btn--primary').filter({ hasNotText: /./ });

    this.transcript = this.page.locator('.active-chat__group-wrapper');
    this.customerMessages = this.transcript.locator('.active-chat__group--end-user');
  }

  async expectChatIsActive(): Promise<void> {
    await expect(this.listActiveChats, 'The chat never moved to the operator’s own list').toBeVisible();
    await expect(this.buttonEndChat, 'An active chat offers no way to end it').toBeVisible();
  }

  async expectOperatorReceived(marker: string): Promise<void> {
    await expect(
      this.messageContaining(marker, this.customerMessages),
      `The operator never received "${marker}" from the customer`,
    ).toBeVisible({ timeout: 30000 });
  }

  async replyAsOperator(marker: string): Promise<void> {
    await expect(this.inputMessage, 'The active chat offered no message input').toBeVisible({
      timeout: ACTION_TIMEOUT,
    });
    await this.inputMessage.fill(marker);
    await this.buttonSendMessage.click();
    await expect(this.messageContaining(marker), 'The operator’s own message never appeared in their chat').toBeVisible(
      { timeout: ACTION_TIMEOUT },
    );
  }

  private messageContaining(marker: string, within: Locator = this.transcript): Locator {
    return within.getByText(chatMarkerPhrase(marker), { exact: false }).first();
  }
}
