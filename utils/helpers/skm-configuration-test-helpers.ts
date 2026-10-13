import { Page, expect } from '@playwright/test';

import { SkmConfigurationPage } from '@page-objects/settings';
import { SKM_CONFIG_URL } from '@utils/constants';
import { SkmDomainSnapshot, SkmSettings, StoredSkmSettings } from '@utils/interfaces';

export async function readSkmSettings(page: Page, domainId: string): Promise<StoredSkmSettings> {
  const response = await page.request.get(SKM_CONFIG_URL, { params: { domain: domainId } });

  expect(
    response.ok(),
    `The back office failed to return the SKM settings for domain "${domainId}" (${response.status()})`,
  ).toBeTruthy();

  const { response: settings } = (await response.json()) as { response: StoredSkmSettings };

  return settings;
}

export async function readEverySkmDomain(page: Page, scp: SkmConfigurationPage): Promise<SkmDomainSnapshot[]> {
  const domains = await scp.domainTabCount();
  const snapshots: SkmDomainSnapshot[] = [];

  for (let index = 0; index < domains; index++) {
    const domainId = await scp.selectDomainTab(index);

    snapshots.push({ domainId, settings: await readSkmSettings(page, domainId) });
  }

  return snapshots;
}

export async function saveSkmSettings(page: Page, domainId: string, settings: StoredSkmSettings): Promise<void> {
  const response = await page.request.post(SKM_CONFIG_URL, { data: { ...settings, domainUUID: [domainId] } });

  expect(
    response.ok(),
    `The back office refused to save the SKM settings of domain "${domainId}" (${response.status()})`,
  ).toBeTruthy();
}

export function skmSettingsRestore(resolveSnapshot: () => SkmDomainSnapshot | undefined) {
  return async ({ page }: { page: Page }): Promise<void> => {
    const snapshot = resolveSnapshot();

    if (!snapshot) {
      return;
    }

    await saveSkmSettings(page, snapshot.domainId, snapshot.settings);
  };
}

export function hasNoSkmCredentials({ azureClientIdIsSet, azureClientSecretIsSet }: StoredSkmSettings): boolean {
  return azureClientIdIsSet !== 'true' && azureClientSecretIsSet !== 'true';
}

export function withoutSkmCredentialFlags({
  azureClientIdIsSet: _clientIdIsSet,
  azureClientSecretIsSet: _clientSecretIsSet,
  ...settings
}: StoredSkmSettings): SkmSettings {
  return settings;
}
