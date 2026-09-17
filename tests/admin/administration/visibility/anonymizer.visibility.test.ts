import { AdminPageFactory } from '@page-objects/admin-page-factory';
import { test } from '@setup/test-setup';

test.describe('[administration] [visibility] The anonymizer page shows every control its settings are edited through', () => {
  test(
    'The page opens with its domain tabs, its approach dropdown, its entities, both word lists, both toggles and the testing card',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/155/' } },
    async ({ page }) => {
      const ap = new AdminPageFactory(page).getAnonymizerPage();

      await ap.open();

      await test.step('The settings card names itself and offers the copy control', async () => {
        await ap.assertSettingsCardIsShown();
      });

      await test.step('The settings are offered per domain, with one domain being edited', async () => {
        await ap.assertDomainTabsAreShown();
      });

      await test.step('The anonymization approach dropdown offers Replace, Redact, Mask and Hash', async () => {
        await ap.assertApproachOptionsAreOffered();
      });

      await test.step('The entities section offers every entity that can be anonymized', async () => {
        await ap.assertEntitiesAreOffered();
      });

      await test.step('The allowlist and the denylist each take a word of their own', async () => {
        await ap.assertWordListsAreOffered();
      });

      await test.step('Both toggles are offered, and the recording one explains itself', async () => {
        await ap.assertTogglesAreShown();
      });

      await test.step('The settings can be saved', async () => {
        await ap.assertSettingsAreSaveable();
      });

      await test.step('The testing card takes a text, anonymizes it and shows the result back', async () => {
        await ap.assertTestingCardIsShown();
      });
    },
  );
});
