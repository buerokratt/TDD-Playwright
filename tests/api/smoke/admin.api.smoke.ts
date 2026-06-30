import { URLS } from '@utils/env/urls';

import { test, expect } from '../api-test-setup';

test('[api] [smoke] Users page loads without API errors', async ({ page }) => {
  await page.goto(URLS.admin + 'chat/users');

  // Verify all APIs returned 200
  const failingCalls = await page.verifyAPIsReturn200();
  if (failingCalls.length > 0) {
    console.log('Failed APIs:', failingCalls);
  }

  // Your other assertions
  expect(failingCalls.length).toBe(0);
});

test('[api] [smoke] Chatbot settings page loads without API errors', async ({ page }) => {
  await page.goto(URLS.admin + 'chat/chatbot/settings');

  // Verify all APIs returned 200
  const failingCalls = await page.verifyAPIsReturn200();
  if (failingCalls.length > 0) {
    console.log('Failed APIs:', failingCalls);
  }

  // Your other assertions
  expect(failingCalls.length).toBe(0);
});

test('[api] [smoke] Chatbot welcome message page loads without API errors', async ({ page }) => {
  await page.goto(URLS.admin + 'chat/chatbot/welcome-message');

  // Verify all APIs returned 200
  const failingCalls = await page.verifyAPIsReturn200();
  if (failingCalls.length > 0) {
    console.log('Failed APIs:', failingCalls);
  }

  // Your other assertions
  expect(failingCalls.length).toBe(0);
});

test('[api] [smoke] Chatbot appearance page loads without API errors', async ({ page }) => {
  await page.goto(URLS.admin + 'chat/chatbot/appearance');

  // Verify all APIs returned 200
  const failingCalls = await page.verifyAPIsReturn200();
  if (failingCalls.length > 0) {
    console.log('Failed APIs:', failingCalls);
  }

  // Your other assertions
  expect(failingCalls.length).toBe(0);
});

test('[api] [smoke] Emergency notices page loads without API errors', async ({ page }) => {
  await page.goto(URLS.admin + 'chat/chatbot/emergency-notices');

  // Verify all APIs returned 200
  const failingCalls = await page.verifyAPIsReturn200();
  if (failingCalls.length > 0) {
    console.log('Failed APIs:', failingCalls);
  }

  // Your other assertions
  expect(failingCalls.length).toBe(0);
});

test('[api] [smoke] Feedback settings page loads without API errors', async ({ page }) => {
  await page.goto(URLS.admin + 'chat/chatbot/feedback');

  // Verify all APIs returned 200
  const failingCalls = await page.verifyAPIsReturn200();
  if (failingCalls.length > 0) {
    console.log('Failed APIs:', failingCalls);
  }

  // Your other assertions
  expect(failingCalls.length).toBe(0);
});

test('[api] [smoke] Working time page loads without API errors', async ({ page }) => {
  await page.goto(URLS.admin + 'chat/working-time');

  // Verify all APIs returned 200
  const failingCalls = await page.verifyAPIsReturn200();
  if (failingCalls.length > 0) {
    console.log('Failed APIs:', failingCalls);
  }

  // Your other assertions
  expect(failingCalls.length).toBe(0);
});

test('[api] [smoke] Session length page loads without API errors', async ({ page }) => {
  await page.goto(URLS.admin + 'chat/session-length');

  // Verify all APIs returned 200
  const failingCalls = await page.verifyAPIsReturn200();
  if (failingCalls.length > 0) {
    console.log('Failed APIs:', failingCalls);
  }

  // Your other assertions
  expect(failingCalls.length).toBe(0);
});
