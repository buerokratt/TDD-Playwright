import { expect, test } from '@setup/test-setup';
import { openAdminPage } from '@utils/helpers';

test('[SMOKE] "Analytics" → "Overview" page loads', async ({ page }) => {
  const visit = await openAdminPage(page, 'analytics/overview');

  await expect(page.getByText('Total number of chats')).toBeVisible();
  visit.assertBackendAnswered();
  visit.assertNoFailedApiCalls();
});

test('[SMOKE] "Analytics" → "Chats" page loads', async ({ page }) => {
  const visit = await openAdminPage(page, 'analytics/chats');

  await expect(page.getByRole('heading', { name: 'Chats', exact: true })).toBeVisible();
  visit.assertBackendAnswered();
  visit.assertNoFailedApiCalls();
});

test('[SMOKE] "Analytics" → "Feedback" page loads', async ({ page }) => {
  const visit = await openAdminPage(page, 'analytics/feedback');

  await expect(page.getByRole('heading', { name: 'Feedback', exact: true })).toBeVisible();
  visit.assertBackendAnswered();
  visit.assertNoFailedApiCalls();
});
