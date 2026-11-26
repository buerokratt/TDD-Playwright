import { UserData } from '@utils/interfaces';

import { createEmail, uniqueSuffix } from './shared-data';

export function createUserData(prefix = 'autotestuser'): UserData {
  const name = `${prefix}${uniqueSuffix()}`;

  return {
    name,
    personalCode: Date.now().toString().slice(-11),
    roles: ['Customer support'],
    displayName: name,
    email: createEmail(prefix),
  };
}

export function createUpdatedUserData(user: UserData): UserData {
  const name = `${user.name}updated`;

  return {
    ...user,
    name,
    displayName: name,
    email: createEmail(name),
  };
}
