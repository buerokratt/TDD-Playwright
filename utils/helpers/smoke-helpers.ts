import { Page, expect } from '@playwright/test';

import { URLS } from '@utils/env';
import { AdminPageVisit, FailedApiCall, ServerError } from '@utils/interfaces';

const isApiCall = (url: string): boolean => url.includes('ruuter');

export async function openAdminPage(page: Page, path: string): Promise<AdminPageVisit> {
  const serverErrors: ServerError[] = [];
  const failedApiCalls: FailedApiCall[] = [];

  page.on('response', (response) => {
    const status = response.status();
    const url = response.url();

    if (status >= 500) {
      serverErrors.push({ status, url });
    }

    if (status >= 400 && isApiCall(url)) {
      failedApiCalls.push({ status, method: response.request().method(), url });
    }
  });

  const response = await page.goto(URLS.admin + path);

  expect(response?.status(), `GET ${path} should serve the admin app`).toBeLessThan(400);

  return {
    assertBackendAnswered(): void {
      expect(serverErrors, `${path} made requests that failed on the server`).toEqual([]);
    },

    assertNoFailedApiCalls(): void {
      expect(failedApiCalls, `${path} called API endpoints that did not answer`).toEqual([]);
    },
  };
}
