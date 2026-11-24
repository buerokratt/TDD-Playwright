import { defineConfig, devices } from '@playwright/test';

import { ADMIN_AUTH_STATE } from '@utils/constants';

import { CHROMIUM_ARGS, SHARED_USE } from './playwright.browsers';
import baseConfig from './playwright.config';

export default defineConfig({
  ...baseConfig,
  projects: [
    ...(baseConfig.projects ?? []).filter((project) => project.name === 'auth'),
    {
      name: 'seed',
      testMatch: '**/*.seed.ts',
      use: {
        ...devices['Desktop Chrome'],
        ...SHARED_USE,
        storageState: ADMIN_AUTH_STATE,
        launchOptions: { args: CHROMIUM_ARGS },
      },
      dependencies: ['auth'],
    },
  ],
});
