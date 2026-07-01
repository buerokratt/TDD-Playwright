import { test, expect } from '@playwright/test';

test('ci mock always passes', async () => {
  expect(true).toBe(true);
});
