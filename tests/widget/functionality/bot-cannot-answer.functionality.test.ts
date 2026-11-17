import { test } from '@setup/test-setup';
import { CSA_UNAVAILABLE, WORKING_TIME_TAG } from '@utils/constants';
import { URLS } from '@utils/env';
import { pendingChatCleanup } from '@utils/helpers';

test.describe(
  '[widget] [functional] The bot-cannot-answer prompt lets the customer close or continue the chat',
  { tag: WORKING_TIME_TAG },
  () => {
    test(
      'Close on the bot-cannot-answer prompt closes the chat window',
      { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/125/' } },
      async ({ officeOpeningHoursPage, customerPage, widgetPage }) => {
        const botCannotAnswerMessage = await officeOpeningHoursPage.botCannotAnswerMessage();

        await officeOpeningHoursPage.whileSettingsAre(CSA_UNAVAILABLE, async () => {
          await test.step('The customer asks for an operator', async () => {
            await customerPage.goto(URLS.customer);
            await widgetPage.openChat();
            await widgetPage.requestCsa();
          });

          await test.step('The widget shows the configured notice with Close and Continue', async () => {
            await widgetPage.expectCloseOrContinuePromptShown(botCannotAnswerMessage);
          });

          await test.step('Close shuts the chat window', async () => {
            await widgetPage.closePrompt();
            await widgetPage.expectChatWindowClosed();
          });
        });
      },
    );

    test(
      'Continue on the bot-cannot-answer prompt keeps the chat open',
      { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/125/' } },
      async ({ officeOpeningHoursPage, customerPage, widgetPage }) => {
        const botCannotAnswerMessage = await officeOpeningHoursPage.botCannotAnswerMessage();

        await officeOpeningHoursPage.whileSettingsAre(CSA_UNAVAILABLE, async () => {
          await test.step('The customer asks for an operator', async () => {
            await customerPage.goto(URLS.customer);
            await widgetPage.openChat();
            await widgetPage.requestCsa();
          });

          await test.step('The widget shows the configured notice with Close and Continue', async () => {
            await widgetPage.expectCloseOrContinuePromptShown(botCannotAnswerMessage);
          });

          await test.step('Continue drops the prompt and leaves the message box open', async () => {
            await widgetPage.continuePrompt();
            await widgetPage.expectChatContinuesAfterPrompt(botCannotAnswerMessage);
          });
        });
      },
    );
  },
);

test.describe(
  '[widget] [functional] The forwarding prompt offers an operator while customer service is used',
  { tag: WORKING_TIME_TAG },
  () => {
    let pendingChatId: string | undefined;

    test.beforeEach(() => {
      pendingChatId = undefined;
    });

    test.afterEach(pendingChatCleanup(() => pendingChatId));

    test(
      'Yes on the forwarding prompt hands the chat over to an operator',
      { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/129/' } },
      async ({ officeOpeningHoursPage, header, customerPage, widgetPage }) => {
        const redirectMessage = await officeOpeningHoursPage.redirectIfBotCannotAnswerMessage();

        await test.step('The operator is present before the customer writes', async () => {
          await header.ensureCsaPresent();
        });

        await test.step('The customer asks for an operator', async () => {
          await customerPage.goto(URLS.customer);
          await widgetPage.openChat();
          await widgetPage.requestCsa();
        });

        await test.step('The widget shows the configured redirect notice with Yes and No', async () => {
          await widgetPage.expectForwardingPromptShown(redirectMessage);
        });

        await test.step('Yes hands the chat over to the back office', async () => {
          pendingChatId = await widgetPage.chatId();
          await widgetPage.confirmForwarding();
        });
      },
    );

    test(
      'No on the forwarding prompt keeps the chat with the bot',
      { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/129/' } },
      async ({ officeOpeningHoursPage, header, customerPage, widgetPage }) => {
        const redirectMessage = await officeOpeningHoursPage.redirectIfBotCannotAnswerMessage();

        await test.step('The operator is present before the customer writes', async () => {
          await header.ensureCsaPresent();
        });

        await test.step('The customer asks for an operator', async () => {
          await customerPage.goto(URLS.customer);
          await widgetPage.openChat();
          await widgetPage.requestCsa();
        });

        await test.step('The widget shows the configured redirect notice with Yes and No', async () => {
          await widgetPage.expectForwardingPromptShown(redirectMessage);
        });

        await test.step('No drops the prompt and leaves the message box open', async () => {
          await widgetPage.declineForwarding();
          await widgetPage.expectChatContinuesAfterForwardingPrompt(redirectMessage);
        });

        await test.step('The chat notes that the conversation goes on with the bot', async () => {
          await widgetPage.expectContinueConversationNoteShown();
        });
      },
    );
  },
);
