import { expect, test } from '@setup/test-setup';
import { URLS } from '@utils/env';
import { getServicePages, registerServiceCleanup } from '@utils/helpers';
import { createServiceName, createValidServiceData } from '@utils/test-data';

const serviceName = createServiceName('clientmessage');

const variableName = 'greeting';
const variableValue = `Hello ${serviceName}`;

const authoredMessage = `{${variableName}} from ${serviceName}`;
const interpolatedMessage = `${variableValue} from ${serviceName}`;
const neverAuthoredMessage = `Never authored ${serviceName}`;

test.describe('[services] [functional] Message text reaches the customer exactly as authored', () => {
  registerServiceCleanup(test, serviceName);

  test('A {variable} placeholder is delivered literally and is not resolved by the widget', async ({ page }) => {
    const { nsp } = getServicePages(page);

    await page.goto(URLS.admin + 'services/newService');
    await nsp.waitForReady();

    await test.step('Create a service with a title', async () => {
      await nsp.setTitle(createValidServiceData({ title: serviceName }).title);
    });

    const assignNodeTitle = 'Assign - 1';
    const messageNodeTitle = 'Send message to client - 1';

    await test.step(`Define the "${variableName}" variable in an Assign node`, async () => {
      await nsp.clickAddNodeAtEdgeIndex(0);
      await nsp.pickNodeTypeAndReturnToCanvas(nsp.pickerDefineBtn);
      await expect(nsp.getFlowNodeByTitle(assignNodeTitle)).toBeVisible();

      await nsp.openNodeDialogByTitle(assignNodeTitle);
      await nsp.assignSetVariableAndSave(variableName, variableValue);
    });

    await test.step('Author a message that references the variable as a placeholder', async () => {
      await nsp.clickAddNodeOnLastEdge();
      await nsp.pickNodeTypeAndReturnToCanvas(nsp.pickerMessageBtn);
      await expect(nsp.getFlowNodeByTitle(messageNodeTitle)).toBeVisible();

      await nsp.openNodeDialogByTitle(messageNodeTitle);
      await nsp.messageSetTextAndSave(authoredMessage);
    });

    await test.step('Save the service and confirm both nodes persisted on the canvas', async () => {
      await nsp.saveService();
      await expect(nsp.getFlowNodeByTitle(assignNodeTitle)).toBeVisible();
      await expect(nsp.getFlowNodeByTitle(messageNodeTitle)).toBeVisible();
    });

    await test.step('Open the TEST widget and start a conversation', async () => {
      await expect(nsp.widget).toBeVisible();
      await nsp.openWidget();
      await nsp.widgetSendText('test');
      await expect(nsp.widgetDialog.getByText('test', { exact: true })).toBeVisible();
    });

    await test.step('The customer receives the authored text verbatim, with the placeholder unresolved', async () => {
      await nsp.expectWidgetToContainText(authoredMessage);
      await nsp.expectWidgetNotToContainText(interpolatedMessage);
      await nsp.expectWidgetNotToContainText(neverAuthoredMessage);
    });
  });
});
