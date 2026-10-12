export interface WorkingTimeSettings {
  readonly organizationUseCSA: 'true' | 'false';
  readonly organizationWorkingAllTime: 'true' | 'false';
  readonly organizationNoCsaAvailableMessage: string;
  readonly organizationBotCannotAnswerMessage: string;
  readonly [setting: string]: string;
}
