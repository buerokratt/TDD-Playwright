import { test } from '@setup/test-setup';
import {
  ABOVE_RANGE_MINUTES,
  AWAY_STATUS_TIME_CAP,
  BELOW_RANGE_MINUTES,
  SESSION_LENGTH_ABOVE_AWAY_CAP,
  SESSION_LENGTH_BELOW_AWAY_CAP,
} from '@utils/constants';
import { sessionLengthCleanup } from '@utils/helpers';
import { SessionLengthSettings } from '@utils/interfaces';
import { createSessionLengthMessage, nextAwayStatusTime, nextResponseTime, nextSessionLength } from '@utils/test-data';

let settingsBeforeRun: SessionLengthSettings;

test.beforeEach(async ({ sessionLengthPage }) => {
  await sessionLengthPage.open();
  await sessionLengthPage.assertPageIsShown();

  settingsBeforeRun = await sessionLengthPage.readSettings();
});

test.afterEach(sessionLengthCleanup(() => settingsBeforeRun));

test.describe(
  '[administration] [functional] Session length settings are saved for the stand',
  { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/184/' } },
  () => {
    test('The saved settings are confirmed and read back after a reload', async ({ sessionLengthPage }) => {
      const updatedSettings: SessionLengthSettings = {
        sessionLength: nextSessionLength(settingsBeforeRun.sessionLength),
        responseTime: nextResponseTime(settingsBeforeRun.responseTime),
        displayMessage: true,
        idleWarningMessage: createSessionLengthMessage('autotest idle warning'),
        showEndMessage: true,
        endMessage: createSessionLengthMessage('autotest end message'),
        awayStatus: true,
        awayStatusTime: nextAwayStatusTime(settingsBeforeRun.awayStatusTime),
      };

      await test.step('Every time, toggle and message is given a new value', async () => {
        await sessionLengthPage.applySettings(updatedSettings);
      });

      await test.step('Saving reports the change went through', async () => {
        await sessionLengthPage.saveSettings();
        await sessionLengthPage.assertSaveWasConfirmed();
      });

      await test.step('The settings come back unchanged after a reload', async () => {
        await sessionLengthPage.open();

        await sessionLengthPage.assertSettingsStored(updatedSettings);
      });
    });

    test('Saving without a change keeps the stored settings', async ({ sessionLengthPage }) => {
      await test.step('Saving the untouched page reports the change went through', async () => {
        await sessionLengthPage.saveSettings();
        await sessionLengthPage.assertSaveWasConfirmed();
      });

      await test.step('The settings come back unchanged after a reload', async () => {
        await sessionLengthPage.open();

        await sessionLengthPage.assertSettingsStored(settingsBeforeRun);
      });
    });
  },
);

test.describe(
  '[administration] [functional] Times outside their range are refused and nothing is stored',
  { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/185/' } },
  () => {
    test('The session length is refused empty, below and above its range', async ({ sessionLengthPage }) => {
      await test.step('An empty session length is refused as empty', async () => {
        await sessionLengthPage.fillSessionLength('');
        await sessionLengthPage.saveSettings();

        await sessionLengthPage.assertSaveWasRejected("Session length can't be empty");
      });

      await test.step('A session length below 30 minutes is refused with its range', async () => {
        await sessionLengthPage.fillSessionLength(BELOW_RANGE_MINUTES);
        await sessionLengthPage.saveSettings();

        await sessionLengthPage.assertSaveWasRejected('Session length must be between 30 and 480 minutes');
      });

      await test.step('A session length above 480 minutes is refused with its range', async () => {
        await sessionLengthPage.fillSessionLength(ABOVE_RANGE_MINUTES);
        await sessionLengthPage.saveSettings();

        await sessionLengthPage.assertSaveWasRejected('Session length must be between 30 and 480 minutes');
      });

      await test.step('The settings the page opened on survive the refused saves', async () => {
        await sessionLengthPage.open();

        await sessionLengthPage.assertSettingsStored(settingsBeforeRun);
      });
    });

    test('The response time is refused empty, below and above its range', async ({ sessionLengthPage }) => {
      await test.step('An empty response time is refused as empty', async () => {
        await sessionLengthPage.fillResponseTime('');
        await sessionLengthPage.saveSettings();

        await sessionLengthPage.assertSaveWasRejected("Time for user to respond can't be empty");
      });

      await test.step('A response time below 5 minutes is refused with its range', async () => {
        await sessionLengthPage.fillResponseTime(BELOW_RANGE_MINUTES);
        await sessionLengthPage.saveSettings();

        await sessionLengthPage.assertSaveWasRejected(
          'Conversation timeout duration must be between 5 and 480 minutes',
        );
      });

      await test.step('A response time above 480 minutes is refused with its range', async () => {
        await sessionLengthPage.fillResponseTime(ABOVE_RANGE_MINUTES);
        await sessionLengthPage.saveSettings();

        await sessionLengthPage.assertSaveWasRejected(
          'Conversation timeout duration must be between 5 and 480 minutes',
        );
      });

      await test.step('The settings the page opened on survive the refused saves', async () => {
        await sessionLengthPage.open();

        await sessionLengthPage.assertSettingsStored(settingsBeforeRun);
      });
    });

    test('The away status time is refused empty, below its range and above what the session length allows', async ({
      sessionLengthPage,
    }) => {
      await test.step('The away status is switched on so its time is checked', async () => {
        await sessionLengthPage.setAwayStatus(true);
      });

      await test.step('An empty away status time is refused as empty', async () => {
        await sessionLengthPage.fillAwayStatusTime('');
        await sessionLengthPage.saveSettings();

        await sessionLengthPage.assertSaveWasRejected("Away status time can't be empty");
      });

      await test.step('An away status time below 5 minutes is refused with its range', async () => {
        await sessionLengthPage.fillAwayStatusTime(BELOW_RANGE_MINUTES);
        await sessionLengthPage.saveSettings();

        await sessionLengthPage.assertSaveWasRejected('Away status time must be between 5 and 120 minutes');
      });

      await test.step('An away status time above 120 minutes is refused with its range while the session runs longer', async () => {
        await sessionLengthPage.fillSessionLength(SESSION_LENGTH_ABOVE_AWAY_CAP);
        await sessionLengthPage.fillAwayStatusTime(String(AWAY_STATUS_TIME_CAP + 1));
        await sessionLengthPage.saveSettings();

        await sessionLengthPage.assertSaveWasRejected('Away status time must be between 5 and 120 minutes');
      });

      await test.step('An away status time as long as a shorter session is refused as not shorter than it', async () => {
        await sessionLengthPage.fillSessionLength(SESSION_LENGTH_BELOW_AWAY_CAP);
        await sessionLengthPage.fillAwayStatusTime(SESSION_LENGTH_BELOW_AWAY_CAP);
        await sessionLengthPage.saveSettings();

        await sessionLengthPage.assertSaveWasRejected('Away status time must be shorter than the session length');
      });

      await test.step('The settings the page opened on survive the refused saves', async () => {
        await sessionLengthPage.open();

        await sessionLengthPage.assertSettingsStored(settingsBeforeRun);
      });
    });
  },
);
