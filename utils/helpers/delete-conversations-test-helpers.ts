import { AdminFixtures, DeleteConversationsSettings } from '@utils/interfaces';

type SettingsResolver = () => DeleteConversationsSettings | undefined;

export function deleteConversationsCleanup(resolveSettings: SettingsResolver) {
  return async ({ deleteConversationsPage }: Pick<AdminFixtures, 'deleteConversationsPage'>): Promise<void> => {
    const settings = resolveSettings();

    if (!settings) {
      return;
    }

    await deleteConversationsPage.open();
    await deleteConversationsPage.applySettings(settings);
    await deleteConversationsPage.saveSettings();
    await deleteConversationsPage.assertSaveWasConfirmed();
  };
}
