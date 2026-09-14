import { AdminPageFactory } from '@page-objects/admin-page-factory';
import { test } from '@setup/test-setup';
import { OUT_OF_RANGE_MINUTES } from '@utils/constants';
import { sessionLengthCleanup } from '@utils/helpers';
import { SessionLengthSettings } from '@utils/interfaces';
import { createSessionLengthMessage, nextResponseTime, nextSessionLength } from '@utils/test-data';

let settingsBeforeRun: SessionLengthSettings;

test.beforeEach(async ({ page }) => {
  const slp = new AdminPageFactory(page).getSessionLengthPage();

  await slp.open();
  await slp.assertPageIsShown();

  settingsBeforeRun = await slp.readSettings();
});

test.afterEach(sessionLengthCleanup(() => settingsBeforeRun));

test.describe('[administration] [functional] Session length settings are saved for the stand', () => {
  test(
    'The saved settings are confirmed and read back after a reload',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/184/' } },
    async ({ page }) => {
      const slp = new AdminPageFactory(page).getSessionLengthPage();

      const updatedSettings: SessionLengthSettings = {
        sessionLength: nextSessionLength(settingsBeforeRun.sessionLength),
        responseTime: nextResponseTime(settingsBeforeRun.responseTime),
        displayMessage: true,
        idleWarningMessage: createSessionLengthMessage('autotest idle warning'),
        showEndMessage: true,
        endMessage: createSessionLengthMessage('autotest end message'),
      };

      await test.step('Both times, both toggles and both messages are given new values', async () => {
        await slp.applySettings(updatedSettings);
      });

      await test.step('Saving reports the change went through', async () => {
        await slp.saveSettings();
        await slp.assertSaveWasConfirmed();
      });

      await test.step('The settings come back unchanged after a reload', async () => {
        await slp.open();

        await slp.assertSettingsStored(updatedSettings);
      });
    },
  );
});

test.describe('[administration] [functional] Times outside their range are refused and nothing is stored', () => {
  test(
    'Every invalid time is named in a notification and the stand keeps the settings it ran on',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/185/' } },
    async ({ page }) => {
      const slp = new AdminPageFactory(page).getSessionLengthPage();

      await test.step('An empty session length is refused as empty', async () => {
        await slp.fillSessionLength('');
        await slp.saveSettings();

        await slp.assertSaveWasRejected("Session length can't be empty");
      });

      await test.step('A session length outside 30-480 minutes is refused with its range', async () => {
        await slp.fillSessionLength(OUT_OF_RANGE_MINUTES);
        await slp.saveSettings();

        await slp.assertSaveWasRejected('Session length must be between 30 and 480 minutes');
      });

      await test.step('An empty response time is refused as empty', async () => {
        await slp.fillSessionLength(settingsBeforeRun.sessionLength);
        await slp.fillResponseTime('');
        await slp.saveSettings();

        await slp.assertSaveWasRejected("Time for user to respond can't be empty");
      });

      await test.step('A response time outside 5-480 minutes is refused with its range', async () => {
        await slp.fillResponseTime(OUT_OF_RANGE_MINUTES);
        await slp.saveSettings();

        await slp.assertSaveWasRejected('Conversation timeout duration must be between 5 and 480 minutes');
      });

      await test.step('The settings the page opened on survive the refused saves', async () => {
        await slp.open();

        await slp.assertSettingsStored(settingsBeforeRun);
      });
    },
  );
});
