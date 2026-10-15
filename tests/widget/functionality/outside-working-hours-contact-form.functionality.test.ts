import { BrowserContext } from '@playwright/test';

import { AdminPageFactory } from '@page-objects/admin-page-factory';
import { OfficeOpeningHoursPage } from '@page-objects/settings';
import { WidgetPage } from '@page-objects/widget';
import { test } from '@setup/test-setup';
import {
  ADMIN_AUTH_STATE,
  MALFORMED_CONTACT_EMAIL,
  MALFORMED_CONTACT_PHONE,
  OUTSIDE_WORKING_HOURS_WITH_CONTACTS,
} from '@utils/constants';
import { URLS } from '@utils/env';
import { seedEnglishLocale } from '@utils/helpers';
import { createContactEmail } from '@utils/test-data';

test.describe('[widget] [functional] The outside-working-hours contact form lets the customer skip it or leave valid contacts', () => {
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
    'Skip on the contact form closes the chat window',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/133/' } },
    async () => {
      const outsideHours = await officeHours.outsideWorkingHoursMessage();

      await officeHours.whileSettingsAre(OUTSIDE_WORKING_HOURS_WITH_CONTACTS, async () => {
        const cPage = await customerContext.newPage();
        const customerPage = new WidgetPage(cPage);

        await test.step('The customer asks for an operator', async () => {
          await cPage.goto(URLS.customer);
          await customerPage.openChat();
          await customerPage.askForOperator();
        });

        await test.step('The widget shows the configured outside-hours notice with the contact fields, Skip and Submit', async () => {
          await customerPage.expectContactFormShown(outsideHours);
        });

        await test.step('Skip shuts the chat window', async () => {
          await customerPage.skipContactForm();
          await customerPage.expectChatWindowClosed();
        });
      });
    },
  );

  test(
    'Submit on the contact form checks the contacts and closes the chat once one is valid',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/133/' } },
    async () => {
      const outsideHours = await officeHours.outsideWorkingHoursMessage();

      await officeHours.whileSettingsAre(OUTSIDE_WORKING_HOURS_WITH_CONTACTS, async () => {
        const cPage = await customerContext.newPage();
        const customerPage = new WidgetPage(cPage);

        await test.step('The customer asks for an operator', async () => {
          await cPage.goto(URLS.customer);
          await customerPage.openChat();
          await customerPage.askForOperator();
        });

        await test.step('The widget shows the configured outside-hours notice with the contact fields, Skip and Submit', async () => {
          await customerPage.expectContactFormShown(outsideHours);
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
    },
  );
});
