import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';

import {
  ACTION_TIMEOUT,
  ADMIN_AUTH_STATE,
  GLOBAL_TEARDOWN,
  TEST_DIR,
  TEST_RESULTS_DIR,
  TEST_TIMEOUT,
  VIEWPORT,
} from '@utils/constants';
import { URLS } from '@utils/env';

export default defineConfig({
  timeout: TEST_TIMEOUT,
  testDir: TEST_DIR,
  globalTeardown: GLOBAL_TEARDOWN,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: Number(process.env.PW_WORKERS) || (process.env.CI ? 4 : 2),
  reporter: 'html',

  use: {
    baseURL: URLS.admin,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    viewport: VIEWPORT,
    video: {
      mode: 'retain-on-failure',
      size: VIEWPORT,
    },
  },

  outputDir: TEST_RESULTS_DIR,

  projects: [
    {
      name: 'mock',
      testMatch: '**/*.mock.ts',
    },
    {
      name: 'auth',
      testMatch: '**/auth.setup.ts',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        viewport: VIEWPORT,
        contextOptions: { screen: VIEWPORT },
        launchOptions: {
          args: ['--start-maximized'],
        },
      },
    },
    {
      name: 'setup',
      testMatch: '**/working-time.setup.ts',
      use: {
        ...devices['Desktop Chrome'],
        storageState: ADMIN_AUTH_STATE,
        viewport: VIEWPORT,
        contextOptions: { screen: VIEWPORT },
        launchOptions: {
          args: ['--incognito', '--start-maximized'],
        },
      },
      dependencies: ['auth'],
    },
    {
      name: 'smoke',
      testMatch: '**/*.smoke.ts',
      use: {
        ...devices['Desktop Chrome'],
        storageState: ADMIN_AUTH_STATE,
        viewport: VIEWPORT,
        contextOptions: { screen: VIEWPORT },
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
        // The widget sometimes stops keeping its own conversation up to date, and a click
        // aimed at it then never settles: Playwright rechecks the button until the test's
        // whole budget is gone and reports a timeout that names no step. Capped here, the
        // same failure arrives in seconds and points at the click that could not land.
        actionTimeout: ACTION_TIMEOUT,
        storageState: ADMIN_AUTH_STATE,
        viewport: VIEWPORT,
        contextOptions: { screen: VIEWPORT },
        launchOptions: {
          // A flow drives a customer and an operator at once, so one of the two windows is
          // always in the background, and both sides learn about the other's messages from a
          // pushed update rather than by polling. Chrome throttles exactly that in windows it
          // considers hidden, which leaves the backgrounded side rendering a stale chat.
          args: [
            '--incognito',
            '--start-maximized',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
          ],
        },
      },
      dependencies: ['setup'],
    },
    {
      name: 'tests',
      testMatch: '**/*.test.ts',
      testIgnore: '**/tests/widget/**',
      use: {
        ...devices['Desktop Chrome'],
        storageState: ADMIN_AUTH_STATE,
        viewport: VIEWPORT,
        contextOptions: { screen: VIEWPORT },
        launchOptions: {
          args: ['--incognito', '--start-maximized'],
        },
      },
      dependencies: ['setup'],
    },
    {
      name: 'widget',
      testMatch: '**/tests/widget/**/*.test.ts',
      use: {
        ...devices['Desktop Chrome'],
        actionTimeout: ACTION_TIMEOUT,
        storageState: ADMIN_AUTH_STATE,
        viewport: VIEWPORT,
        contextOptions: { screen: VIEWPORT },
        launchOptions: {
          args: [
            '--incognito',
            '--start-maximized',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
          ],
        },
      },
      dependencies: ['setup'],
    },
  ],
});

export { URLS };
