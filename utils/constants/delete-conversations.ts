import { DeleteConversationsSettings } from '@utils/interfaces';

export const EXPIRING_CONVERSATIONS_TABLE_COLUMNS = [
  'Start time',
  'End time',
  'Customer support name',
  'Name',
  'ID code',
  'Contact',
  'Comment',
  'Rating',
  'Feedback',
  'Status',
  'ID',
];

export const EXPIRING_CONVERSATIONS_TABLE_RESULT_COUNTS = ['10', '20', '30', '40', '50'];

export const EXPIRING_CONVERSATIONS_PERIOD_RANGE_SHORTCUTS = ['1 day', '7 days', '31 day', '90 days'];

export const BOTH_REMOVALS_ON: Pick<DeleteConversationsSettings, 'authenticatedRemoval' | 'anonymousRemoval'> = {
  authenticatedRemoval: true,
  anonymousRemoval: true,
};
