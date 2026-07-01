import { Page, expect } from '@playwright/test';

import { RouteReadyOptions } from '@utils/interfaces';

export async function waitForAppSettled(page: Page, { timeout = 15000 }: RouteReadyOptions = {}): Promise<void> {
  await page.waitForLoadState('domcontentloaded', { timeout }).catch(() => {});
  await page
    .waitForFunction(() => document.readyState === 'interactive' || document.readyState === 'complete', undefined, {
      timeout,
    })
    .catch(() => {});
}

export async function waitForServicesOverviewReady(
  page: Page,
  { timeout = 15000 }: RouteReadyOptions = {},
): Promise<void> {
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

export async function waitForNewServiceReady(page: Page, { timeout = 15000 }: RouteReadyOptions = {}): Promise<void> {
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
  await Promise.any(readySignals.map((locator) => locator.waitFor({ state: 'visible', timeout })));
}

export async function waitForChatsReady(page: Page, { timeout = 15000 }: RouteReadyOptions = {}): Promise<void> {
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

export async function waitForRouteReady(page: Page, url: string, options?: RouteReadyOptions): Promise<void> {
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
