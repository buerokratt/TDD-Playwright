import { PlaywrightTestProject, devices } from '@playwright/test';

import { ACTION_TIMEOUT, ADMIN_AUTH_STATE, VIEWPORT, WORKING_TIME_TAG } from '@utils/constants';

export const CHROMIUM_ARGS = ['--incognito', '--start-maximized'];

const CHROMIUM_BACKGROUND_ARGS = [
  '--disable-background-timer-throttling',
  '--disable-backgrounding-occluded-windows',
  '--disable-renderer-backgrounding',
];

export const SHARED_USE = {
  viewport: VIEWPORT,
  contextOptions: { screen: VIEWPORT },
  deviceScaleFactor: 1,
};

const BROWSERS = [
  { name: 'chromium', device: devices['Desktop Chrome'] },
  { name: 'firefox', device: devices['Desktop Firefox'] },
  { name: 'webkit', device: devices['Desktop Safari'] },
];

const WORKING_TIME_GREP = new RegExp(WORKING_TIME_TAG);

const SUITES = [
  { name: 'smoke', testMatch: '**/*.smoke.ts' },
  {
    name: 'flow',
    testMatch: '**/*.flow.ts',
    actionTimeout: ACTION_TIMEOUT,
    background: true,
  },
  { name: 'tests', testMatch: '**/*.test.ts', testIgnore: '**/tests/widget/**', grepInvert: WORKING_TIME_GREP },
  {
    name: 'widget',
    testMatch: '**/tests/widget/**/*.test.ts',
    grepInvert: WORKING_TIME_GREP,
    actionTimeout: ACTION_TIMEOUT,
    background: true,
  },
  {
    name: 'working-time',
    testMatch: '**/*.test.ts',
    grep: WORKING_TIME_GREP,
    actionTimeout: ACTION_TIMEOUT,
    background: true,
    workers: 1,
  },
];

export const BROWSER_PROJECTS: PlaywrightTestProject[] = BROWSERS.flatMap((browser) =>
  SUITES.map((suite) => ({
    name: `${suite.name}-${browser.name}`,
    testMatch: suite.testMatch,
    testIgnore: suite.testIgnore,
    grep: suite.grep,
    grepInvert: suite.grepInvert,
    ...(suite.workers && { workers: suite.workers }),
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
