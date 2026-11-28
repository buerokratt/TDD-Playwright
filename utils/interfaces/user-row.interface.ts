import { UserRole } from '@utils/constants';

export interface UserRow {
  readonly name: string;
  readonly roles: UserRole[];
  readonly domains: string[];
  readonly displayName: string;
  readonly title: string;
  readonly email: string;
  readonly department: string;
}
