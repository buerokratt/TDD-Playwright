import { Page } from '@playwright/test';

import { AdminPageFactory } from '@page-objects/admin-page-factory';

type PageSizeResolver = () => string | undefined;

export function usersPageSizeCleanup(resolvePageSize: PageSizeResolver) {
  return async ({ page }: { page: Page }): Promise<void> => {
    const pageSize = resolvePageSize();

    if (!pageSize) {
      return;
    }

    const up = new AdminPageFactory(page).getUsersPage();

    await up.open();
    await up.setPageSize(pageSize);
  };
}

export function userCleanup(resolvePersonalCode: () => string) {
  return async ({ page }: { page: Page }): Promise<void> => {
    const up = new AdminPageFactory(page).getUsersPage();

    await up.open();
    await up.deleteUserIfExists(resolvePersonalCode());
  };
}
