import { AdminPageFactory } from '@page-objects/admin-page-factory';
import { WidgetPage } from '@page-objects/widget';
import { test } from '@setup/test-setup';
import { ADMIN_AUTH_STATE } from '@utils/constants';
import { URLS } from '@utils/env';
import { seedEnglishLocale } from '@utils/helpers';
import { createChatMarker } from '@utils/test-data';

test('[e2e] [chats] A routed chat carries messages both ways between customer and operator', async ({ browser }) => {
  const customerMarker = createChatMarker('the customer wrote');
  const operatorMarker = createChatMarker('the operator wrote');
  const neverSentMarker = createChatMarker('nobody wrote');

  const customerContext = await browser.newContext();
  const csaContext = await browser.newContext({ storageState: ADMIN_AUTH_STATE });

  // The operator inherits English from the storage state auth.setup saved, but the customer
  // starts from a blank context, where the widget would default to Estonian.
  await seedEnglishLocale(customerContext);

  try {
    const cPage = await customerContext.newPage();
    const page = await csaContext.newPage();

    const csaPage = new AdminPageFactory(page);
    const customerPage = new WidgetPage(cPage);
    const unansweredChats = csaPage.getUnansweredChatsPage();
    const activeChats = csaPage.getActiveChatsPage();

    await test.step('The operator is present before the customer writes', async () => {
      await page.bringToFront();
      await csaPage.getPageHeader().ensureCsaPresent();
    });

    await test.step('The operator is watching the queue', async () => {
      await page.goto(URLS.admin + 'chat/unanswered');
    });

    // Each step raises the window it is about to act through. Both the widget and the queue
    // are told about new messages by a push, and a window Chrome treats as hidden receives
    // that push late or not at all — the chat then stays on screen as it was before.
    await test.step('The customer asks for an agent and gets routed', async () => {
      await cPage.bringToFront();
      await cPage.goto(URLS.customer);
      await customerPage.openChat();
      await customerPage.requestCsaChat(await csaPage.getOfficeOpeningHoursPage().noCsaAvailableMessage());
    });

    // The widget hides its message box while a question of the bot's is still unanswered, and
    // answering "yes" is exactly what it fails to notice about itself: the routing reaches the
    // server and the chat the queue, while the widget stays on the question with no way to
    // type. The operator takes the chat over first, and the customer writes once the widget
    // has been told an operator is on the other end.
    await test.step('The operator picks that very chat out of the queue', async () => {
      await page.bringToFront();
      await unansweredChats.takeOverChat(await customerPage.chatId());
      await activeChats.expectChatIsActive();
    });

    await test.step('The customer writes to the operator who took the chat', async () => {
      await cPage.bringToFront();
      await customerPage.sendMessage(customerMarker);

      await page.bringToFront();
      await activeChats.expectOperatorReceived(customerMarker);
    });

    await test.step('The operator answers and only that answer reaches the customer', async () => {
      await activeChats.replyAsOperator(operatorMarker);

      await cPage.bringToFront();
      await customerPage.expectMessageDelivered(operatorMarker);
      await customerPage.expectMessageNeverDelivered(neverSentMarker);
    });
  } finally {
    await Promise.all([customerContext.close(), csaContext.close()]);
  }
});

test('[e2e] [chats] The widget offers no operator while the CSA is unavailable', async ({ browser }) => {
  const csaContext = await browser.newContext({ storageState: ADMIN_AUTH_STATE });
  const customerContext = await browser.newContext();

  try {
    await seedEnglishLocale(customerContext);

    const officeHours = new AdminPageFactory(await csaContext.newPage()).getOfficeOpeningHoursPage();
    const botCannotAnswer = await officeHours.botCannotAnswerMessage();

    await officeHours.whileCsaUnavailable(async () => {
      const cPage = await customerContext.newPage();
      const customerPage = new WidgetPage(cPage);

      await cPage.goto(URLS.customer);
      await customerPage.openChat();
      await customerPage.expectNoOperatorOffered(botCannotAnswer);
    });
  } finally {
    await Promise.all([customerContext.close(), csaContext.close()]);
  }
});
