import { WorkingTimeSettings } from './working-time-settings.interface';

export interface WorkingTimeDomainSnapshot {
  readonly domainId: string;
  readonly settings: WorkingTimeSettings;
}
