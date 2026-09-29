import { AdminPageFactory } from '@page-objects/admin-page-factory';
import { test } from '@setup/test-setup';

test.describe('[administration] [visibility] The anonymizer page shows its settings and testing controls', () => {
  test(
    'The page opens with its domain tabs, its approach dropdown, its entities, both word lists, both toggles and the testing card',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/155/' } },
    async ({ page }) => {
      const ap = new AdminPageFactory(page).getAnonymizerPage();

      await ap.open();

      await test.step('The heading, the copy control and the save control are on the settings card', async () => {
        await ap.assertSettingsCardIsShown();
      });

      await test.step('The configured domains are offered as tabs with one of them selected', async () => {
        await ap.assertDomainTabsAreShown();
      });

      await test.step('The anonymization approach dropdown offers Replace, Redact, Mask and Hash', async () => {
        await ap.assertApproachOptionsAreOffered();
      });

      await test.step('The entities section offers every entity that can be anonymized', async () => {
        await ap.assertEntitiesAreOffered();
      });

      await test.step('The allowlist and denylist each show an input for adding words', async () => {
        await ap.assertWordListsAreOffered();
      });

      await test.step('Both toggles are offered, and the recording one explains itself', async () => {
        await ap.assertTogglesAreShown();
      });

      await test.step('The heading, input and output text areas, clear and anonymize controls are on the testing card', async () => {
        await ap.assertTestingCardIsShown();
      });
    },
  );
});
