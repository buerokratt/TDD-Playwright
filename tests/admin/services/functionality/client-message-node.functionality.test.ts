import { expect, test } from '@setup/test-setup';
import { URLS } from '@utils/env';
import { getServicePages, registerServiceCleanup } from '@utils/helpers';
import { createServiceName, createValidServiceData } from '@utils/test-data';

const serviceName = createServiceName('clientmsgedit');

const firstMessage = `First marker ${serviceName}`;
const editedMessage = `Edited marker ${serviceName}`;

const messageNodeTitle = 'Send message to client - 1';

test.describe('[services] [functional] Editing a client message node changes what the customer receives', () => {
  registerServiceCleanup(test, serviceName);

  test('The customer receives exactly the text the node currently holds, and nothing when it is emptied', async ({
    page,
  }) => {
    const { nsp } = getServicePages(page);

    await page.goto(URLS.admin + 'services/newService');
    await nsp.waitForReady();

    await test.step('Create a service with a title', async () => {
      await nsp.setTitle(createValidServiceData({ title: serviceName }).title);
    });

    await test.step('Add a "Send message to client" node and author the first text', async () => {
      await nsp.clickAddNodeAtEdgeIndex(0);
      await nsp.pickNodeTypeAndReturnToCanvas(nsp.pickerMessageBtn);
      await expect(nsp.getFlowNodeByTitle(messageNodeTitle)).toBeVisible();

      await nsp.openNodeDialogByTitle(messageNodeTitle);
      await nsp.messageSetTextAndSave(firstMessage);
      await nsp.saveService();
      await expect(nsp.getFlowNodeByTitle(messageNodeTitle)).toBeVisible();
    });

    await test.step('Baseline: the first text is delivered to the customer', async () => {
      await expect(nsp.widget).toBeVisible();
      await nsp.openWidget();
      await nsp.widgetSendText('test');
      await expect(nsp.widgetDialog.getByText('test', { exact: true })).toBeVisible();
      await nsp.expectWidgetToContainText(firstMessage);
    });

    await test.step('Re-author the node with new text and save', async () => {
      await page.reload();
      await nsp.waitForReady();

      await nsp.openNodeDialogByTitle(messageNodeTitle);
      await nsp.messageSetTextAndSave(editedMessage);
      await nsp.saveService();
      await expect(nsp.getFlowNodeByTitle(messageNodeTitle)).toBeVisible();
    });

    await test.step('The edited text is delivered and the original no longer is', async () => {
      await page.reload();
      await nsp.waitForReady();

      await expect(nsp.widget).toBeVisible();
      await nsp.openWidget();
      await nsp.widgetSendText('test');
      await expect(nsp.widgetDialog.getByText('test', { exact: true })).toBeVisible();

      await nsp.expectWidgetToContainText(editedMessage);
      await nsp.expectWidgetNotToContainText(firstMessage);
    });

    await test.step('Clearing the node text stops the message from being delivered at all', async () => {
      await page.reload();
      await nsp.waitForReady();

      await nsp.openNodeDialogByTitle(messageNodeTitle);
      await nsp.messageClearTextAndSave();
      await nsp.saveService();

      await page.reload();
      await nsp.waitForReady();

      await expect(nsp.widget).toBeVisible();
      await nsp.openWidget();
      await nsp.widgetSendText('test');
      await expect(nsp.widgetDialog.getByText('test', { exact: true })).toBeVisible();

      await nsp.expectWidgetNotToContainText(editedMessage);
      await nsp.expectWidgetNotToContainText(firstMessage);
    });
  });
});
