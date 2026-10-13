import { uniqueSuffix } from './shared-data';

export function createSkmIndexName(prefix = 'autotestindex'): string {
  return `${prefix}${uniqueSuffix()}`;
}

export function nextSkmStrictness(current: string): string {
  return current === '5' ? '1' : String(Number(current) + 1);
}

export function nextSkmFoundDocuments(current: string): string {
  return current === '20' ? '1' : String(Number(current) + 1);
}
