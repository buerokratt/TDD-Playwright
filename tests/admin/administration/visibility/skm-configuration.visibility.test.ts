import { test } from '@setup/test-setup';

test.describe('[administration] [visibility] The SKM configuration page shows its settings for both retrieval modes', () => {
  test(
    'The page opens with its domain tabs, its controls, the fields of each retrieval mode with their tooltips and the masked credentials',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/157/' } },
    async ({ skmConfigurationPage }) => {
      await skmConfigurationPage.open();

      await test.step('The heading and the description are on the page', async () => {
        await skmConfigurationPage.assertHeaderIsShown();
      });

      await test.step('The configured domains are offered as tabs with one of them selected', async () => {
        await skmConfigurationPage.assertDomainTabsAreShown();
      });

      await test.step('The copy control, the agentic retrieval toggle with its tooltip and the save control are shown', async () => {
        await skmConfigurationPage.assertControlsAreShown();
      });

      await test.step('With agentic retrieval off, its eight retrieval fields are shown, each with its tooltip', async () => {
        await skmConfigurationPage.setAgenticRetrieval(false);
        await skmConfigurationPage.assertRetrievalFieldsAreShown();
      });

      await test.step('The search type dropdown offers Semantic, Vector, Keyword, Hybrid (keyword + vector) and Hybrid + Semantic', async () => {
        await skmConfigurationPage.assertSearchTypesAreOffered();
      });

      await test.step('With agentic retrieval on, the agent fields and the credentials are shown, each with its tooltip', async () => {
        await skmConfigurationPage.setAgenticRetrieval(true);
        await skmConfigurationPage.assertAgenticFieldsAreShown();
      });

      await test.step('The client ID and the client secret are masked, and each says so when a value is already saved', async () => {
        await skmConfigurationPage.assertCredentialsAreMasked();
      });
    },
  );
});
