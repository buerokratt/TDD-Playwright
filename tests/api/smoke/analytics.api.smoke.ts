import { URLS } from '@utils/env/urls';

import { test, expect } from '../api-test-setup';

test('[api] [smoke] Analytics overview loads without API errors', async ({ page }) => {
  await page.goto(URLS.admin + 'analytics/overview');

  // Verify all APIs returned 200
  const failingCalls = await page.verifyAPIsReturn200();
  if (failingCalls.length > 0) {
    console.log('Failed APIs:', failingCalls);
  }

  // Your other assertions
  expect(failingCalls.length).toBe(0);
});

test('[api] [smoke] Chats analytics loads without API errors', async ({ page }) => {
  await page.goto(URLS.admin + 'analytics/chats');

  // Verify all APIs returned 200
  const failingCalls = await page.verifyAPIsReturn200();
  if (failingCalls.length > 0) {
    console.log('Failed APIs:', failingCalls);
  }

  // Your other assertions
  expect(failingCalls.length).toBe(0);
});

test('[api] [smoke] Feedback analytics loads without API errors', async ({ page }) => {
  await page.goto(URLS.admin + 'analytics/feedback');

  // Verify all APIs returned 200
  const failingCalls = await page.verifyAPIsReturn200();
  if (failingCalls.length > 0) {
    console.log('Failed APIs:', failingCalls);
  }

  // Your other assertions
  expect(failingCalls.length).toBe(0);
});

test('[api] [smoke] Advisors analytics loads without API errors', async ({ page }) => {
  await page.goto(URLS.admin + 'analytics/advisors');

  // Verify all APIs returned 200
  const failingCalls = await page.verifyAPIsReturn200();
  if (failingCalls.length > 0) {
    console.log('Failed APIs:', failingCalls);
  }

  // Your other assertions
  expect(failingCalls.length).toBe(0);
});
