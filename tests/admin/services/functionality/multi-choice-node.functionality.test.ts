import { expect, test } from '@setup/test-setup';
import { URLS } from '@utils/env';
import { getServicePages, registerServiceCleanup } from '@utils/helpers';
import { createServiceName, createValidServiceData } from '@utils/test-data';

const serviceName = createServiceName('multichoice');

const questionText = `Pick one ${serviceName}`;
const optionLabel = `option ${serviceName}`;
const neverAuthored = `neverauthored ${serviceName}`;

const renamedAwayDefault = 'Jah';

const multichoiceNodeTitle = 'Multi-choice question - 1';

test.describe('[services] [functional] Multi-choice node presents its authored question and options to the customer', () => {
  registerServiceCleanup(test, serviceName);

  test('Authored question and renamed option are delivered as widget buttons', async ({ page }) => {
    const { nsp } = getServicePages(page);

    await page.goto(URLS.admin + 'services/newService');
    await nsp.waitForReady();

    await test.step('Create a service with a title', async () => {
      await nsp.setTitle(createValidServiceData({ title: serviceName }).title);
    });

    await test.step('Add a "Multi-choice question" node to the flow', async () => {
      await nsp.clickAddNodeAtEdgeIndex(0);
      await nsp.pickNodeTypeAndReturnToCanvas(nsp.pickerMultichoiceBtn);
      await expect(nsp.getFlowNodeByTitle(multichoiceNodeTitle)).toBeVisible();
    });

    await test.step('Author the question and rename the first option, then save', async () => {
      await nsp.openNodeDialogByTitle(multichoiceNodeTitle);
      await nsp.multichoiceSetQuestionAndRenameOption(questionText, 0, optionLabel);

      await nsp.saveService();
      await expect(nsp.getFlowNodeByTitle(multichoiceNodeTitle)).toBeVisible();
    });

    await test.step('Open the TEST widget and start a conversation', async () => {
      await expect(nsp.widget).toBeVisible();
      await nsp.openWidget();
      await nsp.widgetSendText('test');
      await expect(nsp.widgetDialog.getByText('test', { exact: true })).toBeVisible();
    });

    await test.step('The question is delivered and the renamed option is an actual button', async () => {
      await nsp.expectWidgetToContainText(questionText);
      await expect(nsp.widgetDialog.getByRole('button', { name: optionLabel, exact: true })).toBeVisible();
    });

    await test.step('The renamed-away default and a never-authored string are absent', async () => {
      await expect(nsp.widgetDialog.getByRole('button', { name: renamedAwayDefault, exact: true })).toHaveCount(0);
      await nsp.expectWidgetNotToContainText(neverAuthored);
    });
  });
});
