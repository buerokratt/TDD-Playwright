export interface DeleteConversationsSettings {
  readonly authenticatedRemoval: boolean;
  readonly authenticatedPeriod?: string;
  readonly anonymousRemoval: boolean;
  readonly anonymousPeriod?: string;
  readonly deletionTime?: string;
}
