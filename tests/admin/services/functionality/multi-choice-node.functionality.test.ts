import { expect, test } from '@setup/test-setup';
import { URLS } from '@utils/env';
import { registerServiceCleanup } from '@utils/helpers';
import { createServiceName, createValidServiceData } from '@utils/test-data';

const serviceName = createServiceName('multichoice');

const questionText = `Pick one ${serviceName}`;
const optionLabel = `option ${serviceName}`;
const neverAuthored = `neverauthored ${serviceName}`;

const renamedAwayDefault = 'Jah';

const multichoiceNodeTitle = 'Multi-choice question - 1';

test.describe('[services] [functional] Multi-choice node presents its authored question and options to the customer', () => {
  registerServiceCleanup(test, serviceName);

  test('Authored question and renamed option are delivered as widget buttons', async ({ page, newServicePage }) => {
    await page.goto(URLS.admin + 'services/newService');
    await newServicePage.waitForReady();

    await test.step('Create a service with a title', async () => {
      await newServicePage.setTitle(createValidServiceData({ title: serviceName }).title);
    });

    await test.step('Add a "Multi-choice question" node to the flow', async () => {
      await newServicePage.clickAddNodeAtEdgeIndex(0);
      await newServicePage.pickNodeTypeAndReturnToCanvas(newServicePage.pickerMultichoiceBtn);
      await expect(newServicePage.getFlowNodeByTitle(multichoiceNodeTitle)).toBeVisible();
    });

    await test.step('Author the question and rename the first option, then save', async () => {
      await newServicePage.openNodeDialogByTitle(multichoiceNodeTitle);
      await newServicePage.multichoiceSetQuestionAndRenameOption(questionText, 0, optionLabel);

      await newServicePage.saveService();
      await expect(newServicePage.getFlowNodeByTitle(multichoiceNodeTitle)).toBeVisible();
    });

    await test.step('Open the TEST widget and start a conversation', async () => {
      await expect(newServicePage.widget).toBeVisible();
      await newServicePage.openWidget();
      await newServicePage.widgetSendText('test');
      await expect(newServicePage.widgetDialog.getByText('test', { exact: true })).toBeVisible();
    });

    await test.step('The question is delivered and the renamed option is an actual button', async () => {
      await newServicePage.expectWidgetToContainText(questionText);
      await expect(newServicePage.widgetDialog.getByRole('button', { name: optionLabel, exact: true })).toBeVisible();
    });

    await test.step('The renamed-away default and a never-authored string are absent', async () => {
      await expect(
        newServicePage.widgetDialog.getByRole('button', { name: renamedAwayDefault, exact: true }),
      ).toHaveCount(0);
      await newServicePage.expectWidgetNotToContainText(neverAuthored);
    });
  });
});
