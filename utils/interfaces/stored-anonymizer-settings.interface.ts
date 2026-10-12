export interface StoredAnonymizerSettings {
  readonly entities: string;
  readonly anonymizerSelectedApproach: string;
  readonly anonymizerSelectedEntities: string;
  readonly anonymizerAllowlist: string;
  readonly anonymizerDenylist: string;
  readonly isAnonymizationBeforeLlm: boolean;
  readonly isAnonymizationBeforeGlobalClassifier: boolean;
  readonly recordConversationsAnonymously: boolean;
}
