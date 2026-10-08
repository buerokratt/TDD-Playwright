import { expect, test } from '@setup/test-setup';
import { URLS } from '@utils/env';
import { getServicePages, registerServiceCleanup } from '@utils/helpers';
import { createServiceName, createValidServiceData } from '@utils/test-data';

const serviceName = createServiceName('assignroundtrip');

const variableName = `marker${serviceName}`;
const variableValue = `value${serviceName}`;
const neverAuthoredVariable = `neverauthored${serviceName}`;

const assignNodeTitle = 'Assign - 1';

test.describe('[services] [functional] Assign node persists the variable it was configured with', () => {
  registerServiceCleanup(test, serviceName);

  test('Authored variable survives save and reload', async ({ page }) => {
    const { nsp } = getServicePages(page);

    await page.goto(URLS.admin + 'services/newService');
    await nsp.waitForReady();

    await test.step('Create a service with a title', async () => {
      await nsp.setTitle(createValidServiceData({ title: serviceName }).title);
    });

    await test.step('Add an "Assign" node to the flow', async () => {
      await nsp.clickAddNodeAtEdgeIndex(0);
      await nsp.pickNodeTypeAndReturnToCanvas(nsp.pickerDefineBtn);
      await expect(nsp.getFlowNodeByTitle(assignNodeTitle)).toBeVisible();
    });

    await test.step('Author a variable in the node and save the service', async () => {
      await nsp.openNodeDialogByTitle(assignNodeTitle);
      await nsp.assignSetVariableAndSave(variableName, variableValue);

      await nsp.saveService();
      await expect(nsp.getFlowNodeByTitle(assignNodeTitle)).toBeVisible();
    });

    await test.step('Reload the page so nothing is served from in-memory state', async () => {
      await page.reload();
      await nsp.waitForReady();
      await expect(nsp.getFlowNodeByTitle(assignNodeTitle)).toBeVisible();
    });

    await test.step('The variable comes back exactly as authored, and nothing spurious does', async () => {
      await nsp.openNodeDialogByTitle(assignNodeTitle);

      await nsp.assertAssignVariableRow(0, variableName, variableValue);
      await expect(nsp.nodeEditorPopup).not.toContainText(neverAuthoredVariable);

      await nsp.closeNodeDialogWithoutSaving();
    });
  });
});
