import { WorkingTimeSettings } from '@utils/interfaces';

export const MON_FRI = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
export const MON_SUN = [...MON_FRI, 'Saturday', 'Sunday'];

export const WORKING_TIME_TAG = '@working-time';

export const CSA_AVAILABLE_ALL_TIME: Partial<WorkingTimeSettings> = {
  organizationUseCSA: 'true',
  organizationWorkingAllTime: 'true',
};

export const CSA_UNAVAILABLE: Partial<WorkingTimeSettings> = {
  organizationUseCSA: 'false',
};

export const OUTSIDE_WORKING_HOURS_WITHOUT_CONTACTS: Partial<WorkingTimeSettings> = {
  organizationUseCSA: 'true',
  organizationWorkingAllTime: 'false',
  organizationClosedOnWeekEnds: 'false',
  organizationTheSameOnAllWorkingDays: 'true',
  organizationWorkingTimeWeekdays: MON_SUN.map((day) => day.toLowerCase()).join(','),
  organizationAllWeekdaysTimeStartISO: '00:00',
  organizationAllWeekdaysTimeEndISO: '00:01',
  organizationOutsideWorkingHoursAskForContacts: 'false',
};

export const OUTSIDE_WORKING_HOURS_WITH_CONTACTS: Partial<WorkingTimeSettings> = {
  ...OUTSIDE_WORKING_HOURS_WITHOUT_CONTACTS,
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
