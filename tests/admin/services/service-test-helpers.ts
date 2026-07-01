import { AdminPageFactory } from '@page-objects/admin-page-factory';
import { Page, TestType } from '@playwright/test';

import { URLS } from '@utils/env/urls';

type ServiceNames = string | string[];
type ServiceNamesResolver = ServiceNames | (() => ServiceNames | Promise<ServiceNames>);

function asUniqueServiceNames(value: ServiceNames): string[] {
  return [
    ...new Set(
      (Array.isArray(value) ? value : [value])
        .flat()
        .filter(Boolean)
        .map((name) => String(name)),
    ),
  ];
}

export function registerServiceCleanup(test: TestType<any, any>, resolveNames: ServiceNamesResolver): void {
  test.afterEach(async ({ page }) => {
    const names = asUniqueServiceNames(typeof resolveNames === 'function' ? await resolveNames() : resolveNames);

    if (!names.length) {
      return;
    }

    const sop = new AdminPageFactory(page).getServicesOverview();
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
    sop: apf.getServicesOverview(),
  };
}
