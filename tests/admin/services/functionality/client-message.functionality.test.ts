import { expect, test } from '@setup/test-setup';
import { URLS } from '@utils/env';
import { registerServiceCleanup } from '@utils/helpers';
import { createServiceName, createValidServiceData } from '@utils/test-data';

const serviceName = createServiceName('clientmessage');

const variableName = 'greeting';
const variableValue = `Hello ${serviceName}`;

const authoredMessage = `{${variableName}} from ${serviceName}`;
const interpolatedMessage = `${variableValue} from ${serviceName}`;
const neverAuthoredMessage = `Never authored ${serviceName}`;

test.describe('[services] [functional] Message text reaches the customer exactly as authored', () => {
  registerServiceCleanup(test, serviceName);

  test('A {variable} placeholder is delivered literally and is not resolved by the widget', async ({
    page,
    newServicePage,
  }) => {
    await page.goto(URLS.admin + 'services/newService');
    await newServicePage.waitForReady();

    await test.step('Create a service with a title', async () => {
      await newServicePage.setTitle(createValidServiceData({ title: serviceName }).title);
    });

    const assignNodeTitle = 'Assign - 1';
    const messageNodeTitle = 'Send message to client - 1';

    await test.step(`Define the "${variableName}" variable in an Assign node`, async () => {
      await newServicePage.clickAddNodeAtEdgeIndex(0);
      await newServicePage.pickNodeTypeAndReturnToCanvas(newServicePage.pickerDefineBtn);
      await expect(newServicePage.getFlowNodeByTitle(assignNodeTitle)).toBeVisible();

      await newServicePage.openNodeDialogByTitle(assignNodeTitle);
      await newServicePage.assignSetVariableAndSave(variableName, variableValue);
    });

    await test.step('Author a message that references the variable as a placeholder', async () => {
      await newServicePage.clickAddNodeOnLastEdge();
      await newServicePage.pickNodeTypeAndReturnToCanvas(newServicePage.pickerMessageBtn);
      await expect(newServicePage.getFlowNodeByTitle(messageNodeTitle)).toBeVisible();

      await newServicePage.openNodeDialogByTitle(messageNodeTitle);
      await newServicePage.messageSetTextAndSave(authoredMessage);
    });

    await test.step('Save the service and confirm both nodes persisted on the canvas', async () => {
      await newServicePage.saveService();
      await expect(newServicePage.getFlowNodeByTitle(assignNodeTitle)).toBeVisible();
      await expect(newServicePage.getFlowNodeByTitle(messageNodeTitle)).toBeVisible();
    });

    await test.step('Open the TEST widget and start a conversation', async () => {
      await expect(newServicePage.widget).toBeVisible();
      await newServicePage.openWidget();
      await newServicePage.widgetSendText('test');
      await expect(newServicePage.widgetDialog.getByText('test', { exact: true })).toBeVisible();
    });

    await test.step('The customer receives the authored text verbatim, with the placeholder unresolved', async () => {
      await newServicePage.expectWidgetToContainText(authoredMessage);
      await newServicePage.expectWidgetNotToContainText(interpolatedMessage);
      await newServicePage.expectWidgetNotToContainText(neverAuthoredMessage);
    });
  });
});
