import { AdminPageFactory } from '@page-objects/admin-page-factory';
import { WidgetPage } from '@page-objects/widget';
import { test } from '@setup/test-setup';
import { ADMIN_AUTH_STATE } from '@utils/constants';
import { URLS } from '@utils/env';
import { seedEnglishLocale } from '@utils/helpers';
import { AnonymizerSettings } from '@utils/interfaces';
import { createAnonymizerEmail } from '@utils/test-data';

test(
  '[e2e] [chats] A conversation recorded anonymously reaches the chat log without what the customer typed',
  { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/177/' } },
  async ({ browser }) => {
    const customerEmail = createAnonymizerEmail('mari.tamm.');
    const customerMessage = `Write to me at ${customerEmail}`;

    const csaContext = await browser.newContext({ storageState: ADMIN_AUTH_STATE });
    const customerContext = await browser.newContext();

    await seedEnglishLocale(customerContext);

    try {
      const page = await csaContext.newPage();
      const admin = new AdminPageFactory(page);
      const anonymizer = admin.getAnonymizerPage();
      const history = admin.getHistoryPage();

      await anonymizer.open();

      await anonymizer.withSettingsRestored(async () => {
        const settings: AnonymizerSettings = {
          approach: 'Replace',
          entities: ['EMAIL_ADDRESS'],
          allowlist: [],
          denylist: [],
          anonymizationBeforeLlm: false,
          recordAnonymously: true,
        };

        await test.step('The domain records its conversations anonymously, replacing e-mail addresses', async () => {
          await anonymizer.applySettings(settings);
          await anonymizer.saveSettings();
          await anonymizer.assertSaveWasConfirmed();
        });

        const cPage = await customerContext.newPage();
        const customer = new WidgetPage(cPage);

        let greeting = '';
        let chatId = '';

        await test.step('The customer writes their e-mail address to the bot and sees it as they typed it', async () => {
          await cPage.goto(URLS.customer);
          await customer.openChat();

          greeting = await customer.botGreeting();

          await customer.sendMessage(customerMessage);
          chatId = await customer.chatId();
        });

        await test.step('The customer ends the conversation', async () => {
          await customer.closeChat();
        });

        await test.step('The operator finds that very conversation in the chat log', async () => {
          await page.bringToFront();
          await history.openChat(chatId);
        });

        await test.step('The log holds the address the customer typed as an anonymized value', async () => {
          await history.expectCustomerMessagesAnonymize({ hidden: [customerEmail], kept: ['[EMAIL_ADDRESS]'] });
        });

        await test.step('The log holds what the bot said exactly as the customer saw it', async () => {
          await history.expectBotMessage(greeting);
        });
      });
    } finally {
      await customerContext.close();
      await csaContext.close();
    }
  },
);
