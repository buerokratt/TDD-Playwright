import { BrowserContext } from '@playwright/test';

import { AdminPageFactory } from '@page-objects/admin-page-factory';
import { WidgetPage } from '@page-objects/widget';
import { test } from '@setup/test-setup';
import {
  ADMIN_AUTH_STATE,
  CSA_ABSENT_WITH_CONTACTS,
  CSA_ABSENT_WITHOUT_CONTACTS,
  MALFORMED_CONTACT_EMAIL,
  MALFORMED_CONTACT_PHONE,
} from '@utils/constants';
import { URLS } from '@utils/env';
import { seedEnglishLocale } from '@utils/helpers';
import { createContactEmail } from '@utils/test-data';

test.describe('[widget] [functional] The operator-absence prompt lets the customer close or continue the chat', () => {
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
    'Close on the operator-absence prompt closes the chat window',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/131/' } },
    async () => {
      const officeHours = csaPage.getOfficeOpeningHoursPage();
      const absence = await officeHours.noCsaAvailableMessage();

      await officeHours.whileSettingsAre(CSA_ABSENT_WITHOUT_CONTACTS, async () => {
        await csaPage.getPageHeader().whileCsaAway(async () => {
          const cPage = await customerContext.newPage();
          const customerPage = new WidgetPage(cPage);

          await test.step('The customer asks for an operator', async () => {
            await cPage.goto(URLS.customer);
            await customerPage.openChat();
            await customerPage.askForOperator();
          });

          await test.step('The widget shows the configured absence notice with Close and Continue', async () => {
            await customerPage.expectCloseOrContinuePromptShown(absence);
          });

          await test.step('Close shuts the chat window', async () => {
            await customerPage.closeChatOnPrompt();
            await customerPage.expectChatWindowClosed();
          });
        });
      });
    },
  );

  test(
    'Continue on the operator-absence prompt keeps the chat open',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/131/' } },
    async () => {
      const officeHours = csaPage.getOfficeOpeningHoursPage();
      const absence = await officeHours.noCsaAvailableMessage();

      await officeHours.whileSettingsAre(CSA_ABSENT_WITHOUT_CONTACTS, async () => {
        await csaPage.getPageHeader().whileCsaAway(async () => {
          const cPage = await customerContext.newPage();
          const customerPage = new WidgetPage(cPage);

          await test.step('The customer asks for an operator', async () => {
            await cPage.goto(URLS.customer);
            await customerPage.openChat();
            await customerPage.askForOperator();
          });

          await test.step('The widget shows the configured absence notice with Close and Continue', async () => {
            await customerPage.expectCloseOrContinuePromptShown(absence);
          });

          await test.step('Continue drops the prompt and leaves the message box open', async () => {
            await customerPage.continueChatOnPrompt();
            await customerPage.expectChatContinuesAfterPrompt(absence);
          });

          await test.step('The chat notes that the conversation goes on with the bot', async () => {
            await customerPage.expectContinueConversationNoteShown();
          });
        });
      });
    },
  );
});

test.describe('[widget] [functional] The operator-absence contact form lets the customer skip it or leave valid contacts', () => {
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
    'Skip on the operator-absence contact form closes the chat window',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/127/' } },
    async () => {
      const officeHours = csaPage.getOfficeOpeningHoursPage();
      const absence = await officeHours.noCsaAvailableMessage();

      await officeHours.whileSettingsAre(CSA_ABSENT_WITH_CONTACTS, async () => {
        await csaPage.getPageHeader().whileCsaAway(async () => {
          const cPage = await customerContext.newPage();
          const customerPage = new WidgetPage(cPage);

          await test.step('The customer asks for an operator', async () => {
            await cPage.goto(URLS.customer);
            await customerPage.openChat();
            await customerPage.askForOperator();
          });

          await test.step('The widget shows the configured absence notice with the contact fields, Skip and Submit', async () => {
            await customerPage.expectContactFormShown(absence);
          });

          await test.step('Skip shuts the chat window', async () => {
            await customerPage.skipContactForm();
            await customerPage.expectChatWindowClosed();
          });
        });
      });
    },
  );

  test(
    'Submit on the operator-absence contact form checks the contacts and closes the chat once one is valid',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/127/' } },
    async () => {
      const officeHours = csaPage.getOfficeOpeningHoursPage();
      const absence = await officeHours.noCsaAvailableMessage();

      await officeHours.whileSettingsAre(CSA_ABSENT_WITH_CONTACTS, async () => {
        await csaPage.getPageHeader().whileCsaAway(async () => {
          const cPage = await customerContext.newPage();
          const customerPage = new WidgetPage(cPage);

          await test.step('The customer asks for an operator', async () => {
            await cPage.goto(URLS.customer);
            await customerPage.openChat();
            await customerPage.askForOperator();
          });

          await test.step('The widget shows the configured absence notice with the contact fields, Skip and Submit', async () => {
            await customerPage.expectContactFormShown(absence);
          });

          await test.step('Submit without contacts asks for at least one', async () => {
            await customerPage.submitContactForm({});
            await customerPage.expectContactsRequired();
          });

          await test.step('Submit with a malformed e-mail asks for a correct one', async () => {
            await customerPage.submitContactForm({ email: MALFORMED_CONTACT_EMAIL });
            await customerPage.expectEmailRejected();
          });

          await test.step('Submit with a malformed phone number asks for a correct one', async () => {
            await customerPage.submitContactForm({ phone: MALFORMED_CONTACT_PHONE });
            await customerPage.expectPhoneRejected();
          });

          await test.step('Submit with a valid e-mail shuts the chat window', async () => {
            await customerPage.submitContactForm({ email: createContactEmail() });
            await customerPage.expectChatWindowClosed();
          });
        });
      });
    },
  );
});
