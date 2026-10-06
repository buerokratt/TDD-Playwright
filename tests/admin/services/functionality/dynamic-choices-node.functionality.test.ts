import { expect, test } from '@setup/test-setup';
import { URLS } from '@utils/env';
import { registerServiceCleanup } from '@utils/helpers';
import { createServiceName, createValidServiceData } from '@utils/test-data';

const serviceName = createServiceName('dynchoice');

const authoredValues = {
  'List': `list ${serviceName}`,
  'Service Name': `svc ${serviceName}`,
  'Key': `key ${serviceName}`,
  'Payload Keys': `payload ${serviceName}`,
};

const neverAuthored = `neverauthored ${serviceName}`;

const dynamicChoicesNodeTitle = 'Dynamic Choices - 1';

test.describe('[services] [functional] Dynamic Choices node persists the configuration it was given', () => {
  registerServiceCleanup(test, serviceName);

  test('Authored key/value mappings survive save and reload', async ({ page, newServicePage }) => {
    await page.goto(URLS.admin + 'services/newService');
    await newServicePage.waitForReady();

    await test.step('Create a service with a title', async () => {
      await newServicePage.setTitle(createValidServiceData({ title: serviceName }).title);
    });

    await test.step('Add a "Dynamic Choices" node to the flow', async () => {
      await newServicePage.clickAddNodeAtEdgeIndex(0);
      await newServicePage.pickNodeTypeAndReturnToCanvas(newServicePage.pickerDynamicChoiceBtn);
      await expect(newServicePage.getFlowNodeByTitle(dynamicChoicesNodeTitle)).toBeVisible();
    });

    await test.step('Author a value for every key and save the service', async () => {
      await newServicePage.openNodeDialogByTitle(dynamicChoicesNodeTitle);
      await newServicePage.dynamicChoicesSetValuesAndSave(authoredValues);

      await newServicePage.saveService();
      await expect(newServicePage.getFlowNodeByTitle(dynamicChoicesNodeTitle)).toBeVisible();
    });

    await test.step('Reload the page so nothing is served from in-memory state', async () => {
      await page.reload();
      await newServicePage.waitForReady();
      await expect(newServicePage.getFlowNodeByTitle(dynamicChoicesNodeTitle)).toBeVisible();
    });

    await test.step('Every mapping comes back exactly as authored, and nothing spurious does', async () => {
      await newServicePage.openNodeDialogByTitle(dynamicChoicesNodeTitle);

      await newServicePage.assertDynamicChoicesValues(authoredValues);
      await expect(newServicePage.nodeEditorPopup).not.toContainText(neverAuthored);

      await newServicePage.closeNodeDialogWithoutSaving();
    });
  });
});
