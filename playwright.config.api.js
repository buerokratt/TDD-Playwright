const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  use: {
    baseURL: 'https://ruuter.test.buerokratt.ee/v2/private/backoffice/agents/',
    headless: true,
  },
  reporter: [
    ['html', { open: 'always' }],
    ['list', { printSteps: true }],
  ],
});
