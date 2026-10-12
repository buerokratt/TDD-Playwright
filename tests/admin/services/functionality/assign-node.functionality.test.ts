import { expect, test } from '@setup/test-setup';
import { URLS } from '@utils/env';
import { registerServiceCleanup } from '@utils/helpers';
import { createServiceName, createValidServiceData } from '@utils/test-data';

const serviceName = createServiceName('assignroundtrip');

const variableName = `marker${serviceName}`;
const variableValue = `value${serviceName}`;
const neverAuthoredVariable = `neverauthored${serviceName}`;

const assignNodeTitle = 'Assign - 1';

test.describe('[services] [functional] Assign node persists the variable it was configured with', () => {
  registerServiceCleanup(test, serviceName);

  test('Authored variable survives save and reload', async ({ page, newServicePage }) => {
    await page.goto(URLS.admin + 'services/newService');
    await newServicePage.waitForReady();

    await test.step('Create a service with a title', async () => {
      await newServicePage.setTitle(createValidServiceData({ title: serviceName }).title);
    });

    await test.step('Add an "Assign" node to the flow', async () => {
      await newServicePage.clickAddNodeAtEdgeIndex(0);
      await newServicePage.pickNodeTypeAndReturnToCanvas(newServicePage.pickerDefineBtn);
      await expect(newServicePage.getFlowNodeByTitle(assignNodeTitle)).toBeVisible();
    });

    await test.step('Author a variable in the node and save the service', async () => {
      await newServicePage.openNodeDialogByTitle(assignNodeTitle);
      await newServicePage.assignSetVariableAndSave(variableName, variableValue);

      await newServicePage.saveService();
      await expect(newServicePage.getFlowNodeByTitle(assignNodeTitle)).toBeVisible();
    });

    await test.step('Reload the page so nothing is served from in-memory state', async () => {
      await page.reload();
      await newServicePage.waitForReady();
      await expect(newServicePage.getFlowNodeByTitle(assignNodeTitle)).toBeVisible();
    });

    await test.step('The variable comes back exactly as authored, and nothing spurious does', async () => {
      await newServicePage.openNodeDialogByTitle(assignNodeTitle);

      await newServicePage.assertAssignVariableRow(0, variableName, variableValue);
      await expect(newServicePage.nodeEditorPopup).not.toContainText(neverAuthoredVariable);

      await newServicePage.closeNodeDialogWithoutSaving();
    });
  });
});
