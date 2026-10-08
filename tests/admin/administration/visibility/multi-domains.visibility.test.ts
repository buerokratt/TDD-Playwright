import { AdminPageFactory } from '@page-objects/admin-page-factory';
import { test } from '@setup/test-setup';

test.describe('[administration] [visibility] The multi-domains page shows its domains and controls', () => {
  test(
    'The page opens with every domain row complete and both controls offered',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/151/' } },
    async ({ page }) => {
      const mdp = new AdminPageFactory(page).getMultiDomainsPage();

      await mdp.open();

      await test.step('The heading, the add control and the save control are on the page', async () => {
        await mdp.assertPageIsShown();
      });

      await test.step('Every domain listed carries its name, its URL and a delete control', async () => {
        await mdp.assertRowsAreComplete();
      });
    },
  );
});
