export interface AnonymizerSettings {
  approach: string;
  entities: string[];
  allowlist: string[];
  denylist: string[];
  anonymizationBeforeLlm: boolean;
  recordAnonymously: boolean;
}
