import { defineConfig, devices } from '@playwright/test';

import { URLS } from '@utils/env/urls';

export default defineConfig({
  timeout: 120000,
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
      name: 'mock',
      testMatch: '**/*.mock.ts',
    },
    {
      name: 'setup',
      testMatch: '**/*.setup.ts',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1720, height: 1200 },
        contextOptions: { screen: { width: 1720, height: 1200 } },
        launchOptions: {
          args: ['--start-maximized'],
        },
      },
    },
    {
      name: 'smoke',
      testMatch: '**/*.smoke.ts',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/admin/.auth/user.json',
        viewport: { width: 1720, height: 1200 },
        contextOptions: { screen: { width: 1720, height: 1200 } },
        launchOptions: {
          args: ['--incognito', '--start-maximized'],
        },
      },
      dependencies: ['setup'],
    },
    {
      name: 'flow',
      testMatch: '**/*.flow.ts',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/admin/.auth/user.json',
        viewport: { width: 1720, height: 1200 },
        contextOptions: { screen: { width: 1720, height: 1200 } },
        launchOptions: {
          args: ['--incognito', '--start-maximized'],
        },
      },
      dependencies: ['setup'],
    },
    {
      name: 'tests',
      testMatch: '**/*.test.ts',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/admin/.auth/user.json',
        viewport: { width: 1720, height: 1200 },
        contextOptions: { screen: { width: 1720, height: 1200 } },
        launchOptions: {
          args: ['--incognito', '--start-maximized'],
        },
      },
      dependencies: ['setup'],
    },
  ],
});

export { URLS };
