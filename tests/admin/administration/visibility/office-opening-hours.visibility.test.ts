import { test } from '@setup/test-setup';

test.describe('[administration] [visibility] The office opening hours page shows the controls its hours and notices are edited through', () => {
  test(
    'The page opens with its domain tabs, its schedule toggles, the hours that follow the weekends and the notices each toggle unlocks',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/24/' } },
    async ({ officeOpeningHoursPage }) => {
      await officeOpeningHoursPage.open();

      await test.step('The heading, the explanation and the save control are on the page', async () => {
        await officeOpeningHoursPage.assertPageIsShown();
      });

      await test.step('The configured domains are offered as tabs with one of them selected', async () => {
        await officeOpeningHoursPage.assertDomainTabsAreShown();
      });

      await test.step('The settings of the selected domain can be copied to another domain', async () => {
        await officeOpeningHoursPage.assertCopyToDomainIsOffered();
      });

      await test.step('The customer service and schedule toggles are offered with their tooltips', async () => {
        await officeOpeningHoursPage.assertScheduleTogglesAreShown();
      });

      await test.step('The common hours read M-F with weekends closed and M-S with them open', async () => {
        await officeOpeningHoursPage.assertCommonHoursFollowWeekends();
      });

      await test.step('The daily hours list Monday to Friday with weekends closed and the whole week with them open', async () => {
        await officeOpeningHoursPage.assertDailyHoursFollowWeekends();
      });

      await test.step('Outside office hours the notification toggle and its message are offered', async () => {
        await officeOpeningHoursPage.assertOutsideWorkingHoursFieldsAreShown();
      });

      await test.step('With customer service on the absence and redirect notices are offered', async () => {
        await officeOpeningHoursPage.assertCsaFieldsAreShown();
      });

      await test.step('With customer service off only the "Bürokratt cannot answer" notice is offered', async () => {
        await officeOpeningHoursPage.assertBotCannotAnswerFieldIsShown();
      });
    },
  );
});
