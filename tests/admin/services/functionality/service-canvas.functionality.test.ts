import { expect, test } from '@setup/test-setup';
import { URLS } from '@utils/env';
import { registerServiceCleanup } from '@utils/helpers';
import { createServiceName, createValidServiceData } from '@utils/test-data';

const serviceName = createServiceName('canvas');

const assignNodeTitle = 'Assign - 1';
const messageNodeTitle = 'Send message to client - 1';

const neverAddedNodeTitle = 'Condition - 1';

test.describe('[services] [functional] The flow canvas stores the nodes it is given and drops the ones removed', () => {
  registerServiceCleanup(test, serviceName);

  test('Added nodes survive a reload and a deleted node stays deleted', async ({ page, newServicePage }) => {
    await test.step('Create a service and place two nodes on the canvas', async () => {
      await page.goto(URLS.admin + 'services/newService');
      await newServicePage.waitForReady();
      await newServicePage.setTitle(createValidServiceData({ title: serviceName }).title);

      await newServicePage.clickAddNodeAtEdgeIndex(0);
      await newServicePage.pickNodeTypeAndReturnToCanvas(newServicePage.pickerDefineBtn);
      await expect(newServicePage.getFlowNodeByTitle(assignNodeTitle)).toBeVisible();

      await newServicePage.clickAddNodeAtEdgeIndex(1);
      await newServicePage.pickNodeTypeAndReturnToCanvas(newServicePage.pickerMessageBtn);
      await expect(newServicePage.getFlowNodeByTitle(messageNodeTitle)).toBeVisible();

      await newServicePage.saveService();
    });

    await test.step('Both nodes come back after a full reload', async () => {
      await page.reload();
      await newServicePage.waitForReady();

      await expect(newServicePage.getFlowNodeByTitle(assignNodeTitle)).toBeVisible();
      await expect(newServicePage.getFlowNodeByTitle(messageNodeTitle)).toBeVisible();
      await expect(newServicePage.getFlowNodeByTitle(neverAddedNodeTitle)).toHaveCount(0);
    });

    await test.step('Remove one node and save the shortened flow', async () => {
      await newServicePage.deleteNodeByTitle(messageNodeTitle);
      await expect(newServicePage.getFlowNodeByTitle(assignNodeTitle)).toBeVisible();

      await newServicePage.saveService();
    });

    await test.step('The removed node is gone after a reload and the remaining one is untouched', async () => {
      await page.reload();
      await newServicePage.waitForReady();

      await expect(newServicePage.getFlowNodeByTitle(assignNodeTitle)).toBeVisible();
      await expect(newServicePage.getFlowNodeByTitle(messageNodeTitle)).toHaveCount(0);
      await expect(newServicePage.getFlowNodeByTitle(neverAddedNodeTitle)).toHaveCount(0);
    });
  });
});
