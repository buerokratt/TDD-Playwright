import { Page, expect } from '@playwright/test';

import { ACTION_TIMEOUT } from '@utils/constants';
import { RouteReadyOptions } from '@utils/interfaces';

export async function waitForAppSettled(
  page: Page,
  { timeout = ACTION_TIMEOUT }: RouteReadyOptions = {},
): Promise<void> {
  await page.waitForLoadState('domcontentloaded', { timeout }).catch(() => {});
  await page
    .waitForFunction(() => document.readyState === 'interactive' || document.readyState === 'complete', undefined, {
      timeout,
    })
    .catch(() => {});
}

export async function waitForServicesOverviewReady(
  page: Page,
  { timeout = ACTION_TIMEOUT }: RouteReadyOptions = {},
): Promise<void> {
  await waitForAppSettled(page, { timeout });

  const heading = page.getByRole('heading', { name: 'Services', exact: true });
  const createButton = page.getByRole('button', { name: 'Create new service', exact: true });
  const table = page.getByTestId('services-table').or(page.locator('table.data-table')).or(page.locator('table'));

  await expect(
    heading.or(createButton).or(table).first(),
    'Services overview rendered neither its heading, its create button nor a services table',
  ).toBeVisible({ timeout });
}

export async function waitForNewServiceReady(
  page: Page,
  { timeout = ACTION_TIMEOUT }: RouteReadyOptions = {},
): Promise<void> {
  await waitForAppSettled(page, { timeout });

  const header = page.locator('header.header').first().or(page.locator('header').first());

  await expect(header).toBeVisible({ timeout });
  await expect(page.locator('.react-flow__node').first()).toBeVisible({ timeout });
}

export async function waitForChatsReady(
  page: Page,
  { timeout = ACTION_TIMEOUT }: RouteReadyOptions = {},
): Promise<void> {
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

export async function waitForMultiDomainsReady(
  page: Page,
  { timeout = ACTION_TIMEOUT }: RouteReadyOptions = {},
): Promise<void> {
  await waitForAppSettled(page, { timeout });

  await expect(
    page.getByRole('heading', { name: 'Multidomains', exact: true }),
    'Multidomains never rendered its heading',
  ).toBeVisible({ timeout });
}

export async function waitForDeleteConversationsReady(
  page: Page,
  { timeout = ACTION_TIMEOUT }: RouteReadyOptions = {},
): Promise<void> {
  await waitForAppSettled(page, { timeout });

  await expect(
    page.getByRole('heading', { name: 'Conversation deletion', exact: true }),
    'Conversation deletion never rendered its heading',
  ).toBeVisible({ timeout });
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

  if (target.includes('chat/multi-domains')) {
    await waitForMultiDomainsReady(page, options);
    return;
  }

  if (target.includes('chat/delete-conversations')) {
    await waitForDeleteConversationsReady(page, options);
    return;
  }

  if (/\/chat(?:\/|$)/i.test(target)) {
    await waitForChatsReady(page, options);
    return;
  }

  await waitForAppSettled(page, options);
}
