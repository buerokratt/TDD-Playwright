import { WorkingTimeSettings } from '@utils/interfaces';

export const CSA_AVAILABLE_ALL_TIME: Partial<WorkingTimeSettings> = {
  organizationWorkingAllTime: 'true',
  organizationUseCSA: 'true',
};

// Use customer service is what decides the answer: with it off the bot shows the "bot cannot
// answer" notice whatever the hours say, so this leaves the 24/7 hours `setup` wrote in place.
// What a closed office does on its own, with customer service still on, no test here measures.
export const CSA_UNAVAILABLE: Partial<WorkingTimeSettings> = {
  organizationUseCSA: 'false',
};
