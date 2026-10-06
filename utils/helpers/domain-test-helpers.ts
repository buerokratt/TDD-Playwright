import { Page, expect } from '@playwright/test';

import { CSA_ACTIVITY_URL, WIDGET_DATA_URL } from '@utils/constants';
import { URLS } from '@utils/env';
import { AdminPagesFixtures, CsaActivity } from '@utils/interfaces';

import { asUniqueNames } from './shared-helpers';

type DomainNames = string | string[];
type DomainNamesResolver = DomainNames | (() => DomainNames | Promise<DomainNames>);

export async function customerWidgetName(page: Page): Promise<string> {
  const activityResponse = await page.request.get(CSA_ACTIVITY_URL);

  expect(
    activityResponse.ok(),
    `The back office would not report the operator's activity (${activityResponse.status()})`,
  ).toBeTruthy();

  const activity = (await activityResponse.json()) as { response: CsaActivity };

  const response = await page.request.get(WIDGET_DATA_URL, { params: { user_id: activity.response.idCode } });

  expect(response.ok(), `The back office would not list its widgets (${response.status()})`).toBeTruthy();

  const widgets = (await response.json()) as { name: string; url: string }[];
  const widget = widgets.find((candidate) => candidate.url === URLS.customer);

  if (!widget) {
    throw new Error(`The back office configures no widget for ${URLS.customer}`);
  }

  return widget.name;
}

export function domainCleanup(resolveNames: DomainNamesResolver) {
  return async ({ multiDomainsPage }: Pick<AdminPagesFixtures, 'multiDomainsPage'>): Promise<void> => {
    const names = asUniqueNames(typeof resolveNames === 'function' ? await resolveNames() : resolveNames);

    if (!names.length) {
      return;
    }

    await multiDomainsPage.open();

    let removedAny = false;

    for (const name of names) {
      if (await multiDomainsPage.hasDomain(name)) {
        await multiDomainsPage.deleteDomainByName(name);
        removedAny = true;
      }
    }

    if (removedAny) {
      await multiDomainsPage.saveDomains();
      await multiDomainsPage.assertSaveWasConfirmed();
    }
  };
}
