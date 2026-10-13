import { StoredSkmSettings } from './stored-skm-settings.interface';

export interface SkmDomainSnapshot {
  readonly domainId: string;
  readonly settings: StoredSkmSettings;
}
