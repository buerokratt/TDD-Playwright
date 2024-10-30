const { test, expect } = require('@playwright/test');

test('this test should fail every time 1', async ({ page }) => {
  test.info().annotations.push({ type: 'repository', description: 'GH-API-Test-1' });
  await page.goto('https://example.com');
  expect(1).toBe(2);
});

test('this test should fail every time 2', async ({ page }) => {
  test.info().annotations.push({ type: 'repository', description: 'GH-API-Test-2' });
  await page.goto('https://example.com');
  expect(3).toBe(6);
});
