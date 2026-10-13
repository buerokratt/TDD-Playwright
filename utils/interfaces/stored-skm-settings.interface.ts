import { SkmSettings } from './skm-settings.interface';

export interface StoredSkmSettings extends SkmSettings {
  readonly azureClientIdIsSet: 'true' | 'false';
  readonly azureClientSecretIsSet: 'true' | 'false';
}
