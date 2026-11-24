import { test } from '@setup/test-setup';
import { URLS } from '@utils/env';
import { createChatMarker } from '@utils/test-data';

test('[e2e] [chats] A routed chat carries messages both ways between customer and operator', async ({
  page,
  header,
  unansweredChatsPage,
  activeChatsPage,
  officeOpeningHoursPage,
  customerPage,
  widgetPage,
}) => {
  const customerMarker = createChatMarker('the customer wrote');
  const operatorMarker = createChatMarker('the operator wrote');
  const neverSentMarker = createChatMarker('nobody wrote');

  await test.step('The operator is present before the customer writes', async () => {
    await page.bringToFront();
    await header.ensureCsaPresent();
  });

  await test.step('The operator is watching the queue', async () => {
    await page.goto(URLS.admin + 'chat/unanswered');
  });

  // Each step raises the window it is about to act through. Both the widget and the queue
  // are told about new messages by a push, and a window Chrome treats as hidden receives
  // that push late or not at all — the chat then stays on screen as it was before.
  await test.step('The customer asks for an agent and gets routed', async () => {
    await customerPage.bringToFront();
    await customerPage.goto(URLS.customer);
    await widgetPage.openChat();
    await widgetPage.requestCsaChat(await officeOpeningHoursPage.noCsaAvailableMessage());
  });

  // The widget hides its message box while a question of the bot's is still unanswered, and
  // answering "yes" is exactly what it fails to notice about itself: the routing reaches the
  // server and the chat the queue, while the widget stays on the question with no way to
  // type. The operator takes the chat over first, and the customer writes once the widget
  // has been told an operator is on the other end.
  await test.step('The operator picks that very chat out of the queue', async () => {
    await page.bringToFront();
    await unansweredChatsPage.takeOverChat(await widgetPage.chatId());
    await activeChatsPage.expectChatIsActive();
  });

  await test.step('The customer writes to the operator who took the chat', async () => {
    await customerPage.bringToFront();
    await widgetPage.sendMessage(customerMarker);

    await page.bringToFront();
    await activeChatsPage.expectOperatorReceived(customerMarker);
  });

  await test.step('The operator answers and only that answer reaches the customer', async () => {
    await activeChatsPage.replyAsOperator(operatorMarker);

    await customerPage.bringToFront();
    await widgetPage.expectMessageDelivered(operatorMarker);
    await widgetPage.expectMessageNeverDelivered(neverSentMarker);
  });
});

test('[e2e] [chats] The widget offers no operator while the CSA is unavailable', async ({
  officeOpeningHoursPage,
  customerPage,
  widgetPage,
}) => {
  const botCannotAnswer = await officeOpeningHoursPage.botCannotAnswerMessage();

  await officeOpeningHoursPage.whileCsaUnavailable(async () => {
    await customerPage.goto(URLS.customer);
    await widgetPage.openChat();
    await widgetPage.expectNoOperatorOffered(botCannotAnswer);
  });
});
