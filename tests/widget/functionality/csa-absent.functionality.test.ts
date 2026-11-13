import { test } from '@setup/test-setup';
import {
  CSA_ABSENT_WITH_CONTACTS,
  CSA_ABSENT_WITHOUT_CONTACTS,
  MALFORMED_CONTACT_EMAIL,
  MALFORMED_CONTACT_PHONE,
  WORKING_TIME_TAG,
} from '@utils/constants';
import { URLS } from '@utils/env';
import { createContactEmail } from '@utils/test-data';

test.describe(
  '[widget] [functional] The operator-absence prompt lets the customer close or continue the chat',
  { tag: WORKING_TIME_TAG },
  () => {
    test(
      'Close on the operator-absence prompt closes the chat window',
      { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/131/' } },
      async ({ officeOpeningHoursPage, header, customerPage, widgetPage }) => {
        const absence = await officeOpeningHoursPage.noCsaAvailableMessage();

        await officeOpeningHoursPage.whileSettingsAre(CSA_ABSENT_WITHOUT_CONTACTS, async () => {
          await header.whileCsaAway(async () => {
            await test.step('The customer asks for an operator', async () => {
              await customerPage.goto(URLS.customer);
              await widgetPage.openChat();
              await widgetPage.askForOperator();
            });

            await test.step('The widget shows the configured absence notice with Close and Continue', async () => {
              await widgetPage.expectCloseOrContinuePromptShown(absence);
            });

            await test.step('Close shuts the chat window', async () => {
              await widgetPage.closeChatOnPrompt();
              await widgetPage.expectChatWindowClosed();
            });
          });
        });
      },
    );

    test(
      'Continue on the operator-absence prompt keeps the chat open',
      { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/131/' } },
      async ({ officeOpeningHoursPage, header, customerPage, widgetPage }) => {
        const absence = await officeOpeningHoursPage.noCsaAvailableMessage();

        await officeOpeningHoursPage.whileSettingsAre(CSA_ABSENT_WITHOUT_CONTACTS, async () => {
          await header.whileCsaAway(async () => {
            await test.step('The customer asks for an operator', async () => {
              await customerPage.goto(URLS.customer);
              await widgetPage.openChat();
              await widgetPage.askForOperator();
            });

            await test.step('The widget shows the configured absence notice with Close and Continue', async () => {
              await widgetPage.expectCloseOrContinuePromptShown(absence);
            });

            await test.step('Continue drops the prompt and leaves the message box open', async () => {
              await widgetPage.continueChatOnPrompt();
              await widgetPage.expectChatContinuesAfterPrompt(absence);
            });

            await test.step('The chat notes that the conversation goes on with the bot', async () => {
              await widgetPage.expectContinueConversationNoteShown();
            });
          });
        });
      },
    );
  },
);

test.describe(
  '[widget] [functional] The operator-absence contact form lets the customer skip it or leave valid contacts',
  { tag: WORKING_TIME_TAG },
  () => {
    test(
      'Skip on the operator-absence contact form closes the chat window',
      { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/127/' } },
      async ({ officeOpeningHoursPage, header, customerPage, widgetPage }) => {
        const absence = await officeOpeningHoursPage.noCsaAvailableMessage();

        await officeOpeningHoursPage.whileSettingsAre(CSA_ABSENT_WITH_CONTACTS, async () => {
          await header.whileCsaAway(async () => {
            await test.step('The customer asks for an operator', async () => {
              await customerPage.goto(URLS.customer);
              await widgetPage.openChat();
              await widgetPage.askForOperator();
            });

            await test.step('The widget shows the configured absence notice with the contact fields, Skip and Submit', async () => {
              await widgetPage.expectContactFormShown(absence);
            });

            await test.step('Skip shuts the chat window', async () => {
              await widgetPage.skipContactForm();
              await widgetPage.expectChatWindowClosed();
            });
          });
        });
      },
    );

    test(
      'Submit on the operator-absence contact form checks the contacts and closes the chat once one is valid',
      { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/127/' } },
      async ({ officeOpeningHoursPage, header, customerPage, widgetPage }) => {
        const absence = await officeOpeningHoursPage.noCsaAvailableMessage();

        await officeOpeningHoursPage.whileSettingsAre(CSA_ABSENT_WITH_CONTACTS, async () => {
          await header.whileCsaAway(async () => {
            await test.step('The customer asks for an operator', async () => {
              await customerPage.goto(URLS.customer);
              await widgetPage.openChat();
              await widgetPage.askForOperator();
            });

            await test.step('The widget shows the configured absence notice with the contact fields, Skip and Submit', async () => {
              await widgetPage.expectContactFormShown(absence);
            });

            await test.step('Submit without contacts asks for at least one', async () => {
              await widgetPage.submitContactForm({});
              await widgetPage.expectContactsRequired();
            });

            await test.step('Submit with a malformed e-mail asks for a correct one', async () => {
              await widgetPage.submitContactForm({ email: MALFORMED_CONTACT_EMAIL });
              await widgetPage.expectEmailRejected();
            });

            await test.step('Submit with a malformed phone number asks for a correct one', async () => {
              await widgetPage.submitContactForm({ phone: MALFORMED_CONTACT_PHONE });
              await widgetPage.expectPhoneRejected();
            });

            await test.step('Submit with a valid e-mail shuts the chat window', async () => {
              await widgetPage.submitContactForm({ email: createContactEmail() });
              await widgetPage.expectChatWindowClosed();
            });
          });
        });
      },
    );
  },
);
