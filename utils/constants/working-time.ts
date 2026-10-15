import { WorkingTimeSettings } from '@utils/interfaces';

export const WORKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
export const WEEK_DAYS = [...WORKDAYS, 'Saturday', 'Sunday'];

export const CSA_AVAILABLE_ALL_TIME: Partial<WorkingTimeSettings> = {
  organizationWorkingAllTime: 'true',
  organizationUseCSA: 'true',
};

// Use customer service is what decides the answer: with it off the bot shows the "bot cannot
// answer" notice whatever the hours say, so this leaves the 24/7 hours `setup` wrote in place.
// What a closed office does on its own, with customer service still on, no test here measures.
export const CSA_UNAVAILABLE: Partial<WorkingTimeSettings> = {
  organizationUseCSA: 'false',
};

export const OUTSIDE_WORKING_HOURS: Partial<WorkingTimeSettings> = {
  organizationUseCSA: 'true',
  organizationWorkingAllTime: 'false',
  organizationWorkingTimeWeekdays: WEEK_DAYS.map((day) => day.toLowerCase()).join(','),
  organizationClosedOnWeekEnds: 'false',
  organizationTheSameOnAllWorkingDays: 'true',
  organizationAllWeekdaysTimeStartISO: '00:00',
  organizationAllWeekdaysTimeEndISO: '00:01',
  organizationOutsideWorkingHoursAskForContacts: 'false',
};

export const OUTSIDE_WORKING_HOURS_WITH_CONTACTS: Partial<WorkingTimeSettings> = {
  ...OUTSIDE_WORKING_HOURS,
  organizationOutsideWorkingHoursAskForContacts: 'true',
};

export const CSA_ABSENT_WITHOUT_CONTACTS: Partial<WorkingTimeSettings> = {
  organizationUseCSA: 'true',
  organizationWorkingAllTime: 'true',
  organizationNoCsaAskForContacts: 'false',
};

export const CSA_ABSENT_WITH_CONTACTS: Partial<WorkingTimeSettings> = {
  ...CSA_ABSENT_WITHOUT_CONTACTS,
  organizationNoCsaAskForContacts: 'true',
};

export const MALFORMED_CONTACT_EMAIL = 'autotest-not-an-email';
export const MALFORMED_CONTACT_PHONE = 'not-a-phone';
