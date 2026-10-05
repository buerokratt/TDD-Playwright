import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';

import {
  ADMIN_AUTH_STATE,
  GLOBAL_TEARDOWN,
  TEST_DIR,
  TEST_RESULTS_DIR,
  TEST_TIMEOUT,
  VIEWPORT,
} from '@utils/constants';
import { URLS } from '@utils/env';

import { BROWSER_PROJECTS, CHROMIUM_ARGS, SHARED_USE } from './playwright.browsers';

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
      name: 'auth',
      testMatch: '**/auth.setup.ts',
      use: {
        ...devices['Desktop Chrome'],
        ...SHARED_USE,
        channel: 'chrome',
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
        ...SHARED_USE,
        storageState: ADMIN_AUTH_STATE,
        launchOptions: { args: CHROMIUM_ARGS },
      },
      dependencies: ['auth'],
    },
    ...BROWSER_PROJECTS,
  ],
});

export { URLS };
