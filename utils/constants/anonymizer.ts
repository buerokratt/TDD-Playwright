export const ANONYMIZER_APPROACHES = ['Replace', 'Redact', 'Mask', 'Hash'] as const;

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
