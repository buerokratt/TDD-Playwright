import { TestType } from '@playwright/test';

import { URLS } from '@utils/env';

import { asUniqueNames } from './shared-helpers';

type ServiceNames = string | string[];
type ServiceNamesResolver = ServiceNames | (() => ServiceNames | Promise<ServiceNames>);

export function registerServiceCleanup(test: TestType<any, any>, resolveNames: ServiceNamesResolver): void {
  test.afterEach(async ({ page, servicesOverviewPage }) => {
    const names = asUniqueNames(typeof resolveNames === 'function' ? await resolveNames() : resolveNames);

    if (!names.length) {
      return;
    }

    await page.goto(URLS.admin + 'services/overview');

    for (const name of names) {
      await servicesOverviewPage.deleteServiceIfExists(name);
    }
  });
}
