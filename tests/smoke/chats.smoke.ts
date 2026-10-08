import { expect, test } from '@setup/test-setup';
import { openAdminPage } from '@utils/helpers';

test('[SMOKE] "Conversations" → "Unanswered" page loads with its chat tabs', async ({ page }) => {
  const visit = await openAdminPage(page, 'chat/unanswered');

  await expect(page.getByRole('tablist')).toBeVisible();
  visit.assertBackendAnswered();
  visit.assertNoFailedApiCalls();
});

test('[SMOKE] "Conversations" → "Active" page loads with its chat tabs', async ({ page }) => {
  const visit = await openAdminPage(page, 'chat/active');

  await expect(page.getByRole('tablist')).toBeVisible();
  visit.assertBackendAnswered();
  visit.assertNoFailedApiCalls();
});

test('[SMOKE] "Conversations" → "Pending" page loads with its chat tabs', async ({ page }) => {
  const visit = await openAdminPage(page, 'chat/pending');

  await expect(page.getByRole('tablist')).toBeVisible();
  visit.assertBackendAnswered();
  visit.assertNoFailedApiCalls();
});

test('[SMOKE] "Conversations" → "History" page loads with a result count from the backend', async ({ page }) => {
  const visit = await openAdminPage(page, 'chat/history');
  await expect(page.getByText(/Result count:?\s*\d+/i)).toBeVisible();

  visit.assertBackendAnswered();
  visit.assertNoFailedApiCalls();
});
