import { uniqueSuffix } from './shared-data';

export function createDomainName(prefix = 'autotestdomain'): string {
  return `${prefix}${uniqueSuffix()}`;
}

export function createUpdatedDomainName(baseName: string): string {
  return `${baseName}updated`;
}

export function createDomainUrl(domainName: string): string {
  return `https://${domainName.toLowerCase()}.buerokratt.ee`;
}
