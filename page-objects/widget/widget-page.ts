import { Locator, Page, expect, test } from '@playwright/test';

import {
  WIDGET_IDLE_TIMEOUT,
  WIDGET_MESSAGE_BOX_TIMEOUT,
  WIDGET_REDRAW_TIMEOUT,
  WIDGET_REPLY_TIMEOUT,
} from '@utils/constants';
import { isEventuallyVisible } from '@utils/waits';

const ASK_FOR_OPERATOR = 'I want to talk to a human';

export class WidgetPage {
  private readonly page: Page;

  private readonly widget: Locator;
  private readonly bykTitle: Locator;
  private readonly inputField: Locator;
  private readonly sendButton: Locator;
  private readonly buttonHamburger: Locator;
  private readonly routeYes: Locator;

  private readonly buttonConfirm: Locator;
  private readonly inputFeedback: Locator;
  private readonly buttonContinue: Locator;
  private readonly buttonClose: Locator;

  constructor(page: Page) {
    this.page = page;

    this.widget = this.page.getByTitle('Open chat');
    this.bykTitle = this.page.getByRole('heading', { name: 'Bürokratt' });
    this.inputField = this.page.getByPlaceholder('Enter your message...');
    this.sendButton = this.page.getByTitle('Send');
    this.buttonHamburger = this.page.getByTitle('Details');
    this.routeYes = this.page.getByRole('button', { name: 'Yes', exact: true });

    this.buttonConfirm = this.page.getByRole('button', { name: 'Confirm' });
    this.inputFeedback = this.page.getByPlaceholder('Enter your feedback...');
    this.buttonContinue = this.page.getByRole('button', { name: 'Continue', exact: true });
    this.buttonClose = this.page.getByRole('button', { name: 'Close' }).filter({ hasText: 'Close' }).first();
  }

  async openChat(): Promise<void> {
    await expect(this.widget, 'The page never drew the chat launcher').toBeVisible({
      timeout: WIDGET_REPLY_TIMEOUT,
    });
    await this.widget.click();
    await this.bykTitle.waitFor({ state: 'visible' });
  }

  /**
   * The notice the bot answers with when no operator is available is a free-text field of the
   * back office's, so it carries whatever wording and language an administrator last typed.
   * The caller reads it from there and passes it in rather than this page assuming a phrase.
   */
  async getCsaChat(noCsaAvailableMessage: string): Promise<void> {
    await this.inputField.fill(ASK_FOR_OPERATOR);
    await this.sendButton.click();

    const offeredRouting = await isEventuallyVisible(this.routeYes, WIDGET_REPLY_TIMEOUT);

    // Whether the bot offers an operator at all depends on its current configuration, and
    // a bare timeout on the button says nothing about which of the known refusals happened:
    // the operator being away, or the bot answering with contact details instead of routing.
    expect(
      offeredRouting,
      `The bot never offered to route the chat. Its last reply: "${await this.lastReply(noCsaAvailableMessage)}"`,
    ).toBe(true);

    const forwarded = this.page.waitForResponse(
      (response) => response.url().includes('forwards/forward-to-backoffice') && response.request().method() === 'POST',
      { timeout: WIDGET_REPLY_TIMEOUT },
    );

    await this.routeYes.click();

    const response = await forwarded;
    expect(response.ok(), `The back office refused to take the chat over with ${response.status()}`).toBeTruthy();
  }

  async expectNoOperatorOffered(botCannotAnswerMessage: string): Promise<void> {
    await this.inputField.fill(ASK_FOR_OPERATOR);
    await this.sendButton.click();

    const showedNotice = await isEventuallyVisible(
      this.page.getByText(botCannotAnswerMessage, { exact: false }),
      WIDGET_REPLY_TIMEOUT,
    );

    expect(
      showedNotice,
      `The widget never showed "${botCannotAnswerMessage}". Its last reply: "${await this.lastReply()}"`,
    ).toBe(true);

    await expect(
      this.routeYes,
      'The widget offered to route the chat although customer service was switched off',
    ).toBeHidden();
  }

  async chatId(): Promise<string> {
    const stored = await this.page.evaluate(() => window.localStorage.getItem('byk-va-cid'));

    expect(stored, 'The widget never stored an id for the conversation').toBeTruthy();

    return JSON.parse(stored as string);
  }

  private async lastReply(noCsaAvailableMessage?: string): Promise<string> {
    if (noCsaAvailableMessage && (await this.page.getByText(noCsaAvailableMessage, { exact: false }).isVisible())) {
      return 'the widget showed the "no operator available" notice instead of routing the chat';
    }

    const replies = await this.page.locator('[class*="message"]').allInnerTexts();
    const lastReply = replies
      .map((reply) => reply.trim())
      .filter(Boolean)
      .pop();

    return lastReply?.replace(/\s+/g, ' ') ?? 'the conversation held no messages at all';
  }

  private async waitForMessageBox(): Promise<void> {
    if (await isEventuallyVisible(this.inputField, WIDGET_MESSAGE_BOX_TIMEOUT)) {
      return;
    }

    test.info().annotations.push({
      type: 'widget stalled',
      description: `The widget hid its message box until the page was reloaded. Its last reply: "${await this.lastReply()}"`,
    });

    await this.page.reload();

    if (await isEventuallyVisible(this.widget, WIDGET_REDRAW_TIMEOUT)) {
      await this.widget.click();
    }

    await expect(this.inputField, 'The widget hid its message box even after a reload').toBeVisible({
      timeout: WIDGET_REPLY_TIMEOUT,
    });
  }

  async sendMessage(text: string): Promise<void> {
    await this.waitForMessageBox();
    await this.inputField.fill(text);
    await this.sendButton.click();
    await expect(this.messageByText(text), 'The widget never echoed the message the customer sent').toBeVisible({
      timeout: WIDGET_REDRAW_TIMEOUT,
    });
  }

  async expectMessageDelivered(text: string): Promise<void> {
    await expect(this.messageByText(text), `The customer never received "${text}"`).toBeVisible({
      timeout: WIDGET_REPLY_TIMEOUT,
    });
  }

  async expectMessageNeverDelivered(text: string): Promise<void> {
    await expect(this.messageByText(text), `The customer received "${text}", which nobody sent`).toHaveCount(0);
  }

  private messageByText(text: string): Locator {
    return this.page.getByText(text, { exact: true });
  }

  async expectIdleWarningShown(idleWarningMessage: string): Promise<void> {
    await expect(
      this.messageByText(idleWarningMessage),
      `The widget never asked the idle customer "${idleWarningMessage}"`,
    ).toBeVisible({ timeout: WIDGET_IDLE_TIMEOUT });

    await expect(this.buttonContinue, 'The idle warning offered no way to continue the conversation').toBeVisible({
      timeout: WIDGET_REDRAW_TIMEOUT,
    });
  }

  async expectEndMessageShown(endMessage: string): Promise<void> {
    await expect(
      this.page.getByText(endMessage, { exact: false }),
      `The widget never closed the idle conversation with "${endMessage}"`,
    ).toBeVisible({ timeout: WIDGET_IDLE_TIMEOUT });

    await expect(this.buttonClose, 'The end message offered no way to close the chat window').toBeVisible({
      timeout: WIDGET_REDRAW_TIMEOUT,
    });
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
