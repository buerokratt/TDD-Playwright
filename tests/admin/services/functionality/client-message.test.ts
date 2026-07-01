import { expect, test } from '@setup/test-setup';
import { URLS } from '@utils/env/urls';
import { createServiceName, createValidServiceData } from '@utils/test-data/service-data';

import { getServicePages, registerServiceCleanup } from '../service-test-helpers';

const serviceName = createServiceName('clientmessage');

test.describe('[services] [functional] New service test (TEST widget variable resolution)', () => {
  registerServiceCleanup(test, serviceName);

  test('[services] [functional] Create service + add nodes + configure via node edit + verify widget resolves variables', async ({
    page,
  }) => {
    const { nsp } = getServicePages(page);

    await page.goto(URLS.admin + 'services/newService');
    await nsp.waitForReady();

    await nsp.setTitle(createValidServiceData({ title: serviceName }).title);

    await nsp.clickAddNodeAtEdgeIndex(0);
    await nsp.pickNodeTypeAndReturnToCanvas(nsp.buttonDefine);

    const assignNodeTitle = 'Määra - 1';
    await expect(nsp.getFlowNodeByTitle(assignNodeTitle)).toBeVisible();
    await nsp.openNodeDialogByTitle(assignNodeTitle);
    await nsp.assignSetVariableAndSave('greeting', 'Tere');

    if (typeof nsp.clickAddNodeOnLastEdge === 'function') {
      await nsp.clickAddNodeOnLastEdge();
    } else {
      await nsp.clickAddNodeAtEdgeIndex(1);
    }

    await nsp.pickNodeTypeAndReturnToCanvas(nsp.buttonMessageForCustomer);

    const msgNodeTitle = 'Sõnum kliendile - 1';
    await expect(nsp.getFlowNodeByTitle(msgNodeTitle)).toBeVisible();
    await nsp.openNodeDialogByTitle(msgNodeTitle);
    await nsp.messageSetTextAndSave('{greeting}, maailm!');

    await nsp.saveService();
    await expect(nsp.getFlowNodeByTitle(assignNodeTitle)).toBeVisible();
    await expect(nsp.getFlowNodeByTitle(msgNodeTitle)).toBeVisible();

    await expect(nsp.widget).toBeVisible();
    await nsp.openWidget();

    await nsp.widgetSendText('test');
    await expect(nsp.widgetDialog.getByText('test', { exact: true })).toBeVisible();
    await nsp.expectWidgetToContainText('{greeting}, maailm!');
  });
});
