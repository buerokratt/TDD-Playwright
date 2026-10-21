import { NewUserData } from '@utils/interfaces';

import { uniqueSuffix } from './shared-data';

export function createUserData(prefix = 'autotestuser'): NewUserData {
  const name = `${prefix}${uniqueSuffix()}`;

  return {
    name,
    personalCode: Date.now().toString().slice(-11),
    roles: ['Customer support'],
    displayName: name,
    email: `${name}@test.test`,
  };
}

export function createUpdatedUserData(user: NewUserData): NewUserData {
  const name = `${user.name}updated`;

  return {
    ...user,
    name,
    displayName: name,
    email: `${name}@test.test`,
  };
}
