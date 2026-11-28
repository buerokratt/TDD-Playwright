import { AdminFixtures } from '@utils/interfaces';

type PersonalCodeResolver = () => string;

export function userCleanup(resolvePersonalCode: PersonalCodeResolver) {
  return async ({ usersPage }: Pick<AdminFixtures, 'usersPage'>): Promise<void> => {
    await usersPage.open();
    await usersPage.deleteUserIfExists(resolvePersonalCode());
  };
}
