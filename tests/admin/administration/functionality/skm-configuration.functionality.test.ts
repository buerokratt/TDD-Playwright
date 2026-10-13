import { AdminPageFactory } from '@page-objects/admin-page-factory';
import { expect, test } from '@setup/test-setup';
import {
  ACTION_TIMEOUT,
  OUT_OF_RANGE_FOUND_DOCUMENTS,
  OUT_OF_RANGE_MAX_TOKENS,
  OUT_OF_RANGE_STRICTNESS,
} from '@utils/constants';
import {
  hasNoSkmCredentials,
  readEverySkmDomain,
  readSkmSettings,
  saveSkmSettings,
  skmSettingsRestore,
  withoutSkmCredentialFlags,
} from '@utils/helpers';
import { SkmDomainSnapshot } from '@utils/interfaces';
import { createSkmIndexName, nextSkmFoundDocuments, nextSkmStrictness } from '@utils/test-data';

test.describe('[administration] [functional] SKM settings are saved and read back', () => {
  let targetSnapshot: SkmDomainSnapshot | undefined;

  test.afterEach(skmSettingsRestore(() => targetSnapshot));

  test(
    'The saved retrieval settings are confirmed and come back after the page is reopened',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/197/' } },
    async ({ page }) => {
      const scp = new AdminPageFactory(page).getSkmConfigurationPage();

      await scp.open();

      const domains = await readEverySkmDomain(page, scp);
      const targetIndex = domains.findIndex(({ settings }) => hasNoSkmCredentials(settings));

      test.skip(targetIndex === -1, 'Every domain holds a client ID or secret that saving could erase');

      const target = domains[targetIndex];
      const changes = {
        range: nextSkmStrictness(target.settings.range),
        documents: nextSkmFoundDocuments(target.settings.documents),
        indexName: createSkmIndexName(),
      };

      await test.step("The target domain's current settings are saved to be restored later", async () => {
        targetSnapshot = target;
      });

      await test.step('Strictness, found documents and index are changed and the save is confirmed', async () => {
        await scp.selectDomainTab(targetIndex);
        await scp.applyRetrievalSettings(changes);
        await scp.saveSettings();
        await scp.assertSaveWasConfirmed();
      });

      await test.step('The domain comes back with the saved values after the page is reopened', async () => {
        await scp.open();
        await scp.selectDomainTab(targetIndex);
        await scp.assertRetrievalSettingsStored(changes);
      });

      await test.step('The back office stores the saved values', async () => {
        expect(
          await readSkmSettings(page, target.domainId),
          'The back office holds settings other than the ones saved',
        ).toMatchObject(changes);
      });
    },
  );
});

test.describe('[administration] [functional] SKM values outside their range are refused and nothing is stored', () => {
  let targetSnapshot: SkmDomainSnapshot | undefined;

  test.afterEach(skmSettingsRestore(() => targetSnapshot));

  test(
    'Every invalid value is named in a notification and the domain keeps the settings it ran on',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/198/' } },
    async ({ page }) => {
      const scp = new AdminPageFactory(page).getSkmConfigurationPage();

      await scp.open();

      const domains = await readEverySkmDomain(page, scp);
      const targetIndex = domains.findIndex(({ settings }) => hasNoSkmCredentials(settings));

      test.skip(targetIndex === -1, 'Every domain holds a client ID or secret that a save let through could erase');

      const target = domains[targetIndex];

      await test.step("The target domain's current settings are saved to be restored later", async () => {
        targetSnapshot = target;
      });

      await scp.selectDomainTab(targetIndex);
      await scp.setAgenticRetrieval(false);

      await test.step('A strictness outside 1-5 is refused with its range', async () => {
        await scp.fillStrictness(OUT_OF_RANGE_STRICTNESS);
        await scp.saveSettings();

        await scp.assertSaveWasRejected('Range must be between 1 and 5');
      });

      await test.step('A found documents value outside 1-20 is refused with its range', async () => {
        await scp.fillStrictness(target.settings.range);
        await scp.fillFoundDocuments(OUT_OF_RANGE_FOUND_DOCUMENTS);
        await scp.saveSettings();

        await scp.assertSaveWasRejected('Documents must be between 1 and 20');
      });

      await test.step('An empty system instruction is refused as empty', async () => {
        await scp.fillFoundDocuments(target.settings.documents);
        await scp.clearSystemInstruction();
        await scp.saveSettings();

        await scp.assertSaveWasRejected("System message can't be empty");
      });

      await test.step('A maximum number of tokens outside 1-2000 is refused with its range', async () => {
        await scp.fillSystemInstruction(target.settings.systemMessage);
        await scp.fillMaxTokens(OUT_OF_RANGE_MAX_TOKENS);
        await scp.saveSettings();

        await scp.assertSaveWasRejected('Maxmimum number of tokens must be between 1 and 2000');
      });

      await test.step('The settings the domain held survive the refused saves', async () => {
        expect(
          await readSkmSettings(page, target.domainId),
          'A refused save still changed the stored settings',
        ).toEqual(target.settings);
      });
    },
  );
});

test.describe('[administration] [functional] SKM settings are copied from one domain to another', () => {
  let targetSnapshot: SkmDomainSnapshot | undefined;

  test.afterEach(skmSettingsRestore(() => targetSnapshot));

  test(
    'The target domain is confirmed and comes back holding the settings of the source with no client ID or secret',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/196/' } },
    async ({ page }) => {
      const scp = new AdminPageFactory(page).getSkmConfigurationPage();

      await scp.open();

      const domains = await readEverySkmDomain(page, scp);

      expect(domains.length, 'Copying settings is only offered where a second domain exists').toBeGreaterThan(1);

      const targetIndex = domains.findIndex(({ settings }) => hasNoSkmCredentials(settings));

      test.skip(targetIndex === -1, 'Every domain holds a client ID or secret that copying would erase for good');

      const sourceIndex = targetIndex === 0 ? 1 : 0;
      const target = domains[targetIndex];
      const targetName = await scp.domainTabName(targetIndex);
      const sourceSettings = withoutSkmCredentialFlags(domains[sourceIndex].settings);

      await test.step("The target domain's current settings are saved to be restored later", async () => {
        targetSnapshot = target;
      });

      await test.step('The target domain is given settings the source does not have', async () => {
        await saveSkmSettings(page, target.domainId, {
          ...target.settings,
          range: nextSkmStrictness(sourceSettings.range),
          indexName: createSkmIndexName(),
        });

        expect(
          withoutSkmCredentialFlags(await readSkmSettings(page, target.domainId)),
          `"${targetName}" already holds the settings that are about to be copied onto it`,
        ).not.toEqual(sourceSettings);
      });

      await test.step(`Copying the source onto "${targetName}" reports the settings went through`, async () => {
        await scp.selectDomainTab(sourceIndex);
        await scp.copySettingsTo(targetName);
        await scp.assertSaveWasConfirmed();
      });

      await test.step('The target domain comes back with the settings of the source', async () => {
        await scp.selectDomainTab(targetIndex);

        await expect
          .poll(async () => withoutSkmCredentialFlags(await readSkmSettings(page, target.domainId)), {
            message: `"${targetName}" came back with settings of its own`,
            timeout: ACTION_TIMEOUT,
          })
          .toEqual(sourceSettings);
      });

      await test.step(`"${targetName}" holds no client ID or secret after the copy`, async () => {
        expect(
          hasNoSkmCredentials(await readSkmSettings(page, target.domainId)),
          `"${targetName}" kept a client ID or secret after the copy`,
        ).toBe(true);
      });
    },
  );
});
