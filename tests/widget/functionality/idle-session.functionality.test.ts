import { test } from '@setup/test-setup';
import { MINIMUM_RESPONSE_TIME, WIDGET_IDLE_TEST_TIMEOUT } from '@utils/constants';
import { URLS } from '@utils/env';
import { createSessionLengthMessage } from '@utils/test-data';

test.describe('[widget] [functional] An idle conversation follows the session length settings', () => {
  test.describe.configure({ timeout: WIDGET_IDLE_TEST_TIMEOUT });

  test(
    'An idle customer is warned with the message the session length settings hold',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/188/' } },
    async ({ sessionLengthPage, customerPage, widgetPage }) => {
      const idleWarningMessage = createSessionLengthMessage('autotest idle warning');

      await sessionLengthPage.whileSettingsAre(
        {
          responseTime: MINIMUM_RESPONSE_TIME,
          displayMessage: true,
          idleWarningMessage,
          showEndMessage: false,
        },
        async () => {
          await test.step("The customer opens the widget, and the bot's greeting starts the chat", async () => {
            await customerPage.goto(URLS.customer);
            await widgetPage.openChat();
          });

          await test.step('Left alone for the configured time, the widget asks whether to continue', async () => {
            await widgetPage.expectIdleWarningShown(idleWarningMessage);
          });
        },
      );
    },
  );

  test(
    'An idle conversation ends with the message the session length settings hold',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/189/' } },
    async ({ sessionLengthPage, customerPage, widgetPage }) => {
      const endMessage = createSessionLengthMessage('autotest end message');

      await sessionLengthPage.whileSettingsAre(
        {
          responseTime: MINIMUM_RESPONSE_TIME,
          displayMessage: false,
          showEndMessage: true,
          endMessage,
        },
        async () => {
          await test.step("The customer opens the widget, and the bot's greeting starts the chat", async () => {
            await customerPage.goto(URLS.customer);
            await widgetPage.openChat();
          });

          await test.step('Left alone for the configured time, the widget ends the chat with its end message', async () => {
            await widgetPage.expectEndMessageShown(endMessage);
          });
        },
      );
    },
  );
});
