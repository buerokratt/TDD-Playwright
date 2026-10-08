import { ANONYMIZER_APPROACHES, ANONYMIZER_ENTITIES, AnonymizerApproach, AnonymizerEntity } from '@utils/constants';

import { uniqueSuffix } from './shared-data';

export function createAnonymizerWord(prefix = 'autotestword'): string {
  return `${prefix}${uniqueSuffix()}`;
}

export function createAnonymizerEmail(prefix = 'autotestmail'): string {
  return `${prefix}${uniqueSuffix()}@example.com`;
}

export function nextAnonymizerApproach(current: AnonymizerApproach): AnonymizerApproach {
  const index = ANONYMIZER_APPROACHES.indexOf(current);

  return ANONYMIZER_APPROACHES[(index + 1) % ANONYMIZER_APPROACHES.length];
}

export function toggledAnonymizerEntities(current: readonly AnonymizerEntity[]): AnonymizerEntity[] {
  const [flipped] = ANONYMIZER_ENTITIES;

  return ANONYMIZER_ENTITIES.filter((entity) =>
    entity === flipped ? !current.includes(flipped) : current.includes(entity),
  );
}
