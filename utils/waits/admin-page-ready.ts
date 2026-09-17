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

export async function waitForConversationsReady(
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

export async function waitForHistoryReady(
  page: Page,
  { timeout = ACTION_TIMEOUT }: RouteReadyOptions = {},
): Promise<void> {
  await waitForAppSettled(page, { timeout });

  await expect(page.getByRole('heading', { name: /^History/ }), 'History never rendered its heading').toBeVisible({
    timeout,
  });

  await expect(
    page.locator('table.data-table tbody tr').first(),
    'History rendered its heading but never received a conversation',
  ).toBeVisible({ timeout });
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

export async function waitForChatAnalysisReady(
  page: Page,
  { timeout = ACTION_TIMEOUT }: RouteReadyOptions = {},
): Promise<void> {
  await waitForAppSettled(page, { timeout });

  await expect(
    page.getByRole('heading', { name: 'Chat analysis management', exact: true }),
    'Chat analysis never rendered its heading',
  ).toBeVisible({ timeout });
}

export async function waitForSessionLengthReady(
  page: Page,
  { timeout = ACTION_TIMEOUT }: RouteReadyOptions = {},
): Promise<void> {
  await waitForAppSettled(page, { timeout });

  await expect(
    page.getByRole('heading', { name: 'Session length', exact: true }),
    'Session length never rendered its heading',
  ).toBeVisible({ timeout });

  await expect(
    page.locator('input[name="session-length"]'),
    'Session length rendered its heading but never received the settings it holds',
  ).not.toHaveValue('', { timeout });
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

export async function waitForAnonymizerReady(
  page: Page,
  { timeout = ACTION_TIMEOUT }: RouteReadyOptions = {},
): Promise<void> {
  await waitForAppSettled(page, { timeout });

  await expect(
    page.getByRole('heading', { name: 'Anonymizer Settings', exact: true }),
    'Anonymizer never rendered its heading',
  ).toBeVisible({ timeout });
}

const ROUTE_READY: { test: (url: string) => boolean; wait: typeof waitForAppSettled }[] = [
  {
    test: (url) => /\/chat\/(?:unanswered|active|pending)(?:\/|$)/i.test(url),
    wait: waitForConversationsReady,
  },
  { test: (url) => url.includes('chat/history'), wait: waitForHistoryReady },
  { test: (url) => url.includes('services/overview'), wait: waitForServicesOverviewReady },
  { test: (url) => url.includes('services/newService'), wait: waitForNewServiceReady },
  { test: (url) => url.includes('chat/chat-analysis'), wait: waitForChatAnalysisReady },
  { test: (url) => url.includes('chat/session-length'), wait: waitForSessionLengthReady },
  { test: (url) => url.includes('chat/delete-conversations'), wait: waitForDeleteConversationsReady },
  { test: (url) => url.includes('chat/multi-domains'), wait: waitForMultiDomainsReady },
  { test: (url) => url.includes('chat/anonymizer'), wait: waitForAnonymizerReady },
];

export async function waitForRouteReady(page: Page, url: string, options?: RouteReadyOptions): Promise<void> {
  const target = String(url || '');
  const route = ROUTE_READY.find((entry) => entry.test(target));

  await (route?.wait ?? waitForAppSettled)(page, options);
}
