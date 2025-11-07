import { defineConfig, devices } from '@playwright/test';

const env = process.env.ENV || 'test';

const baseURLs = {
  test: {
    customer: 'https://test.buerokratt.ee/',
    admin: 'https://admin.test.buerokratt.ee/'
  },
  stage: {
    customer: 'https://stage.buerokratt.ee/',
    admin: 'https://admin.stage.buerokratt.ee/'
  }
};

const currentEnvURLs = baseURLs[env] || baseURLs.test;

export default defineConfig({
  timeout: 60000,
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',

  use: {
    baseURL: currentEnvURLs.admin,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: {
      mode: 'retain-on-failure', // or 'on'
      size: { width: 1280, height: 720 }
    }
  },

  outputDir: 'test-results/',

  projects: [
    {
      name: 'setup',
      testMatch: '**/*.setup.js',
      use: {
        ...devices['Desktop Chrome'],
      }
    },
    {
      name: 'smoke',
      testMatch: '**/*.smoke.js',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/admin/.auth/user.json',
        launchOptions: {
          args: ['--incognito']
        }
      },
      dependencies: ['setup'],
    },
    {
      name: 'flow',
      testMatch: '**/*.spec.js',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/admin/.auth/user.json',
        launchOptions: {
          args: ['--incognito']
        }
      },
      dependencies: ['setup'],
    },
    {
      name: 'tests',
      testMatch: '**/*.test.js',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/admin/.auth/user.json',
        launchOptions: {
          args: ['--incognito']
        }
      },
      dependencies: ['setup'],
    }
  ]
});

export const URLS = currentEnvURLs;