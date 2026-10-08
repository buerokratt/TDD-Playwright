import { expect, test } from '@setup/test-setup';
import { URLS } from '@utils/env';
import { getServicePages, registerServiceCleanup } from '@utils/helpers';
import { createServiceName, createValidServiceData } from '@utils/test-data';

const serviceName = createServiceName('canvas');

const assignNodeTitle = 'Assign - 1';
const messageNodeTitle = 'Send message to client - 1';

const neverAddedNodeTitle = 'Condition - 1';

test.describe('[services] [functional] The flow canvas stores the nodes it is given and drops the ones removed', () => {
  registerServiceCleanup(test, serviceName);

  test('Added nodes survive a reload and a deleted node stays deleted', async ({ page }) => {
    const { nsp } = getServicePages(page);

    await test.step('Create a service and place two nodes on the canvas', async () => {
      await page.goto(URLS.admin + 'services/newService');
      await nsp.waitForReady();
      await nsp.setTitle(createValidServiceData({ title: serviceName }).title);

      await nsp.clickAddNodeAtEdgeIndex(0);
      await nsp.pickNodeTypeAndReturnToCanvas(nsp.pickerDefineBtn);
      await expect(nsp.getFlowNodeByTitle(assignNodeTitle)).toBeVisible();

      await nsp.clickAddNodeAtEdgeIndex(1);
      await nsp.pickNodeTypeAndReturnToCanvas(nsp.pickerMessageBtn);
      await expect(nsp.getFlowNodeByTitle(messageNodeTitle)).toBeVisible();

      await nsp.saveService();
    });

    await test.step('Both nodes come back after a full reload', async () => {
      await page.reload();
      await nsp.waitForReady();

      await expect(nsp.getFlowNodeByTitle(assignNodeTitle)).toBeVisible();
      await expect(nsp.getFlowNodeByTitle(messageNodeTitle)).toBeVisible();
      await expect(nsp.getFlowNodeByTitle(neverAddedNodeTitle)).toHaveCount(0);
    });

    await test.step('Remove one node and save the shortened flow', async () => {
      await nsp.deleteNodeByTitle(messageNodeTitle);
      await expect(nsp.getFlowNodeByTitle(assignNodeTitle)).toBeVisible();

      await nsp.saveService();
    });

    await test.step('The removed node is gone after a reload and the remaining one is untouched', async () => {
      await page.reload();
      await nsp.waitForReady();

      await expect(nsp.getFlowNodeByTitle(assignNodeTitle)).toBeVisible();
      await expect(nsp.getFlowNodeByTitle(messageNodeTitle)).toHaveCount(0);
      await expect(nsp.getFlowNodeByTitle(neverAddedNodeTitle)).toHaveCount(0);
    });
  });
});
