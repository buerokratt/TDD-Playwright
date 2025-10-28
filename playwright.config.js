import { defineConfig, devices } from '@playwright/test';

const env = process.env.ENV || 'test';

const baseURLs = {
  test: {
    customer: 'https://test.buerokratt.ee/',
    admin: 'https://admin.test.buerokratt.ee/'
  },
  stage: {
    // customer: 'https://stage.buerokratt.ee/',
    customer: 'https://ria.test.vportal.ee/',
    admin: 'https://admin.stage.buerokratt.ee/'
  }
};

const currentEnvURLs = baseURLs[env] || baseURLs.test;

export default defineConfig({
  timeout: 30000,
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    baseURL: currentEnvURLs.admin,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // screenshot: 'on',
    reporter: process.env.CI ? 'dot' : [
      ['list'],
      ['html']
    ]
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'setup',
      testMatch: '**/*.setup.js',
    },
    {
      name: 'smoke',
      testMatch: '**/*.smoke.js',
    },
    {
      name: 'flow',
      testMatch: '**/*.spec.js',
    },
    {
      name: 'tests',
      testMatch: '**/*.test.js',
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--incognito']
        }
      },
      setup: async ({ page }) => {
        // This runs for each test in this project
        page.on('console', msg => {
          const errorPattern = /error|failed|uncaught|exception|typeerror|referenceerror|syntaxerror|rangeerror|evalerror|urlerror|is not defined|cannot read|undefined|null is not an object/i;

          if (msg.type() === 'error' || errorPattern.test(msg.text())) {
            console.log(`[${msg.type().toUpperCase()}] ${msg.text()}`);
          }
        });
      }
    },
    // {
    //   name: 'firefox',
    //   use: {
    //     ...devices['Desktop Firefox'],
    //     launchOptions: {
    //       args: ['--private']
    //     }
    //   },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 13 Pro'] },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
export const URLS = currentEnvURLs;