const { URLS } = require('../../../playwright.config');
const { AdminPageFactory: ap } = require('../../../page-objects/admin-page-factory');

function asUniqueServiceNames(value) {
  return [...new Set(
    (Array.isArray(value) ? value : [value])
      .flat()
      .filter(Boolean)
      .map((name) => String(name))
  )];
}

function registerServiceCleanup(test, resolveNames) {
  test.afterEach(async ({ page }) => {
    const names = asUniqueServiceNames(
      typeof resolveNames === 'function' ? await resolveNames() : resolveNames
    );

    if (!names.length) {
      return;
    }

    const sop = new ap(page).getServicesOverview();
    await page.goto(URLS.admin + 'services/overview');

    for (const name of names) {
      await sop.deleteServiceIfExists(name);
    }
  });
}

function getServicePages(page) {
  const apf = new ap(page);
  return {
    apf,
    nsp: apf.getNewServicePage(),
    sop: apf.getServicesOverview(),
  };
}

module.exports = {
  registerServiceCleanup,
  getServicePages,
};
