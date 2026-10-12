import { test } from '@setup/test-setup';
import {
  EXPONENT_MINUTES,
  NEGATIVE_MINUTES,
  NON_NUMERIC_MINUTES,
  OUT_OF_RANGE_MINUTES,
  ZERO_MINUTES,
} from '@utils/constants';
import { sessionLengthCleanup } from '@utils/helpers';
import { SessionLengthSettings } from '@utils/interfaces';
import { createSessionLengthMessage, nextResponseTime, nextSessionLength } from '@utils/test-data';

let settingsBeforeRun: SessionLengthSettings;

test.beforeEach(async ({ sessionLengthPage }) => {
  await sessionLengthPage.open();
  await sessionLengthPage.assertPageIsShown();

  settingsBeforeRun = await sessionLengthPage.readSettings();
});

test.afterEach(sessionLengthCleanup(() => settingsBeforeRun));

test.describe('[administration] [functional] Session length settings are saved for the stand', () => {
  test(
    'The saved settings are confirmed and read back after a reload',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/184/' } },
    async ({ sessionLengthPage }) => {
      const updatedSettings: SessionLengthSettings = {
        sessionLength: nextSessionLength(settingsBeforeRun.sessionLength),
        responseTime: nextResponseTime(settingsBeforeRun.responseTime),
        displayMessage: true,
        idleWarningMessage: createSessionLengthMessage('autotest idle warning'),
        showEndMessage: true,
        endMessage: createSessionLengthMessage('autotest end message'),
      };

      await test.step('Both times, both toggles and both messages are given new values', async () => {
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
    },
  );

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
});

test.describe('[administration] [functional] Times outside their range are refused and nothing is stored', () => {
  test(
    'Every invalid time is named in a notification and the stand keeps the settings it ran on',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/185/' } },
    async ({ sessionLengthPage }) => {
      await test.step('An empty session length is refused as empty', async () => {
        await sessionLengthPage.fillSessionLength('');
        await sessionLengthPage.saveSettings();

        await sessionLengthPage.assertSaveWasRejected("Session length can't be empty");
      });

      await test.step('A session length outside 30-480 minutes is refused with its range', async () => {
        await sessionLengthPage.fillSessionLength(OUT_OF_RANGE_MINUTES);
        await sessionLengthPage.saveSettings();

        await sessionLengthPage.assertSaveWasRejected('Session length must be between 30 and 480 minutes');
      });

      await test.step('An empty response time is refused as empty', async () => {
        await sessionLengthPage.fillSessionLength(settingsBeforeRun.sessionLength);
        await sessionLengthPage.fillResponseTime('');
        await sessionLengthPage.saveSettings();

        await sessionLengthPage.assertSaveWasRejected("Time for user to respond can't be empty");
      });

      await test.step('A response time outside 5-480 minutes is refused with its range', async () => {
        await sessionLengthPage.fillResponseTime(OUT_OF_RANGE_MINUTES);
        await sessionLengthPage.saveSettings();

        await sessionLengthPage.assertSaveWasRejected(
          'Conversation timeout duration must be between 5 and 480 minutes',
        );
      });

      await test.step('The settings the page opened on survive the refused saves', async () => {
        await sessionLengthPage.open();

        await sessionLengthPage.assertSettingsStored(settingsBeforeRun);
      });
    },
  );

  test('Zero, negative and non-numeric session lengths are refused', async ({ sessionLengthPage }) => {
    await test.step('Zero minutes is refused with the range', async () => {
      await sessionLengthPage.fillSessionLength(ZERO_MINUTES);
      await sessionLengthPage.saveSettings();

      await sessionLengthPage.assertSaveWasRejected('Session length must be between 30 and 480 minutes');
    });

    await test.step('A negative session length is refused with the range', async () => {
      await sessionLengthPage.fillSessionLength(NEGATIVE_MINUTES);
      await sessionLengthPage.saveSettings();

      await sessionLengthPage.assertSaveWasRejected('Session length must be between 30 and 480 minutes');
    });

    await test.step('Letters never reach the session length field', async () => {
      await sessionLengthPage.typeSessionLength(NON_NUMERIC_MINUTES);
      await sessionLengthPage.assertSessionLengthReads('');
    });

    await test.step('A session length left empty by letters is refused as empty', async () => {
      await sessionLengthPage.saveSettings();

      await sessionLengthPage.assertSaveWasRejected("Session length can't be empty");
    });

    await test.step('An exponent outside 30-480 minutes is refused with the range', async () => {
      await sessionLengthPage.typeSessionLength(EXPONENT_MINUTES);
      await sessionLengthPage.saveSettings();

      await sessionLengthPage.assertSaveWasRejected('Session length must be between 30 and 480 minutes');
    });

    await test.step('The settings the page opened on survive the refused saves', async () => {
      await sessionLengthPage.open();

      await sessionLengthPage.assertSettingsStored(settingsBeforeRun);
    });
  });
});

test.describe('[administration] [functional] An unsaved session length is dropped once the page is left', () => {
  test('Leaving through the side menu drops the edit without a prompt', async ({
    sessionLengthPage,
    sideMenu,
    historyPage,
  }) => {
    await test.step('A new session length is entered and left unsaved', async () => {
      await sessionLengthPage.fillSessionLength(nextSessionLength(settingsBeforeRun.sessionLength));
    });

    await test.step('Leaving through the side menu raises no prompt', async () => {
      await sessionLengthPage.assertLeavingRaisesNoPrompt(() => sideMenu.openHistory());
    });

    await test.step('History opens from the side menu', async () => {
      await historyPage.assertPageIsShown();
    });

    await test.step('The session length page comes back holding the stored settings', async () => {
      await sessionLengthPage.open();

      await sessionLengthPage.assertSettingsStored(settingsBeforeRun);
    });
  });

  test('Reloading drops the edit without a prompt', async ({ sessionLengthPage }) => {
    await test.step('A new session length is entered and left unsaved', async () => {
      await sessionLengthPage.fillSessionLength(nextSessionLength(settingsBeforeRun.sessionLength));
    });

    await test.step('The page reloads without a prompt', async () => {
      await sessionLengthPage.assertLeavingRaisesNoPrompt(() => sessionLengthPage.open());
    });

    await test.step('The reloaded page holds the stored settings', async () => {
      await sessionLengthPage.assertSettingsStored(settingsBeforeRun);
    });
  });
});
