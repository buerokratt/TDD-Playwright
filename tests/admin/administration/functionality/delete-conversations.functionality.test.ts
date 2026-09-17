import { AdminPageFactory } from '@page-objects/admin-page-factory';
import { test } from '@setup/test-setup';
import { BOTH_REMOVALS_ON } from '@utils/constants';
import { deleteConversationsCleanup } from '@utils/helpers';
import { DeleteConversationsSettings } from '@utils/interfaces';
import { createLongerPeriod, createShiftedDeletionTime } from '@utils/test-data';

test.describe(
  '[administration] [functional] The conversations deletion page follows its removal toggles',
  { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/156/' } },
  () => {
    test('A removal switched off takes its own fields off the page', async ({ page }) => {
      const dcp = new AdminPageFactory(page).getDeleteConversationsPage();

      await dcp.open();

      await test.step('Both removals start switched on', async () => {
        await dcp.setAuthenticatedRemoval(true);
        await dcp.setAnonymousRemoval(true);
        await dcp.assertPeriodFieldsOffered();
      });

      await test.step('Switching authenticated removal off takes its period away and leaves the rest', async () => {
        await dcp.setAuthenticatedRemoval(false);

        await dcp.assertAuthenticatedPeriodHidden();
        await dcp.assertDeletionTimeOffered();
        await dcp.assertExpiringRangeOffered();
      });

      await test.step('Switching anonymous removal off as well takes the whole expiring block away', async () => {
        await dcp.setAnonymousRemoval(false);

        await dcp.assertAnonymousPeriodHidden();
        await dcp.assertExpiringBlockHidden();
        await dcp.assertSaveOffered();
      });

      await test.step('Switching both back on brings the fields back', async () => {
        await dcp.setAuthenticatedRemoval(true);
        await dcp.setAnonymousRemoval(true);

        await dcp.assertPeriodFieldsOffered();
        await dcp.assertDeletionTimeOffered();
        await dcp.assertExpiringRangeOffered();
      });
    });
  },
);

test.describe(
  '[administration] [functional] The conversations deletion page saves the rules it is given',
  { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/178/' } },
  () => {
    let settingsBeforeRun: DeleteConversationsSettings;

    test.beforeEach(async ({ page }) => {
      const dcp = new AdminPageFactory(page).getDeleteConversationsPage();

      await dcp.open();
      settingsBeforeRun = await dcp.readFormSettings();
    });

    test.afterEach(deleteConversationsCleanup(() => settingsBeforeRun));

    test('A longer period and a shifted deletion time are confirmed and survive a reload', async ({ page }) => {
      const dcp = new AdminPageFactory(page).getDeleteConversationsPage();

      await test.step('The form is brought to both removals switched on', async () => {
        await dcp.applySettings({ ...settingsBeforeRun, ...BOTH_REMOVALS_ON });
        await dcp.assertPeriodFieldsOffered();
      });

      const wanted = await test.step('A longer period and a shifted deletion time are entered', async () => {
        const current = await dcp.readFormSettings();

        const next: DeleteConversationsSettings = {
          ...BOTH_REMOVALS_ON,
          authenticatedPeriod: createLongerPeriod(current.authenticatedPeriod),
          anonymousPeriod: createLongerPeriod(current.anonymousPeriod),
          deletionTime: createShiftedDeletionTime(current.deletionTime),
        };

        await dcp.applySettings(next);

        return next;
      });

      await test.step('Saving reports the update went through', async () => {
        await dcp.saveSettings();
        await dcp.assertSaveWasConfirmed();
      });

      await test.step('The new periods and time come back after a reload', async () => {
        await dcp.open();
        await dcp.assertStoredSettings(wanted);
      });
    });

    test('A removal switched off is confirmed and stays off after a reload', async ({ page }) => {
      const dcp = new AdminPageFactory(page).getDeleteConversationsPage();

      const { authenticatedRemoval } = settingsBeforeRun;

      await test.step('Anonymous removal is switched off', async () => {
        await dcp.setAnonymousRemoval(false);
        await dcp.assertAnonymousPeriodHidden();
      });

      await test.step('Saving reports the update went through', async () => {
        await dcp.saveSettings();
        await dcp.assertSaveWasConfirmed();
      });

      await test.step('The removal is still off after a reload and asks for no period', async () => {
        await dcp.open();

        await dcp.assertStoredSettings({ authenticatedRemoval, anonymousRemoval: false });
        await dcp.assertAnonymousPeriodHidden();
      });
    });
  },
);
