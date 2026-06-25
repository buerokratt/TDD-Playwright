const { test, expect } = require('@playwright/test');

test('ci mock always passes', async () => {
  expect(true).toBe(true);
});
