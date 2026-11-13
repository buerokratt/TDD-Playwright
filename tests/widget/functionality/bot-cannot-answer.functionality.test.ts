import { test } from '@setup/test-setup';
import { WORKING_TIME_TAG } from '@utils/constants';
import { URLS } from '@utils/env';

test.describe(
  '[widget] [functional] The bot-cannot-answer prompt lets the customer close or continue the chat',
  { tag: WORKING_TIME_TAG },
  () => {
    test(
      'Close on the bot-cannot-answer prompt closes the chat window',
      { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/125/' } },
      async ({ officeOpeningHoursPage, customerPage, widgetPage }) => {
        const botCannotAnswer = await officeOpeningHoursPage.botCannotAnswerMessage();

        await officeOpeningHoursPage.whileCsaUnavailable(async () => {
          await test.step('The customer asks for an operator', async () => {
            await customerPage.goto(URLS.customer);
            await widgetPage.openChat();
            await widgetPage.askForOperator();
          });

          await test.step('The widget shows the configured notice with Close and Continue', async () => {
            await widgetPage.expectCloseOrContinuePromptShown(botCannotAnswer);
          });

          await test.step('Close shuts the chat window', async () => {
            await widgetPage.closeChatOnPrompt();
            await widgetPage.expectChatWindowClosed();
          });
        });
      },
    );

    test(
      'Continue on the bot-cannot-answer prompt keeps the chat open',
      { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/125/' } },
      async ({ officeOpeningHoursPage, customerPage, widgetPage }) => {
        const botCannotAnswer = await officeOpeningHoursPage.botCannotAnswerMessage();

        await officeOpeningHoursPage.whileCsaUnavailable(async () => {
          await test.step('The customer asks for an operator', async () => {
            await customerPage.goto(URLS.customer);
            await widgetPage.openChat();
            await widgetPage.askForOperator();
          });

          await test.step('The widget shows the configured notice with Close and Continue', async () => {
            await widgetPage.expectCloseOrContinuePromptShown(botCannotAnswer);
          });

          await test.step('Continue drops the prompt and leaves the message box open', async () => {
            await widgetPage.continueChatOnPrompt();
            await widgetPage.expectChatContinuesAfterPrompt(botCannotAnswer);
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
    test(
      'The redirect notice is shown with Yes and No while the operator is present',
      { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/129/' } },
      async ({ officeOpeningHoursPage, header, customerPage, widgetPage }) => {
        const redirectMessage = await officeOpeningHoursPage.redirectIfBotCannotAnswerMessage();

        await test.step('The operator is present before the customer writes', async () => {
          await header.ensureCsaPresent();
        });

        await test.step('The customer asks for an operator', async () => {
          await customerPage.goto(URLS.customer);
          await widgetPage.openChat();
          await widgetPage.askForOperator();
        });

        await test.step('The widget shows the configured redirect notice with Yes and No', async () => {
          await widgetPage.expectForwardingPromptShown(redirectMessage);
        });
      },
    );
  },
);
