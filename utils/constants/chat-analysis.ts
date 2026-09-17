import { ChatAnalysisLabelSection } from '@utils/interfaces';

export const CHAT_ANALYSIS_LABEL_SECTIONS: ChatAnalysisLabelSection[] = [
  {
    title: 'Add field',
    placeholder: 'Enter field name',
    note: 'Enter one or more names (separated by commas) and press "Add".',
  },
  {
    title: 'Add response quality',
    placeholder: 'Enter quality level',
    note: 'Enter one or more quality levels (separated by commas) and press "Add".',
  },
  {
    title: 'Add follow-up action status',
    placeholder: 'Enter follow-up action',
    note: 'Enter one or more follow-up actions (separated by commas) and press "Add".',
  },
];

export const CHAT_ANALYSIS_LABEL_MAX_LENGTH = 50;
