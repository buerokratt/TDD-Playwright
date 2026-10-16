import { Page } from '@playwright/test';

import { URLS } from '@utils/env';
import { AdminFixtures } from '@utils/interfaces';

import { asUniqueNames } from './shared-helpers';

type ServiceNames = string | string[];
type ServiceNamesResolver = ServiceNames | (() => ServiceNames | Promise<ServiceNames>);

export function serviceCleanup(resolveNames: ServiceNamesResolver) {
  return async ({
    page,
    servicesOverviewPage,
  }: Pick<AdminFixtures, 'servicesOverviewPage'> & { page: Page }): Promise<void> => {
    const names = asUniqueNames(typeof resolveNames === 'function' ? await resolveNames() : resolveNames);

    if (!names.length) {
      return;
    }

    await page.goto(URLS.admin + 'services/overview');

    for (const name of names) {
      await servicesOverviewPage.deleteServiceIfExists(name);
    }
  };
}
