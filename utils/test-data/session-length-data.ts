import { uniqueSuffix } from './shared-data';

export function createSessionLengthMessage(prefix = 'autotest session length'): string {
  return `${prefix} ${uniqueSuffix()}`;
}

export function nextSessionLength(current: string): string {
  return current === '45' ? '60' : '45';
}

export function nextResponseTime(current: string): string {
  return current === '10' ? '15' : '10';
}
