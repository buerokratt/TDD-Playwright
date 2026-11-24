import { AdminFixtures } from '@utils/interfaces';

type PageSizeResolver = () => string | undefined;
type PersonalCodeResolver = () => string;

export function usersPageSizeCleanup(resolvePageSize: PageSizeResolver) {
  return async ({ usersPage }: Pick<AdminFixtures, 'usersPage'>): Promise<void> => {
    const pageSize = resolvePageSize();

    if (!pageSize) {
      return;
    }

    await usersPage.open();
    await usersPage.setPageSize(pageSize);
  };
}

export function userCleanup(resolvePersonalCode: PersonalCodeResolver) {
  return async ({ usersPage }: Pick<AdminFixtures, 'usersPage'>): Promise<void> => {
    await usersPage.open();
    await usersPage.deleteUserIfExists(resolvePersonalCode());
  };
}
