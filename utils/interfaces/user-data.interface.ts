import { UserRole } from '@utils/constants';

export interface UserData {
  readonly name: string;
  readonly personalCode: string;
  readonly roles: UserRole[];
  readonly displayName: string;
  readonly email: string;
}
