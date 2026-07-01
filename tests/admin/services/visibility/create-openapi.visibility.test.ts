import { NewServicePage } from '@page-objects/services/newservice/new-service-page';

import { expect, test } from '@setup/test-setup';
import { URLS } from '@utils/env/urls';
import { createServiceName, createValidServiceData } from '@utils/test-data/service-data';

import { registerServiceCleanup } from '../service-test-helpers';

// IMPORTANT: ensure create runs before delete + same worker context
test.describe('[services] [visibility] Create new OpenAPI endpoint (visibility)', () => {
  let serviceName: string;

  registerServiceCleanup(test, () => serviceName);

  test('[services] [visibility] Create new openAPI endpoint test (visibility)', async ({ page }) => {
    test.slow();
    test.setTimeout(600000);
    serviceName = createServiceName('openapi-service');

    const nsp = new NewServicePage(page);

    await page.goto(URLS.admin + 'services/newService');
    await nsp.waitForReady();

    await test.step('New service: set title', async () => {
      await nsp.setTitle(createValidServiceData({ title: serviceName }).title);
    });

    await test.step('Save service', async () => {
      await nsp.saveService();
    });

    await test.step('Add node → open API creation modal', async () => {
      // should open picker -> click +API (inside picker) -> modal opens
      await nsp.addNewAPI();
      await nsp.assertCreateEndpointModalVisible();
    });

    await test.step('Assert modal base UI visible', async () => {
      await expect(nsp.createEndpointTitle).toBeVisible();
      await expect(nsp.createEndpointTabOtspunkt).toBeVisible();

      await expect(nsp.createEndpointServiceTypeCombo).toBeVisible();
      await expect(nsp.createEndpointCancel).toBeVisible();
      await expect(nsp.createEndpointCreate).toBeVisible();

      await expect(nsp.createEndpointCreate).toBeDisabled();
    });

    await test.step('Select Open API and assert fields become visible', async () => {
      await nsp.selectServiceType('Open API');

      await expect(nsp.createEndpointName).toBeVisible();
      await expect(nsp.createEndpointUrl).toBeVisible();
      await expect(nsp.createEndpointFetchEndpoints).toBeVisible();
      await expect(nsp.createEndpointPublicSwitch).toBeVisible();
    });

    await test.step('Fill required fields and verify "Loo" becomes enabled', async () => {
      await nsp.setEndpointName(`keskmineBrutopalkAPI${serviceName}`);
      await nsp.setEndpointUrl(nsp.apiURL);

      // some UIs enable after blur/change
      await page.keyboard.press('Tab');

      await expect(nsp.createEndpointCreate).toBeEnabled();
    });

    await test.step('Create endpoint and verify durable success state', async () => {
      await nsp.createEndpoint();
    });

    await test.step('Endpoint is returned to canvas', async () => {
      await nsp.assertCanvasVisible();
      await expect(nsp.toastList).toContainText(/salvest|õnnest|api element/i);
    });
  });
});
