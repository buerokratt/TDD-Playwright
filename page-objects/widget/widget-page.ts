import { Locator, Page, expect, test } from '@playwright/test';

import {
  BOT_CANNOT_ANSWER_TIMEOUT,
  WIDGET_IDLE_TIMEOUT,
  WIDGET_MESSAGE_BOX_TIMEOUT,
  WIDGET_REDRAW_TIMEOUT,
  WIDGET_REPLY_TIMEOUT,
} from '@utils/constants';
import { ContactDetails } from '@utils/interfaces';
import { isEventuallyVisible } from '@utils/waits';

const ASK_FOR_OPERATOR = 'I want to talk to a human';
const CONTACTS_REQUIRED = 'Please fill in at least one field';
const EMAIL_REJECTED = 'Please make sure the email address is correct';
const PHONE_REJECTED = 'Please make sure the phone number is correct';

const asRendered = (notice: string): string => notice.replace(/\[([^\]]+)]\([^)]+\)/g, '$1');

export class WidgetPage {
  private readonly page: Page;

  private readonly widget: Locator;
  private readonly headingWidget: Locator;
  private readonly buttonDetails: Locator;
  private readonly buttonCloseChat: Locator;

  private readonly inputMessage: Locator;
  private readonly buttonSendMessage: Locator;
  private readonly botMessages: Locator;

  private readonly buttonConfirmForwarding: Locator;
  private readonly buttonDeclineForwarding: Locator;
  private readonly buttonEndWithoutAnswer: Locator;
  private readonly inputFeedback: Locator;
  private readonly buttonConfirmFeedback: Locator;
  private readonly buttonSkipFeedback: Locator;
  private readonly buttonContinueIdleChat: Locator;
  private readonly buttonCloseEndedChat: Locator;
  private readonly buttonClosePrompt: Locator;
  private readonly buttonContinuePrompt: Locator;
  private readonly noteContinueConversation: Locator;

  private readonly inputContactEmail: Locator;
  private readonly inputContactPhone: Locator;
  private readonly inputContactQuestion: Locator;
  private readonly buttonSkipContactForm: Locator;
  private readonly buttonSubmitContactForm: Locator;

  constructor(page: Page) {
    this.page = page;

    this.widget = this.page.getByTitle('Open chat');
    this.headingWidget = this.page.getByRole('heading', { name: 'Bürokratt' });
    this.buttonDetails = this.page.getByTitle('Details');
    this.buttonCloseChat = this.page.getByTitle('Close', { exact: true });

    this.inputMessage = this.page.getByPlaceholder('Enter your message...');
    this.buttonSendMessage = this.page.getByTitle('Send');
    this.botMessages = this.page.locator('.admin .message-main');

    this.buttonConfirmForwarding = this.page.getByRole('button', { name: 'Yes', exact: true });
    this.buttonDeclineForwarding = this.page.getByRole('button', { name: 'No', exact: true });
    this.buttonEndWithoutAnswer = this.page.getByRole('button', { name: 'Yes, no answer' });
    this.inputFeedback = this.page.getByPlaceholder('Enter your feedback...');
    this.buttonConfirmFeedback = this.page.getByRole('button', { name: 'Confirm' });
    this.buttonSkipFeedback = this.page.getByTitle('Skip', { exact: true });
    this.buttonContinueIdleChat = this.page.getByRole('button', { name: 'Continue', exact: true });
    this.buttonCloseEndedChat = this.page.getByRole('button', { name: 'Close' }).filter({ hasText: 'Close' }).first();
    this.buttonClosePrompt = this.page.locator('form').getByRole('button', { name: 'Close', exact: true });
    this.buttonContinuePrompt = this.page.locator('form').getByRole('button', { name: 'Continue', exact: true });
    this.noteContinueConversation = this.page.getByText('Continue conversation with bürokratt', { exact: true });

    this.inputContactEmail = this.page.getByPlaceholder('email@gmail.com');
    this.inputContactPhone = this.page.getByPlaceholder('+372 123 456');
    this.inputContactQuestion = this.page.getByPlaceholder('Type your question here');
    this.buttonSkipContactForm = this.page.locator('form').getByRole('button', { name: 'skip' });
    this.buttonSubmitContactForm = this.page.locator('form').getByRole('button', { name: 'submit' });
  }

  async openChat(): Promise<void> {
    await expect(this.widget, 'The page never drew the chat launcher').toBeVisible({
      timeout: WIDGET_REPLY_TIMEOUT,
    });
    await this.widget.click();
    await expect(this.headingWidget, 'The chat launcher never opened the widget').toBeVisible({
      timeout: WIDGET_REDRAW_TIMEOUT,
    });
  }

  /**
   * The notice the bot answers with when no operator is available is a free-text field of the
   * back office's, so it carries whatever wording and language an administrator last typed.
   * The caller reads it from there and passes it in rather than this page assuming a phrase.
   */
  async requestCsaChat(noCsaAvailableMessage: string): Promise<void> {
    await this.askForOperator();

    const offeredRouting = await isEventuallyVisible(this.buttonConfirmForwarding, WIDGET_REPLY_TIMEOUT);

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

    await this.buttonConfirmForwarding.click();

    const response = await forwarded;
    expect(response.ok(), `The back office refused to take the chat over with ${response.status()}`).toBeTruthy();
  }

  async expectNoOperatorOffered(botCannotAnswerMessage: string): Promise<void> {
    await this.askForOperator();

    const showedNotice = await isEventuallyVisible(
      this.page.getByText(asRendered(botCannotAnswerMessage), { exact: false }),
      WIDGET_REPLY_TIMEOUT,
    );

    expect(
      showedNotice,
      `The widget never showed "${botCannotAnswerMessage}". Its last reply: "${await this.lastReply()}"`,
    ).toBe(true);

    await expect(
      this.buttonConfirmForwarding,
      'The widget offered to route the chat although customer service was switched off',
    ).toBeHidden();
  }

  async askForOperator(): Promise<void> {
    await this.inputMessage.fill(ASK_FOR_OPERATOR);
    await this.buttonSendMessage.click();
  }

  async expectCloseOrContinuePromptShown(notice: string): Promise<void> {
    const prompt = this.noticePrompt(notice);
    const showedPrompt = await isEventuallyVisible(prompt, BOT_CANNOT_ANSWER_TIMEOUT);

    expect(showedPrompt, `The widget never showed "${notice}". Its last reply: "${await this.lastReply()}"`).toBe(true);

    await expect(this.buttonClosePrompt, 'The prompt offered no way to close the chat window').toBeVisible();
    await expect(this.buttonContinuePrompt, 'The prompt offered no way to continue the conversation').toBeVisible();
  }

  async closeChatOnPrompt(): Promise<void> {
    await this.buttonClosePrompt.click();
  }

  async continueChatOnPrompt(): Promise<void> {
    await this.buttonContinuePrompt.click();
  }

  async expectForwardingPromptShown(redirectMessage: string): Promise<void> {
    const showedPrompt = await isEventuallyVisible(this.forwardingPrompt(redirectMessage), BOT_CANNOT_ANSWER_TIMEOUT);

    expect(
      showedPrompt,
      `The widget never showed "${redirectMessage}". Its last reply: "${await this.lastReply()}"`,
    ).toBe(true);

    await expect(
      this.buttonConfirmForwarding,
      'The forwarding prompt offered no way to accept an operator',
    ).toBeVisible();
    await expect(
      this.buttonDeclineForwarding,
      'The forwarding prompt offered no way to decline an operator',
    ).toBeVisible();
  }

  async expectChatWindowClosed(): Promise<void> {
    await expect(this.headingWidget, 'The chat window stayed open after the customer closed it').toBeHidden({
      timeout: WIDGET_REDRAW_TIMEOUT,
    });
    await expect(this.widget, 'The page never brought the chat launcher back').toBeVisible({
      timeout: WIDGET_REDRAW_TIMEOUT,
    });
  }

  async expectChatContinuesAfterPrompt(notice: string): Promise<void> {
    await expect(
      this.noticePrompt(notice),
      'The prompt stayed on screen after the customer chose to continue',
    ).toBeHidden({ timeout: WIDGET_REDRAW_TIMEOUT });
    await expect(this.headingWidget, 'The chat window closed although the customer chose to continue').toBeVisible();
    await expect(this.inputMessage, 'The widget gave the customer no message box to continue in').toBeVisible({
      timeout: WIDGET_REDRAW_TIMEOUT,
    });
  }

  async expectContinueConversationNoteShown(): Promise<void> {
    await expect(
      this.noteContinueConversation,
      'The widget never told the customer the conversation goes on with the bot',
    ).toBeVisible({ timeout: WIDGET_REPLY_TIMEOUT });
  }

  async expectContactFormShown(notice: string): Promise<void> {
    const showedForm = await isEventuallyVisible(this.noticePrompt(notice), BOT_CANNOT_ANSWER_TIMEOUT);

    expect(showedForm, `The widget never showed "${notice}". Its last reply: "${await this.lastReply()}"`).toBe(true);

    await expect(this.inputContactEmail, 'The contact form asked for no e-mail address').toBeVisible();
    await expect(this.inputContactPhone, 'The contact form asked for no phone number').toBeVisible();
    await expect(this.inputContactQuestion, 'The contact form left no room for the question').toBeVisible();
    await expect(this.buttonSkipContactForm, 'The contact form offered no way to skip it').toBeVisible();
    await expect(this.buttonSubmitContactForm, 'The contact form offered no way to send the contacts').toBeVisible();
  }

  async skipContactForm(): Promise<void> {
    await this.buttonSkipContactForm.click();
  }

  async submitContactForm(contacts: ContactDetails): Promise<void> {
    await this.inputContactEmail.fill(contacts.email ?? '');
    await this.inputContactPhone.fill(contacts.phone ?? '');
    await this.buttonSubmitContactForm.click();
  }

  async expectContactsRequired(): Promise<void> {
    await this.expectContactFormRejected(CONTACTS_REQUIRED);
  }

  async expectEmailRejected(): Promise<void> {
    await this.expectContactFormRejected(EMAIL_REJECTED);
  }

  async expectPhoneRejected(): Promise<void> {
    await this.expectContactFormRejected(PHONE_REJECTED);
  }

  private noticePrompt(notice: string): Locator {
    return this.page
      .locator('form')
      .filter({ has: this.page.getByRole('heading', { name: asRendered(notice), exact: true }) });
  }

  private forwardingPrompt(redirectMessage: string): Locator {
    return this.page.getByRole('heading', { name: asRendered(redirectMessage), exact: true });
  }

  private async expectContactFormRejected(message: string): Promise<void> {
    await expect(this.page.getByText(message, { exact: true }), `The contact form never said "${message}"`).toBeVisible(
      {
        timeout: WIDGET_REDRAW_TIMEOUT,
      },
    );
    await expect(
      this.buttonSubmitContactForm,
      'The contact form closed although it rejected the contacts',
    ).toBeVisible();
  }

  async botGreeting(): Promise<string> {
    const greeting = this.botMessages.first();

    await expect(greeting, 'The widget never showed a message of the bot the chat could be read back by').toBeVisible({
      timeout: WIDGET_REPLY_TIMEOUT,
    });

    return (await greeting.innerText()).trim();
  }

  async endChatWithoutAnswerAndSkipFeedback(): Promise<void> {
    await this.buttonCloseChat.click();

    await expect(
      this.buttonEndWithoutAnswer,
      'The widget never asked the customer to confirm ending the conversation',
    ).toBeVisible({ timeout: WIDGET_REDRAW_TIMEOUT });
    await this.buttonEndWithoutAnswer.click();

    if (await isEventuallyVisible(this.buttonSkipFeedback, WIDGET_REDRAW_TIMEOUT)) {
      await this.buttonSkipFeedback.click();
    }
  }

  async chatId(): Promise<string> {
    const storedId = (): Promise<string | null> => this.page.evaluate(() => window.localStorage.getItem('byk-va-cid'));

    await expect
      .poll(storedId, {
        timeout: WIDGET_REDRAW_TIMEOUT,
        message: 'The widget never stored an id for the conversation',
      })
      .not.toBeNull();

    const stored = await storedId();

    if (stored === null) {
      throw new Error('The widget stored no id for the conversation');
    }

    return JSON.parse(stored);
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
    if (await isEventuallyVisible(this.inputMessage, WIDGET_MESSAGE_BOX_TIMEOUT)) {
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

    await expect(this.inputMessage, 'The widget hid its message box even after a reload').toBeVisible({
      timeout: WIDGET_REPLY_TIMEOUT,
    });
  }

  async sendMessage(text: string): Promise<void> {
    await this.waitForMessageBox();
    await this.inputMessage.fill(text);
    await this.buttonSendMessage.click();
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

    await expect(
      this.buttonContinueIdleChat,
      'The idle warning offered no way to continue the conversation',
    ).toBeVisible({
      timeout: WIDGET_REDRAW_TIMEOUT,
    });
  }

  async expectEndMessageShown(endMessage: string): Promise<void> {
    await expect(
      this.page.getByText(endMessage, { exact: false }),
      `The widget never closed the idle conversation with "${endMessage}"`,
    ).toBeVisible({ timeout: WIDGET_IDLE_TIMEOUT });

    await expect(this.buttonCloseEndedChat, 'The end message offered no way to close the chat window').toBeVisible({
      timeout: WIDGET_REDRAW_TIMEOUT,
    });
  }

  async openDetails(): Promise<void> {
    await this.buttonDetails.click();
  }

  async giveFeedback(score: string, feedback: string): Promise<void> {
    await this.page.getByRole('button', { name: score }).click();
    await this.inputFeedback.fill(feedback);
    await this.buttonConfirmFeedback.click();
  }
}
