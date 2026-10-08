import { AdminPagesFixtures, SessionLengthSettings } from '@utils/interfaces';

type SessionLengthResolver = () => SessionLengthSettings | undefined;

export function sessionLengthCleanup(resolveSettings: SessionLengthResolver) {
  return async ({ sessionLengthPage }: Pick<AdminPagesFixtures, 'sessionLengthPage'>): Promise<void> => {
    const settings = resolveSettings();

    if (!settings) {
      return;
    }

    await sessionLengthPage.open();
    await sessionLengthPage.applySettings(settings);
    await sessionLengthPage.saveSettings();
    await sessionLengthPage.assertSaveWasConfirmed();
  };
}
