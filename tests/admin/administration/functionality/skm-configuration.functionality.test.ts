import { AdminPageFactory } from '@page-objects/admin-page-factory';
import { expect, test } from '@setup/test-setup';
import { ACTION_TIMEOUT } from '@utils/constants';
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
