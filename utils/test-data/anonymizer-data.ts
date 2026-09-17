import { ANONYMIZER_APPROACHES, ANONYMIZER_ENTITIES } from '@utils/constants';

import { uniqueSuffix } from './shared-data';

export function createAnonymizerWord(prefix = 'autotestword'): string {
  return `${prefix}${uniqueSuffix()}`;
}

export function createAnonymizerEmail(prefix = 'autotestmail'): string {
  return `${prefix}${uniqueSuffix()}@example.com`;
}

export function nextAnonymizerApproach(current: string): string {
  const approaches: readonly string[] = ANONYMIZER_APPROACHES;
  const index = approaches.indexOf(current);

  return approaches[(index + 1) % approaches.length];
}

export function toggledAnonymizerEntities(current: string[]): string[] {
  const [flipped] = ANONYMIZER_ENTITIES;

  return ANONYMIZER_ENTITIES.filter((entity) =>
    entity === flipped ? !current.includes(flipped) : current.includes(entity),
  );
}
