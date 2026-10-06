import { expect, test } from '@setup/test-setup';
import { URLS } from '@utils/env';
import { registerServiceCleanup } from '@utils/helpers';
import { createServiceName, createValidServiceData } from '@utils/test-data';

const serviceName = createServiceName('clientmsgedit');

const firstMessage = `First marker ${serviceName}`;
const editedMessage = `Edited marker ${serviceName}`;

const messageNodeTitle = 'Send message to client - 1';

test.describe('[services] [functional] Editing a client message node changes what the customer receives', () => {
  registerServiceCleanup(test, serviceName);

  test('The customer receives exactly the text the node currently holds, and nothing when it is emptied', async ({
    page,
    newServicePage,
  }) => {
    await page.goto(URLS.admin + 'services/newService');
    await newServicePage.waitForReady();

    await test.step('Create a service with a title', async () => {
      await newServicePage.setTitle(createValidServiceData({ title: serviceName }).title);
    });

    await test.step('Add a "Send message to client" node and author the first text', async () => {
      await newServicePage.clickAddNodeAtEdgeIndex(0);
      await newServicePage.pickNodeTypeAndReturnToCanvas(newServicePage.pickerMessageBtn);
      await expect(newServicePage.getFlowNodeByTitle(messageNodeTitle)).toBeVisible();

      await newServicePage.openNodeDialogByTitle(messageNodeTitle);
      await newServicePage.messageSetTextAndSave(firstMessage);
      await newServicePage.saveService();
      await expect(newServicePage.getFlowNodeByTitle(messageNodeTitle)).toBeVisible();
    });

    await test.step('Baseline: the first text is delivered to the customer', async () => {
      await expect(newServicePage.widget).toBeVisible();
      await newServicePage.openWidget();
      await newServicePage.widgetSendText('test');
      await expect(newServicePage.widgetDialog.getByText('test', { exact: true })).toBeVisible();
      await newServicePage.expectWidgetToContainText(firstMessage);
    });

    await test.step('Re-author the node with new text and save', async () => {
      await page.reload();
      await newServicePage.waitForReady();

      await newServicePage.openNodeDialogByTitle(messageNodeTitle);
      await newServicePage.messageSetTextAndSave(editedMessage);
      await newServicePage.saveService();
      await expect(newServicePage.getFlowNodeByTitle(messageNodeTitle)).toBeVisible();
    });

    await test.step('The edited text is delivered and the original no longer is', async () => {
      await page.reload();
      await newServicePage.waitForReady();

      await expect(newServicePage.widget).toBeVisible();
      await newServicePage.openWidget();
      await newServicePage.widgetSendText('test');
      await expect(newServicePage.widgetDialog.getByText('test', { exact: true })).toBeVisible();

      await newServicePage.expectWidgetToContainText(editedMessage);
      await newServicePage.expectWidgetNotToContainText(firstMessage);
    });

    await test.step('Clearing the node text stops the message from being delivered at all', async () => {
      await page.reload();
      await newServicePage.waitForReady();

      await newServicePage.openNodeDialogByTitle(messageNodeTitle);
      await newServicePage.messageClearTextAndSave();
      await newServicePage.saveService();

      await page.reload();
      await newServicePage.waitForReady();

      await expect(newServicePage.widget).toBeVisible();
      await newServicePage.openWidget();
      await newServicePage.widgetSendText('test');
      await expect(newServicePage.widgetDialog.getByText('test', { exact: true })).toBeVisible();

      await newServicePage.expectWidgetNotToContainText(editedMessage);
      await newServicePage.expectWidgetNotToContainText(firstMessage);
    });
  });
});
