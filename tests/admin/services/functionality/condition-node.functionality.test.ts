import { expect, test } from '@setup/test-setup';
import { URLS } from '@utils/env';
import { getServicePages, registerServiceCleanup } from '@utils/helpers';
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

    test(`An ${rule} rule delivers the ${takenBranch} branch and no other`, async ({ page }) => {
      const { nsp } = getServicePages(page);

      await page.goto(URLS.admin + 'services/newService');
      await nsp.waitForReady();

      await test.step('Create a service with a title', async () => {
        await nsp.setTitle(createValidServiceData({ title: serviceName }).title);
      });

      await test.step('Add a "Condition" node to the flow', async () => {
        await nsp.clickAddNodeAtEdgeIndex(0);
        await nsp.pickNodeTypeAndReturnToCanvas(nsp.pickerConditionBtn);
        await expect(nsp.getFlowNodeByTitle(conditionNodeTitle)).toBeVisible();
      });

      await test.step(`Author an ${rule} rule and save the condition node`, async () => {
        await nsp.openNodeDialogByTitle(conditionNodeTitle);
        await nsp.conditionAddLiteralRule(leftOperand, '==', rightOperand);
        await nsp.conditionSaveNode();
      });

      await test.step('Wire a distinct message onto each branch', async () => {
        await nsp.addMessageOnConditionBranch('Success', successNodeTitle, successMessage);
        await nsp.addMessageOnConditionBranch('Failure', failureNodeTitle, failureMessage);
      });

      await test.step('Save the service and confirm both branch nodes persisted', async () => {
        await nsp.saveService();
        await expect(nsp.getFlowNodeByTitle(successNodeTitle)).toBeVisible();
        await expect(nsp.getFlowNodeByTitle(failureNodeTitle)).toBeVisible();
      });

      await test.step('Open the TEST widget and start a conversation', async () => {
        await expect(nsp.widget).toBeVisible();
        await nsp.openWidget();
        await nsp.widgetSendText('test');
        await expect(nsp.widgetDialog.getByText('test', { exact: true })).toBeVisible();
      });

      await test.step(`The ${takenBranch} branch is delivered and the other one is not`, async () => {
        await nsp.expectWidgetToContainText(deliveredMessage);
        await nsp.expectWidgetNotToContainText(skippedMessage);
        await nsp.expectWidgetNotToContainText(neverAuthored);
      });
    });
  }
});
