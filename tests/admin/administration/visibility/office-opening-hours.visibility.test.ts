import { AdminPageFactory } from '@page-objects/admin-page-factory';
import { test } from '@setup/test-setup';

test.describe('[administration] [visibility] The office opening hours page shows the controls its hours and notices are edited through', () => {
  test(
    'Each control appears under the toggles that unlock it',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/24/' } },
    async ({ page }) => {
      const ohp = new AdminPageFactory(page).getOfficeOpeningHoursPage();

      await ohp.open();

      await test.step('The heading, the explanation and the save control are on the page', async () => {
        await ohp.assertPageIsShown();
      });

      await test.step('A tab per domain and the copy to domain control are offered', async () => {
        await ohp.assertDomainControlsAreShown();
      });

      await test.step('The customer service and schedule toggles are offered with their tooltips', async () => {
        await ohp.assertScheduleTogglesAreShown();
      });

      await test.step('The common hours read M-F with weekends closed and M-S with them open', async () => {
        await ohp.assertCommonHoursFollowWeekends();
      });

      await test.step('The daily hours list Monday to Friday with weekends closed and the whole week with them open', async () => {
        await ohp.assertDailyHoursFollowWeekends();
      });

      await test.step('Outside office hours the notification toggle and its message are offered', async () => {
        await ohp.assertOutsideHoursNotificationIsShown();
      });

      await test.step('With customer service on the absence and redirect notices are offered', async () => {
        await ohp.assertCustomerServiceNotificationsAreShown();
      });

      await test.step('With customer service off only the "Bürokratt cannot answer" notice is offered', async () => {
        await ohp.assertBotCannotAnswerNotificationIsShown();
      });
    },
  );
});
