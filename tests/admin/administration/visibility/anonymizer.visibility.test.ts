import { test } from '@setup/test-setup';

test.describe('[administration] [visibility] The anonymizer page shows its settings and testing controls', () => {
  test(
    'The page opens with its domain tabs, its approach dropdown, its entities, both word lists, both toggles, the testing card and their notes',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/155/' } },
    async ({ anonymizerPage }) => {
      await anonymizerPage.open();

      await test.step('The heading, the copy control and the save control are on the settings card', async () => {
        await anonymizerPage.assertSettingsCardIsShown();
      });

      await test.step('The configured domains are offered as tabs with one of them selected', async () => {
        await anonymizerPage.assertDomainTabsAreShown();
      });

      await test.step('The anonymization approach dropdown offers Replace, Redact, Mask and Hash', async () => {
        await anonymizerPage.assertApproachOptionsAreOffered();
      });

      await test.step('The entities section offers every entity that can be anonymized and shows its note', async () => {
        await anonymizerPage.assertEntitiesAreOffered();
      });

      await test.step('The allowlist and denylist each show their note and an input for adding words', async () => {
        await anonymizerPage.assertWordListsAreOffered();
      });

      await test.step('Both toggles are offered, and the recording one explains itself', async () => {
        await anonymizerPage.assertTogglesAreShown();
      });

      await test.step('The heading, the note, input and output text areas, clear and anonymize controls are on the testing card', async () => {
        await anonymizerPage.assertTestingCardIsShown();
      });
    },
  );
});
