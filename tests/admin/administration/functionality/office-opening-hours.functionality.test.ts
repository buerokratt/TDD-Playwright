import { AdminPageFactory } from '@page-objects/admin-page-factory';
import { expect, test } from '@setup/test-setup';
import { WORKING_TIME_TAG } from '@utils/constants';
import { WorkingTimeFormSettings } from '@utils/interfaces';
import { createWorkingTimeMessage } from '@utils/test-data';

test.describe(
  '[administration] [functional] Office opening hours are copied from one domain to another',
  { tag: WORKING_TIME_TAG },
  () => {
    test(
      'The target domain is confirmed and comes back holding the opening hours of the source',
      { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/128/' } },
      async ({ page }) => {
        const ohp = new AdminPageFactory(page).getOfficeOpeningHoursPage();

        await ohp.open();

        const domains = await ohp.domainNamesBesidesSuiteWidget();
        expect(
          domains.length,
          'Copying is tried only between domains the rest of the suite does not chat through, and fewer than two exist',
        ).toBeGreaterThan(1);

        const [source, target] = domains;
        const absenceMessage = createWorkingTimeMessage();

        await ohp.withSettingsRestoredForDomains([source, target], async () => {
          await test.step('The source domain is given opening hours the target does not have', async () => {
            await ohp.selectDomain(source);
            await ohp.fillAbsenceMessage(absenceMessage);
            await ohp.saveSettings();
            await ohp.assertSaveWasConfirmed();
          });

          await test.step(`Copying them onto "${target}" reports the settings went through`, async () => {
            await ohp.open();
            await ohp.selectDomain(source);

            await ohp.copySettingsTo(target);
            await ohp.assertSaveWasConfirmed();
          });

          await test.step('The target domain comes back with the opening hours of the source', async () => {
            await ohp.selectDomain(target);
            await ohp.assertSettingsCopied(source, target, absenceMessage);
          });
        });
      },
    );
  },
);

test.describe(
  '[administration] [functional] Office opening hours are saved for a domain',
  { tag: WORKING_TIME_TAG },
  () => {
    test(
      'The saved 24/7 toggle and absence notification are confirmed and read back after a reload',
      { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/126/' } },
      async ({ page }) => {
        const ohp = new AdminPageFactory(page).getOfficeOpeningHoursPage();

        await ohp.open();

        const [domain] = await ohp.domainNamesBesidesSuiteWidget();
        expect(
          domain,
          'Saving is tried only on a domain the rest of the suite does not chat through, and none exists',
        ).toBeTruthy();

        await ohp.withSettingsRestoredForDomains([domain], async () => {
          await ohp.selectDomain(domain);

          const settingsBefore = await ohp.readSettings();
          const updatedSettings: WorkingTimeFormSettings = {
            workingAllTime: !settingsBefore.workingAllTime,
            absenceMessage: createWorkingTimeMessage(),
          };

          await test.step('The 24/7 toggle and the absence notification are given new values', async () => {
            await ohp.applySettings(updatedSettings);
          });

          await test.step('Saving reports the change went through', async () => {
            await ohp.saveSettings();
            await ohp.assertSaveWasConfirmed();
          });

          await test.step('The settings come back unchanged after a reload', async () => {
            await ohp.open();
            await ohp.selectDomain(domain);

            await ohp.assertSettingsStored(updatedSettings);
          });
        });
      },
    );
  },
);
