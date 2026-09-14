import { BrowserContext } from '@playwright/test';

import { AdminPageFactory } from '@page-objects/admin-page-factory';
import { SessionLengthPage } from '@page-objects/settings';
import { WidgetPage } from '@page-objects/widget';
import { test } from '@setup/test-setup';
import { ADMIN_AUTH_STATE, MINIMUM_RESPONSE_TIME, WIDGET_IDLE_TEST_TIMEOUT } from '@utils/constants';
import { URLS } from '@utils/env';
import { seedEnglishLocale } from '@utils/helpers';
import { createSessionLengthMessage } from '@utils/test-data';

test.describe('[widget] [functional] An idle conversation follows the session length settings', () => {
  test.describe.configure({ timeout: WIDGET_IDLE_TEST_TIMEOUT });

  let csaContext: BrowserContext;
  let customerContext: BrowserContext;
  let sessionLength: SessionLengthPage;

  test.beforeEach(async ({ browser }) => {
    csaContext = await browser.newContext({ storageState: ADMIN_AUTH_STATE });
    customerContext = await browser.newContext();

    await seedEnglishLocale(customerContext);

    sessionLength = new AdminPageFactory(await csaContext.newPage()).getSessionLengthPage();
  });

  test.afterEach(async () => {
    await customerContext.close();
    await csaContext.close();
  });

  test(
    'An idle customer is warned with the message the session length settings hold',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/188/' } },
    async () => {
      const idleWarningMessage = createSessionLengthMessage('autotest idle warning');

      await sessionLength.whileSettingsAre(
        {
          responseTime: MINIMUM_RESPONSE_TIME,
          displayMessage: true,
          idleWarningMessage,
          showEndMessage: false,
        },
        async () => {
          const cPage = await customerContext.newPage();
          const customerPage = new WidgetPage(cPage);

          await test.step("The customer opens the widget, and the bot's greeting starts the chat", async () => {
            await cPage.goto(URLS.customer);
            await customerPage.openChat();
          });

          await test.step('Left alone for the configured time, the widget asks whether to continue', async () => {
            await customerPage.expectIdleWarningShown(idleWarningMessage);
          });
        },
      );
    },
  );

  test(
    'An idle conversation ends with the message the session length settings hold',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/189/' } },
    async () => {
      const endMessage = createSessionLengthMessage('autotest end message');

      await sessionLength.whileSettingsAre(
        {
          responseTime: MINIMUM_RESPONSE_TIME,
          displayMessage: false,
          showEndMessage: true,
          endMessage,
        },
        async () => {
          const cPage = await customerContext.newPage();
          const customerPage = new WidgetPage(cPage);

          await test.step("The customer opens the widget, and the bot's greeting starts the chat", async () => {
            await cPage.goto(URLS.customer);
            await customerPage.openChat();
          });

          await test.step('Left alone for the configured time, the widget ends the chat with its end message', async () => {
            await customerPage.expectEndMessageShown(endMessage);
          });
        },
      );
    },
  );
});
