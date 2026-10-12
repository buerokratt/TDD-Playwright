import { expect, test } from '@setup/test-setup';
import { URLS } from '@utils/env';
import { registerServiceCleanup } from '@utils/helpers';
import { createServiceName, createValidServiceData } from '@utils/test-data';

const serviceName = createServiceName('msgdelivery');

const deliveredMessage = `Delivered marker ${serviceName}`;
const neverAuthoredMessage = `Never authored ${serviceName}`;

test.describe('[services] [functional] Message node delivers authored text to the customer widget', () => {
  registerServiceCleanup(test, serviceName);

  test('Authored message node text is delivered in the TEST widget', async ({ page, newServicePage }) => {
    await page.goto(URLS.admin + 'services/newService');
    await newServicePage.waitForReady();

    await test.step('Create a service with a title', async () => {
      await newServicePage.setTitle(createValidServiceData({ title: serviceName }).title);
    });

    const messageNodeTitle = 'Send message to client - 1';

    await test.step('Add a "Send message to client" node to the flow', async () => {
      await newServicePage.clickAddNodeAtEdgeIndex(0);
      await newServicePage.pickNodeTypeAndReturnToCanvas(newServicePage.pickerMessageBtn);
      await expect(newServicePage.getFlowNodeByTitle(messageNodeTitle)).toBeVisible();
    });

    await test.step('Author the message text and save the node', async () => {
      await newServicePage.openNodeDialogByTitle(messageNodeTitle);
      await newServicePage.messageSetTextAndSave(deliveredMessage);
    });

    await test.step('Save the service and confirm the node persisted on the canvas', async () => {
      await newServicePage.saveService();
      await expect(newServicePage.getFlowNodeByTitle(messageNodeTitle)).toBeVisible();
    });

    await test.step('Open the TEST widget and start a conversation', async () => {
      await expect(newServicePage.widget).toBeVisible();
      await newServicePage.openWidget();
      await newServicePage.widgetSendText('test');
      await expect(newServicePage.widgetDialog.getByText('test', { exact: true })).toBeVisible();
    });

    await test.step('The authored message is delivered to the customer (and nothing spurious is)', async () => {
      await newServicePage.expectWidgetToContainText(deliveredMessage);
      await newServicePage.expectWidgetNotToContainText(neverAuthoredMessage);
    });
  });
});
