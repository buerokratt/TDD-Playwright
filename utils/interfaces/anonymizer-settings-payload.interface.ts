import { StoredAnonymizerSettings } from './stored-anonymizer-settings.interface';

export interface AnonymizerSettingsPayload extends StoredAnonymizerSettings {
  readonly domainUUID: string[];
}
