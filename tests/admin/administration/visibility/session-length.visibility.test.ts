import { test } from '@setup/test-setup';

test.describe('[administration] [visibility] The session length page shows every control its settings are edited through', () => {
  test(
    'The page opens with its time fields, its toggles, both message areas and the save control',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/26/' } },
    async ({ sessionLengthPage }) => {
      await sessionLengthPage.open();

      await test.step('The heading, both explanations and the save control are on the page', async () => {
        await sessionLengthPage.assertPageIsShown();
      });

      await test.step('The session length field carries its unit, its allowed range and its tooltip', async () => {
        await sessionLengthPage.assertSessionLengthFieldIsShown();
      });

      await test.step('The response time field carries its unit, its allowed range and its tooltip', async () => {
        await sessionLengthPage.assertResponseTimeFieldIsShown();
      });

      await test.step('Both message toggles are offered with their tooltips', async () => {
        await sessionLengthPage.assertMessageTogglesAreShown();
      });

      await test.step('The idle warning message is shown while its toggle says Yes and gone while it says No', async () => {
        await sessionLengthPage.assertIdleWarningMessageFollowsItsToggle();
      });

      await test.step('The end message is shown while its toggle says Yes and gone while it says No', async () => {
        await sessionLengthPage.assertEndMessageFollowsItsToggle();
      });

      await test.step('The away status toggle is offered with its tooltip', async () => {
        await sessionLengthPage.assertAwayStatusToggleIsShown();
      });

      await test.step('The away status time, its explanation and its range follow the away toggle and the session length', async () => {
        await sessionLengthPage.assertAwayStatusTimeFollowsItsToggle();
      });
    },
  );
});
