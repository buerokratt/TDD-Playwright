import { test } from '@setup/test-setup';
import { BOTH_REMOVALS_ON } from '@utils/constants';
import { deleteConversationsCleanup } from '@utils/helpers';
import { DeleteConversationsSettings } from '@utils/interfaces';
import { createLongerPeriod, createShiftedDeletionTime } from '@utils/test-data';

test.describe(
  '[administration] [functional] The conversations deletion page follows its removal toggles',
  { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/156/' } },
  () => {
    test('A removal switched off takes its own fields off the page', async ({ deleteConversationsPage }) => {
      await deleteConversationsPage.open();

      await test.step('Both removals start switched on', async () => {
        await deleteConversationsPage.setAuthenticatedRemoval(true);
        await deleteConversationsPage.setAnonymousRemoval(true);
        await deleteConversationsPage.assertPeriodFieldsOffered();
      });

      await test.step('Switching authenticated removal off takes its period away and leaves the rest', async () => {
        await deleteConversationsPage.setAuthenticatedRemoval(false);

        await deleteConversationsPage.assertAuthenticatedPeriodHidden();
        await deleteConversationsPage.assertDeletionTimeOffered();
        await deleteConversationsPage.assertExpiringRangeOffered();
      });

      await test.step('Switching anonymous removal off as well takes the whole expiring block away', async () => {
        await deleteConversationsPage.setAnonymousRemoval(false);

        await deleteConversationsPage.assertAnonymousPeriodHidden();
        await deleteConversationsPage.assertExpiringBlockHidden();
        await deleteConversationsPage.assertSaveOffered();
      });

      await test.step('Switching both back on brings the fields back', async () => {
        await deleteConversationsPage.setAuthenticatedRemoval(true);
        await deleteConversationsPage.setAnonymousRemoval(true);

        await deleteConversationsPage.assertPeriodFieldsOffered();
        await deleteConversationsPage.assertDeletionTimeOffered();
        await deleteConversationsPage.assertExpiringRangeOffered();
      });
    });
  },
);

test.describe(
  '[administration] [functional] The conversations deletion page saves the rules it is given',
  { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/178/' } },
  () => {
    let settingsBeforeRun: DeleteConversationsSettings;

    test.beforeEach(async ({ deleteConversationsPage }) => {
      await deleteConversationsPage.open();
      settingsBeforeRun = await deleteConversationsPage.readFormSettings();
    });

    test.afterEach(deleteConversationsCleanup(() => settingsBeforeRun));

    test('A longer period and a shifted deletion time are confirmed and survive a reload', async ({
      deleteConversationsPage,
    }) => {
      await test.step('The form is brought to both removals switched on', async () => {
        await deleteConversationsPage.applySettings({ ...settingsBeforeRun, ...BOTH_REMOVALS_ON });
        await deleteConversationsPage.assertPeriodFieldsOffered();
      });

      const wanted = await test.step('A longer period and a shifted deletion time are entered', async () => {
        const current = await deleteConversationsPage.readFormSettings();

        const next: DeleteConversationsSettings = {
          ...BOTH_REMOVALS_ON,
          authenticatedPeriod: createLongerPeriod(current.authenticatedPeriod),
          anonymousPeriod: createLongerPeriod(current.anonymousPeriod),
          deletionTime: createShiftedDeletionTime(current.deletionTime),
        };

        await deleteConversationsPage.applySettings(next);

        return next;
      });

      await test.step('Saving reports the update went through', async () => {
        await deleteConversationsPage.saveSettings();
        await deleteConversationsPage.assertSaveWasConfirmed();
      });

      await test.step('The new periods and time come back after a reload', async () => {
        await deleteConversationsPage.open();
        await deleteConversationsPage.assertStoredSettings(wanted);
      });
    });

    test('A removal switched off is confirmed and stays off after a reload', async ({ deleteConversationsPage }) => {
      const { authenticatedRemoval } = settingsBeforeRun;

      await test.step('Anonymous removal is switched off', async () => {
        await deleteConversationsPage.setAnonymousRemoval(false);
        await deleteConversationsPage.assertAnonymousPeriodHidden();
      });

      await test.step('Saving reports the update went through', async () => {
        await deleteConversationsPage.saveSettings();
        await deleteConversationsPage.assertSaveWasConfirmed();
      });

      await test.step('The removal is still off after a reload and asks for no period', async () => {
        await deleteConversationsPage.open();

        await deleteConversationsPage.assertStoredSettings({ authenticatedRemoval, anonymousRemoval: false });
        await deleteConversationsPage.assertAnonymousPeriodHidden();
      });
    });
  },
);
