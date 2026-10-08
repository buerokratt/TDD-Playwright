import { AdminPageFactory } from '@page-objects/admin-page-factory';
import { test } from '@setup/test-setup';

test.describe(
  '[administration] [visibility] The conversations deletion page shows the whole deletion form',
  { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/156/' } },
  () => {
    test('The page shows its heading and description and offers both removals with a way to save them', async ({
      page,
    }) => {
      const dcp = new AdminPageFactory(page).getDeleteConversationsPage();

      await dcp.open();

      await test.step('The page shows its heading and description', async () => {
        await dcp.assertPageHeadingAndDescriptionAreShown();
      });

      await test.step('Both removals are offered as toggles with their tooltips', async () => {
        await dcp.assertRemovalTogglesOffered();
      });

      await test.step('The rules can be saved', async () => {
        await dcp.assertSaveOffered();
      });
    });

    test('With both removals switched on, every field the rules need is on the page', async ({ page }) => {
      const dcp = new AdminPageFactory(page).getDeleteConversationsPage();

      await dcp.open();

      await test.step('Both removals are switched on', async () => {
        await dcp.setAuthenticatedRemoval(true);
        await dcp.setAnonymousRemoval(true);
      });

      await test.step('Each removal takes a period in days and explains what it deletes', async () => {
        await dcp.assertPeriodFieldsOffered();
      });

      await test.step('The hour the deletion runs at is offered with its tooltip', async () => {
        await dcp.assertDeletionTimeOffered();
      });

      await test.step('The expiring conversations filter takes a range and offers its four shortcuts', async () => {
        await dcp.assertExpiringRangeOffered();
      });

      await test.step('The conversations falling in the period are counted', async () => {
        await dcp.assertConversationCountShown();
      });

      await test.step('The column selector offers every column the table lists', async () => {
        await dcp.assertColumnSelectorOffersEveryColumn();
      });

      await test.step('The table lists its columns, each with a control to sort by it', async () => {
        await dcp.assertTableListsEveryColumnWithSorting();
      });

      await test.step('A ninety day range fills the table, each conversation offered for viewing', async () => {
        await dcp.loadNinetyDayRange();
        await dcp.assertEveryRowEndsWithViewButton();
      });

      await test.step('The filled list is paged and the result count starts on the size the case names', async () => {
        await dcp.assertPagingOfferedWhenListOverflows();
        await dcp.assertResultCountOffered();
      });
    });
  },
);
