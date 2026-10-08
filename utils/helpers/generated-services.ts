import { Page, expect } from '@playwright/test';

import { ACTION_TIMEOUT } from '@utils/constants';
import { URLS } from '@utils/env';
import { waitForServicesOverviewReady } from '@utils/waits';

const GENERATED_SERVICE = /\d{14}/;

export async function removeGeneratedServices(page: Page): Promise<number> {
  const table = page.locator('table').first();
  const rows = page.locator('table tbody tr');
  const generatedRows = rows.filter({ hasText: GENERATED_SERVICE });

  await page.goto(URLS.admin + 'services/overview');

  // Throws when the admin never rendered, which is what the caller has to hear about.
  // An overview that rendered but holds no services is a different, unremarkable case:
  // there is simply nothing to clean up.
  await waitForServicesOverviewReady(page, { timeout: 30000 });

  const tableRendered = await table.waitFor({ state: 'visible', timeout: ACTION_TIMEOUT }).then(
    () => true,
    () => false,
  );

  if (!tableRendered) {
    return 0;
  }

  await showAllRowsOnOnePage(page);

  let removed = 0;
  const remainingCount = await generatedRows.count();

  for (let remaining = remainingCount; remaining > 0; remaining -= 1) {
    await generatedRows.first().getByRole('button', { name: 'Delete', exact: true }).click();

    const confirmDialog = page.getByRole('dialog').filter({ hasText: /delete this service/i });
    await confirmDialog.getByRole('button', { name: 'Delete', exact: true }).click();

    await expect(generatedRows, 'Confirming the dialog did not remove the service').toHaveCount(remaining - 1, {
      timeout: ACTION_TIMEOUT,
    });

    removed += 1;
  }

  return removed;
}

async function showAllRowsOnOnePage(page: Page): Promise<void> {
  const pageSize = page.locator('select').first();

  if (await pageSize.count()) {
    await pageSize.selectOption('50');
    await expect(pageSize).toHaveValue('50');
  }
}
