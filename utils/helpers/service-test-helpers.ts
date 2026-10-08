import { Page, TestType } from '@playwright/test';

import { AdminPageFactory } from '@page-objects/admin-page-factory';
import { URLS } from '@utils/env';

import { asUniqueNames } from './shared-helpers';

type ServiceNames = string | string[];
type ServiceNamesResolver = ServiceNames | (() => ServiceNames | Promise<ServiceNames>);

export function registerServiceCleanup(test: TestType<any, any>, resolveNames: ServiceNamesResolver): void {
  test.afterEach(async ({ page }) => {
    const names = asUniqueNames(typeof resolveNames === 'function' ? await resolveNames() : resolveNames);

    if (!names.length) {
      return;
    }

    const sop = new AdminPageFactory(page).getServicesOverviewPage();
    await page.goto(URLS.admin + 'services/overview');

    for (const name of names) {
      await sop.deleteServiceIfExists(name);
    }
  });
}

export function getServicePages(page: Page) {
  const apf = new AdminPageFactory(page);
  return {
    apf,
    nsp: apf.getNewServicePage(),
    sop: apf.getServicesOverviewPage(),
  };
}
