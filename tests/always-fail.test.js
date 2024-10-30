const { test, expect } = require('@playwright/test');

test('this test should fail every time 1', {
  annotation: {
    type: 'repository',
    description: 'GH-API-Test-1'
  },
}, async ({ page }) => {
  await page.goto('https://example.com');
  expect(1).toBe(2);
});

test('this test should fail every time 2', {
  annotation: {
    type: 'repository',
    description: 'GH-API-Test-2'
  },
}, async ({ page }) => {
  await page.goto('https://example.com');
  expect(3).toBe(6);
});
