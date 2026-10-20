import { expect, test } from '@setup/test-setup';
import { URLS } from '@utils/env';

const inventoryOperation = 'GET /store/inventory';
const inventoryDescription = /Returns pet inventories by status/i;

const findByStatusOperation = 'GET /pet/findByStatus';
const findByStatusDescription = /Finds Pets by status/i;

const undeclaredOperation = 'GET /neverauthored/endpoint';

const endpointName = 'pwparseoracle';

test('[services] [functional] The endpoint modal lists the operations the OpenAPI document declares', async ({
  page,
  newServicePage,
}) => {
  await page.goto(URLS.admin + 'services/api-registry');
  await page.waitForLoadState('domcontentloaded');

  await test.step('An unconfigured endpoint cannot be registered', async () => {
    await newServicePage.openCreateEndpointFromRegistry();
    await newServicePage.assertCreateEndpointModalVisible();

    await expect(newServicePage.createEndpointCreate).toBeDisabled();
  });

  await test.step('Naming the endpoint alone is still not a configuration', async () => {
    await newServicePage.selectServiceType('Open API');
    await newServicePage.setEndpointName(endpointName);

    await expect(newServicePage.createEndpointCreate).toBeDisabled();
  });

  await test.step('Asking for endpoints returns exactly the operations the document declares', async () => {
    const operations = await newServicePage.fetchEndpointsFromUrl(newServicePage.apiURL);

    expect(operations).toContain(inventoryOperation);
    expect(operations).toContain(findByStatusOperation);
    expect(operations).toContain('DELETE /user/{username}');
    expect(operations).not.toContain(undeclaredOperation);
  });

  await test.step('Selecting an operation binds that operation, not a generic form', async () => {
    await newServicePage.selectFetchedEndpoint(inventoryOperation);
    await expect(newServicePage.createEndpointModal).toContainText(inventoryDescription);
    await expect(newServicePage.createEndpointModal).not.toContainText(findByStatusDescription);
  });

  await test.step('Selecting a different operation rebinds to that one', async () => {
    await newServicePage.selectFetchedEndpoint(findByStatusOperation);
    await expect(newServicePage.createEndpointModal).toContainText(findByStatusDescription);
    await expect(newServicePage.createEndpointModal).not.toContainText(inventoryDescription);
  });

  await test.step('An endpoint that has not been verified still cannot be registered', async () => {
    await expect(newServicePage.createEndpointCreate).toBeDisabled();
  });

  await test.step('Cancelling leaves nothing in the shared registry', async () => {
    await newServicePage.createEndpointCancel.click();
    await expect(newServicePage.createEndpointModal).toBeHidden();

    await expect(page.locator('tr', { hasText: endpointName })).toHaveCount(0);
  });
});
