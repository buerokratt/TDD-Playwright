export const SKM_SEARCH_TYPES = [
  'Semantic',
  'Vector',
  'Keyword',
  'Hybrid (keyword + vector)',
  'Hybrid + Semantic',
] as const;

export const SKM_RETRIEVAL_FIELDS = [
  'Strictness',
  'Found Documents',
  'System Instruction',
  'Maximum Number Of Tokens',
  'Index',
  'Semantic Configuration',
  'Search Type',
  'Limit bot responses to your data',
] as const;

export const SKM_AGENTIC_FIELDS = [
  'Agent name',
  'Agent type',
  'Maximum output tokens',
  'Client ID',
  'Client secret',
] as const;

export type SkmField = (typeof SKM_RETRIEVAL_FIELDS)[number] | (typeof SKM_AGENTIC_FIELDS)[number];

export const SKM_NUMBER_FIELDS: readonly SkmField[] = [
  'Strictness',
  'Found Documents',
  'Maximum Number Of Tokens',
  'Maximum output tokens',
];

export const OUT_OF_RANGE_STRICTNESS = '6';

export const OUT_OF_RANGE_FOUND_DOCUMENTS = '21';

export const OUT_OF_RANGE_MAX_TOKENS = '2001';
