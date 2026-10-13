import { AdminPageFactory } from '@page-objects/admin-page-factory';
import { test } from '@setup/test-setup';

test.describe('[administration] [visibility] The SKM configuration page shows its settings for both retrieval modes', () => {
  test(
    'The page opens with its domain tabs, its controls, the fields of each retrieval mode with their tooltips and the masked credentials',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/157/' } },
    async ({ page }) => {
      const scp = new AdminPageFactory(page).getSkmConfigurationPage();

      await scp.open();

      await test.step('The heading and the description are on the page', async () => {
        await scp.assertHeaderIsShown();
      });

      await test.step('The configured domains are offered as tabs with one of them selected', async () => {
        await scp.assertDomainTabsAreShown();
      });

      await test.step('The copy control, the agentic retrieval toggle with its tooltip and the save control are shown', async () => {
        await scp.assertControlsAreShown();
      });

      await test.step('With agentic retrieval off, its eight retrieval fields are shown, each with its tooltip', async () => {
        await scp.setAgenticRetrieval(false);
        await scp.assertRetrievalFieldsAreShown();
      });

      await test.step('The search type dropdown offers Semantic, Vector, Keyword, Hybrid (keyword + vector) and Hybrid + Semantic', async () => {
        await scp.assertSearchTypesAreOffered();
      });

      await test.step('With agentic retrieval on, the agent fields and the credentials are shown, each with its tooltip', async () => {
        await scp.setAgenticRetrieval(true);
        await scp.assertAgenticFieldsAreShown();
      });

      await test.step('The client ID and the client secret are masked, and each says so when a value is already saved', async () => {
        await scp.assertCredentialsAreMasked();
      });
    },
  );
});
