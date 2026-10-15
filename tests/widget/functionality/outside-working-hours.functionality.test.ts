import { BrowserContext } from '@playwright/test';

import { AdminPageFactory } from '@page-objects/admin-page-factory';
import { OfficeOpeningHoursPage } from '@page-objects/settings';
import { WidgetPage } from '@page-objects/widget';
import { test } from '@setup/test-setup';
import { ADMIN_AUTH_STATE, OUTSIDE_WORKING_HOURS } from '@utils/constants';
import { URLS } from '@utils/env';
import { seedEnglishLocale } from '@utils/helpers';

test.describe('[widget] [functional] The outside-working-hours prompt lets the customer close or continue the chat', () => {
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
    'Close on the outside-working-hours prompt closes the chat window',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/132/' } },
    async () => {
      const outsideHours = await officeHours.outsideWorkingHoursMessage();

      await officeHours.whileSettingsAre(OUTSIDE_WORKING_HOURS, async () => {
        const cPage = await customerContext.newPage();
        const customerPage = new WidgetPage(cPage);

        await test.step('The customer asks for an operator', async () => {
          await cPage.goto(URLS.customer);
          await customerPage.openChat();
          await customerPage.askForOperator();
        });

        await test.step('The widget shows the configured outside-hours notice with Close and Continue', async () => {
          await customerPage.expectCloseOrContinuePromptShown(outsideHours);
        });

        await test.step('Close shuts the chat window', async () => {
          await customerPage.closeChatOnPrompt();
          await customerPage.expectChatWindowClosed();
        });
      });
    },
  );

  test(
    'Continue on the outside-working-hours prompt keeps the chat open',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/132/' } },
    async () => {
      const outsideHours = await officeHours.outsideWorkingHoursMessage();

      await officeHours.whileSettingsAre(OUTSIDE_WORKING_HOURS, async () => {
        const cPage = await customerContext.newPage();
        const customerPage = new WidgetPage(cPage);

        await test.step('The customer asks for an operator', async () => {
          await cPage.goto(URLS.customer);
          await customerPage.openChat();
          await customerPage.askForOperator();
        });

        await test.step('The widget shows the configured outside-hours notice with Close and Continue', async () => {
          await customerPage.expectCloseOrContinuePromptShown(outsideHours);
        });

        await test.step('Continue drops the prompt and leaves the message box open', async () => {
          await customerPage.continueChatOnPrompt();
          await customerPage.expectChatContinuesAfterPrompt(outsideHours);
        });

        await test.step('The chat notes that the conversation goes on with the bot', async () => {
          await customerPage.expectContinueConversationNoteShown();
        });
      });
    },
  );
});
