export interface WorkingTimeSettings {
  readonly organizationUseCSA: 'true' | 'false';
  readonly organizationWorkingAllTime: 'true' | 'false';
  readonly organizationClosedOnWeekEnds: 'true' | 'false';
  readonly organizationTheSameOnAllWorkingDays: 'true' | 'false';
  readonly organizationWorkingTimeWeekdays: string;
  readonly organizationAllWeekdaysTimeStartISO: string;
  readonly organizationAllWeekdaysTimeEndISO: string;
  readonly organizationOutsideWorkingHoursAskForContacts: 'true' | 'false';
  readonly organizationNoCsaAskForContacts: 'true' | 'false';
  readonly organizationNoCsaAvailableMessage: string;
  readonly organizationBotCannotAnswerMessage: string;
  readonly organizationRedirectIfBotCannotAnswerMessage: string;
  readonly organizationOutsideWorkingHoursMessage: string;
}
