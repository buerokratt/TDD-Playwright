import { AdminPageFactory } from '@page-objects/admin-page-factory';
import { expect, test } from '@setup/test-setup';
import { ACTION_TIMEOUT } from '@utils/constants';
import {
  hasNoSkmCredentials,
  readSkmSettings,
  saveSkmSettings,
  skmSettingsRestore,
  withoutSkmCredentialFlags,
} from '@utils/helpers';
import { SkmDomainSnapshot } from '@utils/interfaces';
import { createSkmIndexName, nextSkmStrictness } from '@utils/test-data';

test.describe('[administration] [functional] SKM settings are copied from one domain to another', () => {
  let targetSnapshot: SkmDomainSnapshot | undefined;

  test.afterEach(skmSettingsRestore(() => targetSnapshot));

  test(
    'The target domain is confirmed and comes back holding the settings of the source with no client ID or secret',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/196/' } },
    async ({ page }) => {
      const scp = new AdminPageFactory(page).getSkmConfigurationPage();

      await scp.open();

      const domains = await scp.domainTabCount();

      expect(domains, 'Copying settings is only offered where a second domain exists').toBeGreaterThan(1);

      const domainIds: string[] = [];

      for (let index = 0; index < domains; index++) {
        domainIds.push(await scp.selectDomainTab(index));
      }

      const settingsBefore = await Promise.all(domainIds.map((domainId) => readSkmSettings(page, domainId)));
      const targetIndex = settingsBefore.findIndex(hasNoSkmCredentials);

      test.skip(targetIndex === -1, 'Every domain holds a client ID or secret that copying would erase for good');

      const sourceIndex = targetIndex === 0 ? 1 : 0;
      const targetId = domainIds[targetIndex];
      const targetName = await scp.domainTabName(targetIndex);
      const sourceSettings = withoutSkmCredentialFlags(settingsBefore[sourceIndex]);

      await test.step("The target domain's current settings are saved to be restored later", async () => {
        targetSnapshot = { domainId: targetId, settings: settingsBefore[targetIndex] };
      });

      await test.step('The target domain is given settings the source does not have', async () => {
        await saveSkmSettings(page, targetId, {
          ...settingsBefore[targetIndex],
          range: nextSkmStrictness(sourceSettings.range),
          indexName: createSkmIndexName(),
        });

        expect(
          withoutSkmCredentialFlags(await readSkmSettings(page, targetId)),
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
          .poll(async () => withoutSkmCredentialFlags(await readSkmSettings(page, targetId)), {
            message: `"${targetName}" came back with settings of its own`,
            timeout: ACTION_TIMEOUT,
          })
          .toEqual(sourceSettings);
      });

      await test.step(`"${targetName}" holds no client ID or secret after the copy`, async () => {
        expect(
          hasNoSkmCredentials(await readSkmSettings(page, targetId)),
          `"${targetName}" kept a client ID or secret after the copy`,
        ).toBe(true);
      });
    },
  );
});
