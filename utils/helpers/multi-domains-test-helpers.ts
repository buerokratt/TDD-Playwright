import { Page, expect } from '@playwright/test';

import { USER_INFO_URL, WIDGET_DATA_URL, WIDGET_DOMAINS_URL } from '@utils/constants';
import { URLS } from '@utils/env';
import { WidgetDomain } from '@utils/interfaces';

type WidgetDomainsResolver = () => WidgetDomain[] | undefined;

export async function readCustomerWidgetName(page: Page): Promise<string> {
  const userResponse = await page.request.get(USER_INFO_URL);

  expect(
    userResponse.ok(),
    `The back office would not report who is signed in (${userResponse.status()})`,
  ).toBeTruthy();

  const { response: user } = (await userResponse.json()) as { response: { idCode: string } };

  const response = await page.request.get(WIDGET_DATA_URL, { params: { user_id: user.idCode } });

  expect(response.ok(), `The back office would not list its widgets (${response.status()})`).toBeTruthy();

  const widgets = (await response.json()) as { name: string; url: string }[];
  const widget = widgets.find((candidate) => candidate.url === URLS.customer);

  if (!widget) {
    throw new Error(`The back office configures no widget for ${URLS.customer}`);
  }

  return widget.name;
}

export async function readWidgetDomains(page: Page): Promise<WidgetDomain[]> {
  const response = await page.request.get(WIDGET_DOMAINS_URL);

  expect(response.ok(), `The back office failed to get the widget domains (${response.status()})`).toBeTruthy();

  const { response: domains } = (await response.json()) as { response: WidgetDomain[] };

  return domains;
}

export async function readWidgetDomainId(page: Page, name: string): Promise<string> {
  const domain = (await readWidgetDomains(page)).find((candidate) => candidate.name === name);

  if (!domain) {
    throw new Error(`The back office stores no domain named "${name}"`);
  }

  return domain.domainId;
}

export function multiDomainsCleanup(resolveDomains: WidgetDomainsResolver) {
  return async ({ page }: { page: Page }): Promise<void> => {
    const domainsBeforeRun = resolveDomains();

    if (!domainsBeforeRun) {
      return;
    }

    const added = (await readWidgetDomains(page)).filter(
      (domain) => !domainsBeforeRun.some((original) => original.domainId === domain.domainId),
    );

    if (!added.length) {
      return;
    }

    const response = await page.request.post(WIDGET_DOMAINS_URL, {
      data: { widgetDomains: JSON.stringify(added.map((domain) => ({ ...domain, active: false }))) },
    });

    expect(
      response.ok(),
      `The back office failed to delete the widget domains this run added (${response.status()})`,
    ).toBeTruthy();
  };
}
