const { test, expect } = require('../../../.setup/test-setup');
const { URLS } = require('../../../../playwright.config');
const { AdminPageFactory: ap } = require('../../../../page-objects/admin-page-factory');
const { createServiceName, createValidServiceData } = require('../../../../utils/test-data/service-data');

const serviceName = createServiceName('clientmessage');

test.describe('[services] [functional] New service test (TEST widget variable resolution)', () => {
  test.describe.configure({ mode: 'serial' });

  test('[services] [functional] Create service + add nodes + configure via node edit + verify widget resolves variables', async ({ page }) => {
    const apf = new ap(page);
    const nsp = apf.getNewServicePage();

    await page.goto(URLS.admin + 'services/newService');
    await page.waitForLoadState('domcontentloaded');

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
    await nsp.messageSetTextAndSave('${greeting}, maailm!');

    await nsp.saveService();

    await expect(nsp.widget).toBeVisible();
    await nsp.openWidget();

    const chat = page.locator('div').filter({ has: page.getByText('TEST') }).first();
    const input = chat.getByPlaceholder('Sisestage sisend, eraldatud komadega');

    await input.fill('test');
    await chat.getByAltText('Send').click();

    await expect(chat.getByText('test', { exact: true })).toBeVisible();
    await expect(chat.locator('.os-viewport .os-content')).toContainText('Tere, maailm!');
  });

  test('[services] [functional] Delete new service test', async ({ page }) => {
    await page.goto(URLS.admin + 'services/overview');

    const sop = new ap(page).getServicesOverview();
    await sop.assertServiceRowVisible(serviceName);
    await sop.deleteService(serviceName);
    await sop.assertRowDeleted(serviceName);
  });
});
