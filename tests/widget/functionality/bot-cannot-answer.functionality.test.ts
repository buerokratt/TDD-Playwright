import { BrowserContext } from '@playwright/test';

import { AdminPageFactory } from '@page-objects/admin-page-factory';
import { OfficeOpeningHoursPage } from '@page-objects/settings';
import { WidgetPage } from '@page-objects/widget';
import { test } from '@setup/test-setup';
import { ADMIN_AUTH_STATE } from '@utils/constants';
import { URLS } from '@utils/env';
import { seedEnglishLocale } from '@utils/helpers';

test.describe('[widget] [functional] The bot-cannot-answer prompt lets the customer close or continue the chat', () => {
  let csaContext: BrowserContext;
  let customerContext: BrowserContext;
  let officeHours: OfficeOpeningHoursPage;

  test.beforeEach(async ({ browser }) => {
    csaContext = await browser.newContext({ storageState: ADMIN_AUTH_STATE });
    customerContext = await browser.newContext();

    await seedEnglishLocale(customerContext);

    officeHours = new AdminPageFactory(await csaContext.newPage()).getOfficeOpeningHoursPage();
  });

  test.afterEach(async () => {
    await Promise.all([customerContext.close(), csaContext.close()]);
  });

  test(
    'Close on the bot-cannot-answer prompt closes the chat window',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/125/' } },
    async () => {
      const botCannotAnswer = await officeHours.botCannotAnswerMessage();

      await officeHours.whileCsaUnavailable(async () => {
        const cPage = await customerContext.newPage();
        const customerPage = new WidgetPage(cPage);

        await test.step('The customer writes something the bot cannot answer', async () => {
          await cPage.goto(URLS.customer);
          await customerPage.openChat();
          await customerPage.askWhatBotCannotAnswer();
        });

        await test.step('The widget shows the configured notice with Close and Continue', async () => {
          await customerPage.expectBotCannotAnswerPromptShown(botCannotAnswer);
        });

        await test.step('Close shuts the chat window', async () => {
          await customerPage.closeChatOnBotCannotAnswerPrompt();
          await customerPage.expectChatWindowClosed();
        });
      });
    },
  );

  test(
    'Continue on the bot-cannot-answer prompt keeps the chat open',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/125/' } },
    async () => {
      const botCannotAnswer = await officeHours.botCannotAnswerMessage();

      await officeHours.whileCsaUnavailable(async () => {
        const cPage = await customerContext.newPage();
        const customerPage = new WidgetPage(cPage);

        await test.step('The customer writes something the bot cannot answer', async () => {
          await cPage.goto(URLS.customer);
          await customerPage.openChat();
          await customerPage.askWhatBotCannotAnswer();
        });

        await test.step('The widget shows the configured notice with Close and Continue', async () => {
          await customerPage.expectBotCannotAnswerPromptShown(botCannotAnswer);
        });

        await test.step('Continue drops the prompt and leaves the message box open', async () => {
          await customerPage.continueChatOnBotCannotAnswerPrompt();
          await customerPage.expectChatContinuesAfterPrompt(botCannotAnswer);
        });
      });
    },
  );
});
