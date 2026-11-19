import { test } from '@setup/test-setup';
import {
  MALFORMED_CONTACT_EMAIL,
  MALFORMED_CONTACT_PHONE,
  OUTSIDE_WORKING_HOURS_WITHOUT_CONTACTS,
  OUTSIDE_WORKING_HOURS_WITH_CONTACTS,
} from '@utils/constants';
import { URLS } from '@utils/env';
import { pendingChatCleanup } from '@utils/helpers';
import { createEmail } from '@utils/test-data';

test.describe(
  '[widget] [functional] The outside-working-hours prompt lets the customer close or continue the chat',
  { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/132/' } },
  () => {
    test('Close on the outside-working-hours prompt closes the chat window', async ({
      officeOpeningHoursPage,
      customerPage,
      widgetPage,
    }) => {
      const outsideWorkingHoursMessage = await officeOpeningHoursPage.outsideWorkingHoursMessage();

      await officeOpeningHoursPage.whileSettingsAre(OUTSIDE_WORKING_HOURS_WITHOUT_CONTACTS, async () => {
        await test.step('The customer asks for an operator', async () => {
          await customerPage.goto(URLS.customer);
          await widgetPage.openChat();
          await widgetPage.requestCsa();
        });

        await test.step('The widget shows the configured notice with Close and Continue', async () => {
          await widgetPage.expectCloseOrContinuePromptShown(outsideWorkingHoursMessage);
        });

        await test.step('Close shuts the chat window', async () => {
          await widgetPage.closePrompt();
          await widgetPage.expectChatWindowClosed();
        });
      });
    });

    test('Continue on the outside-working-hours prompt keeps the chat open', async ({
      officeOpeningHoursPage,
      customerPage,
      widgetPage,
    }) => {
      const outsideWorkingHoursMessage = await officeOpeningHoursPage.outsideWorkingHoursMessage();

      await officeOpeningHoursPage.whileSettingsAre(OUTSIDE_WORKING_HOURS_WITHOUT_CONTACTS, async () => {
        await test.step('The customer asks for an operator', async () => {
          await customerPage.goto(URLS.customer);
          await widgetPage.openChat();
          await widgetPage.requestCsa();
        });

        await test.step('The widget shows the configured notice with Close and Continue', async () => {
          await widgetPage.expectCloseOrContinuePromptShown(outsideWorkingHoursMessage);
        });

        await test.step('Continue drops the prompt and leaves the message box open', async () => {
          await widgetPage.continuePrompt();
          await widgetPage.expectChatContinuesAfterPrompt(outsideWorkingHoursMessage);
        });

        await test.step('The chat notes that the conversation goes on with the bot', async () => {
          await widgetPage.expectContinueConversationNoteShown();
        });
      });
    });
  },
);

test.describe(
  '[widget] [functional] The outside-working-hours contact form lets the customer skip it or leave valid contacts',
  { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/133/' } },
  () => {
    let pendingChatId: string | undefined;

    test.beforeEach(() => {
      pendingChatId = undefined;
    });

    test.afterEach(pendingChatCleanup(() => pendingChatId));

    test('Skip on the contact form closes the chat window', async ({
      officeOpeningHoursPage,
      customerPage,
      widgetPage,
    }) => {
      const outsideWorkingHoursMessage = await officeOpeningHoursPage.outsideWorkingHoursMessage();

      await officeOpeningHoursPage.whileSettingsAre(OUTSIDE_WORKING_HOURS_WITH_CONTACTS, async () => {
        await test.step('The customer asks for an operator', async () => {
          await customerPage.goto(URLS.customer);
          await widgetPage.openChat();
          await widgetPage.requestCsa();
        });

        await test.step('The widget shows the configured notice with the contact fields, Skip and Submit', async () => {
          await widgetPage.expectContactFormShown(outsideWorkingHoursMessage);
        });

        await test.step('Skip shuts the chat window', async () => {
          await widgetPage.skipContactForm();
          await widgetPage.expectChatWindowClosed();
        });
      });
    });

    test('Submit on the contact form checks the contacts and closes the chat once one is valid', async ({
      officeOpeningHoursPage,
      customerPage,
      widgetPage,
    }) => {
      const outsideWorkingHoursMessage = await officeOpeningHoursPage.outsideWorkingHoursMessage();

      await officeOpeningHoursPage.whileSettingsAre(OUTSIDE_WORKING_HOURS_WITH_CONTACTS, async () => {
        await test.step('The customer asks for an operator', async () => {
          await customerPage.goto(URLS.customer);
          await widgetPage.openChat();
          await widgetPage.requestCsa();
        });

        await test.step('The widget shows the configured notice with the contact fields, Skip and Submit', async () => {
          await widgetPage.expectContactFormShown(outsideWorkingHoursMessage);
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
          pendingChatId = await widgetPage.chatId();
          await widgetPage.submitContactForm({ email: createEmail() });
          await widgetPage.expectChatWindowClosed();
        });
      });
    });
  },
);
