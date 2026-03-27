const { expect } = require('@playwright/test');

async function waitForAppSettled(page, { timeout = 15000 } = {}) {
  await page.waitForLoadState('domcontentloaded', { timeout }).catch(() => {});
  await page.waitForFunction(() => document.readyState === 'interactive' || document.readyState === 'complete', undefined, { timeout }).catch(() => {});
}

async function waitForServicesOverviewReady(page, { timeout = 15000 } = {}) {
  await waitForAppSettled(page, { timeout });
  const heading = page.getByRole('heading', { name: /Teenused/i }).first();
  const candidate = page.getByTestId('services-table').first().or(page.locator('table.data-table').first()).or(page.locator('table').first());
  await expect(heading).toBeVisible({ timeout });
  await expect(candidate).toBeVisible({ timeout });
}

async function waitForNewServiceReady(page, { timeout = 15000 } = {}) {
  await waitForAppSettled(page, { timeout });
  const header = page.locator('header.header');
  const canvas = page.getByRole('application');
  await expect(header).toBeVisible({ timeout });
  await expect(canvas).toBeVisible({ timeout });
}

async function waitForChatsReady(page, { timeout = 15000 } = {}) {
  await waitForAppSettled(page, { timeout });
  const tabList = page.getByRole('tablist');
  await expect(tabList).toBeVisible({ timeout });
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
  if (target.includes('/chat')) {
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
