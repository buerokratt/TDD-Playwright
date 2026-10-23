import { test } from '@setup/test-setup';
import { URLS } from '@utils/env';
import { readCustomerWidgetName } from '@utils/helpers';
import { AnonymizerSettings } from '@utils/interfaces';
import { createAnonymizerEmail } from '@utils/test-data';

test(
  '[e2e] [chats] Anonymous recording anonymizes customer messages in the chat log',
  { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/177/' } },
  async ({ page, anonymizerPage, historyPage, customerPage, widgetPage }) => {
    const customerEmail = createAnonymizerEmail('mari.tamm.');
    const customerMessage = `Write to me at ${customerEmail}`;

    await anonymizerPage.open();
    await anonymizerPage.selectDomain(await readCustomerWidgetName(page));

    await anonymizerPage.withSettingsRestored(async () => {
      const settings: AnonymizerSettings = {
        approach: 'Replace',
        entities: ['EMAIL_ADDRESS'],
        allowlist: [],
        denylist: [],
        anonymizationBeforeLlm: false,
        recordAnonymously: true,
      };

      await test.step('The domain records its conversations anonymously, replacing e-mail addresses', async () => {
        await anonymizerPage.applySettings(settings);
        await anonymizerPage.saveSettings();
        await anonymizerPage.assertSaveWasConfirmed();
      });

      const { greeting, chatId } =
        await test.step('The customer writes their e-mail address to the bot and sees it as they typed it', async () => {
          await customerPage.goto(URLS.customer);
          await widgetPage.openChat();

          const greeting = await widgetPage.botGreeting();

          await widgetPage.sendMessage(customerMessage);

          return { greeting, chatId: await widgetPage.chatId() };
        });

      await test.step('The customer ends the conversation', async () => {
        await widgetPage.endChatWithoutAnswerAndSkipFeedback();
      });

      await test.step('The operator finds that very conversation in the chat log', async () => {
        await page.bringToFront();
        await historyPage.openConversation(chatId);
      });

      await test.step('The log holds the address the customer typed as an anonymized value', async () => {
        await historyPage.expectCustomerMessagesAnonymized({ hidden: [customerEmail], kept: ['[EMAIL_ADDRESS]'] });
      });

      await test.step('The log holds what the bot said exactly as the customer saw it', async () => {
        await historyPage.expectBotMessage(greeting);
      });
    });
  },
);
