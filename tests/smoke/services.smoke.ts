import { expect, test } from '@setup/test-setup';
import { openAdminPage } from '@utils/helpers';

test('[SMOKE] "Services" → "Overview" page loads with its services table', async ({ page }) => {
  const visit = await openAdminPage(page, 'services/overview');

  await expect(page.getByRole('heading', { name: 'Services', exact: true })).toBeVisible();
  await expect(page.getByRole('table').first().locator('tbody tr').first()).toBeVisible();

  visit.assertBackendAnswered();
  visit.assertNoFailedApiCalls();
});

test('[SMOKE] "Services" → "Create new service" page loads with its flow editor', async ({ page }) => {
  const visit = await openAdminPage(page, 'services/newService');

  await expect(page.getByRole('button', { name: 'Settings', exact: true }).first()).toBeVisible();
  await expect(page.locator('.react-flow__node').first()).toBeVisible();

  visit.assertBackendAnswered();
  visit.assertNoFailedApiCalls();
});

test('[SMOKE] "Services" → "Faulty Services" page loads', async ({ page }) => {
  const visit = await openAdminPage(page, 'services/faultyServices');

  await expect(page.getByRole('heading', { name: 'Faulty Services', exact: true })).toBeVisible();
  visit.assertBackendAnswered();
  visit.assertNoFailedApiCalls();
});

test('[SMOKE] "Services" → "API Registry" page loads with its endpoint table', async ({ page }) => {
  const visit = await openAdminPage(page, 'services/api-registry');

  await expect(page.getByRole('heading', { name: 'API Registry', exact: true })).toBeVisible();
  await expect(page.getByRole('table').first().locator('tbody tr').first()).toBeVisible();

  visit.assertBackendAnswered();
  visit.assertNoFailedApiCalls();
});
