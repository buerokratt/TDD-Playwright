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

        await test.step('The customer asks for an operator', async () => {
          await cPage.goto(URLS.customer);
          await customerPage.openChat();
          await customerPage.askForOperator();
        });

        await test.step('The widget shows the configured notice with Close and Continue', async () => {
          await customerPage.expectCloseOrContinuePromptShown(botCannotAnswer);
        });

        await test.step('Close shuts the chat window', async () => {
          await customerPage.closeChatOnPrompt();
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

        await test.step('The customer asks for an operator', async () => {
          await cPage.goto(URLS.customer);
          await customerPage.openChat();
          await customerPage.askForOperator();
        });

        await test.step('The widget shows the configured notice with Close and Continue', async () => {
          await customerPage.expectCloseOrContinuePromptShown(botCannotAnswer);
        });

        await test.step('Continue drops the prompt and leaves the message box open', async () => {
          await customerPage.continueChatOnPrompt();
          await customerPage.expectChatContinuesAfterPrompt(botCannotAnswer);
        });
      });
    },
  );
});

test.describe('[widget] [functional] The forwarding prompt offers an operator while customer service is used', () => {
  let csaContext: BrowserContext;
  let customerContext: BrowserContext;
  let csaPage: AdminPageFactory;

  test.beforeEach(async ({ browser }) => {
    csaContext = await browser.newContext({ storageState: ADMIN_AUTH_STATE });
    customerContext = await browser.newContext();

    await seedEnglishLocale(customerContext);

    csaPage = new AdminPageFactory(await csaContext.newPage());
  });

  test.afterEach(async () => {
    await Promise.all([customerContext.close(), csaContext.close()]);
  });

  test(
    'The redirect notice is shown with Yes and No while the operator is present',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/129/' } },
    async () => {
      const redirectMessage = await csaPage.getOfficeOpeningHoursPage().redirectIfBotCannotAnswerMessage();
      const cPage = await customerContext.newPage();
      const customerPage = new WidgetPage(cPage);

      await test.step('The operator is present before the customer writes', async () => {
        await csaPage.getPageHeader().ensureCsaPresent();
      });

      await test.step('The customer asks for an operator', async () => {
        await cPage.goto(URLS.customer);
        await customerPage.openChat();
        await customerPage.askForOperator();
      });

      await test.step('The widget shows the configured redirect notice with Yes and No', async () => {
        await customerPage.expectForwardingPromptShown(redirectMessage);
      });
    },
  );
});
