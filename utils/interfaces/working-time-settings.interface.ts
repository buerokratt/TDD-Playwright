export interface WorkingTimeSettings {
  readonly organizationUseCSA: 'true' | 'false';
  readonly organizationWorkingAllTime: 'true' | 'false';
  readonly organizationClosedOnWeekEnds: 'true' | 'false';
  readonly organizationTheSameOnAllWorkingDays: 'true' | 'false';
  readonly organizationWorkingTimeWeekdays: string;
  readonly organizationAllWeekdaysTimeStartISO: string;
  readonly organizationAllWeekdaysTimeEndISO: string;
  readonly organizationOutsideWorkingHoursAskForContacts: 'true' | 'false';
  readonly organizationOutsideWorkingHoursMessage: string;
  readonly organizationNoCsaAskForContacts: 'true' | 'false';
  readonly organizationNoCsaAvailableMessage: string;
  readonly organizationRedirectIfBotCannotAnswerMessage: string;
  readonly organizationBotCannotAnswerMessage: string;
}
