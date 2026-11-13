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
      async ({ officeOpeningHoursPage }) => {
        await officeOpeningHoursPage.open();

        const domains = await officeOpeningHoursPage.domainNamesBesidesSuiteWidget();
        expect(
          domains.length,
          'Copying is tried only between domains the rest of the suite does not chat through, and fewer than two exist',
        ).toBeGreaterThan(1);

        const [source, target] = domains;

        await officeOpeningHoursPage.withSettingsRestoredForDomains([source, target], async () => {
          await officeOpeningHoursPage.selectDomain(source);

          const sourceBefore = await officeOpeningHoursPage.readSettings();
          const copiedSettings: WorkingTimeFormSettings = {
            workingAllTime: !sourceBefore.workingAllTime,
            absenceMessage: createWorkingTimeMessage(),
          };

          await test.step('The source domain is given opening hours the target does not have', async () => {
            await officeOpeningHoursPage.applySettings(copiedSettings);
            await officeOpeningHoursPage.saveSettings();
            await officeOpeningHoursPage.assertSaveWasConfirmed();
          });

          await test.step(`Copying them onto "${target}" reports the settings went through`, async () => {
            await officeOpeningHoursPage.open();
            await officeOpeningHoursPage.selectDomain(source);

            await officeOpeningHoursPage.copySettingsTo(target);
            await officeOpeningHoursPage.assertSaveWasConfirmed();
          });

          await test.step('The target domain comes back with the opening hours of the source', async () => {
            await officeOpeningHoursPage.selectDomain(target);
            await officeOpeningHoursPage.assertSettingsStored(copiedSettings);
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
      async ({ officeOpeningHoursPage }) => {
        await officeOpeningHoursPage.open();

        const [domain] = await officeOpeningHoursPage.domainNamesBesidesSuiteWidget();
        expect(
          domain,
          'Saving is tried only on a domain the rest of the suite does not chat through, and none exists',
        ).toBeTruthy();

        await officeOpeningHoursPage.withSettingsRestoredForDomains([domain], async () => {
          await officeOpeningHoursPage.selectDomain(domain);

          const settingsBefore = await officeOpeningHoursPage.readSettings();
          const updatedSettings: WorkingTimeFormSettings = {
            workingAllTime: !settingsBefore.workingAllTime,
            absenceMessage: createWorkingTimeMessage(),
          };

          await test.step('The 24/7 toggle and the absence notification are given new values', async () => {
            await officeOpeningHoursPage.applySettings(updatedSettings);
          });

          await test.step('Saving reports the change went through', async () => {
            await officeOpeningHoursPage.saveSettings();
            await officeOpeningHoursPage.assertSaveWasConfirmed();
          });

          await test.step('The settings come back unchanged after a reload', async () => {
            await officeOpeningHoursPage.open();
            await officeOpeningHoursPage.selectDomain(domain);

            await officeOpeningHoursPage.assertSettingsStored(updatedSettings);
          });
        });
      },
    );
  },
);
