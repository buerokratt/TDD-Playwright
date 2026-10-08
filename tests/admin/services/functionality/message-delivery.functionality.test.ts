import { expect, test } from '@setup/test-setup';
import { URLS } from '@utils/env';
import { getServicePages, registerServiceCleanup } from '@utils/helpers';
import { createServiceName, createValidServiceData } from '@utils/test-data';

const serviceName = createServiceName('msgdelivery');

const deliveredMessage = `Delivered marker ${serviceName}`;
const neverAuthoredMessage = `Never authored ${serviceName}`;

test.describe('[services] [functional] Message node delivers authored text to the customer widget', () => {
  registerServiceCleanup(test, serviceName);

  test('Authored message node text is delivered in the TEST widget', async ({ page }) => {
    const { nsp } = getServicePages(page);

    await page.goto(URLS.admin + 'services/newService');
    await nsp.waitForReady();

    await test.step('Create a service with a title', async () => {
      await nsp.setTitle(createValidServiceData({ title: serviceName }).title);
    });

    const messageNodeTitle = 'Send message to client - 1';

    await test.step('Add a "Send message to client" node to the flow', async () => {
      await nsp.clickAddNodeAtEdgeIndex(0);
      await nsp.pickNodeTypeAndReturnToCanvas(nsp.pickerMessageBtn);
      await expect(nsp.getFlowNodeByTitle(messageNodeTitle)).toBeVisible();
    });

    await test.step('Author the message text and save the node', async () => {
      await nsp.openNodeDialogByTitle(messageNodeTitle);
      await nsp.messageSetTextAndSave(deliveredMessage);
    });

    await test.step('Save the service and confirm the node persisted on the canvas', async () => {
      await nsp.saveService();
      await expect(nsp.getFlowNodeByTitle(messageNodeTitle)).toBeVisible();
    });

    await test.step('Open the TEST widget and start a conversation', async () => {
      await expect(nsp.widget).toBeVisible();
      await nsp.openWidget();
      await nsp.widgetSendText('test');
      await expect(nsp.widgetDialog.getByText('test', { exact: true })).toBeVisible();
    });

    await test.step('The authored message is delivered to the customer (and nothing spurious is)', async () => {
      await nsp.expectWidgetToContainText(deliveredMessage);
      await nsp.expectWidgetNotToContainText(neverAuthoredMessage);
    });
  });
});
