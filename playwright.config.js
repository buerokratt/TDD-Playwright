const { defineConfig, devices } = require('@playwright/test');
const { URLS } = require('./utils/env/urls');

module.exports = defineConfig({
  timeout: 60000,
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.PW_WORKERS || (process.env.CI ? 4 : '50%'),
  reporter: 'html',

  use: {
    baseURL: URLS.admin,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    viewport: { width: 1720, height: 1200 },
    video: {
      mode: 'retain-on-failure',
      size: { width: 1720, height: 1200 },
    },
  },

  outputDir: 'test-results/',

  projects: [
    {
      name: 'setup',
      testMatch: '**/*.setup.js',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1720, height: 1200 },
        screen: { width: 1720, height: 1200 },
        launchOptions: {
          args: ['--start-maximized'],
        },
      },
    },
    {
      name: 'smoke',
      testMatch: '**/*.smoke.js',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/admin/.auth/user.json',
        viewport: { width: 1720, height: 1200 },
        screen: { width: 1720, height: 1200 },
        launchOptions: {
          args: ['--incognito', '--start-maximized'],
        },
      },
      dependencies: ['setup'],
    },
    {
      name: 'flow',
      testMatch: '**/*.spec.js',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/admin/.auth/user.json',
        viewport: { width: 1720, height: 1200 },
        screen: { width: 1720, height: 1200 },
        launchOptions: {
          args: ['--incognito', '--start-maximized'],
        },
      },
      dependencies: ['setup'],
    },
    {
      name: 'tests',
      testMatch: '**/*.test.js',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/admin/.auth/user.json',
        viewport: { width: 1720, height: 1200 },
        screen: { width: 1720, height: 1200 },
        launchOptions: {
          args: ['--incognito', '--start-maximized'],
        },
      },
      dependencies: ['setup'],
    },
  ],
});

module.exports.URLS = URLS;
