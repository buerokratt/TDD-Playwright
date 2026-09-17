import { Page } from '@playwright/test';

import { AdminPageFactory } from '@page-objects/admin-page-factory';
import { DeleteConversationsSettings } from '@utils/interfaces';

type SettingsResolver = () => DeleteConversationsSettings | undefined;

export function deleteConversationsCleanup(resolveSettings: SettingsResolver) {
  return async ({ page }: { page: Page }): Promise<void> => {
    const settings = resolveSettings();

    if (!settings) {
      return;
    }

    const dcp = new AdminPageFactory(page).getDeleteConversationsPage();

    await dcp.open();
    await dcp.applySettings(settings);
    await dcp.saveSettings();
    await dcp.assertSaveWasConfirmed();
  };
}
