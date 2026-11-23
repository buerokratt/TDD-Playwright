import { expect, test } from '@setup/test-setup';
import { WorkingTimeFormSettings } from '@utils/interfaces';
import { createWorkingTimeMessage } from '@utils/test-data';

test.describe(
  '[administration] [functional] Office opening hours settings are saved for the selected domain',
  { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/126/' } },
  () => {
    test('The saved settings are confirmed and read back after a reload', async ({ officeOpeningHoursPage }) => {
      await officeOpeningHoursPage.open();

      const [domain] = await officeOpeningHoursPage.domainNamesBesidesSuiteWidget();
      expect(
        domain,
        'Saving is tried only on a domain the rest of the suite does not chat through, and none exists',
      ).toBeTruthy();

      await officeOpeningHoursPage.selectDomain(domain);

      await officeOpeningHoursPage.withSettingsRestoredForDomains([domain], async () => {
        const settingsBefore = await officeOpeningHoursPage.readSettings();
        const updatedSettings: WorkingTimeFormSettings = {
          workingAllTime: !settingsBefore.workingAllTime,
          noCsaAvailableMessage: createWorkingTimeMessage(),
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
    });

    test('Saving without a change keeps the stored settings', async ({ officeOpeningHoursPage }) => {
      await officeOpeningHoursPage.open();

      const [domain] = await officeOpeningHoursPage.domainNamesBesidesSuiteWidget();
      expect(
        domain,
        'Saving is tried only on a domain the rest of the suite does not chat through, and none exists',
      ).toBeTruthy();

      await officeOpeningHoursPage.selectDomain(domain);

      await officeOpeningHoursPage.withSettingsRestoredForDomains([domain], async () => {
        const settingsBefore = await officeOpeningHoursPage.readSettings();

        await test.step('Saving the untouched page reports the change went through', async () => {
          await officeOpeningHoursPage.saveSettings();
          await officeOpeningHoursPage.assertSaveWasConfirmed();
        });

        await test.step('The settings come back unchanged after a reload', async () => {
          await officeOpeningHoursPage.open();
          await officeOpeningHoursPage.selectDomain(domain);

          await officeOpeningHoursPage.assertSettingsStored(settingsBefore);
        });
      });
    });
  },
);

test.describe(
  '[administration] [functional] Office opening hours settings are copied from one domain to another',
  { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/128/' } },
  () => {
    test('The target domain is confirmed and comes back holding the settings of the source', async ({
      officeOpeningHoursPage,
    }) => {
      await officeOpeningHoursPage.open();

      const domains = await officeOpeningHoursPage.domainNamesBesidesSuiteWidget();
      expect(
        domains.length,
        'Copying is tried only between domains the rest of the suite does not chat through, and fewer than two exist',
      ).toBeGreaterThan(1);

      const [source, target] = domains;

      await officeOpeningHoursPage.withSettingsRestoredForDomains([source, target], async () => {
        await officeOpeningHoursPage.selectDomain(target);
        const targetSettingsBefore = await officeOpeningHoursPage.readSettings();

        await officeOpeningHoursPage.selectDomain(source);
        const settingsBefore = await officeOpeningHoursPage.readSettings();
        const settings: WorkingTimeFormSettings = {
          workingAllTime: !settingsBefore.workingAllTime,
          noCsaAvailableMessage: createWorkingTimeMessage(),
        };

        await test.step('The source domain is given settings the target does not have', async () => {
          await officeOpeningHoursPage.applySettings(settings);
          await officeOpeningHoursPage.saveSettings();
          await officeOpeningHoursPage.assertSaveWasConfirmed();

          expect(
            targetSettingsBefore,
            `"${target}" already holds the settings that are about to be copied onto it`,
          ).not.toEqual(settings);
        });

        await test.step(`Copying them onto "${target}" reports the settings went through`, async () => {
          await officeOpeningHoursPage.copySettingsTo(target);
          await officeOpeningHoursPage.assertSaveWasConfirmed();
        });

        await test.step('The target domain comes back with the settings of the source', async () => {
          await officeOpeningHoursPage.selectDomain(target);
          await officeOpeningHoursPage.assertSettingsStored(settings);
        });
      });
    });
  },
);
