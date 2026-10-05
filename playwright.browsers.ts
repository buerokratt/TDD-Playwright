import { PlaywrightTestProject, devices } from '@playwright/test';

import { ACTION_TIMEOUT, ADMIN_AUTH_STATE, VIEWPORT } from '@utils/constants';

export const CHROMIUM_ARGS = ['--incognito', '--start-maximized'];

const CHROMIUM_BACKGROUND_ARGS = [
  '--disable-background-timer-throttling',
  '--disable-backgrounding-occluded-windows',
  '--disable-renderer-backgrounding',
];

export const SHARED_USE = {
  viewport: VIEWPORT,
  contextOptions: { screen: VIEWPORT },
};

const BROWSERS = [
  { name: 'chromium', suffix: '', device: devices['Desktop Chrome'] },
  { name: 'firefox', suffix: '-firefox', device: devices['Desktop Firefox'] },
  { name: 'webkit', suffix: '-webkit', device: devices['Desktop Safari'] },
];

const SUITES = [
  { name: 'smoke', testMatch: '**/*.smoke.ts' },
  {
    name: 'flow',
    testMatch: '**/*.flow.ts',
    actionTimeout: ACTION_TIMEOUT,
    background: true,
  },
  { name: 'tests', testMatch: '**/*.test.ts', testIgnore: '**/tests/widget/**' },
  {
    name: 'widget',
    testMatch: '**/tests/widget/**/*.test.ts',
    actionTimeout: ACTION_TIMEOUT,
    background: true,
  },
];

export const BROWSER_PROJECTS: PlaywrightTestProject[] = BROWSERS.flatMap((browser) =>
  SUITES.map((suite) => ({
    name: `${suite.name}${browser.suffix}`,
    testMatch: suite.testMatch,
    testIgnore: suite.testIgnore,
    use: {
      ...browser.device,
      ...SHARED_USE,
      storageState: ADMIN_AUTH_STATE,
      ...(suite.actionTimeout && { actionTimeout: suite.actionTimeout }),
      ...(browser.name === 'chromium' && {
        launchOptions: {
          args: [...CHROMIUM_ARGS, ...(suite.background ? CHROMIUM_BACKGROUND_ARGS : [])],
        },
      }),
    },
    dependencies: ['setup'],
  })),
);
