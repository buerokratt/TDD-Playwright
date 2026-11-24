import { uniqueSuffix } from './shared-data';

export function createWorkingTimeMessage(prefix = 'autotest working time'): string {
  return `${prefix} ${uniqueSuffix()}`;
}
