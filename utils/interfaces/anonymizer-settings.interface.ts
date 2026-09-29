import { AnonymizerApproach, AnonymizerEntity } from '@utils/constants';

export interface AnonymizerSettings {
  readonly approach: AnonymizerApproach;
  readonly entities: AnonymizerEntity[];
  readonly allowlist: string[];
  readonly denylist: string[];
  readonly anonymizationBeforeLlm: boolean;
  readonly recordAnonymously: boolean;
}
