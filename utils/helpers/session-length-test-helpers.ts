import { Page } from '@playwright/test';

import { AdminPageFactory } from '@page-objects/admin-page-factory';
import { SessionLengthSettings } from '@utils/interfaces';

type SessionLengthResolver = () => SessionLengthSettings | undefined;

export function sessionLengthCleanup(resolveSettings: SessionLengthResolver) {
  return async ({ page }: { page: Page }): Promise<void> => {
    const settings = resolveSettings();

    if (!settings) {
      return;
    }

    const slp = new AdminPageFactory(page).getSessionLengthPage();

    await slp.open();
    await slp.applySettings(settings);
    await slp.saveSettings();
    await slp.assertSaveWasConfirmed();
  };
}
