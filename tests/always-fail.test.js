const { test, expect } = require('@playwright/test');

test('this test should fail every time', async ({ page }) => {
  await page.goto('https://example.com');
  expect(1).toBe(2);
});
