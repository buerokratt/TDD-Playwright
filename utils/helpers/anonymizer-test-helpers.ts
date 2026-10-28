import { Page, expect } from '@playwright/test';

import { ANONYMIZER_CONFIG_URL } from '@utils/constants';
import { StoredAnonymizerSettings } from '@utils/interfaces';

function splitStoredList(list: string): string[] {
  return list
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function comparableAnonymizerSettings(stored: StoredAnonymizerSettings) {
  return {
    ...stored,
    entities: splitStoredList(stored.entities).sort(),
    anonymizerSelectedEntities: splitStoredList(stored.anonymizerSelectedEntities).sort(),
    anonymizerAllowlist: splitStoredList(stored.anonymizerAllowlist).sort(),
    anonymizerDenylist: splitStoredList(stored.anonymizerDenylist).sort(),
  };
}

export async function readStoredAnonymizerSettings(page: Page, domainId: string): Promise<StoredAnonymizerSettings> {
  const response = await page.request.get(ANONYMIZER_CONFIG_URL, { params: { domain: domainId } });

  expect(response.ok(), `The back office would not read the anonymizer settings (${response.status()})`).toBeTruthy();

  return ((await response.json()) as { response: StoredAnonymizerSettings }).response;
}

export async function assertAnonymizerSettingsUnchanged(
  page: Page,
  domainId: string,
  snapshot: StoredAnonymizerSettings,
): Promise<void> {
  expect(
    comparableAnonymizerSettings(await readStoredAnonymizerSettings(page, domainId)),
    'The anonymizer settings were left changed',
  ).toEqual(comparableAnonymizerSettings(snapshot));
}
