const { expect } = require('@playwright/test');

async function waitForAppSettled(page, { timeout = 15000 } = {}) {
  await page.waitForLoadState('domcontentloaded', { timeout }).catch(() => {});
  await page.waitForFunction(() => document.readyState === 'interactive' || document.readyState === 'complete', undefined, { timeout }).catch(() => {});
}

async function waitForServicesOverviewReady(page, { timeout = 15000 } = {}) {
  await waitForAppSettled(page, { timeout });

  const heading = page.getByRole('heading', { name: /Teenused/i }).first();
  const createButton = page.getByRole('button', { name: /Loo uus teenus/i }).first();
  const table = page
    .getByTestId('services-table')
    .first()
    .or(page.locator('table.data-table').first())
    .or(page.locator('table').first());

  await Promise.any([
    heading.waitFor({ state: 'visible', timeout }),
    createButton.waitFor({ state: 'visible', timeout }),
    table.waitFor({ state: 'visible', timeout }),
  ]).catch(async () => {
    await expect(page.locator('main').first()).toBeVisible({ timeout });
  });
}

async function waitForNewServiceReady(page, { timeout = 15000 } = {}) {
  await waitForAppSettled(page, { timeout });

  const header = page.locator('header.header').first().or(page.locator('header').first());
  const readySignals = [
    page.getByRole('application').first(),
    page.locator('.react-flow, .react-flow__renderer, .react-flow__viewport').first(),
    page.locator('button.edge-button').first(),
    page.locator('.react-flow__node-start, .start-node').first(),
    page.getByRole('button', { name: /Teenuse seaded/i }).first(),
  ];

  await expect(header).toBeVisible({ timeout });
  await Promise.any(
    readySignals.map((locator) => locator.waitFor({ state: 'visible', timeout }))
  );
}

async function waitForChatsReady(page, { timeout = 15000 } = {}) {
  await waitForAppSettled(page, { timeout });
  const main = page.locator('main').first();
  const heading = page.getByRole('heading').first();
  const tabList = page.getByRole('tablist').first();

  await Promise.any([
    tabList.waitFor({ state: 'visible', timeout }),
    heading.waitFor({ state: 'visible', timeout }),
    main.waitFor({ state: 'visible', timeout }),
  ]).catch(async () => {
    await expect(page.locator('body')).toBeVisible({ timeout });
  });
}

async function waitForRouteReady(page, url, options) {
  const target = String(url || '');
  if (target.includes('services/overview')) {
    await waitForServicesOverviewReady(page, options);
    return;
  }
  if (target.includes('services/newService')) {
    await waitForNewServiceReady(page, options);
    return;
  }
  if (/\/chat(?:\/|$)/i.test(target)) {
    await waitForChatsReady(page, options);
    return;
  }
  await waitForAppSettled(page, options);
}

module.exports = {
  waitForAppSettled,
  waitForServicesOverviewReady,
  waitForNewServiceReady,
  waitForChatsReady,
  waitForRouteReady,
};
