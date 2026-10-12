import { CHAT_ANALYSIS_LABEL_MAX_LENGTH } from '@utils/constants';

import { uniqueSuffix } from './shared-data';

export function createChatAnalysisLabel(prefix = 'autotestlabel'): string {
  return `${prefix}${uniqueSuffix()}`;
}

export function createOverlongChatAnalysisLabel(prefix = 'autotestlong'): string {
  return createChatAnalysisLabel(prefix).padEnd(CHAT_ANALYSIS_LABEL_MAX_LENGTH + 1, 'x');
}
