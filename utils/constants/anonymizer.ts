export const ANONYMIZER_APPROACHES = ['Replace', 'Redact', 'Mask', 'Hash'] as const;

export type AnonymizerApproach = (typeof ANONYMIZER_APPROACHES)[number];

export const ANONYMIZER_ENTITIES = [
  'EST_ID_DOC',
  'ORGANIZATION',
  'IBAN_CODE',
  'PHONE_NUMBER',
  'LOCATION',
  'CAR_NUMBER',
  'DATE_TIME',
  'IP_ADDRESS',
  'GPE',
  'CREDIT_CARD',
  'URL',
  'CRYPTO',
  'PERSON',
  'EE_PERSONAL_CODE',
  'EMAIL_ADDRESS',
] as const;

export type AnonymizerEntity = (typeof ANONYMIZER_ENTITIES)[number];

export const ANONYMIZER_WORD_LISTS = ['allowlist', 'denylist'] as const;

export type AnonymizerWordList = (typeof ANONYMIZER_WORD_LISTS)[number];

export const ANONYMIZER_DENYLIST_PLACEHOLDER = '[REDACTED]';

export const DOMAIN_SELECTION_STORAGE_KEY = 'domain-selection';
