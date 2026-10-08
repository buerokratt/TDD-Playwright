import { expect, test } from '@setup/test-setup';
import { URLS } from '@utils/env';
import { registerServiceCleanup } from '@utils/helpers';
import { createServiceName, createValidServiceData } from '@utils/test-data';

const conditionNodeTitle = 'Condition - 1';
const successNodeTitle = 'Send message to client - 1';
const failureNodeTitle = 'Send message to client - 2';

const scenarios = [
  {
    rule: 'always-true',
    takenBranch: 'Success',
    serviceName: createServiceName('conditiontrue'),
  },
  {
    rule: 'always-false',
    takenBranch: 'Failure',
    serviceName: createServiceName('conditionfalse'),
  },
] as const;

test.describe('[services] [functional] Condition node routes the conversation down the branch its rule selects', () => {
  registerServiceCleanup(
    test,
    scenarios.map((scenario) => scenario.serviceName),
  );

  for (const { rule, takenBranch, serviceName } of scenarios) {
    const successMessage = `success branch ${serviceName}`;
    const failureMessage = `failure branch ${serviceName}`;
    const neverAuthored = `neverauthored ${serviceName}`;

    const leftOperand = `lit${serviceName}`;
    const rightOperand = rule === 'always-true' ? leftOperand : `other${serviceName}`;

    const deliveredMessage = takenBranch === 'Success' ? successMessage : failureMessage;
    const skippedMessage = takenBranch === 'Success' ? failureMessage : successMessage;

    test(`An ${rule} rule delivers the ${takenBranch} branch and no other`, async ({ page, newServicePage }) => {
      await page.goto(URLS.admin + 'services/newService');
      await newServicePage.waitForReady();

      await test.step('Create a service with a title', async () => {
        await newServicePage.setTitle(createValidServiceData({ title: serviceName }).title);
      });

      await test.step('Add a "Condition" node to the flow', async () => {
        await newServicePage.clickAddNodeAtEdgeIndex(0);
        await newServicePage.pickNodeTypeAndReturnToCanvas(newServicePage.pickerConditionBtn);
        await expect(newServicePage.getFlowNodeByTitle(conditionNodeTitle)).toBeVisible();
      });

      await test.step(`Author an ${rule} rule and save the condition node`, async () => {
        await newServicePage.openNodeDialogByTitle(conditionNodeTitle);
        await newServicePage.conditionAddLiteralRule(leftOperand, '==', rightOperand);
        await newServicePage.conditionSaveNode();
      });

      await test.step('Wire a distinct message onto each branch', async () => {
        await newServicePage.addMessageOnConditionBranch('Success', successNodeTitle, successMessage);
        await newServicePage.addMessageOnConditionBranch('Failure', failureNodeTitle, failureMessage);
      });

      await test.step('Save the service and confirm both branch nodes persisted', async () => {
        await newServicePage.saveService();
        await expect(newServicePage.getFlowNodeByTitle(successNodeTitle)).toBeVisible();
        await expect(newServicePage.getFlowNodeByTitle(failureNodeTitle)).toBeVisible();
      });

      await test.step('Open the TEST widget and start a conversation', async () => {
        await expect(newServicePage.widget).toBeVisible();
        await newServicePage.openWidget();
        await newServicePage.widgetSendText('test');
        await expect(newServicePage.widgetDialog.getByText('test', { exact: true })).toBeVisible();
      });

      await test.step(`The ${takenBranch} branch is delivered and the other one is not`, async () => {
        await newServicePage.expectWidgetToContainText(deliveredMessage);
        await newServicePage.expectWidgetNotToContainText(skippedMessage);
        await newServicePage.expectWidgetNotToContainText(neverAuthored);
      });
    });
  }
});
